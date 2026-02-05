import fs from "fs";
import path from "path";

const kitsFile = "/app/data/kits.json";
const assembliesFile = "/data/assemblies.json";

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { return fallback; }
}
function writeJson(file, obj) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(obj, null, 2));
}

export function createMockAdapter() {
  return {
    name: "mock",

    async listKits() {
      const kits = readJson(kitsFile, []);
      return kits.map(k => k.kitId);
    },

    async getKitSpec(kitId) {
      const kits = readJson(kitsFile, []);
      const kit = kits.find(k => k.kitId === kitId);
      if (!kit) throw new Error(`Kit not found: ${kitId}`);
      return {
        kitId: kit.kitId,
        defaultQty: kit.defaultQty ?? 1,
        site: kit.site ?? null,
        components: kit.components ?? []
      };
    },

    async findOrCreateAssembly({ kitId, qty, site }) {
      const db = readJson(assembliesFile, { assemblies: [] });
      let a = db.assemblies.find(x => x.kitId === kitId && x.status !== "Released");
      if (!a) {
        a = {
          assemblyId: `ASM-${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
          kitId,
          qty,
          site,
          status: "Hold",
          lines: []
        };
        db.assemblies.push(a);
        writeJson(assembliesFile, db);
      }
      return a;
    },

    async updateAssembly({ assemblyId, lines }) {
      const db = readJson(assembliesFile, { assemblies: [] });
      const a = db.assemblies.find(x => x.assemblyId === assemblyId);
      if (!a) throw new Error(`Assembly not found: ${assemblyId}`);

      a.lines = lines;
      if (a.status !== "Released") a.status = "Hold";

      writeJson(assembliesFile, db);
      return a;
    }
  };
}
