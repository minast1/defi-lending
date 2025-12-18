//import { parseEther } from "viem";
import { parseEther } from "viem";

export async function movePrice(client: any, contract: any, amount: bigint, trend: number) {
  console.log(`Moving Price.... ${parseEther(amount.toString())} ETH`);
  //const trend = Math.random() > 0.5 ? 1n : -1n;
  try {
    await client.writeContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "movePrice",
      args: [amount],
    });
    console.log(`📈 Price moved ${trend > 0 ? "upward" : "downward"} by ${amount} ETH`);
  } catch (error) {
    console.error("Error moving price:", error);
  }
}
