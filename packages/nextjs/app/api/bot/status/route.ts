import { simulatorRunning, simulatorStartBlock } from "../state";

export async function GET() {
  return Response.json({
    running: simulatorRunning,
    startBlock: simulatorStartBlock?.toString() ?? null,
  });
}
