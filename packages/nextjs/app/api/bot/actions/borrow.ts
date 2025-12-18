import { publicClient } from "../clients";
import { formatEther } from "viem";

export async function simulateBorrow(client: any, lending: any, user: `0x${string}`) {
  const collateralValue = (await publicClient.readContract({
    address: lending.address,
    abi: lending.abi,
    functionName: "calculateCollateralValue",
    args: [user],
  })) as bigint;

  if (collateralValue <= 0n) return;

  //Aggresive vs conservative borrower
  const aggressiveBorrower = Math.random() < 0.3;
  const percentage = aggressiveBorrower
    ? 60 + Math.random() * 15 // 60–75%
    : 30 + Math.random() * 30; // 30–60%

  const cappedCollateral = (collateralValue * 70n) / 100n; // 70% max
  const amount = (cappedCollateral * BigInt(Math.floor(percentage * 10))) / 1000n;

  if (amount <= 0n) return;
  try {
    await client.writeContract({
      address: lending.address,
      abi: lending.abi,
      functionName: "borrowDai",
      args: [amount],
    });
    console.log(
      `📉 ${user} borrowed ${formatEther(amount)} DAI ` +
        `(${aggressiveBorrower ? "aggressive" : "conservative"}, ` +
        `${((Number(amount) * 100) / Number(collateralValue)).toFixed(1)}% of collateral)`,
    );
  } catch (error) {
    console.error("Borrow failed:", error);
  }
}
