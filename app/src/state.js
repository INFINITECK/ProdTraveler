import fs from "fs";
import path from "path";

const FILE = "/data/state.json";

function readState() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return { lastRunUtc: null, kits: {} };
  }
}

function writeState(state) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(state, null, 2));
}

export function createState() {
  return {
    getKitState: (kitId) => {
      const s = readState();
      return s.kits?.[kitId] ?? null;
    },

    saveKitState: (row) => {
      const s = readState();
      s.kits = s.kits || {};
      s.kits[row.kit_id] = {
        spec_hash: row.spec_hash,
        assembly_id: row.assembly_id,
        last_sync_utc: row.last_sync_utc,
        note: row.note ?? null
      };
      writeState(s);
    },

    getLastRunUtc: () => readState().lastRunUtc ?? null,

    setLastRunUtc: (utc) => {
      const s = readState();
      s.lastRunUtc = utc;
      writeState(s);
    }
  };
}
