# Agent Instructions: Audit a Qualtrics QSF File

You are auditing a Qualtrics Survey Format (`.qsf`) file before survey fielding. Your job is to find structural, logical, respondent-facing, and export-related risks while preserving the original file and the researcher's intended design.

Do not merely confirm that the file is valid JSON. Treat the QSF as a connected survey program: trace the active Survey Flow, referenced blocks, questions, conditions, randomizers, embedded data, quotas, scoring, validation, piped text, redirects, and export behavior together.

## Operating Principles

1. Preserve the original QSF. Perform a read-only audit unless the user explicitly asks for a revised copy.
2. Never overwrite the source QSF. If edits are authorized, save a new version with a clear filename and record its SHA-256 checksum.
3. Keep survey content confidential. Do not upload a QSF, respondent data, panel links, or credentials to an external service without explicit authorization.
4. Distinguish what the QSF proves from what requires Qualtrics preview or live platform testing.
5. Distinguish confirmed defects, risks, ambiguities, recommendations, and passed checks.
6. Cite the relevant element ID, flow ID, block ID, question ID, export tag, embedded-data field, or option for every finding when available.
7. Do not infer design intent silently. Record assumptions and ask about policy choices that materially change the assessment.
8. Check both respondent experience and downstream data consequences.
9. Exclude Trash, unused, or unreachable material from active-flow findings, but identify it clearly and note any risk it still creates.
10. Produce a durable audit report even when no defects are found.

## Inputs to Request or Identify

Before auditing, identify:

1. The source QSF path and filename.
2. The project and survey name.
3. Whether this is a first audit or a re-audit of a revised QSF.
4. Any prior QSF version and prior audit report.
5. Intended survey population and eligibility rules.
6. Intended consent, screen-out, attention-check, quota, and termination behavior.
7. Which questions must be forced, requested, or optional, including explicit exceptions.
8. Intended randomization probabilities or subset sizes.
9. Recruitment or panel platform and required completion, screen-out, over-quota, and quality-failure URLs or status codes.
10. Embedded-data fields supplied by contact lists, URL parameters, web services, or panel integrations.
11. Export requirements, naming conventions, recodes, and downstream analysis constraints.
12. Whether JavaScript, custom HTML, translations, scoring, quotas, or external integrations are expected.

If some information is unavailable, continue with a structural audit and mark intent-dependent conclusions as ambiguities rather than defects.

## Audit Workflow

### 1. Preserve and Inventory the Source

1. Record the source path, filename, file size, modification time, and SHA-256 checksum.
2. Confirm that the file parses as JSON without modifying it.
3. Record QSF and survey metadata when present, including survey name, platform or QSF version, creation or modification metadata, and survey status.
4. Inventory all survey elements by type and identifier.
5. Identify the Survey Flow, block definitions, question elements, survey options, scoring, quotas, look-and-feel, translations, and other payloads present.
6. Detect duplicate, missing, malformed, or unexpectedly reused identifiers.

### 2. Reconstruct the Active Survey

1. Start from the active Survey Flow rather than the order of JSON elements.
2. Recursively trace blocks, branches, groups, randomizers, embedded-data elements, web services, authenticators, and End Survey elements.
3. Build an ordered inventory of every block and question reachable in the active flow.
4. Identify blocks and questions that are unreferenced, unreachable, in Trash, or explicitly unused.
5. Check that every referenced block, question, quota, scoring category, embedded-data field, and flow node exists.
6. Check for elements placed after unconditional End Survey or redirect elements that may therefore be unreachable.
7. Report active and inactive counts separately.

### 3. Audit Survey Flow, Branches, and Termination

For every branch and termination path:

1. Translate the condition into plain language.
2. Verify question IDs, choice IDs, recodes, embedded-data names, operators, and values.
3. Treat embedded-data field names and values as case-sensitive unless the platform behavior is verified otherwise.
4. Confirm that the tested value is assigned before the branch evaluates it.
5. Check nested `AND`/`OR` logic and whether condition groupings match the intended rule.
6. Trace pass, fail, blank, and unexpected-value routes.
7. Confirm that consent decline, ineligibility, attention failure, quota failure, and other screen-outs actually reach the intended End Survey element.
8. Check whether responses are recorded, anonymized, counted toward quotas, or ignored as intended.
9. Compare Survey Options completion behavior with explicit Survey Flow End Survey redirects.
10. Flag conflicting platforms, completion URLs, screen-out URLs, status codes, or messages.

Do not claim that a route works solely because the flow looks coherent. Require preview testing for routing, redirect, quota, authenticator, and external-integration behavior.

### 4. Audit Blocks and Randomization

For each block and randomizer:

1. Confirm that referenced children exist and are active.
2. Compare the requested subset size with the number of eligible children.
3. Check whether randomization occurs at the intended level: blocks, questions, choices, or conditions.
4. Check fixed-order, random-order, evenly presented, and advanced-randomization settings.
5. Identify pinned, excluded, duplicated, or potentially unreachable items.
6. Check that branch conditions do not unintentionally undermine random assignment.
7. Check embedded-data assignments used to record treatment conditions.
8. Confirm that treatment labels, displayed content, and exported treatment fields remain aligned.
9. Record structural checks as passed but reserve probability and display claims for simulation or preview testing when needed.

### 5. Audit Questions and Response Validation

For every active question:

1. Record question ID, export tag, block, question type, selector, subselector, and validation setting.
2. Check Force Response, Request Response, and optional status against the user's rule.
3. Treat Request Response as a soft prompt, not as equivalent to Force Response.
4. Handle consent, eligibility, attention checks, factual manipulation checks, open-ended comments, and sensitive items according to the stated policy; do not impose one universal rule.
5. Check minimum and maximum selections, content validation, numeric ranges, date formats, email formats, text length, and custom validation.
6. Check matrix, side-by-side, rank-order, constant-sum, slider, drill-down, file-upload, and text-entry configuration for answerability and export coherence.
7. Verify that choice IDs, answer IDs, recodes, display order, and validation references agree.
8. Check display logic, skip logic, carry-forward logic, default choices, and choice randomization.
9. Identify questions that can be shown but cannot be answered, can be required while hidden, or can be skipped despite intended validation.
10. Flag inconsistent treatment of substantively similar questions.

### 6. Audit Embedded Data, Piped Text, Quotas, and Scoring

1. Inventory every embedded-data field declared, assigned, tested, displayed, exported, or received externally.
2. Detect case, spelling, whitespace, and naming inconsistencies.
3. Identify fields used before assignment and fields assigned but never used.
4. Trace piped text to its exact source and verify that hypothetical, real-world, control, and treatment fields are not crossed.
5. Check the grammar and spacing that result when piped values are inserted.
6. Account for HTML already contained in embedded values to avoid nested or broken formatting.
7. Verify quota references, conditions, increments, actions, and termination behavior.
8. Verify scoring references, category assignments, values, and any branch or display logic that depends on scores.
9. Check contact-list, URL-parameter, authenticator, and panel fields for name compatibility without exposing secret values in the report.

### 7. Audit Wording, Choices, and Formatting

1. Read all active respondent-facing text in flow order.
2. Check wording consistency across instructions, questions, choices, validation messages, and End Survey messages.
3. Check that named countries, actors, time periods, treatments, and pronouns agree with the assigned condition.
4. Check choice completeness, mutual exclusivity where intended, scale direction, anchors, and `Other` text-entry behavior.
5. Flag typos, unintended quotation marks, duplicated punctuation, extra spaces, broken entities, and inconsistent capitalization.
6. Identify hidden editor bookmarks, pasted comments, empty spans, redundant nonbreaking spaces, repeated `<br>` tags, browser-specific tags such as `<br type="_moz">`, and malformed nesting.
7. Preserve meaningful paragraphs, lists, emphasis, underlining, and accessible structure. Recommend targeted cleanup rather than stripping all HTML.
8. Flag images or media with missing references, inaccessible alternatives, insecure URLs, or likely mobile-display problems.

### 8. Audit Export and Downstream Compatibility

1. Check active export tags for duplicates, blanks, accidental defaults, inconsistent naming, and case collisions.
2. Check whether question type, choices, subquestions, text entries, and recodes will create the expected export columns.
3. Check embedded-data fields and treatment indicators for stable, analysis-ready names and values.
4. Identify renamed or removed questions that may break longitudinal merges, preregistered code, data dictionaries, or analysis scripts.
5. Check recode uniqueness and consistency across parallel items.
6. Flag labels or values that are ambiguous after export.
7. Do not guarantee the exact exported dataset from QSF inspection alone. Require a test response and export when export compatibility is material.

### 9. Audit Survey Options and Operational Settings

Check relevant Survey Options and related elements for:

1. Back button, save-and-continue, progress bar, question numbering, and partial-completion behavior.
2. Inactive-survey, expiration, duplicate-response, ballot-box stuffing, and response-anonymization settings.
3. Language, translation, accessibility, mobile, and look-and-feel risks visible in the QSF.
4. Custom JavaScript or external resources that require separate security and runtime review.
5. Completion messages, redirects, panel integrations, and response-recording settings.
6. Conflicts between global Survey Options and explicit flow-level behavior.

### 10. Compare Revisions When Applicable

When a prior QSF or audit exists:

1. Record checksums for both QSF versions.
2. Re-run the full audit; do not inspect only previously reported findings.
3. Create a finding-by-finding status table: fixed, partly fixed, unchanged, regressed, no longer applicable, or unresolved design choice.
4. Identify new defects introduced by the revision.
5. State which report supersedes the earlier report for the current file.

## Severity and Status

Use severity separately from finding status.

### Severity

- **Critical:** Can invalidate consent, eligibility, sample routing, random assignment, termination, or completion behavior; can expose respondents to the wrong study; or can materially invalidate the data.
- **High:** Can create missing required data, incorrect treatment or piping, broken validation, quota/scoring errors, or substantial export incompatibility.
- **Moderate:** Wording, formatting, consistency, or operational issue that can affect interpretation, respondent experience, or professionalism.
- **Low:** Cleanup or maintainability issue unlikely to affect recorded data.

### Status

- **Confirmed defect:** The QSF itself demonstrates behavior inconsistent with an explicit rule or internally necessary condition.
- **Risk:** The structure is concerning, but impact depends on Qualtrics runtime behavior or external configuration.
- **Ambiguity:** The design intent needed to judge the configuration is unknown or admits multiple coherent choices.
- **Recommendation:** A quality improvement rather than a defect.
- **Passed check:** A named structural check completed without a detected problem.

Do not label an intent-dependent choice a confirmed defect unless the intended rule is documented.

## Required Audit Report

Return a detailed Markdown report for every audit. If the environment supports polished document generation, also create a readable PDF derived from the same report; the Markdown report remains the editable source. The report must be detailed enough for a researcher or later agent to reproduce the audit.

Include:

1. Report metadata: audit date, AI model, reasoning level, project, survey, workspace, source QSF, source SHA-256, audit scope, modification status, and relationship to prior versions.
2. Executive summary with a clear fielding-readiness conclusion.
3. Coverage counts: total and active elements, blocks, questions, randomizers, and excluded or dormant content.
4. Severity definitions.
5. Findings grouped by validation, flow and termination, randomization, embedded data and piping, wording and formatting, export compatibility, and operational settings.
6. For each finding: severity, status, location, identifiers, evidence, impact, recommended correction, and verification needed.
7. Structural checks passed.
8. Recommended repair order.
9. A pre-fielding verification checklist covering every route and material randomized rendering.
10. Audit conclusion and unresolved design decisions.
11. For a re-audit, a status table for every prior finding plus newly detected findings.

Do not include sensitive panel codes, credentials, or unnecessary confidential survey text. Redact secret values while preserving enough information to diagnose the configuration.

## Required Verification Checklist

The report must distinguish completed static checks from manual checks still required. Recommend, as applicable:

1. Preview every consent, eligibility, attention-check, quota, completion, and screen-out route.
2. Test pass, fail, blank, and unexpected-value cases.
3. Preview every randomized condition and every piped-text combination.
4. Test desktop and mobile layouts.
5. Confirm completion and status codes with the intended panel platform.
6. Submit synthetic test responses and inspect the exported data.
7. Confirm export column names, recodes, embedded data, treatment indicators, missing values, and text-entry columns.
8. Re-export the QSF after repairs and re-run the audit on the exact fielding candidate.

## Stop Conditions

Stop and ask the user before:

1. Editing or overwriting the source QSF.
2. Changing consent, eligibility, randomization, quota, scoring, attention-check, termination, or completion policy.
3. Choosing between conflicting panel platforms or redirect codes.
4. Removing custom JavaScript, web services, authenticators, or external integrations.
5. Publishing a QSF or audit report that may contain confidential study content, panel codes, or security-sensitive configuration.
6. Claiming the survey is field-ready without the required Qualtrics preview and test-export checks.
