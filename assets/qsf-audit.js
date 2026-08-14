(function () {
  "use strict";

  var MAX_FILE_SIZE = 20 * 1024 * 1024;
  var currentReport = "";
  var currentReportName = "qsf-quick-audit-report.md";
  var currentReportUrl = "";

  function byId(id) {
    return document.getElementById(id);
  }

  function setText(element, value) {
    if (element) {
      element.textContent = value;
    }
  }

  function clearElement(element) {
    while (element && element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  function createElement(tag, className, text) {
    var element = document.createElement(tag);
    if (className) {
      element.className = className;
    }
    if (text !== undefined) {
      element.textContent = text;
    }
    return element;
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

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () {
        fallbackCopy(text);
      });
    }
    fallbackCopy(text);
    return Promise.resolve();
  }

  function temporaryStatus(element, message) {
    setText(element, message);
    window.clearTimeout(temporaryStatus.timeout);
    temporaryStatus.timeout = window.setTimeout(function () {
      setText(element, "");
    }, 2400);
  }

  function walk(value, visit, path) {
    var currentPath = path || "$";
    visit(value, currentPath);
    if (Array.isArray(value)) {
      value.forEach(function (item, index) {
        walk(item, visit, currentPath + "[" + index + "]");
      });
      return;
    }
    if (value && typeof value === "object") {
      Object.keys(value).forEach(function (key) {
        walk(value[key], visit, currentPath + "." + key);
      });
    }
  }

  function collectStrings(value) {
    var strings = [];
    walk(value, function (item, path) {
      if (typeof item === "string") {
        strings.push({ value: item, path: path });
      }
    });
    return strings;
  }

  function countBy(values) {
    var counts = new Map();
    values.forEach(function (value) {
      if (value !== null && value !== undefined && value !== "") {
        counts.set(value, (counts.get(value) || 0) + 1);
      }
    });
    return counts;
  }

  function duplicates(values) {
    return Array.from(countBy(values).entries())
      .filter(function (entry) { return entry[1] > 1; })
      .map(function (entry) { return entry[0]; });
  }

  function unique(values) {
    return Array.from(new Set(values));
  }

  function escapeMarkdown(value) {
    return String(value === undefined || value === null ? "" : value)
      .replace(/\|/g, "\\|")
      .replace(/\r?\n/g, " ");
  }

  function safeFileStem(name) {
    return name.replace(/\.qsf$/i, "").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "qsf";
  }

  function formatBytes(bytes) {
    if (bytes < 1024) {
      return bytes + " bytes";
    }
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + " KB";
    }
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function severityRank(severity) {
    return { Critical: 0, High: 1, Moderate: 2, Low: 3 }[severity] || 4;
  }

  function statusLabel(status) {
    return status || "Risk";
  }

  function addFinding(findings, severity, status, title, location, evidence, recommendation) {
    findings.push({
      severity: severity,
      status: status,
      title: title,
      location: location,
      evidence: evidence,
      recommendation: recommendation
    });
  }

  function elementType(element) {
    return element && (element.Element || element.Type || "Unknown");
  }

  function questionId(element) {
    return element && element.Payload && (element.Payload.QuestionID || element.PrimaryAttribute) || element && element.PrimaryAttribute || "Unknown question";
  }

  function blockId(block) {
    return block && (block.ID || block.BlockID || block.PrimaryAttribute);
  }

  function extractBlockArray(blockElement) {
    if (!blockElement) {
      return [];
    }
    if (Array.isArray(blockElement.Payload)) {
      return blockElement.Payload;
    }
    if (blockElement.Payload && Array.isArray(blockElement.Payload.Blocks)) {
      return blockElement.Payload.Blocks;
    }
    return [];
  }

  function extractFlowRoot(flowElement) {
    if (!flowElement) {
      return null;
    }
    return flowElement.Payload || flowElement.Flow || null;
  }

  function directFlowChildren(node) {
    if (!node || typeof node !== "object") {
      return [];
    }
    if (Array.isArray(node.Flow)) {
      return node.Flow;
    }
    if (Array.isArray(node.Children)) {
      return node.Children;
    }
    return [];
  }

  function findFlowObjects(root) {
    var objects = [];
    walk(root, function (value, path) {
      if (value && typeof value === "object" && !Array.isArray(value) && typeof value.Type === "string") {
        objects.push({ value: value, path: path });
      }
    });
    return objects;
  }

  function getForceResponse(payload) {
    var candidates = [
      payload && payload.ValidationSettings && payload.ValidationSettings.ForceResponse,
      payload && payload.Validation && payload.Validation.Settings && payload.Validation.Settings.ForceResponse,
      payload && payload.Validation && payload.Validation.ForceResponse
    ];
    return candidates.find(function (value) { return value !== undefined && value !== null; });
  }

  function getRequestResponse(payload) {
    var candidates = [
      payload && payload.ValidationSettings && payload.ValidationSettings.RequestResponse,
      payload && payload.Validation && payload.Validation.Settings && payload.Validation.Settings.RequestResponse,
      payload && payload.Validation && payload.Validation.RequestResponse
    ];
    return candidates.find(function (value) { return value !== undefined && value !== null; });
  }

  function extractUrls(value) {
    var urls = [];
    collectStrings(value).forEach(function (entry) {
      var matches = entry.value.match(/https?:\/\/[^\s"'<>]+/gi) || [];
      matches.forEach(function (url) {
        try {
          urls.push({ url: url, host: new URL(url).host, path: entry.path });
        } catch (error) {
          return;
        }
      });
    });
    return urls;
  }

  function hexDigest(buffer) {
    return Array.from(new Uint8Array(buffer)).map(function (byte) {
      return byte.toString(16).padStart(2, "0");
    }).join("");
  }

  function sha256(text) {
    if (!window.crypto || !window.crypto.subtle) {
      return Promise.resolve("Unavailable in this browser context");
    }
    return window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)).then(hexDigest);
  }

  function analyzeQsf(qsf, file, checksum) {
    var findings = [];
    var passed = [];
    var elements = Array.isArray(qsf.SurveyElements) ? qsf.SurveyElements : [];
    var surveyEntry = qsf.SurveyEntry || {};

    if (!Array.isArray(qsf.SurveyElements)) {
      addFinding(findings, "Critical", "Confirmed defect", "SurveyElements is missing or is not an array", "QSF root", "The expected SurveyElements collection could not be read.", "Re-export the survey from Qualtrics and confirm that the selected file is a complete QSF export.");
    } else {
      passed.push("The file parses as JSON and contains a SurveyElements array.");
    }

    var byType = new Map();
    elements.forEach(function (element) {
      var type = elementType(element);
      if (!byType.has(type)) {
        byType.set(type, []);
      }
      byType.get(type).push(element);
    });

    var primaryIds = elements.map(function (element) { return element.PrimaryAttribute; }).filter(Boolean);
    var duplicatePrimaryIds = duplicates(primaryIds);
    if (duplicatePrimaryIds.length) {
      addFinding(findings, "High", "Confirmed defect", "Duplicate survey-element identifiers", duplicatePrimaryIds.join(", "), duplicatePrimaryIds.length + " PrimaryAttribute value(s) are reused.", "Inspect the duplicated elements and re-export or repair the survey so each element identifier is unique.");
    } else if (elements.length) {
      passed.push("No duplicate nonblank PrimaryAttribute values were detected among survey elements.");
    }

    var questions = (byType.get("SQ") || []).filter(function (element) { return element.Payload && typeof element.Payload === "object"; });
    var questionMap = new Map();
    questions.forEach(function (element) {
      questionMap.set(questionId(element), element);
    });

    var blockElements = byType.get("BL") || [];
    var blocks = [];
    blockElements.forEach(function (element) {
      extractBlockArray(element).forEach(function (block) {
        blocks.push(block);
      });
    });
    var blockMap = new Map();
    blocks.forEach(function (block) {
      if (blockId(block)) {
        blockMap.set(blockId(block), block);
      }
    });

    var flowElement = (byType.get("FL") || [])[0];
    var flowRoot = extractFlowRoot(flowElement);
    var flowObjects = findFlowObjects(flowRoot);
    var referencedBlockIds = unique(flowObjects.filter(function (entry) {
      return entry.value.Type.toLowerCase() === "block" && typeof entry.value.ID === "string";
    }).map(function (entry) { return entry.value.ID; }));

    if (!flowElement) {
      addFinding(findings, "Critical", "Risk", "Survey Flow element was not found", "SurveyElements", "No FL element was detected, so the active survey route could not be reconstructed.", "Confirm that this is a complete Qualtrics export and inspect the Survey Flow in Qualtrics.");
    } else {
      passed.push("A Survey Flow element was found and inspected.");
    }

    var missingBlocks = referencedBlockIds.filter(function (id) { return !blockMap.has(id); });
    if (missingBlocks.length) {
      addFinding(findings, "Critical", "Confirmed defect", "Survey Flow references missing blocks", missingBlocks.join(", "), missingBlocks.length + " referenced block ID(s) do not exist in the block payload.", "Restore the missing block references or remove stale flow elements, then re-export and retest the survey.");
    } else if (referencedBlockIds.length) {
      passed.push("Every block ID referenced by the detected Survey Flow resolves to a block definition.");
    }

    var activeBlockIds = referencedBlockIds.length ? referencedBlockIds : Array.from(blockMap.keys());
    var resolvedActiveBlockIds = activeBlockIds.filter(function (id) { return blockMap.has(id); });
    var activeQuestionIds = [];
    var missingQuestionIds = [];
    resolvedActiveBlockIds.forEach(function (id) {
      var block = blockMap.get(id);
      var blockQuestions = block && Array.isArray(block.BlockElements) ? block.BlockElements : [];
      blockQuestions.forEach(function (item) {
        if (item && String(item.Type || "").toLowerCase() === "question" && item.QuestionID) {
          activeQuestionIds.push(item.QuestionID);
          if (!questionMap.has(item.QuestionID)) {
            missingQuestionIds.push(item.QuestionID);
          }
        }
      });
    });
    activeQuestionIds = unique(activeQuestionIds);
    missingQuestionIds = unique(missingQuestionIds);

    if (missingQuestionIds.length) {
      addFinding(findings, "High", "Confirmed defect", "Active blocks reference missing questions", missingQuestionIds.join(", "), missingQuestionIds.length + " question reference(s) do not resolve to SQ elements.", "Restore the missing questions or remove stale block references, then re-export the QSF.");
    } else if (activeQuestionIds.length) {
      passed.push("Every question ID referenced by the detected active blocks resolves to a question element.");
    }

    var activeQuestions = activeQuestionIds.length ? activeQuestionIds.map(function (id) { return questionMap.get(id); }).filter(Boolean) : questions;
    var exportTags = activeQuestions.map(function (element) {
      return element.Payload.DataExportTag;
    }).filter(function (tag) { return typeof tag === "string" && tag.trim(); });
    var duplicateExportTags = duplicates(exportTags);
    var blankExportTagIds = activeQuestions.filter(function (element) {
      return !element.Payload.DataExportTag || !String(element.Payload.DataExportTag).trim();
    }).map(questionId);

    if (duplicateExportTags.length) {
      addFinding(findings, "High", "Confirmed defect", "Duplicate active export tags", duplicateExportTags.join(", "), duplicateExportTags.length + " export tag(s) are assigned to more than one active question.", "Assign unique, stable export tags and verify the resulting test-data columns.");
    } else if (activeQuestions.length) {
      passed.push("No duplicate nonblank export tags were detected among the inferred active questions.");
    }
    if (blankExportTagIds.length) {
      addFinding(findings, "Moderate", "Risk", "Active questions with blank export tags", blankExportTagIds.join(", "), blankExportTagIds.length + " inferred active question(s) lack a nonblank DataExportTag.", "Assign stable analysis-ready export tags and verify a synthetic data export.");
    }

    var forcedOn = 0;
    var forcedOff = 0;
    var requested = 0;
    var validationUnknown = 0;
    activeQuestions.forEach(function (element) {
      var force = getForceResponse(element.Payload);
      var request = getRequestResponse(element.Payload);
      if (String(force).toUpperCase() === "ON" || force === true) {
        forcedOn += 1;
      } else if (String(force).toUpperCase() === "OFF" || force === false) {
        forcedOff += 1;
      } else {
        validationUnknown += 1;
      }
      if (String(request).toUpperCase() === "ON" || request === true) {
        requested += 1;
      }
    });

    if (forcedOn && forcedOff) {
      addFinding(findings, "Moderate", "Ambiguity", "Mixed forced-response settings require policy review", "Inferred active questions", forcedOn + " question(s) are forced and " + forcedOff + " question(s) are not forced. The QSF alone does not establish which exceptions are intentional.", "Compare every validation setting with the confirmed policy for substantive items, consent, eligibility, checks, comments, and sensitive questions.");
    }
    if (requested) {
      addFinding(findings, "Moderate", "Risk", "Request Response is used on active questions", "Inferred active questions", requested + " question(s) use Request Response. This is a soft prompt and does not force an answer.", "Confirm that soft prompting is intentional; use Force Response only where ethically and substantively appropriate.");
    }

    var randomizers = flowObjects.filter(function (entry) {
      return entry.value.Type.toLowerCase() === "randomizer";
    });
    randomizers.forEach(function (entry, index) {
      var node = entry.value;
      var children = directFlowChildren(node);
      var subset = Number(node.SubSet !== undefined ? node.SubSet : node.Subset !== undefined ? node.Subset : node.Count);
      if (Number.isFinite(subset) && subset > children.length) {
        addFinding(findings, "Critical", "Confirmed defect", "Randomizer requests more children than are available", node.FlowID || node.ID || "Randomizer " + (index + 1), "The subset is " + subset + " but only " + children.length + " direct child element(s) were detected.", "Reduce the subset or restore missing children, then preview every randomized route.");
      } else if (!children.length) {
        addFinding(findings, "High", "Risk", "Randomizer has no detected children", node.FlowID || node.ID || "Randomizer " + (index + 1), "No direct Flow or Children array entries were detected.", "Inspect the randomizer in Qualtrics and confirm that it contains the intended elements.");
      }
    });
    if (randomizers.length && !findings.some(function (finding) { return finding.title.indexOf("Randomizer") === 0; })) {
      passed.push("Detected randomizers do not request more direct children than are structurally available.");
    }

    var fieldNames = [];
    flowObjects.forEach(function (entry) {
      if (entry.value.Type.toLowerCase() === "embeddeddata") {
        collectStrings(entry.value).forEach(function (item) {
          if (/\.Field$/.test(item.path) && item.value.trim()) {
            fieldNames.push(item.value.trim());
          }
        });
      }
    });
    var lowerFields = new Map();
    unique(fieldNames).forEach(function (field) {
      var key = field.toLowerCase();
      if (!lowerFields.has(key)) {
        lowerFields.set(key, []);
      }
      lowerFields.get(key).push(field);
    });
    var caseCollisions = Array.from(lowerFields.values()).filter(function (values) { return unique(values).length > 1; });
    if (caseCollisions.length) {
      addFinding(findings, "Critical", "Risk", "Embedded-data names differ only by capitalization", "Survey Flow embedded data", caseCollisions.map(function (values) { return values.join(" / "); }).join("; "), "Use one exact field name consistently, then preview every affected branch and piped-text location.");
    }

    var pipedFields = [];
    activeQuestions.forEach(function (element) {
      collectStrings(element.Payload).forEach(function (entry) {
        var regex = /\$\{e:\/\/Field\/([^}]+)\}/g;
        var match;
        while ((match = regex.exec(entry.value)) !== null) {
          pipedFields.push({ field: match[1].trim(), question: questionId(element) });
        }
      });
    });
    var knownFields = new Set(fieldNames);
    var unknownPiped = pipedFields.filter(function (entry) { return knownFields.size && !knownFields.has(entry.field); });
    var caseMismatchedPiped = unknownPiped.filter(function (entry) {
      return Array.from(knownFields).some(function (field) { return field.toLowerCase() === entry.field.toLowerCase(); });
    });
    if (caseMismatchedPiped.length) {
      addFinding(findings, "High", "Confirmed defect", "Piped embedded-data names have capitalization mismatches", unique(caseMismatchedPiped.map(function (entry) { return entry.question + ": " + entry.field; })).join(", "), caseMismatchedPiped.length + " piped reference(s) differ in capitalization from a declared field.", "Use the exact declared field name and preview every affected question.");
    }
    var externallyPossiblePiped = unknownPiped.filter(function (entry) { return caseMismatchedPiped.indexOf(entry) === -1; });
    if (externallyPossiblePiped.length) {
      addFinding(findings, "Moderate", "Risk", "Piped fields are not declared in detected embedded-data flow", unique(externallyPossiblePiped.map(function (entry) { return entry.question + ": " + entry.field; })).join(", "), "These fields may be supplied externally, but that cannot be confirmed from the QSF.", "Confirm contact-list, URL-parameter, authenticator, web-service, or panel assignments and preview the rendered text.");
    }

    var residuePatterns = [
      { label: "hidden CKEditor bookmark", regex: /cke_bm_[a-zA-Z0-9]+|data-cke-bookmark|display\s*:\s*none/gi },
      { label: "HTML comment", regex: /<!--[\s\S]*?-->/g },
      { label: "browser-specific _moz markup", regex: /type=["']?_moz["']?/gi },
      { label: "repeated nonbreaking spaces", regex: /(?:&nbsp;\s*){3,}/gi },
      { label: "repeated line breaks", regex: /(?:<br\s*\/?>(?:\s|&nbsp;)*){3,}/gi }
    ];
    var residueHits = [];
    activeQuestions.forEach(function (element) {
      var text = collectStrings(element.Payload).map(function (entry) { return entry.value; }).join("\n");
      residuePatterns.forEach(function (pattern) {
        pattern.regex.lastIndex = 0;
        if (pattern.regex.test(text)) {
          residueHits.push(questionId(element) + ": " + pattern.label);
        }
      });
    });
    if (residueHits.length) {
      addFinding(findings, "Moderate", "Recommendation", "Editor residue or redundant markup detected", unique(residueHits).join(", "), unique(residueHits).length + " question-and-pattern combination(s) were detected.", "Remove only unnecessary residue while preserving meaningful paragraphs, lists, emphasis, and accessible structure; then preview desktop and mobile layouts.");
    }

    var customCodeIds = activeQuestions.filter(function (element) {
      return collectStrings(element.Payload).some(function (entry) {
        return /QuestionJS|JavaScript/i.test(entry.path) && entry.value.trim();
      }) || Object.keys(element.Payload).some(function (key) { return /javascript|questionjs/i.test(key); });
    }).map(questionId);
    if (customCodeIds.length) {
      addFinding(findings, "High", "Risk", "Custom JavaScript requires separate review", unique(customCodeIds).join(", "), customCodeIds.length + " active question(s) appear to contain custom code or code references.", "Review the code for correctness, privacy, security, external requests, mobile behavior, and compatibility with the current Qualtrics runtime.");
    }

    var surveyOptions = byType.get("SO") || [];
    var endSurveyObjects = flowObjects.filter(function (entry) {
      return entry.value.Type.toLowerCase().replace(/\s+/g, "") === "endsurvey";
    }).map(function (entry) { return entry.value; });
    var redirectUrls = extractUrls(surveyOptions.concat(endSurveyObjects));
    var redirectHosts = unique(redirectUrls.map(function (entry) { return entry.host; }));
    if (redirectHosts.length > 1) {
      addFinding(findings, "Critical", "Risk", "Multiple redirect hosts are configured", "Survey Options and End Survey elements", redirectHosts.length + " distinct hostnames were detected in completion-related settings. Hostnames are omitted from this privacy-preserving report.", "Confirm the intended panel or recruitment platform and reconcile every completion and screen-out destination before fielding.");
    } else if (redirectUrls.length) {
      passed.push("Completion-related URLs detected in Survey Options and End Survey elements use one hostname.");
    }

    var unreferencedBlocks = Array.from(blockMap.keys()).filter(function (id) { return referencedBlockIds.length && referencedBlockIds.indexOf(id) === -1; });
    if (unreferencedBlocks.length) {
      addFinding(findings, "Low", "Recommendation", "Blocks are not referenced by the detected Survey Flow", unreferencedBlocks.join(", "), unreferencedBlocks.length + " block(s) appear inactive or unused.", "Confirm that these blocks are intentionally dormant or in Trash before deleting or ignoring them.");
    }

    findings.sort(function (a, b) {
      return severityRank(a.severity) - severityRank(b.severity) || a.title.localeCompare(b.title);
    });

    var metrics = {
      elements: elements.length,
      questions: questions.length,
      activeQuestions: activeQuestions.length,
      blocks: blocks.length,
      activeBlocks: resolvedActiveBlockIds.length,
      randomizers: randomizers.length,
      embeddedFields: unique(fieldNames).length,
      forcedOn: forcedOn,
      forcedOff: forcedOff,
      requested: requested,
      validationUnknown: validationUnknown,
      findings: findings.length
    };

    return {
      file: file,
      checksum: checksum,
      surveyName: surveyEntry.SurveyName || surveyEntry.SurveyDescription || "Not reported",
      surveyId: surveyEntry.SurveyID || surveyEntry.SurveyId || "Not reported",
      metrics: metrics,
      findings: findings,
      passed: passed
    };
  }

  function buildReport(result) {
    var metrics = result.metrics;
    var lines = [];
    var critical = result.findings.filter(function (finding) { return finding.severity === "Critical"; }).length;
    var high = result.findings.filter(function (finding) { return finding.severity === "High"; }).length;
    var readiness = critical || high ? "Not ready for fielding based on the structural quick audit; resolve and verify the findings below." : "No Critical or High structural finding was detected, but preview and test-export verification are still required before fielding.";

    lines.push("# QSF Quick Audit Report", "", "## Report Metadata", "");
    lines.push("- Audit date: " + new Date().toISOString());
    lines.push("- Audit method: Browser-only deterministic quick audit");
    lines.push("- Source file: `" + escapeMarkdown(result.file.name) + "`");
    lines.push("- Source file size: " + formatBytes(result.file.size));
    lines.push("- Source modified time: " + new Date(result.file.lastModified).toISOString());
    lines.push("- Source SHA-256: `" + result.checksum + "`");
    lines.push("- Survey name: " + escapeMarkdown(result.surveyName));
    lines.push("- Survey ID: `" + escapeMarkdown(result.surveyId) + "`");
    lines.push("- Modification status: Read-only audit; the source QSF was not changed");
    lines.push("- Privacy status: Processed locally in browser memory; file contents were not transmitted or stored by the website");
    lines.push("- Verification status: Static quick audit complete; Qualtrics preview and test-export checks pending");
    lines.push("", "## Executive Summary", "", readiness, "");
    lines.push("- Survey elements: " + metrics.elements);
    lines.push("- Question elements: " + metrics.questions);
    lines.push("- Inferred active questions: " + metrics.activeQuestions);
    lines.push("- Blocks: " + metrics.blocks);
    lines.push("- Inferred active blocks: " + metrics.activeBlocks);
    lines.push("- Randomizers: " + metrics.randomizers);
    lines.push("- Detected embedded-data fields: " + metrics.embeddedFields);
    lines.push("- Findings: " + metrics.findings + " (Critical: " + critical + ", High: " + high + ")");
    lines.push("", "## Response-Validation Inventory", "");
    lines.push("- Force Response ON: " + metrics.forcedOn);
    lines.push("- Force Response OFF: " + metrics.forcedOff);
    lines.push("- Request Response ON: " + metrics.requested);
    lines.push("- Validation setting not classified: " + metrics.validationUnknown);
    lines.push("", "These counts do not establish which settings are correct. Compare them with the confirmed policy for substantive questions, consent, eligibility, checks, comments, and sensitive items.");
    lines.push("", "## Findings", "");

    if (!result.findings.length) {
      lines.push("No structural finding was generated by the current deterministic checks.", "");
    } else {
      lines.push("| Severity | Status | Finding | Location | Evidence | Recommended action |", "|---|---|---|---|---|---|");
      result.findings.forEach(function (finding) {
        lines.push("| " + finding.severity + " | " + statusLabel(finding.status) + " | " + escapeMarkdown(finding.title) + " | " + escapeMarkdown(finding.location) + " | " + escapeMarkdown(finding.evidence) + " | " + escapeMarkdown(finding.recommendation) + " |");
      });
      lines.push("");
    }

    lines.push("## Structural Checks Passed", "");
    if (!result.passed.length) {
      lines.push("- No passed check was recorded.");
    } else {
      result.passed.forEach(function (item) { lines.push("- " + item); });
    }

    lines.push("", "## Pre-Fielding Verification Checklist", "");
    [
      "Consent acceptance and decline routes behave as intended.",
      "Every eligibility pass and fail route behaves as intended.",
      "Attention-check pass, fail, and blank routes behave as intended.",
      "Quota-full and other screen-out routes use the intended message, recording behavior, and status code.",
      "Every randomized condition appears with the intended probability or subset rule.",
      "Every piped-text combination is grammatical and uses the correct source field.",
      "Forced, requested, and optional responses match the confirmed policy.",
      "Normal completion reaches the intended platform and status code.",
      "Desktop and mobile previews contain no clipped labels, broken HTML, or editor artifacts.",
      "Synthetic test responses export with the expected columns, recodes, embedded data, treatment indicators, and missing values.",
      "The repaired fielding-candidate QSF has been re-exported, checksummed, and re-audited."
    ].forEach(function (item) { lines.push("- [ ] " + item); });

    lines.push("", "## Limitations", "");
    lines.push("This browser-only Quick Audit checks deterministic structural patterns visible in the QSF. It does not infer every research-design intention, execute custom JavaScript or web services, simulate the Qualtrics runtime, contact a panel platform, or inspect an exported dataset. For substantive alignment, give a trusted agent both the current draft pre-analysis plan and the QSF and require a plan-to-QSF concordance table. A deeper agent audit and route-by-route Qualtrics preview remain necessary.");
    lines.push("", "## Audit Conclusion", "", readiness);
    return lines.join("\n") + "\n";
  }

  function renderMetric(container, label, value) {
    var card = createElement("div", "metric-card");
    card.appendChild(createElement("span", "metric-value", String(value)));
    card.appendChild(createElement("span", "metric-label", label));
    container.appendChild(card);
  }

  function renderResults(result) {
    var results = byId("qsf-audit-results");
    var metricsContainer = byId("qsf-audit-metrics");
    var findingsContainer = byId("qsf-finding-list");
    var critical = result.findings.filter(function (finding) { return finding.severity === "Critical"; }).length;
    var high = result.findings.filter(function (finding) { return finding.severity === "High"; }).length;

    setText(byId("qsf-results-summary"), result.file.name + " · " + result.findings.length + " finding(s) · Critical: " + critical + " · High: " + high);
    clearElement(metricsContainer);
    renderMetric(metricsContainer, "Elements", result.metrics.elements);
    renderMetric(metricsContainer, "Active questions", result.metrics.activeQuestions);
    renderMetric(metricsContainer, "Active blocks", result.metrics.activeBlocks);
    renderMetric(metricsContainer, "Randomizers", result.metrics.randomizers);
    renderMetric(metricsContainer, "Findings", result.metrics.findings);

    clearElement(findingsContainer);
    if (!result.findings.length) {
      findingsContainer.appendChild(createElement("p", "no-findings", "No finding was generated by the current deterministic checks. Preview and test-export verification are still required."));
    } else {
      result.findings.forEach(function (finding) {
        var item = createElement("article", "finding-card severity-" + finding.severity.toLowerCase());
        var header = createElement("div", "finding-header");
        header.appendChild(createElement("span", "severity-badge", finding.severity));
        header.appendChild(createElement("span", "status-badge", statusLabel(finding.status)));
        item.appendChild(header);
        item.appendChild(createElement("h4", "", finding.title));
        item.appendChild(createElement("p", "finding-location", "Location: " + finding.location));
        item.appendChild(createElement("p", "", finding.evidence));
        item.appendChild(createElement("p", "finding-recommendation", "Recommended action: " + finding.recommendation));
        findingsContainer.appendChild(item);
      });
    }

    setText(byId("qsf-report-preview"), currentReport);
    if (currentReportUrl) {
      URL.revokeObjectURL(currentReportUrl);
    }
    currentReportUrl = URL.createObjectURL(new Blob([currentReport], { type: "text/markdown;charset=utf-8" }));
    byId("qsf-download-report").href = currentReportUrl;
    byId("qsf-download-report").download = currentReportName;
    results.hidden = false;
    byId("qsf-audit-error").hidden = true;
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showError(message) {
    var error = byId("qsf-audit-error");
    setText(error, message);
    error.hidden = false;
    byId("qsf-audit-results").hidden = true;
    setText(byId("qsf-audit-status"), "");
  }

  function resetAudit() {
    if (currentReportUrl) {
      URL.revokeObjectURL(currentReportUrl);
      currentReportUrl = "";
    }
    currentReport = "";
    currentReportName = "qsf-quick-audit-report.md";
    byId("qsf-file-input").value = "";
    byId("qsf-audit-results").hidden = true;
    byId("qsf-audit-error").hidden = true;
    setText(byId("qsf-audit-status"), "");
    byId("qsf-drop-zone").focus();
  }

  function processFile(file) {
    if (!file) {
      return;
    }
    if (!/\.qsf$/i.test(file.name)) {
      showError("Please select a file whose name ends in .qsf.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      showError("This file is larger than the 20 MB browser-audit limit. No file contents were uploaded.");
      return;
    }
    if (file.size === 0) {
      showError("The selected QSF file is empty.");
      return;
    }

    byId("qsf-audit-error").hidden = true;
    byId("qsf-audit-results").hidden = true;
    setText(byId("qsf-audit-status"), "Reading and auditing " + file.name + " locally...");

    file.text().then(function (text) {
      var qsf;
      try {
        qsf = JSON.parse(text);
      } catch (error) {
        throw new Error("The selected file is not valid JSON. No file contents were uploaded.");
      }
      return sha256(text).then(function (checksum) {
        var result = analyzeQsf(qsf, file, checksum);
        currentReport = buildReport(result);
        currentReportName = safeFileStem(file.name) + "-quick-audit-report.md";
        setText(byId("qsf-audit-status"), "Audit complete. The file remained in this browser session.");
        renderResults(result);
      });
    }).catch(function (error) {
      showError(error && error.message ? error.message : "The QSF could not be audited.");
    });
  }

  function initializeCopyInstructions() {
    var button = byId("copy-agent-instructions");
    var source = byId("agent-instructions-text");
    var status = byId("copy-agent-instructions-status");
    if (!button || !source) {
      return;
    }
    button.addEventListener("click", function () {
      copyText(source.textContent.trim()).then(function () {
        temporaryStatus(status, "Copied");
      });
    });
  }

  function initializeAuditTool() {
    var dropZone = byId("qsf-drop-zone");
    var input = byId("qsf-file-input");
    var selectButton = byId("qsf-select-file");
    if (!dropZone || !input || !selectButton) {
      return;
    }

    selectButton.addEventListener("click", function (event) {
      event.stopPropagation();
      input.click();
    });
    dropZone.addEventListener("click", function (event) {
      if (event.target !== selectButton) {
        input.click();
      }
    });
    dropZone.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        input.click();
      }
    });
    input.addEventListener("change", function () {
      processFile(input.files && input.files[0]);
    });
    ["dragenter", "dragover"].forEach(function (eventName) {
      dropZone.addEventListener(eventName, function (event) {
        event.preventDefault();
        event.stopPropagation();
        dropZone.classList.add("is-dragging");
      });
    });
    ["dragleave", "drop"].forEach(function (eventName) {
      dropZone.addEventListener(eventName, function (event) {
        event.preventDefault();
        event.stopPropagation();
        dropZone.classList.remove("is-dragging");
      });
    });
    dropZone.addEventListener("drop", function (event) {
      var files = event.dataTransfer && event.dataTransfer.files;
      if (files && files.length) {
        processFile(files[0]);
      }
    });

    byId("qsf-copy-report").addEventListener("click", function () {
      if (!currentReport) {
        return;
      }
      copyText(currentReport).then(function () {
        temporaryStatus(byId("qsf-audit-status"), "Report copied.");
      });
    });
    byId("qsf-reset-audit").addEventListener("click", resetAudit);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initializeCopyInstructions();
    initializeAuditTool();
  });
})();
