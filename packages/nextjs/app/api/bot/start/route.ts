import { publicClient } from "../clients";
import { runSimulator } from "../simulator";
import { simulatorRunning, startSimulator } from "../state";
import scaffoldConfig from "~~/scaffold.config";

const { targetNetworks } = scaffoldConfig;

export async function POST() {
  if (simulatorRunning) {
    return Response.json({ ok: true, running: true });
  }

  const block = await publicClient.getBlockNumber();
  startSimulator(block);

  runSimulator();
  console.log(`🚀 Simulator started on ${targetNetworks[0].name} at block ${block}`);

  return Response.json({
    ok: true,
    running: true,
    startBlock: block.toString(),
  });
}
//runSimulator();
