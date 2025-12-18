import { faucetWalletClient, publicClient } from "../clients";
import { parseEther } from "viem";

export async function fundAccountsIfNeeded(clients: any[]) {
  for (const client of clients) {
    const [address] = await client.getAddresses();
    const currentBalance = await publicClient.getBalance({ address });
    //Fund if balance drops below 2 ETH
    if (currentBalance < parseEther("2")) {
      //Random amount between 3-13 ETH
      const topUpAmount = parseEther((3 + Math.random() * 10).toFixed(2));

      await faucetWalletClient.sendTransaction({
        to: client.account.address as `0x${string}`,
        value: topUpAmount,
      });
      console.log(`Topped up ${address} with ${topUpAmount} ETH`);
    }
  }
}
