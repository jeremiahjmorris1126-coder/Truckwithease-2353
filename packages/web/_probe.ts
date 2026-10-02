import { createClient } from "@libsql/client";
const c = createClient({ url: "file:/tmp/twe-local.db" });
const t = await c.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
let withRows = 0;
for (const r of t.rows) {
  const name = String(r.name);
  const cnt = await c.execute(`SELECT COUNT(*) AS n FROM "${name}"`);
  const x = Number(cnt.rows[0].n);
  if (x > 0) withRows++;
}
console.log(`${withRows} tables with rows / ${t.rows.length} total tables`);
process.exit(0);
