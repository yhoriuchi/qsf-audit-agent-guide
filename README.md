# QSF Audit Agent Guide

*A systematic protocol for auditing Qualtrics QSF files for survey logic, randomization, validation, embedded data, wording, and export compatibility.*

This repository contains a source-aware, read-only protocol for AI agents that audit Qualtrics Survey Format (`.qsf`) files before fielding. It covers structural integrity, active survey flow, branching and termination, randomization, response validation, embedded data and piping, wording and HTML residue, export tags, and downstream data compatibility.

The main instructions are in [`AGENTS.md`](AGENTS.md). The public GitHub Pages guide is at [https://yhoriuchi.github.io/qsf-audit-agent-guide/](https://yhoriuchi.github.io/qsf-audit-agent-guide/), with page source in [`index.md`](index.md).

The website also includes a private, browser-only Quick Audit. Users can drag in a `.qsf` file, run deterministic structural checks, and download a Markdown report without transmitting or storing the QSF contents.

## What This Repo Provides

- A reusable, tool-agnostic audit protocol in [`AGENTS.md`](AGENTS.md).
- A copy-paste prompt in [`prompts/qsf-audit-agent.md`](prompts/qsf-audit-agent.md).
- A structured report template in [`templates/qsf-audit-report.md`](templates/qsf-audit-report.md).
- A client-side Quick Audit implementation in [`assets/qsf-audit.js`](assets/qsf-audit.js).
- A GitHub Actions workflow that publishes the guide with GitHub Pages.

## Browser-Only Privacy Model

The Quick Audit reads the user-selected file through the browser File API and performs all processing in browser memory. It does not send QSF contents to this repository owner, GitHub Pages, an AI provider, analytics, or another server.

Privacy controls include:

- a Content Security Policy with `connect-src 'none'`;
- no analytics, tracking script, or external page-view badge;
- no server endpoint or AI API integration;
- text-only rendering of findings rather than injection of QSF-supplied HTML;
- local SHA-256 calculation and local Markdown downloads;
- a 20 MB file-size limit and `.qsf` filename validation.

The Quick Audit is intentionally deterministic. It does not replace a deeper agent audit, Qualtrics preview testing, panel-platform checks, custom-code review, or inspection of a synthetic data export.

## Suggested Use

Give the agent:

1. The `.qsf` file to audit.
2. The current draft pre-analysis plan, which serves as the intended-design specification.
3. Intended survey behavior not yet documented in the draft plan, including screening, forced-response, randomization, quota, and completion rules.
4. The panel or recruitment platform and its completion and screen-out requirements.
5. Any prior QSF version or prior audit report that should be compared.
6. The instructions in [`AGENTS.md`](AGENTS.md) or the prompt in [`prompts/qsf-audit-agent.md`](prompts/qsf-audit-agent.md).

Require the agent to preserve the original QSF and return a plan-to-QSF concordance table plus a detailed audit report that distinguishes confirmed structural defects from risks, ambiguities, recommendations, and checks that require Qualtrics preview testing.

Alternatively, users can begin with the website's browser-only Quick Audit and give its generated report to the agent as additional context.

## GitHub Pages

The site is built from [`index.md`](index.md) using the same layout and stylesheet as Yusaku Horiuchi's other agent guides. The workflow in [`.github/workflows/pages.yml`](.github/workflows/pages.yml) publishes the built site from `main`.

Project-specific survey content and audit reports are intentionally omitted from this public repository.
