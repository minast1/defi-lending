import { runSimulator } from "./simulator";
import scaffoldConfig from "~~/scaffold.config";

const { targetNetworks } = scaffoldConfig;

let started = false;

export async function POST() {
  if (!started) {
    started = true;
    console.log(`🌍 Connected to ${targetNetworks[0].name}`);

    runSimulator(); // fire and forget
  }

  return Response.json({ ok: true, started });
}
//runSimulator();
