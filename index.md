---
title: QSF Audit Agent Guide
---

<link rel="stylesheet" href="assets/site.css">

<main class="page-shell" markdown="1">

<section class="hero" markdown="1">

# QSF Audit Agent Guide

- **Author:** Yusaku Horiuchi
- **Affiliation:** Syde P. Deeb Eminent Scholar in Political Science, Florida State University
- **Created:** August 14, 2026
- **Last revised:** August 14, 2026

![Page views](https://hits.sh/yhoriuchi.github.io/qsf-audit-agent-guide.svg?label=page%20views)

A systematic protocol for auditing Qualtrics QSF files for survey logic, randomization, validation, embedded data, wording, and export compatibility.

The audit is read-only by default. It preserves the source QSF, reconstructs the active survey, separates confirmed defects from design ambiguities, and identifies the preview and export tests still required before fielding.

<div class="hero-actions" markdown="1">
<button type="button" class="button button-primary" id="copy-agent-instructions">Copy Agent Instructions</button>
<span class="copy-status" id="copy-agent-instructions-status" aria-live="polite"></span>
</div>

</section>

## How to Use This Guide

1. Click **Copy Agent Instructions** and paste the instructions into the agent that will audit the survey.
2. Give the agent the `.qsf` file, the intended survey rules, and any prior QSF or audit report.
3. Specify eligibility, validation, randomization, panel redirect, and export requirements when known.
4. Require a detailed audit report and preserve the original QSF.

<section class="summary-grid" markdown="1">

<div class="summary-card" markdown="1">

## What the Agent Must Do

- Parse and checksum the source QSF without altering it.
- Reconstruct the active Survey Flow and trace cross-references.
- Audit validation, branches, termination, randomizers, piping, wording, and exports.
- Cite element, block, question, field, and export-tag identifiers.
- Separate confirmed defects from risks and intent-dependent choices.
- Return a complete audit report and pre-fielding checklist.

</div>

<div class="summary-card" markdown="1">

## What the Agent Must Avoid

- Treating valid JSON as proof that the survey works.
- Overwriting the source QSF.
- Guessing the researcher's design policy.
- Ignoring inactive, unreachable, or conflicting flow elements.
- Exposing confidential survey content or panel codes.
- Declaring field readiness without preview and test-export checks.

</div>

</section>

## Core Workflow

<ol class="workflow">
  <li><strong>Preserve and inventory.</strong> Record the source path, file metadata, and SHA-256 checksum; parse the JSON; inventory survey elements; and keep the audit read-only.</li>
  <li><strong>Reconstruct the active survey.</strong> Begin with the Survey Flow, recursively trace referenced blocks and questions, and separate active content from Trash, unused, unreferenced, or unreachable material.</li>
  <li><strong>Trace routing and termination.</strong> Evaluate branch conditions, embedded-data assignments, consent and eligibility failures, attention checks, quotas, End Survey elements, redirects, and conflicting platform settings.</li>
  <li><strong>Audit validation and randomization.</strong> Compare Force Response, Request Response, optional-item policy, custom validation, subset sizes, choice randomization, and treatment-recording fields with the intended design.</li>
  <li><strong>Audit content and piping.</strong> Verify every embedded field and piped value, then inspect wording, choices, grammar, spacing, HTML, and editor residue under all relevant conditions.</li>
  <li><strong>Protect exported data.</strong> Check export tags, recodes, embedded data, treatment indicators, and question structure for duplicate names, ambiguous values, and downstream incompatibilities.</li>
  <li><strong>Classify evidence.</strong> Assign severity separately from status, distinguish confirmed defects from risks and ambiguities, and name the runtime checks that static QSF inspection cannot complete.</li>
  <li><strong>Report and verify.</strong> Produce a detailed audit report, prioritize repairs, and give the researcher a route-by-route, mobile, randomization, and test-export checklist.</li>
</ol>

## Audit Coverage

The agent should inspect the QSF as a connected survey program rather than a list of questions.

| Area | Minimum checks |
|---|---|
| File integrity | JSON parsing, QSF metadata, checksum, element inventory, duplicate or missing IDs |
| Active structure | Survey Flow, blocks, questions, unreachable content, broken cross-references |
| Routing | Branch conditions, consent, eligibility, attention checks, quotas, termination, redirects |
| Randomization | Eligible children, subset size, order, treatment assignment, exported indicators |
| Validation | Force Response, Request Response, optional items, custom rules, hidden required questions |
| Embedded data | Definition, assignment, case and spelling, branch tests, piping, quotas, scoring |
| Respondent content | Wording, choices, grammar, formatting, HTML residue, mobile risks |
| Export compatibility | Export tags, recodes, text-entry columns, treatment fields, analysis continuity |
| Operations | Survey Options, anonymization, partial completion, panel integrations, external resources |

## Evidence and Classification

Use severity and status as separate dimensions.

### Severity

- **Critical:** Can invalidate consent, eligibility, sample routing, random assignment, termination, completion behavior, or the resulting data.
- **High:** Can create missing required data, incorrect treatment or piping, broken validation, quota or scoring errors, or substantial export incompatibility.
- **Moderate:** Can affect interpretation, respondent experience, or professionalism.
- **Low:** Cleanup or maintainability issue unlikely to affect recorded data.

### Finding status

- **Confirmed defect:** The QSF demonstrates a conflict with an explicit rule or necessary internal condition.
- **Risk:** Impact depends on Qualtrics runtime behavior or external configuration.
- **Ambiguity:** Design intent is missing or permits multiple coherent choices.
- **Recommendation:** Quality improvement rather than a defect.
- **Passed check:** A named structural check completed without a detected problem.

Do not turn an unknown design choice into a defect. For example, whether an attention check should be forced or optional depends on the researcher's policy; inconsistency can be reported even when the intended setting is unknown.

## Checks That Matter Especially

- `Request Response` is a soft prompt and is not equivalent to `Force Response`.
- Embedded-data field names, values, spaces, and capitalization must be used consistently.
- Failure branches must contain or reach the intended End Survey behavior; assigning a flag alone may not terminate a respondent.
- Flow-level redirects can conflict with completion URLs stored in Survey Options.
- Randomizer subset sizes must not exceed the number of eligible children.
- Treatment text, country names, or other piped values must come from the correct experiment and render grammatically.
- Hidden editor bookmarks, pasted comments, redundant nonbreaking spaces, browser-specific tags, and nested markup can survive in QSF text.
- Active export tags should be unique and compatible with downstream analysis, but exact export behavior should be confirmed with synthetic responses.

## Verification Beyond the QSF

Static inspection is necessary but not sufficient. Before fielding, preview and test:

1. Every consent, eligibility, attention-check, quota, screen-out, and completion route.
2. Pass, fail, blank, and unexpected-value cases.
3. Every randomized condition and materially different piped-text combination.
4. Desktop and mobile layouts.
5. Panel redirects, messages, recording behavior, and status codes.
6. A synthetic test-response export, including column names, recodes, embedded data, treatment indicators, text entries, and missing values.
7. The exact repaired QSF exported as the fielding candidate.

## Report Structure

Every audit should produce a detailed Markdown report. If the environment supports polished document generation, the agent may also create a PDF from the same source.

The report should include:

- audit date, AI model, reasoning level, workspace, source file, and SHA-256 checksum;
- modification status and relationship to any prior audit;
- executive summary and fielding-readiness conclusion;
- active element, block, question, randomizer, and excluded-content counts;
- severity definitions and finding statuses;
- detailed findings with identifiers, evidence, impact, repair, and verification needed;
- prior-finding status and newly introduced issues for a re-audit;
- structural checks passed;
- recommended repair order;
- pre-fielding preview and export checklist;
- unresolved design decisions and final conclusion.

<script id="agent-instructions-text" type="text/plain">{% include_relative AGENTS.md %}</script>
<script>
(function () {
  var button = document.getElementById("copy-agent-instructions");
  var source = document.getElementById("agent-instructions-text");
  var status = document.getElementById("copy-agent-instructions-status");

  if (!button || !source) {
    return;
  }

  function setStatus(message) {
    if (!status) {
      return;
    }
    status.textContent = message;
    window.clearTimeout(setStatus.timeout);
    setStatus.timeout = window.setTimeout(function () {
      status.textContent = "";
    }, 2400);
  }

  function fallbackCopy(text) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }

  button.addEventListener("click", function () {
    var text = source.textContent.trim();

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () {
        setStatus("Copied");
      }).catch(function () {
        fallbackCopy(text);
        setStatus("Copied");
      });
      return;
    }

    fallbackCopy(text);
    setStatus("Copied");
  });
})();
</script>

</main>
