# splunk-skills

Agent skills and subagents for Splunk — threat hunting, TA development, and dashboard building. Works with [Cursor](https://cursor.com) and other AI coding agents that support the [Agent Skills](https://agentskills.io/) specification.

## Installation

### Full install (skills + agents)

```bash
npx splunk-skills
```

This installs all skills and agents globally to `~/.cursor/`. For project-level installation:

```bash
npx splunk-skills --project
```

### Skills only (via standard CLI)

```bash
npx skills add dtherrick/splunk-skills
```

This uses the [Vercel skills CLI](https://github.com/vercel-labs/skills) and installs only the skills (not agents) from the `skills/` directory.

## What's Included

### Skills

Skills are instruction sets that guide your AI coding agent through specialized workflows. They are installed to `~/.cursor/skills/` (global) or `.cursor/skills/` (project).

| Skill | Description |
|-------|-------------|
| **peak-threat-hunting** | Conduct threat hunts in Splunk using the PEAK framework (Prepare, Execute, Act with Knowledge). Supports hypothesis-driven, baseline, and model-assisted hunts with MITRE ATT&CK mapping. |
| **splunk-ta-development** | Build Splunk Technology Add-ons (TAs) end-to-end — analyze log samples, create props.conf/transforms.conf, load data, and validate field extractions via the Splunk MCP server. |
| **splunk-dashboard-studio** | Build Dashboard Studio dashboards using JSON definitions. Covers all visualization types, layout design, tokens, interactivity, Dynamic Options Syntax (DOS), and conditional formatting. |

### Agents

Agents are subagent definitions that handle specialized tasks autonomously. They are installed to `~/.cursor/agents/`.

| Agent | Description |
|-------|-------------|
| **dashboard-studio-builder** | Builds Dashboard Studio dashboards as JSON definitions. Full lifecycle: discovers data via Splunk MCP, assembles the definition, deploys, and validates. |
| **splunk-dashboard-builder** | Builds Simple XML dashboards from SPL queries and analysis context. Specializes in security operations, threat hunting, and operational monitoring dashboards. |

## Prerequisites

Most skills and agents require a [Splunk MCP server](https://github.com/livehybrid/splunk-mcp) connection to run queries and deploy dashboards against a Splunk instance.

## License

MIT
