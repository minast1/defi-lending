import { publicClient } from "../clients";
import { parseAbiItem, parseEther } from "viem";

const liquidationInProgress = new Set<string>();

export async function liquidate(lending: any, dai: any, dex: any, clients: any[]) {
  let eligible: any[] = [];
  const logs = await publicClient.getLogs({
    address: lending.address,
    event: parseAbiItem("event CollateralAdded(address indexed user,uint256 indexed amount,uint256 price)"),
    fromBlock: 0n,
    toBlock: "latest",
  });

  const users = [...new Set(logs.map(l => l?.args.user).filter((user): user is string => !!user))];

  for (const user of users) {
    const userKey = user.toLowerCase();
    if (liquidationInProgress.has(userKey)) continue;

    const borrowed = (await publicClient.readContract({
      address: lending.address,
      abi: lending.abi,
      functionName: "s_userBorrowed",
      args: [user],
    })) as bigint;

    if (borrowed === 0n) continue;

    const liquidatable = await publicClient.readContract({
      address: lending.address,
      abi: lending.abi,
      functionName: "isLiquidatable",
      args: [user],
    });

    if (!liquidatable) continue;

    //Find eligible liquidators
    const candidates = clients.filter(c => c.account.address.toLowerCase() !== userKey);

    const balances = await Promise.all(
      candidates.map(async c => {
        const bal = (await publicClient.readContract({
          address: dai.address,
          abi: dai.abi,
          functionName: "balanceOf",
          args: [c.account.address as `0x${string}`],
        })) as bigint;
        return {
          wallet: c,
          hasEnough: bal >= borrowed,
        };
      }),
    );

    eligible = balances.filter(b => b.hasEnough).map(b => b.wallet);

    if (eligible.length === 0) {
      //If none try to create one via swap
      console.log("No eligible liquidators, reverting to swap");
      const swapper = candidates[Math.floor(Math.random() * candidates.length)];
      //console.log({ swapper });
      if (!swapper) continue;
      const price = (await publicClient.readContract({
        address: dex.address,
        abi: dex.abi,
        functionName: "currentPrice",
        args: [],
      })) as bigint;

      const ethNeeded = (borrowed * price * 110n) / (1000n * parseEther("1"));
      const ethBalance = await publicClient.getBalance({
        address: swapper.account.address,
      });
      const maxEth = ethBalance - parseEther("0.1");
      if (maxEth <= parseEther("0.01")) continue;

      const swapAmount = ethNeeded > maxEth ? maxEth : ethNeeded;

      try {
        await swapper.writeContract({
          address: dex.address,
          abi: dex.abi,
          functionName: "swap",
          args: [swapAmount],
          value: swapAmount,
        });

        const newBalance = (await publicClient.readContract({
          address: dai.address,
          abi: dai.abi,
          functionName: "balanceOf",
          args: [swapper.account.address],
        })) as bigint;

        if (newBalance >= borrowed) {
          eligible.push(swapper);
          console.log(`🔄 Swapped ETH for liquidation liquidity`);
        }
      } catch {
        continue;
      }
    } ///End if

    if (eligible.length === 0) continue;
    liquidationInProgress.add(user);

    /** === Execute liquidation === */
    const liquidator = eligible[Math.floor(Math.random() * eligible.length)];
    liquidationInProgress.add(userKey);
    //console.log({ selectedLiquidator: liquidator });
    try {
      await liquidator.writeContract({
        address: dai.address,
        abi: dai.abi,
        functionName: "approve",
        args: [lending.address, borrowed],
      });

      await liquidator.writeContract({
        address: lending.address,
        abi: lending.abi,
        functionName: "liquidate",
        args: [user],
      });

      /** === Refill collateral for user (Hardhat parity) === */
      const userEth = await publicClient.getBalance({ address: user });
      const buffer = parseEther("2");

      if (userEth > buffer) {
        await liquidator.writeContract({
          address: lending.address,
          abi: lending.abi,
          functionName: "addCollateral",
          value: userEth - buffer,
        });
      }

      console.log(`💥 Liquidated user ${user}`);
    } finally {
      liquidationInProgress.delete(userKey);
    }

    break;
  } ///End for
}
