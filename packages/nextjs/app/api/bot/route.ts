import { runSimulator } from "./simulator";
import scaffoldConfig from "~~/scaffold.config";

const { targetNetworks } = scaffoldConfig;

let controller: AbortController | null = null;
let running = false;

export async function POST(req: Request) {
  const { action } = await req.json();

  if (action === "start") {
    if (!running) {
      controller = new AbortController();
      running = true;
      console.log(`🌍 Connected to ${targetNetworks[0].name}`);

      runSimulator(controller.signal);
    }
    return Response.json({ running });
  }

  if (action === "stop") {
    if (controller) {
      controller.abort();
      controller = null;
    }
    running = false;
    console.log(`🌍 Stopping Simulator on ${targetNetworks[0].name}`);
    return Response.json({ running });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
}
//runSimulator();
