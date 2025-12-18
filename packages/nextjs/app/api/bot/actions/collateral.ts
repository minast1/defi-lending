import { publicClient } from "../clients";
import { formatEther, parseEther } from "viem";

export async function addCollateral(client: any, lending: any, user: `0x${string}`) {
  const balance = await publicClient.getBalance({ address: user });
  if (balance < parseEther("3")) return;

  const currentCollateral = (await publicClient.readContract({
    address: lending.address,
    abi: lending.abi,
    functionName: "s_userCollateral",
    args: [user],
  })) as bigint;

  //Keep 2 ETH in reserve for gas
  const maxPossible = balance - parseEther("2");
  if (maxPossible <= 0n) return;

  //Random percentage 20-80%
  const percentage = 20 + Math.random() * 60;

  const amount = (maxPossible * BigInt(Math.floor(percentage * 10))) / 1000n;

  if (amount < parseEther("0.01")) return;

  try {
    // const { request } = await publicClient.simulateContract({
    //   address: lending.address,
    //   abi: lending.abi,
    //   functionName: "addCollateral",
    //   value: amount,
    //   args: [],
    // });

    await client.writeContract({
      address: lending.address,
      abi: lending.abi,
      functionName: "addCollateral",
      value: amount,
      args: [],
    });
    console.log(
      `Account ${user} added ${formatEther(amount)} ETH as collateral ` +
        `(${percentage.toFixed(1)}% of available balance, ` +
        `total collateral: ${formatEther(currentCollateral + amount)} ETH)`,
    );
  } catch (error) {
    console.error("Add collateral failed:", error);
  }
}
