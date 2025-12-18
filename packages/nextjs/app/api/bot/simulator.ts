import { simulateBorrow } from "./actions/borrow";
import { addCollateral } from "./actions/collateral";
import { liquidate } from "./actions/liquidation";
import { movePrice } from "./actions/price";
import { faucetWalletClient, walletClients } from "./clients";
import contracts from "./contracts";
import { fundAccountsIfNeeded } from "./utils/fund";
import { sleep } from "./utils/sleep";
import { parseEther } from "viem";

const CHANCE_TO_BORROW = 0.3; // 30% chance to borrow
const CHANCE_TO_ADD_COLLATERAL = 0.2; // 20% chance to add collateral
export async function runSimulator() {
  console.log("🤖 Market Simulator Started");
  /** === Trend state (matches Hardhat) === */
  let trend = Math.random() > 0.5 ? 1 : -1;
  let trendDuration = 0;
  let maxTrendDuration = Math.floor(Math.random() * 8) + 7;

  while (true) {
    try {
      /** 1️⃣ Update price EVERY tick */
      trendDuration++;
      if (trendDuration >= maxTrendDuration) {
        trend *= -1;
        trendDuration = 0;
        maxTrendDuration = Math.floor(Math.random() * 8) + 7;
        console.log(`📈 Trend reversed: ${trend > 0 ? "upward" : "downward"}`);
      }

      const noise = Math.random() * 2.5 - 1.6;
      const direction = trend + noise;

      const baseAmount = parseEther("500");
      const amountToSell = direction > 0 ? baseAmount : -baseAmount * 1000n;

      await movePrice(faucetWalletClient, contracts.MovePrice, amountToSell, direction);

      /** 2️⃣ Ensure all accounts are funded */
      await fundAccountsIfNeeded(walletClients);

      /** 3️⃣ Random borrowing (market-wide actor) */
      if (Math.random() < CHANCE_TO_BORROW) {
        const i = Math.floor(Math.random() * walletClients.length);
        const randomWallet = walletClients[i];
        const actor = randomWallet;
        await simulateBorrow(actor, contracts.Lending, actor.account.address as `0x${string}`);
      }

      /** 4️⃣ Random collateral addition */
      if (Math.random() < CHANCE_TO_ADD_COLLATERAL) {
        const i = Math.floor(Math.random() * walletClients.length);
        const randomWallet = walletClients[i];
        const actor = randomWallet;
        await addCollateral(actor, contracts.Lending, actor.account.address as `0x${string}`);
      }

      /** 5️⃣ Always attempt liquidation */
      await liquidate(contracts.Lending, contracts.Dai, contracts.DEX, walletClients);
    } catch (err) {
      console.error("❌ Simulator tick error");
      console.error(err);
    }

    /** === 2s cadence (Hardhat parity) === */
    await sleep(2000);
  }
}
