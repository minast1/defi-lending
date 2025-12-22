export let simulatorRunning = false;
export let simulatorStartBlock: bigint | null = null;

export function startSimulator(block: bigint) {
  simulatorRunning = true;
  simulatorStartBlock = block;
}

export function stopSimulator() {
  simulatorRunning = false;
  simulatorStartBlock = null;
}
