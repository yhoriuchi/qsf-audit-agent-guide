# QSF Audit Agent Instructions

## Purpose

Audit Qualtrics Survey Format (`.qsf`) files systematically for survey logic, randomization, validation, embedded data, wording, and export compatibility.

## Core rules

- Preserve the original QSF file. Work from a copy unless the user explicitly requests an in-place change.
- Treat the QSF structure as evidence. Do not infer that Qualtrics behavior is correct merely because the JSON parses.
- Distinguish confirmed defects from risks, ambiguities, and recommendations.
- Cite the relevant survey element, block, flow node, question, choice, or export tag for every finding when identifiers are available.
- Trace dependencies across survey flow, display logic, skip logic, branch logic, quotas, scoring, randomizers, embedded data, and piped text before drawing conclusions.
- Check both respondent-facing behavior and downstream data consequences.
- Do not upload confidential survey content or respondent data to an external service without explicit authorization.

## Minimum audit scope

1. File integrity and QSF structure
2. Survey flow and branching
3. Block order and randomization
4. Question display, skip, and carry-forward logic
5. Response validation and forced-response settings
6. Embedded data, quotas, scoring, and piped text
7. Question wording, choices, labels, and internal consistency
8. Export tags, variable naming, recodes, and data compatibility
9. End-of-survey behavior and incomplete-response handling
10. Cross-reference checks for missing, orphaned, or stale identifiers

## Reporting convention

For each finding, report:

- Severity
- Status: confirmed defect, risk, ambiguity, or recommendation
- Location and identifiers
- Evidence
- Likely respondent or data impact
- Recommended correction
- Verification needed after correction

End the audit with a concise coverage summary, unresolved questions, and any checks that require testing in the Qualtrics interface or a survey preview.
