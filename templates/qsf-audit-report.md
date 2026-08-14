# QSF Audit Report

## Report Metadata

- Audit date: `[Month Day, Year]`
- AI model: `[exact model / not reported]`
- Reasoning level or intelligence setting: `[exact setting / not reported]`
- Project: `[project]`
- Survey: `[survey]`
- Workspace: `[path]`
- Source QSF: `[path]`
- Source file size: `[bytes]`
- Source modified time: `[timestamp]`
- Source SHA-256: `[checksum]`
- Audit scope: `[scope]`
- Modification status: `Read-only audit; the source QSF was not changed`
- Prior QSF or report: `[path / none]`
- Relationship to prior report: `[first audit / supersedes prior report for current file / other]`
- Verification status: `[static audit complete; preview/export checks pending or completed]`

## Executive Summary

Fielding-readiness conclusion: `[ready for controlled testing / not ready for fielding / other]`

`[Concise summary of the most important findings, improvements, and unresolved decisions.]`

Key findings:

1. `[finding]`
2. `[finding]`
3. `[finding]`

Coverage:

- Survey elements: `[count]`
- Referenced active blocks: `[count]`
- Active question elements: `[count]`
- Active randomizers: `[count]`
- Dormant, Trash, unreferenced, or unreachable content: `[count and treatment]`

## Severity Classification

| Severity | Meaning |
|---|---|
| Critical | Can invalidate consent, eligibility, sample routing, random assignment, termination, completion behavior, or the resulting data. |
| High | Can create missing required data, incorrect treatment or piping, broken validation, quota/scoring errors, or substantial export incompatibility. |
| Moderate | Wording, formatting, consistency, or operational issue that can affect interpretation, respondent experience, or professionalism. |
| Low | Cleanup or maintainability issue unlikely to affect recorded data. |

Finding status is reported separately as `confirmed defect`, `risk`, `ambiguity`, `recommendation`, or `passed check`.

## Status of Prior Findings

Remove this section for a first audit.

| Prior finding | Current status | Current assessment |
|---|---|---|
| `[finding]` | `[fixed / partly fixed / unchanged / regressed / no longer applicable / unresolved design choice]` | `[assessment]` |

## 1. File Integrity and Active-Survey Inventory

### 1.1 Parsing and metadata

- `[result]`

### 1.2 Active-flow reconstruction

- `[result]`

### 1.3 Cross-reference and identifier checks

- `[result]`

## 2. Response Validation

| Severity | Status | Question ID | Export tag | Block | Current setting | Expected setting or decision | Evidence and impact |
|---|---|---|---|---|---|---|---|
| `[severity]` | `[status]` | `[QID]` | `[tag]` | `[block]` | `[setting]` | `[setting/decision]` | `[evidence and impact]` |

## 3. Survey Flow, Branching, and Termination

### 3.1 `[Finding title]`

- Severity: `[severity]`
- Status: `[status]`
- Location and identifiers: `[flow/block/question/field IDs]`
- Evidence: `[what the QSF demonstrates]`
- Likely impact: `[respondent or data impact]`
- Recommended correction: `[correction]`
- Verification needed: `[preview/runtime check]`

## 4. Randomization and Treatment Alignment

| Randomizer or location | Children | Subset or mode | Treatment-recording field | Assessment | Verification needed |
|---|---:|---|---|---|---|
| `[ID]` | `[count]` | `[setting]` | `[field]` | `[assessment]` | `[check]` |

## 5. Embedded Data, Piping, Quotas, and Scoring

| Severity | Status | Field or object | Defined/assigned at | Used at | Finding | Recommended correction |
|---|---|---|---|---|---|---|
| `[severity]` | `[status]` | `[name/ID]` | `[location]` | `[location]` | `[finding]` | `[correction]` |

## 6. Wording, Choices, and HTML

| Severity | Status | Location | Issue | Recommended correction |
|---|---|---|---|---|
| `[severity]` | `[status]` | `[QID/choice]` | `[issue]` | `[correction]` |

## 7. Export and Downstream Compatibility

| Severity | Status | Location | Export effect | Recommended correction or test |
|---|---|---|---|---|
| `[severity]` | `[status]` | `[QID/tag/field]` | `[effect]` | `[correction/test]` |

## 8. Survey Options and Operational Settings

| Severity | Status | Setting or location | Assessment | Verification needed |
|---|---|---|---|---|
| `[severity]` | `[status]` | `[setting]` | `[assessment]` | `[check]` |

## 9. Structural Checks Passed

- `[ ] The QSF parses as valid JSON.`
- `[ ] Every active flow reference resolves to an existing object.`
- `[ ] Active export tags are unique.`
- `[ ] Randomizer subset sizes do not exceed eligible children.`
- `[other passed check]`

Mark only checks actually completed. Replace checkbox text with concrete counts where useful.

## 10. Recommended Repair Order

1. `[repair]`
2. `[repair]`
3. `[repair]`

## 11. Pre-Fielding Verification Checklist

- [ ] Consent acceptance and decline routes behave as intended.
- [ ] Every eligibility pass and fail route behaves as intended.
- [ ] Attention-check pass, fail, and blank routes behave as intended.
- [ ] Quota-full and other screen-out routes use the intended message, recording behavior, and status code.
- [ ] Every randomized condition appears with the intended probability or subset rule.
- [ ] Every piped-text combination is grammatical and uses the correct source field.
- [ ] Forced, requested, and optional responses match the confirmed policy.
- [ ] Normal completion reaches the intended platform and status code.
- [ ] Desktop and mobile previews contain no clipped labels, broken HTML, or editor artifacts.
- [ ] Synthetic test responses export with the expected columns, recodes, embedded data, treatment indicators, and missing values.
- [ ] The repaired fielding-candidate QSF has been re-exported, checksummed, and re-audited.

## Audit Conclusion

`[Concise conclusion, fielding-readiness assessment, unresolved decisions, and confirmation that the audit did or did not alter the source QSF.]`
