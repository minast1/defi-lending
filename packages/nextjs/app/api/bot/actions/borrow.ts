import { publicClient } from "../clients";
import { BaseError, ContractFunctionRevertedError, formatEther } from "viem";

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
    ? 85 + Math.random() * 14 // 85–99%
    : 30 + Math.random() * 40; // 30–70%

  //const cappedCollateral = (collateralValue * 70n) / 100n; // 70% max
  const borrowAmount = (collateralValue * BigInt(Math.floor(percentage * 10))) / 1000n;

  if (borrowAmount > 0n) {
    try {
      await client.writeContract({
        address: lending.address,
        abi: lending.abi,
        functionName: "borrowDai",
        args: [borrowAmount],
      });

      console.log(
        `📉 ${user} borrowed ${formatEther(borrowAmount)} DAI ` +
          `(${aggressiveBorrower ? "aggressive" : "conservative"}, ` +
          `${((Number(borrowAmount) * 100) / Number(collateralValue)).toFixed(1)}% of collateral)`,
      );
    } catch (err) {
      if (err instanceof BaseError) {
        const revertError = err.walk(err => err instanceof ContractFunctionRevertedError);
        if (revertError instanceof ContractFunctionRevertedError) {
          const errorName = revertError.data?.errorName ?? "";
          console.log(errorName);
          // do something with `errorName`
        }
      } else {
        console.log(err);
      }
    }
  }
}
