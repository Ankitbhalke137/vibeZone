/**
 * Applies sql/harden.sql (CHECK constraints + indexes) to the direct Neon URL.
 * Cross-platform enough for local/dev; production should run the same SQL in CI.
 */
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("[harden] DIRECT_URL / DATABASE_URL is required");
  process.exit(1);
}

const file = path.resolve(process.cwd(), "sql/harden.sql");
const sql = readFileSync(file, "utf8");

const result = spawnSync("psql", [url, "-v", "ON_ERROR_STOP=1"], {
  input: sql,
  stdio: ["pipe", "inherit", "inherit"],
});

if (result.error) {
  console.error("[harden] psql is required to apply CHECK constraints:", result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
