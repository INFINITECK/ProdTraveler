import crypto from "crypto";

export function hashComponents(components) {
  const normalized = (components || [])
    .map(c => ({
      inventoryId: String(c.inventoryId || "").trim(),
      qty: Number(c.qty),
      uom: String(c.uom || "").trim()
    }))
    .filter(x => x.inventoryId && Number.isFinite(x.qty))
    .sort((a, b) => (a.inventoryId + "|" + a.uom).localeCompare(b.inventoryId + "|" + b.uom));

  return crypto.createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
}
