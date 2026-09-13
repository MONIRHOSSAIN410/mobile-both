/**
 * Removes every build cache in the repo.
 *
 *   npm run clean
 *
 * Next.js keeps compiled pages and fetch results under `frontend/.next`. If a
 * dev server was running while files changed underneath it, that cache can go
 * on serving the old page — which looks exactly like "my fix did nothing".
 * Deleting it and restarting is the reliable cure.
 */

import { rm, access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const TARGETS = [
  "frontend/.next",
  "frontend/.turbo",
  "frontend/tsconfig.tsbuildinfo",
  "node_modules/.cache",
  "frontend/node_modules/.cache",
  "backend/node_modules/.cache",
];

const exists = (p) => access(p, constants.F_OK).then(() => true, () => false);

const removed = [];
for (const target of TARGETS) {
  const full = path.join(ROOT, target);
  if (await exists(full)) {
    await rm(full, { recursive: true, force: true });
    removed.push(target);
  }
}

console.log(
  removed.length
    ? `\n  🧹  Removed:\n${removed.map((r) => `        ${r}`).join("\n")}\n\n      Now start the servers again.\n`
    : "\n  ✅  Nothing to clean — no build caches present.\n"
);
