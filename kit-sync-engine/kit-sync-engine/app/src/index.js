import express from "express";
import { createState } from "./state.js";
import { createEngine } from "./engine.js";
import { createMockAdapter } from "./adapters/mock.js";

const PORT = Number(process.env.PORT || "8080");
const POLL_SECONDS = Number(process.env.POLL_SECONDS || "60");
const ADAPTER = String(process.env.ADAPTER || "mock").toLowerCase();
const UPDATE_RELEASED = String(process.env.UPDATE_RELEASED || "false").toLowerCase() === "true";

const state = createState("/data/state.sqlite");

let adapter;
if (ADAPTER === "mock") adapter = createMockAdapter();
else throw new Error(`Unknown adapter: ${ADAPTER}`);

const engine = createEngine({ adapter, state, updateReleased: UPDATE_RELEASED });

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, adapter: adapter.name, lastRunUtc: state.getLastRunUtc() });
});

app.post("/sync/run", async (req, res) => {
  try {
    res.json({ ok: true, results: await engine.syncAll() });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

app.post("/sync/kits/:kitId", async (req, res) => {
  try {
    res.json({ ok: true, result: await engine.syncKit(req.params.kitId) });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

app.listen(PORT, () => console.log(`kit-sync-engine listening on :${PORT}`));

async function runScheduled() {
  try {
    await engine.syncAll();
    console.log(`[OK] scheduled sync complete ${new Date().toISOString()}`);
  } catch (e) {
    console.error("[ERROR] scheduled sync failed", e?.message || e);
  }
}

runScheduled();
setInterval(runScheduled, POLL_SECONDS * 1000);
