# QSF Audit Agent Guide

*A systematic protocol for auditing Qualtrics QSF files for survey logic, randomization, validation, embedded data, wording, and export compatibility.*

This repository contains a source-aware, read-only protocol for AI agents that audit Qualtrics Survey Format (`.qsf`) files before fielding. It covers structural integrity, active survey flow, branching and termination, randomization, response validation, embedded data and piping, wording and HTML residue, export tags, and downstream data compatibility.

The main instructions are in [`AGENTS.md`](AGENTS.md). The public GitHub Pages guide is at [https://yhoriuchi.github.io/qsf-audit-agent-guide/](https://yhoriuchi.github.io/qsf-audit-agent-guide/), with page source in [`index.md`](index.md).

## What This Repo Provides

- A reusable, tool-agnostic audit protocol in [`AGENTS.md`](AGENTS.md).
- A copy-paste prompt in [`prompts/qsf-audit-agent.md`](prompts/qsf-audit-agent.md).
- A structured report template in [`templates/qsf-audit-report.md`](templates/qsf-audit-report.md).
- A GitHub Actions workflow that publishes the guide with GitHub Pages.

## Suggested Use

Give the agent:

1. The `.qsf` file to audit.
2. The intended survey behavior, including screening, forced-response, randomization, quota, and completion rules.
3. The panel or recruitment platform and its completion and screen-out requirements.
4. Any prior QSF version or prior audit report that should be compared.
5. The instructions in [`AGENTS.md`](AGENTS.md) or the prompt in [`prompts/qsf-audit-agent.md`](prompts/qsf-audit-agent.md).

Require the agent to preserve the original QSF and return a detailed audit report that distinguishes confirmed structural defects from risks, ambiguities, recommendations, and checks that require Qualtrics preview testing.

## GitHub Pages

The site is built from [`index.md`](index.md) using the same layout and stylesheet as Yusaku Horiuchi's other agent guides. The workflow in [`.github/workflows/pages.yml`](.github/workflows/pages.yml) publishes the built site from `main`.

Project-specific survey content and audit reports are intentionally omitted from this public repository.
