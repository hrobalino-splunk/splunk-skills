#!/usr/bin/env node

import { cpSync, mkdirSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, "..");

const args = process.argv.slice(2);
const isProject = args.includes("--project");
const showHelp = args.includes("--help") || args.includes("-h");

if (showHelp) {
  console.log(`
splunk-skills — Install Splunk skills and agents for Cursor

Usage:
  npx splunk-skills [options]

Options:
  --project   Install to .cursor/ in the current directory (project-level)
              Default: install globally to ~/.cursor/
  --help, -h  Show this help message

What gets installed:
  Skills  → <target>/skills/<skill-name>/
  Agents  → <target>/agents/<agent-name>.md
`);
  process.exit(0);
}

const targetBase = isProject
  ? join(process.cwd(), ".cursor")
  : join(homedir(), ".cursor");

const skillsSrc = join(packageRoot, "skills");
const agentsSrc = join(packageRoot, "agents");
const skillsDest = join(targetBase, "skills");
const agentsDest = join(targetBase, "agents");

const installed = { skills: [], agents: [] };

const skillDirs = readdirSync(skillsSrc).filter((name) =>
  statSync(join(skillsSrc, name)).isDirectory()
);

for (const skill of skillDirs) {
  const src = join(skillsSrc, skill);
  const dest = join(skillsDest, skill);
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
  installed.skills.push(skill);
}

const agentFiles = readdirSync(agentsSrc).filter((name) =>
  name.endsWith(".md")
);

mkdirSync(agentsDest, { recursive: true });
for (const agent of agentFiles) {
  const src = join(agentsSrc, agent);
  const dest = join(agentsDest, agent);
  cpSync(src, dest);
  installed.agents.push(basename(agent, ".md"));
}

const scope = isProject ? "project (.cursor/)" : `global (${targetBase})`;
console.log(`\n  Splunk Skills installed to ${scope}\n`);

if (installed.skills.length > 0) {
  console.log("  Skills:");
  for (const s of installed.skills) {
    console.log(`    + ${s}`);
  }
}

if (installed.agents.length > 0) {
  console.log("\n  Agents:");
  for (const a of installed.agents) {
    console.log(`    + ${a}`);
  }
}

console.log(`\n  ${installed.skills.length} skill(s), ${installed.agents.length} agent(s) installed.\n`);
