import { runTick } from "./actions/tick";
import { simulatorRunning } from "./state";
import { sleep } from "./utils/sleep";

export async function runSimulator() {
  console.log("🤖 Market Simulator Started");

  while (simulatorRunning) {
    console.log(simulatorRunning);
    try {
      await runTick();
    } catch (error) {
      console.error("Simulator tick error", error);
    }

    /** === 2s cadence (Hardhat parity) === */
    await sleep(2000);
  }
}
