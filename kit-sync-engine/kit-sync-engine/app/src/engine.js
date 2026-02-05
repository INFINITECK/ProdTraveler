import { hashComponents } from "./hash.js";

export function createEngine({ adapter, state, updateReleased = false }) {
  async function syncKit(kitId) {
    const spec = await adapter.getKitSpec(kitId);
    const specHash = hashComponents(spec.components);

    const existing = state.getKitState(kitId);
    if (existing?.spec_hash === specHash) {
      return { kitId, changed: false, assemblyId: existing.assembly_id || null };
    }

    const assembly = await adapter.findOrCreateAssembly({
      kitId,
      qty: spec.defaultQty ?? 1,
      site: spec.site ?? null
    });

    if (!updateReleased && String(assembly.status || "").toLowerCase() === "released") {
      state.saveKitState({
        kit_id: kitId,
        spec_hash: specHash,
        assembly_id: assembly.assemblyId,
        last_sync_utc: new Date().toISOString(),
        note: "Spec changed but assembly is released; not updated."
      });
      return { kitId, changed: true, assemblyId: assembly.assemblyId, skipped: true };
    }

    const updated = await adapter.updateAssembly({
      assemblyId: assembly.assemblyId,
      lines: spec.components
    });

    state.saveKitState({
      kit_id: kitId,
      spec_hash: specHash,
      assembly_id: updated.assemblyId,
      last_sync_utc: new Date().toISOString(),
      note: null
    });

    return { kitId, changed: true, assemblyId: updated.assemblyId };
  }

  async function syncAll() {
    const kitIds = await adapter.listKits();
    const results = [];
    for (const kitId of kitIds) results.push(await syncKit(kitId));
    state.setLastRunUtc(new Date().toISOString());
    return results;
  }

  return { syncKit, syncAll };
}
