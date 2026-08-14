# Copy-Paste Prompt: QSF Audit Agent

You are auditing a Qualtrics Survey Format (`.qsf`) file before fielding. Follow the protocol below exactly.

## Inputs

- Project: `[PROJECT]`
- Survey: `[SURVEY]`
- Source QSF: `[PATH]`
- Prior QSF or audit report: `[PATH_OR_NONE]`
- Intended eligibility and termination rules: `[RULES_OR_UNKNOWN]`
- Forced-response and check-question policy: `[RULES_OR_UNKNOWN]`
- Randomization requirements: `[RULES_OR_UNKNOWN]`
- Panel platform and completion/screen-out rules: `[PLATFORM_AND_RULES_OR_UNKNOWN]`
- Export naming and downstream compatibility requirements: `[REQUIREMENTS_OR_UNKNOWN]`

## Task

Perform a read-only audit of the source QSF. Preserve the original file and record its SHA-256 checksum. Parse the JSON, reconstruct the active Survey Flow, inventory reachable blocks and questions, and trace all dependencies before drawing conclusions.

Audit:

1. File integrity, metadata, identifiers, and cross-references.
2. Active Survey Flow, branches, groups, and unreachable elements.
3. Consent, eligibility, attention-check, quota, termination, and completion routes.
4. Block, question, choice, and condition randomization.
5. Force Response, Request Response, optional items, and custom validation.
6. Display, skip, and carry-forward logic.
7. Embedded data, piped text, quotas, scoring, and external inputs.
8. Wording, choices, grammar, spacing, HTML, and editor residue.
9. Export tags, recodes, treatment indicators, and downstream data compatibility.
10. Survey Options, redirects, panel integration, anonymization, partial completion, mobile, and accessibility risks.

## Rules

1. Do not overwrite or silently modify the source QSF.
2. Do not stop after confirming that the file is valid JSON.
3. Start from the active Survey Flow; separate active content from Trash, unused, unreferenced, and unreachable content.
4. Cite element, flow, block, question, choice, export-tag, and embedded-data identifiers for findings when available.
5. Treat Request Response as a soft prompt, not as Force Response.
6. Treat embedded-data names and values as case-sensitive unless verified otherwise.
7. Trace every field from assignment through branch tests, display, piping, and export.
8. Check that randomizer subset sizes do not exceed eligible children and that treatment labels remain aligned with displayed content and exported fields.
9. Check every pass, fail, blank, and unexpected-value route for screening and termination logic.
10. Compare Survey Options completion behavior with explicit Survey Flow redirects and flag conflicting platforms or codes.
11. Check piped text for wrong source fields, grammar, spacing, nested HTML, and treatment-condition mismatches.
12. Check active export tags for duplicates, blanks, naming inconsistency, and recode conflicts.
13. Distinguish confirmed defects, risks, ambiguities, recommendations, and passed checks.
14. Use Critical, High, Moderate, or Low severity separately from finding status.
15. Do not label an intent-dependent choice a confirmed defect when the policy is unknown.
16. Do not expose credentials, secret panel codes, or unnecessary confidential survey text in the report.
17. Do not claim field readiness from static inspection alone. Identify all required Qualtrics preview and test-export checks.
18. If a prior QSF or report is supplied, re-run the entire audit and classify every prior finding as fixed, partly fixed, unchanged, regressed, no longer applicable, or an unresolved design choice.

## Deliverables

1. A detailed Markdown audit report based on `templates/qsf-audit-report.md`.
2. If polished document-generation tools are available, a readable PDF generated from the same report.
3. No modified QSF unless the user separately authorizes a revised copy.

The report must include metadata and the source checksum, an executive summary and fielding-readiness conclusion, coverage counts, severity definitions, detailed findings with evidence and impact, passed structural checks, recommended repair order, a pre-fielding verification checklist, and unresolved design decisions. For a re-audit, include a prior-finding status table and identify new issues.
