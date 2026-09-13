#!/usr/bin/env node
/**
 * "It builds on my machine but fails on Vercel" — preflight.
 *
 * Vercel never sees your working folder. It clones your repository and builds
 * whatever is *committed*, with only the environment variables you typed into
 * the dashboard. Two things on your disk are invisible to it:
 *
 *   1. files you edited but never committed (and anything .gitignore excludes)
 *   2. .env.local — `next build` reads it here, Vercel does not have it
 *
 * Either one turns a green local build into a red deployment. So this script
 * checks that your working tree matches the commit you are about to push, then
 * builds with the same bare environment Vercel uses.
 *
 *   npm run preflight
 *
 * Green means the commit you are about to push builds on Vercel.
 */

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const c = {
  dim: (s) => `[2m${s}[0m`,
  red: (s) => `[31m${s}[0m`,
  green: (s) => `[32m${s}[0m`,
  yellow: (s) => `[33m${s}[0m`,
  bold: (s) => `[1m${s}[0m`,
};

const git = (...args) =>
  execFileSync("git", args, { cwd: appDir, encoding: "utf8" }).trim();

function fail(message, hint) {
  console.error(`\n${c.red("✖")} ${message}`);
  if (hint) console.error(`  ${c.dim(hint)}`);
  process.exit(1);
}

// --------------------------------------------------------------- env shuffle
//
// Done first, and restored no matter how this process ends — a .env.local left
// renamed would break `npm run dev` in a way that is very hard to guess at.

const LOCAL_ENV_FILES = [
  ".env.local",
  ".env.development.local",
  ".env.production.local",
  ".env",
];
const SUFFIX = ".preflight-backup";
const moved = [];

function hideLocalEnv() {
  for (const name of LOCAL_ENV_FILES) {
    const from = path.join(appDir, name);
    const to = from + SUFFIX;
    // A leftover from an interrupted run: put it back before doing anything.
    if (!fs.existsSync(from) && fs.existsSync(to)) fs.renameSync(to, from);
    if (!fs.existsSync(from)) continue;
    fs.renameSync(from, to);
    moved.push([to, from]);
  }
}

function restoreLocalEnv() {
  while (moved.length) {
    const [from, to] = moved.pop();
    try {
      if (fs.existsSync(from)) fs.renameSync(from, to);
    } catch {
      console.error(c.red(`  Could not restore ${path.basename(to)} — rename ${from} back.`));
    }
  }
}

process.on("exit", restoreLocalEnv);
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(sig, () => process.exit(130));
}

// ---------------------------------------------------------------- git checks

try {
  git("rev-parse", "--git-dir");
} catch {
  fail(
    "This folder is not a git repository.",
    "Vercel builds from a repository, so there is nothing to preflight yet."
  );
}

let head;
try {
  head = git("rev-parse", "--short", "HEAD");
} catch {
  fail("This repository has no commits yet.", 'git add -A && git commit -m "first commit"');
}

/**
 * Only changes that can affect a build matter. A stray note.txt does not, and
 * refusing to run over one would just teach you to ignore this script.
 */
const BUILD_RELEVANT =
  /^(src\/|public\/|scripts\/|package|next\.config|tsconfig|postcss|components\.json)/;
const changed = git("status", "--porcelain")
  .split("\n")
  .filter(Boolean)
  .map((line) => ({ status: line.slice(0, 2).trim(), file: line.slice(3).replace(/^"|"$/g, "") }));

const relevant = changed.filter((e) => BUILD_RELEVANT.test(e.file));

if (relevant.length) {
  console.log(`\n${c.yellow("!")} ${c.bold("These are not committed — Vercel will not see them:")}`);
  for (const { status, file } of relevant.slice(0, 15)) {
    const what = status === "??" ? "never added" : "modified";
    console.log(`    ${c.dim(`${what.padEnd(11)} ${file}`)}`);
  }
  if (relevant.length > 15) console.log(c.dim(`    …and ${relevant.length - 15} more`));
  console.log(
    c.dim(
      "\n  The build below uses your working folder, so it will pass even if the\n" +
        "  commit would not. Commit these first for a true preflight:\n" +
        "      git add -A && git commit -m \"…\"\n"
    )
  );
} else {
  console.log(`\n${c.green("✔")} Working folder matches commit ${head} — what builds here builds there.`);
}

// A build needs these, and .gitignore has swallowed them before now.
for (const required of ["package.json", "package-lock.json", "next.config.ts", "src/app/layout.tsx"]) {
  if (!git("ls-files", "--", required))
    fail(
      `${required} is not committed.`,
      "Vercel clones the repo — an untracked file simply does not exist there."
    );
}

const images = git("ls-files", "--", "public/products").split("\n").filter(Boolean);
console.log(c.dim(`  product images committed: ${images.length}`));
if (images.length === 0)
  console.log(
    c.yellow("  ! Nothing under public/products is committed — the deployed site will fall back to SVG mocks.")
  );

// -------------------------------------------------------------- bare-env build

if (!fs.existsSync(path.join(appDir, "node_modules", "next")))
  fail("node_modules is missing.", "Run `npm install` first.");

/**
 * Vercel's build environment: no .env.local, and none of the variables that
 * happen to be exported in your shell.
 */
const env = { ...process.env };
for (const key of Object.keys(env)) {
  if (key.startsWith("NEXT_PUBLIC_") || key.startsWith("AUTH_") || key.startsWith("NEXTAUTH_"))
    delete env[key];
}
env.CI = "1";
env.NEXT_TELEMETRY_DISABLED = "1";

hideLocalEnv();
if (moved.length)
  console.log(c.dim(`  temporarily set aside: ${moved.map(([, to]) => path.basename(to)).join(", ")}`));

console.log(c.dim("\nBuilding the way Vercel builds — no .env.local, no local variables …\n"));

const build = spawnSync(
  process.execPath,
  [path.join(appDir, "node_modules", "next", "dist", "bin", "next"), "build"],
  { cwd: appDir, env, stdio: "inherit" }
);

restoreLocalEnv();

if (build.status !== 0) {
  console.error(
    `\n${c.red("✖ This does not build the way Vercel builds it.")}\n` +
      c.dim("  The failure above is the one Vercel would report. Fix it, commit, then push.\n")
  );
  process.exit(build.status ?? 1);
}

console.log(`\n${c.green("✔")} ${c.bold("Builds clean with nothing but the committed code.")}`);
console.log(
  c.dim(
    "  The build was the easy half. These affect the running site, not the build,\n" +
      "  so set them in Vercel → Settings → Environment Variables and redeploy:\n" +
      "      NEXT_PUBLIC_API_URL   https://your-backend/api\n" +
      "      NEXT_PUBLIC_SITE_URL  https://your-site.vercel.app\n" +
      "      AUTH_SECRET           any 32-byte random hex string\n" +
      "      AUTH_BRIDGE_SECRET    must match the backend's value\n"
  )
);
