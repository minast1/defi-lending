import { stopSimulator } from "../state";

export async function POST() {
  stopSimulator();
  console.log("🛑 Simulator stopped");

  return Response.json({ ok: true, running: false });
}
