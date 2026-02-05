import Database from "better-sqlite3";

export function createState(dbPath = "/data/state.sqlite") {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS kit_state (
      kit_id TEXT PRIMARY KEY,
      spec_hash TEXT NOT NULL,
      assembly_id TEXT,
      last_sync_utc TEXT,
      note TEXT
    );
    CREATE TABLE IF NOT EXISTS run_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      last_run_utc TEXT
    );
    INSERT OR IGNORE INTO run_state (id, last_run_utc) VALUES (1, NULL);
  `);

  const getKit = db.prepare(`SELECT * FROM kit_state WHERE kit_id = ?`);
  const upsertKit = db.prepare(`
    INSERT INTO kit_state (kit_id, spec_hash, assembly_id, last_sync_utc, note)
    VALUES (@kit_id, @spec_hash, @assembly_id, @last_sync_utc, @note)
    ON CONFLICT(kit_id) DO UPDATE SET
      spec_hash=excluded.spec_hash,
      assembly_id=excluded.assembly_id,
      last_sync_utc=excluded.last_sync_utc,
      note=excluded.note
  `);

  const getLastRun = db.prepare(`SELECT last_run_utc FROM run_state WHERE id = 1`);
  const setLastRun = db.prepare(`UPDATE run_state SET last_run_utc = ? WHERE id = 1`);

  return {
    getKitState: (kitId) => getKit.get(kitId) || null,
    saveKitState: (row) => upsertKit.run(row),
    getLastRunUtc: () => getLastRun.get()?.last_run_utc || null,
    setLastRunUtc: (utc) => setLastRun.run(utc)
  };
}
