import * as vscode from "vscode";
import { PhipromptCompletionProvider } from "./completionProvider";
import { PhipromptInlineSuggestions } from "./inlineSuggestions";
import { PhipromptCodeActionProvider } from "./codeActionProvider";
import { PhipromptHoverProvider } from "./hoverProvider";
import { PhipromptFormatter } from "./formatter";
import { activateCopilotConfig } from "./copilotConfig";
import {
  PhipromptRenameProvider,
  PhipromptRefactorProvider,
} from "./refactorProvider";
import { PhipromptLinter } from "./linter";
import { showTutorialPanel } from "./tutorials";
import {
  PhipromptBreadcrumbProvider,
  PhipromptDefinitionProvider,
  PhipromptDocumentLinkProvider,
} from "./breadcrumbNavigation";
import {
  AUTO_ALIAS_MAP,
  PHIPROMPT_SYMBOLIC_MAP,
  SYMBOL_TO_TEXT,
  validateFrameworkCompliance,
  detectFrameworkPatterns,
  getFrameworkSuggestions,
} from "./symbolicMap";

// Merge natural language extensions
Object.assign(AUTO_ALIAS_MAP);

let outputChannel: vscode.OutputChannel;

/**
 * Convert text using symbol mappings with proper word boundary handling
 */
export function convertText(
  text: string,
  mapping: Record<string, string>,
  outputChannel?: vscode.OutputChannel
): string {
  let result = text;

  if (outputChannel) {
    outputChannel.appendLine(
      `[convertText] Starting conversion with ${
        Object.keys(mapping).length
      } mappings`
    );
  }

  // Sort keys by descending length for longest match first
  const sortedKeys = Object.keys(mapping).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const value = mapping[key];
    const isAlphaKey = /^[a-zA-Z]/.test(key);
    const regex = isAlphaKey
      ? new RegExp(`\\b${key.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\b`, "g")
      : new RegExp(key.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&"), "g");

    const matches = result.match(regex);
    if (matches && outputChannel) {
      outputChannel.appendLine(
        `[convertText] Replacing '${key}' with '${value}', matches: ${matches.length}`
      );
    }

    result = result.replace(regex, value);
  }

  return result;
}

/**
 * Extension activation entry point
 */
export function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel(
    "PHIPROMPT Framework Extension"
  );
  context.subscriptions.push(outputChannel);

  outputChannel.appendLine(
    "[activate] PHIPROMPT Extension activation started with enhanced framework support."
  );

  try {
    // === ENHANCED BREADCRUMB NAVIGATION PROVIDERS ===
    // Document symbols for enhanced breadcrumb trail with framework awareness
    const breadcrumbProvider = new PhipromptBreadcrumbProvider();
    context.subscriptions.push(
      vscode.languages.registerDocumentSymbolProvider(
        "phiprompt",
        breadcrumbProvider
      )
    );

    // Enhanced Ctrl+click navigation (Go to Definition) with framework context
    const definitionProvider = new PhipromptDefinitionProvider();
    context.subscriptions.push(
      vscode.languages.registerDefinitionProvider(
        "phiprompt",
        definitionProvider
      )
    );

    // Enhanced clickable links for section references and framework navigation
    const linkProvider = new PhipromptDocumentLinkProvider();
    context.subscriptions.push(
      vscode.languages.registerDocumentLinkProvider("phiprompt", linkProvider)
    );

    outputChannel.appendLine(
      "[activate] Registered enhanced breadcrumb navigation providers."
    );

    // === ENHANCED FRAMEWORK VALIDATION COMMANDS ===

    // Enhanced framework validation command
    const validateCommand = vscode.commands.registerCommand(
      "phiprompt.validateFramework",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showWarningMessage(
            "No active PHIPROMPT document found."
          );
          return;
        }

        const document = editor.document;
        if (document.languageId !== "phiprompt") {
          vscode.window.showWarningMessage(
            "Current document is not a PHIPROMPT file."
          );
          return;
        }

        const content = document.getText();
        const validation = validateFrameworkCompliance(content);

        // Clear previous diagnostics
        const diagnosticCollection =
          vscode.languages.createDiagnosticCollection("phiprompt-framework");
        const diagnostics: vscode.Diagnostic[] = [];

        // Add errors as diagnostics
        if (validation.errors) {
          validation.errors.forEach((error) => {
            const diagnostic = new vscode.Diagnostic(
              new vscode.Range(0, 0, 0, 0),
              error,
              vscode.DiagnosticSeverity.Error
            );
            diagnostic.source = "PHIPROMPT Framework";
            diagnostics.push(diagnostic);
          });
        }

        // Add warnings as diagnostics
        if (validation.warnings) {
          validation.warnings.forEach((warning) => {
            const diagnostic = new vscode.Diagnostic(
              new vscode.Range(0, 0, 0, 0),
              warning,
              vscode.DiagnosticSeverity.Warning
            );
            diagnostic.source = "PHIPROMPT Framework";
            diagnostics.push(diagnostic);
          });
        }

        diagnosticCollection.set(document.uri, diagnostics);

        // Show validation results
        if (validation.isValid) {
          const warningCount = validation.warnings?.length || 0;
          const suggestionCount = validation.suggestions?.length || 0;
          vscode.window.showInformationMessage(
            `✅ Framework validation passed! ${warningCount} warnings, ${suggestionCount} suggestions.`
          );
        } else {
          const errorCount = validation.errors?.length || 0;
          const warningCount = validation.warnings?.length || 0;
          vscode.window.showErrorMessage(
            `❌ Framework validation failed! ${errorCount} errors, ${warningCount} warnings.`
          );
        }

        // Log detailed results
        outputChannel.appendLine(`[validateFramework] Validation Results:`);
        outputChannel.appendLine(`  Valid: ${validation.isValid}`);
        outputChannel.appendLine(`  Errors: ${validation.errors?.length || 0}`);
        outputChannel.appendLine(
          `  Warnings: ${validation.warnings?.length || 0}`
        );
        outputChannel.appendLine(
          `  Suggestions: ${validation.suggestions?.length || 0}`
        );

        validation.errors?.forEach((error) =>
          outputChannel.appendLine(`  ERROR: ${error}`)
        );
        validation.warnings?.forEach((warning) =>
          outputChannel.appendLine(`  WARNING: ${warning}`)
        );
        validation.suggestions?.forEach((suggestion) =>
          outputChannel.appendLine(`  SUGGESTION: ${suggestion}`)
        );
      }
    );

    context.subscriptions.push(validateCommand);

    // Enhanced framework pattern analysis command
    const analyzeCommand = vscode.commands.registerCommand(
      "phiprompt.analyzeComplexity",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== "phiprompt") {
          vscode.window.showWarningMessage(
            "No active PHIPROMPT document found."
          );
          return;
        }

        const content = editor.document.getText();
        const patterns = detectFrameworkPatterns(content);

        const patternSummary = {
          framework_headers: patterns.filter(
            (p) => p.type === "framework_header"
          ).length,
          pipeline_sequences: patterns.filter(
            (p) => p.type === "pipeline_sequence"
          ).length,
          output_specifications: patterns.filter(
            (p) => p.type === "output_specification"
          ).length,
          meta_controls: patterns.filter((p) => p.type === "meta_control")
            .length,
          module_definitions: patterns.filter(
            (p) => p.type === "module_definition"
          ).length,
        };

        const complexity = Object.values(patternSummary).reduce(
          (sum, count) => sum + count,
          0
        );

        let complexityLevel = "Simple";
        if (complexity > 20) complexityLevel = "Complex";
        else if (complexity > 10) complexityLevel = "Moderate";

        vscode.window.showInformationMessage(
          `📊 Framework Complexity: ${complexityLevel} (${complexity} patterns detected)`
        );

        outputChannel.appendLine(`[analyzeComplexity] Pattern Analysis:`);
        outputChannel.appendLine(
          `  Framework Headers: ${patternSummary.framework_headers}`
        );
        outputChannel.appendLine(
          `  Pipeline Sequences: ${patternSummary.pipeline_sequences}`
        );
        outputChannel.appendLine(
          `  Output Specifications: ${patternSummary.output_specifications}`
        );
        outputChannel.appendLine(
          `  Meta Controls: ${patternSummary.meta_controls}`
        );
        outputChannel.appendLine(
          `  Module Definitions: ${patternSummary.module_definitions}`
        );
        outputChannel.appendLine(
          `  Total Complexity: ${complexity} (${complexityLevel})`
        );
      }
    );

    context.subscriptions.push(analyzeCommand);

    // === ENHANCED SYMBOL CONVERSION COMMANDS ===

    // Convert symbols to natural language
    const convertToTextCommand = vscode.commands.registerCommand(
      "phiprompt.convertToText",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== "phiprompt") {
          vscode.window.showWarningMessage(
            "Please open a PHIPROMPT (.φp) file"
          );
          return;
        }

        const selection = editor.selection;
        const text = editor.document.getText(selection);
        const converted = convertText(text, SYMBOL_TO_TEXT, outputChannel);

        if (converted !== text) {
          await editor.edit((editBuilder) => {
            editBuilder.replace(selection, converted);
          });
          vscode.window.showInformationMessage(
            "✅ Symbols converted to natural language."
          );
        } else {
          vscode.window.showInformationMessage(
            "ℹ️ No symbols found to convert."
          );
        }
      }
    );

    context.subscriptions.push(convertToTextCommand);

    // Convert natural language to symbols
    const convertFromTextCommand = vscode.commands.registerCommand(
      "phiprompt.convertFromText",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== "phiprompt") {
          vscode.window.showWarningMessage(
            "Please open a PHIPROMPT (.φp) file"
          );
          return;
        }

        const selection = editor.selection;
        const text = editor.document.getText(selection);
        const converted = convertText(text, AUTO_ALIAS_MAP, outputChannel);

        if (converted !== text) {
          await editor.edit((editBuilder) => {
            editBuilder.replace(selection, converted);
          });
          vscode.window.showInformationMessage(
            "✅ Text converted to PHICODE symbols."
          );
        } else {
          vscode.window.showInformationMessage("ℹ️ No convertible text found.");
        }
      }
    );

    context.subscriptions.push(convertFromTextCommand);

    // === ENHANCED FRAMEWORK TEMPLATE COMMANDS ===

    // Insert complete Φ pipeline template
    const insertPhiPipelineCommand = vscode.commands.registerCommand(
      "phiprompt.insertPhiPipeline",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== "phiprompt") {
          vscode.window.showWarningMessage(
            "Please open a PHIPROMPT (.φp) file"
          );
          return;
        }

        const frameworkName = await vscode.window.showInputBox({
          prompt:
            "Enter framework name (e.g., contentAnalyzer, strategyBuilder)",
          placeHolder: "frameworkName",
        });

        if (!frameworkName) {
          // Use default template if no name provided
          const pipelineTemplate = `Φ = {
    Ψ: { // Optimizer
        ρ: {filter: /dup|overconf|loops/g, consolidator: [merge,collapse]},
        ν: [entity,attr,val,rel], α: [conflicts,claims,loops,novelty],
        μ: [abstract,fig,subj], κ: [nest,vague,impl]
    },
    ℜ: { // Forensics
        models: [causal,triangulation,anomaly,custody,refinement],
        principles: [evidence,falsify,docs,error]
    },
    Π: { // Processor
        compile: ξ→ε→α→ν→ρ→χ→ω→φ→β→κ→σ→λ→μ→τ→π→δ
    }
}`;

          await editor.edit((editBuilder) => {
            editBuilder.insert(editor.selection.active, pipelineTemplate);
          });

          vscode.window.showInformationMessage(
            "⚙️ Φ pipeline template inserted"
          );
          return;
        }

        const template = `##[${frameworkName}.INPUT]
Collect.analysis_content.${frameworkName} : {input_description, requirements, context}

##[${frameworkName}.ACTIVATE_MODULE]
activate.Φ = ∀(input_variables) → ALWAYS{
    ν.preprocess.capture(${frameworkName}_request) → ν.preprocess.standardize → ν.preprocess.prepare →
    μ.input_collection.extract(input_variables) → Ψ.ρ → Ψ.ℜ →
    Π.${frameworkName}_analysis → Λ.processing_chain →
    Ω.output_config.format_apply →
    Ο.output.${frameworkName}_results[
        output1 : analysis → result1 ∧ 🔍investigation_required ∧ F → technical,
        output2 : synthesis → result2 ∧ 📊baseline_required ∧ F → analytical,
        output3 : validation → result3 ∧ ⚠uncertainty_explicit ∧ F → systematic,
        output4 : optimization → result4 ∧ 🔗relationship_inferred ∧ F → comprehensive,
        output5 : implementation → result5 ∧ 📝qualitative_assessment ∧ F → functional
    ] ⊕ meta_outputs ⊕ ⚠framework_compliance_requirements
}

Φ.${frameworkName} = {
    ν.preprocess : {
        input_capture : [requirements ∧ context ∧ specifications],
        format_standardize : [normalize_input ; extract_patterns ; clarify_objectives],
        prepare : [analysis_matrix ; validation_protocols ; processing_pipeline]
    },

    μ.input_collection : {
        input_structure : [primary_data ∧ context_data ∧ validation_data],
        validation : [completeness_checks ; format_verification ; quality_assessment],
        extraction : [content_analysis ∪ structural_patterns ∪ relationship_mapping]
    },

    Ψ : {
        ρ : {
            filter : /irrelevant|duplicate|incomplete/g,
            consolidator : [merge_similar ∪ resolve_conflicts ∪ unify_formats],
            ν : [entities ∪ attributes ∪ values ∪ relationships],
            α : [conflicts ∪ inconsistencies ∪ gaps ∪ validations],
            μ : [patterns ∪ structures ∪ themes],
            κ : [uncertainties🌀 ∪ complexities🧱 ∪ assumptions🧪]
        },
        ℜ : {
            models : [analytical_model ∪ validation_model ∪ synthesis_model ∪ optimization_model ∪ implementation_model],
            principles : [accuracy ∧ completeness ∧ consistency ∧ reliability],
            domains : [${frameworkName}_domain ⊕ related_domains ⊕ validation_domains],
            limits : [scope_limitations ∪ data_constraints ∪ processing_boundaries],
            QA : [peer_review ; validation_testing ; accuracy_verification]
        }
    },

    Π : {
        compile : {
            → ξ : [domain_analysis → context_classification ∧ requirements_mapping ∧ ⚠uncertainty_flags],
            → ε : [entity_identification → pattern_extraction ∧ relationship_discovery ∧ 🔍investigation_markers],
            → α : [attribute_extraction → property_analysis ∧ validation_checks ∧ 🧱complexity_handling],
            → ρ : [relationship_mapping → connection_analysis ∧ dependency_tracking ∧ 🔗relationship_validation],
            → ω : [coherence_validation → consistency_checks ∧ completeness_assessment ∧ ⚠quality_flags],
            → φ : [feedback_calibration → response_optimization ∧ accuracy_tuning ∧ 📊performance_metrics],
            → κ : [uncertainty_handling → risk_assessment ∧ confidence_levels ∧ ⚠limitation_acknowledgment],
            → σ : [symbolic_synthesis → pattern_integration ∧ structure_optimization ∧ 📝documentation_generation],
            → δ : [implementation_output → deliverable_generation ∧ format_compliance ∧ ⚠quality_assurance]
        },
        
        run : {
            ι : [consistency_validation ∧ mapping_verification ∧ challenge_resolution],
            σ : [extract ∪ compile ∪ analyze ∪ synthesize ∪ optimize ∪ validate ∪ generate ∪ deliver],
            γ : symbolic_processing_attempted,
            δ : IF technical_output → symbolic+implementation ELSE narrative_synthesis,
            ν : [natural_language_integration ∪ flag_explanations ∪ tone_optimization],
            φ : [format_compliance ∧ feedback_integration ∧ constraint_satisfaction]
        }
    },

    Ω.output_config : {
        format_structure : [F → technical ∧ T → systematic ∧ S → ${frameworkName}_specifications],
        presentation : [analysis_hierarchy ; result_organization ; insight_clarity],
        consistency : [framework_compliance ∧ quality_standards ∧ validation_requirements]
    },

    ⇑.compliance : [framework_syntax_adherence ∪ pattern_consistency ∪ validation_completeness ∪ quality_assurance],
    ⇑.limits : [processing_constraints ∪ scope_boundaries ∪ accuracy_limitations ∪ context_dependencies],
    ⇑.success : [objective_achievement ∪ quality_excellence ∪ stakeholder_satisfaction ∪ implementation_effectiveness]
}`;

        await editor.edit((editBuilder) => {
          editBuilder.insert(editor.selection.active, template);
        });

        vscode.window.showInformationMessage(
          `✅ Φ.${frameworkName} pipeline template inserted.`
        );
      }
    );

    context.subscriptions.push(insertPhiPipelineCommand);

    // Generate Greek module template
    const generateGreekModuleCommand = vscode.commands.registerCommand(
      "phiprompt.generateGreekModule",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const modules = [
          "Ψ (Optimizer)",
          "ℜ (Forensics)",
          "Π (Processor)",
          "Ω (Output)",
          "Λ (Lambda)",
        ];
        const selectedModule = await vscode.window.showQuickPick(modules, {
          placeHolder: "Select Greek module to generate",
        });

        if (!selectedModule) return;

        const moduleSymbol = selectedModule.split(" ")[0];
        let template = "";

        switch (moduleSymbol) {
          case "Ψ":
            template = `    Ψ : {
        ρ : {
            filter : /pattern1|pattern2|pattern3/g,
            consolidator : [merge_operations ∪ resolve_conflicts ∪ unify_structures],
            ν : [entities ∪ attributes ∪ values ∪ relationships],
            α : [validations ∪ constraints ∪ requirements ∪ compliance],
            μ : [patterns ∪ themes ∪ structures ∪ classifications],
            κ : [uncertainties🌀 ∪ complexities🧱 ∪ assumptions🧪 ∪ edge_cases⚠]
        },
        ℜ : {
            models : [analysis_model ∪ validation_model ∪ optimization_model ∪ synthesis_model ∪ quality_model],
            principles : [accuracy ∧ consistency ∧ completeness ∧ reliability],
            domains : [primary_domain ⊕ secondary_domains ⊕ validation_contexts],
            limits : [scope_constraints ∪ processing_limitations ∪ accuracy_boundaries],
            QA : [validation_protocols ; quality_checks ; accuracy_verification]
        }
    }`;
            break;
          case "ℜ":
            template = `    ℜ : {
        models : [forensic_analysis ∪ evidence_validation ∪ pattern_detection ∪ causality_mapping ∪ verification_protocols],
        principles : [evidence_based ∧ systematic_investigation ∧ bias_mitigation ∧ transparency],
        domains : [investigation_domain ⊕ evidence_analysis ⊕ validation_frameworks],
        limits : [evidence_availability ∪ investigation_scope ∪ certainty_constraints ∪ temporal_boundaries],
        QA : [peer_review ; cross_validation ; evidence_verification ; bias_assessment]
    }`;
            break;
          case "Π":
            template = `    Π : {
        compile : {
            → ξ : [domain_classification → context_analysis ∧ requirement_mapping ∧ ⚠scope_validation],
            → ε : [entity_extraction → pattern_identification ∧ relationship_discovery ∧ 🔍detailed_analysis],
            → α : [attribute_validation → property_verification ∧ constraint_checking ∧ 🧱complexity_assessment],
            → ρ : [relationship_mapping → connection_analysis ∧ dependency_tracking ∧ 🔗link_validation],
            → ω : [coherence_validation → consistency_verification ∧ completeness_assessment ∧ ⚠quality_assurance],
            → φ : [feedback_integration → response_calibration ∧ optimization_tuning ∧ 📊performance_monitoring],
            → κ : [uncertainty_management → risk_evaluation ∧ confidence_assessment ∧ ⚠limitation_documentation],
            → σ : [symbolic_synthesis → pattern_compilation ∧ structure_optimization ∧ 📝result_formatting],
            → δ : [implementation_generation → output_production ∧ format_compliance ∧ ⚠delivery_validation]
        },
        run : {
            ι : [consistency_checking ∧ mapping_validation ∧ process_verification],
            σ : [extraction ∪ compilation ∪ analysis ∪ synthesis ∪ optimization ∪ validation],
            γ : symbolic_processing_execution,
            δ : conditional_output_generation,
            ν : [natural_language_integration ∪ documentation_generation],
            φ : [format_compliance ∧ quality_assurance ∧ stakeholder_alignment]
        }
    }`;
            break;
          case "Ω":
            template = `    Ω.output_config : {
        format_structure : [F → format_type ∧ T → tone_category ∧ S → structure_requirements],
        presentation : [hierarchy_organization ; content_structuring ; readability_optimization],
        consistency : [template_adherence ∧ quality_standards ∧ compliance_requirements],
        validation : [output_verification ; format_checking ; quality_assessment],
        delivery : [stakeholder_alignment ; accessibility_compliance ; performance_optimization]
    }`;
            break;
          case "Λ":
            template = `    Λ.function_processing : {
        lambda_operations : [transformation_functions ∪ mapping_operations ∪ filtering_logic ∪ validation_rules],
        functional_composition : [operation_chaining → result_transformation ∧ error_handling ∧ ⚠performance_monitoring],
        context_preservation : [scope_management ∪ state_tracking ∪ dependency_resolution],
        optimization : [performance_tuning ∧ resource_efficiency ∧ scalability_enhancement]
    }`;
            break;
        }

        await editor.edit((editBuilder) => {
          editBuilder.insert(editor.selection.active, template);
        });

        vscode.window.showInformationMessage(
          `✅ ${moduleSymbol} module template inserted.`
        );
      }
    );

    context.subscriptions.push(generateGreekModuleCommand);

    // === ENHANCED SYMBOL INSERTION COMMAND ===

    const insertSymbolCommand = vscode.commands.registerCommand(
      "phiprompt.insertSymbol",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const symbolCategories = [
          "Greek Modules (Φ, Ψ, ℜ, Π, ρ, ν, α, κ, μ)",
          "Pipeline Steps (ξ, ε, α, ρ, ω, φ, κ, σ, δ)",
          "Logical Operators (→, ∧, ∪, ⊕, ∀, ∃)",
          "Uncertainty Flags (⚠, 🔍, 🌀, 🧱, 🎭, 🧪)",
          "Mathematical Symbols (∇, ∂, ↻, ⇑, ⇓, ±)",
          "All Symbols",
        ];

        const selectedCategory = await vscode.window.showQuickPick(
          symbolCategories,
          {
            placeHolder: "Select symbol category",
          }
        );

        if (!selectedCategory) return;

        let symbolOptions: string[] = [];

        if (selectedCategory.includes("Greek Modules")) {
          symbolOptions = [
            "Φ",
            "Ψ",
            "ℜ",
            "Π",
            "ρ",
            "ν",
            "α",
            "κ",
            "μ",
            "λ",
            "ξ",
            "ε",
            "π",
            "ω",
            "χ",
            "υ",
            "φ",
            "β",
            "σ",
            "τ",
            "δ",
            "γ",
            "ι",
            "θ",
            "η",
            "ζ",
          ];
        } else if (selectedCategory.includes("Pipeline Steps")) {
          symbolOptions = [
            "ξ",
            "ε",
            "α",
            "ρ",
            "ω",
            "φ",
            "κ",
            "σ",
            "δ",
            "π",
            "β",
            "γ",
            "τ",
            "ι",
            "υ",
            "χ",
          ];
        } else if (selectedCategory.includes("Logical Operators")) {
          symbolOptions = [
            "→",
            "∧",
            "∪",
            "⊕",
            "∀",
            "∃",
            "∈",
            "∉",
            "∅",
            "∨",
            "¬",
            "⟹",
            "≡",
            "⊤",
            "⊥",
            "⇔",
          ];
        } else if (selectedCategory.includes("Uncertainty Flags")) {
          symbolOptions = [
            "⚠",
            "🔍",
            "🌀",
            "🧱",
            "🎭",
            "🧪",
            "⚡",
            "🔄",
            "📊",
            "📝",
            "🔗",
          ];
        } else if (selectedCategory.includes("Mathematical")) {
          symbolOptions = [
            "∇",
            "∂",
            "↻",
            "⇑",
            "⇓",
            "±",
            "≅",
            "≬",
            "☉",
            "☽",
            "↪",
            "⇨",
            "⇦",
            "⊣",
          ];
        } else {
          symbolOptions = Object.keys(PHIPROMPT_SYMBOLIC_MAP);
        }

        const symbolItems = symbolOptions.map((symbol) => ({
          label: symbol,
          description: PHIPROMPT_SYMBOLIC_MAP[symbol]?.[0] || "Symbol",
          detail: PHIPROMPT_SYMBOLIC_MAP[symbol]?.slice(1).join(", ") || "",
        }));

        const selectedSymbol = await vscode.window.showQuickPick(symbolItems, {
          placeHolder: "Select symbol to insert",
          matchOnDescription: true,
          matchOnDetail: true,
        });

        if (!selectedSymbol) return;

        await editor.edit((editBuilder) => {
          editBuilder.insert(editor.selection.active, selectedSymbol.label);
        });
      }
    );

    context.subscriptions.push(insertSymbolCommand);

    // === ENHANCED NAVIGATION COMMAND ===

    const navigateToSectionCommand = vscode.commands.registerCommand(
      "phiprompt.navigateToSection",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== "phiprompt") {
          vscode.window.showWarningMessage(
            "No active PHIPROMPT document found."
          );
          return;
        }

        const content = editor.document.getText();
        const patterns = detectFrameworkPatterns(content);

        if (patterns.length === 0) {
          // Fallback to document symbols
          const symbols =
            (await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
              "vscode.executeDocumentSymbolProvider",
              editor.document.uri
            )) || [];

          const items = symbols.map((symbol) => ({
            label: symbol.name,
            description: symbol.detail || "",
            symbol: symbol,
          }));

          const selected = await vscode.window.showQuickPick(items, {
            placeHolder: "Select a section to navigate to",
          });

          if (selected) {
            const range = selected.symbol.selectionRange;
            editor.selection = new vscode.Selection(range.start, range.end);
            editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
          }
          return;
        }

        const navigationItems = patterns.map((pattern) => ({
          label: pattern.content,
          description: `Line ${pattern.line} - ${pattern.type}`,
          detail: pattern.framework || pattern.module || pattern.category || "",
          line: pattern.line,
        }));

        const selectedItem = await vscode.window.showQuickPick(
          navigationItems,
          {
            placeHolder: "Navigate to framework section",
            matchOnDescription: true,
            matchOnDetail: true,
          }
        );

        if (!selectedItem) return;

        const position = new vscode.Position(selectedItem.line - 1, 0);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(
          new vscode.Range(position, position),
          vscode.TextEditorRevealType.InCenter
        );
      }
    );

    context.subscriptions.push(navigateToSectionCommand);

    // === ENHANCED SYMBOL MAPPING COMMAND ===

    const generateSymbolMappingCommand = vscode.commands.registerCommand(
      "phiprompt.generateSymbolMapping",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== "phiprompt") {
          vscode.window.showWarningMessage(
            "No active PHIPROMPT document found."
          );
          return;
        }

        outputChannel.appendLine(
          `[mapping] Manual symbol mapping generation triggered`
        );
        generateCompactSymbolMapping(editor, false, outputChannel);
      }
    );

    context.subscriptions.push(generateSymbolMappingCommand);

    // === EXISTING LANGUAGE PROVIDERS ===
    context.subscriptions.push(
      vscode.languages.registerCompletionItemProvider(
        "phiprompt",
        new PhipromptCompletionProvider(outputChannel),
        ".",
        " ",
        "(",
        ":",
        "="
      )
    );

    // === ENHANCED COMPLETION PROVIDER ===

    const enhancedCompletionProvider =
      vscode.languages.registerCompletionItemProvider(
        "phiprompt",
        {
          provideCompletionItems(
            document: vscode.TextDocument,
            position: vscode.Position
          ) {
            const lineText = document.lineAt(position).text;
            const linePrefix = lineText.substr(0, position.character);

            const completionItems: vscode.CompletionItem[] = [];

            // Framework-aware suggestions
            if (typeof getFrameworkSuggestions === "function") {
              const suggestions = getFrameworkSuggestions(
                linePrefix,
                position.character
              );

              for (const suggestion of suggestions) {
                const item = new vscode.CompletionItem(
                  suggestion.symbol,
                  vscode.CompletionItemKind.Snippet
                );
                item.detail = suggestion.description;
                item.documentation = `Category: ${suggestion.category}`;
                item.insertText = suggestion.insertText;
                completionItems.push(item);
              }
            }

            // Add general symbol completions
            for (const [symbol, aliases] of Object.entries(
              PHIPROMPT_SYMBOLIC_MAP
            )) {
              const item = new vscode.CompletionItem(
                symbol,
                vscode.CompletionItemKind.Constant
              );
              item.detail = aliases[0];
              item.documentation = aliases.slice(1).join(", ");
              item.insertText = symbol;
              completionItems.push(item);
            }

            return completionItems;
          },
        },
        "→",
        "∧",
        "∪",
        "⊕",
        "Φ",
        "Ψ",
        "ℜ",
        "Π" // Trigger characters
      );

    context.subscriptions.push(enhancedCompletionProvider);

    // === INLINE SUGGESTIONS PROVIDER ===
    const inlineSuggestionsProvider = new PhipromptInlineSuggestions(context);
    context.subscriptions.push(
      vscode.languages.registerInlineCompletionItemProvider(
        "phiprompt",
        inlineSuggestionsProvider
      )
    );
    outputChannel.appendLine(
      "[activate] Registered inline suggestions provider with context awareness."
    );

    context.subscriptions.push(
      vscode.languages.registerCodeActionsProvider(
        "phiprompt",
        new PhipromptCodeActionProvider(),
        {
          providedCodeActionKinds: [
            vscode.CodeActionKind.QuickFix,
            vscode.CodeActionKind.Refactor,
          ],
        }
      )
    );

    context.subscriptions.push(
      vscode.languages.registerHoverProvider(
        "phiprompt",
        new PhipromptHoverProvider()
      )
    );

    context.subscriptions.push(
      vscode.languages.registerDocumentFormattingEditProvider(
        "phiprompt",
        new PhipromptFormatter()
      )
    );

    context.subscriptions.push(
      vscode.languages.registerRenameProvider(
        "phiprompt",
        new PhipromptRenameProvider()
      )
    );

    context.subscriptions.push(
      vscode.languages.registerCodeActionsProvider(
        "phiprompt",
        new PhipromptRefactorProvider(),
        {
          providedCodeActionKinds: [
            vscode.CodeActionKind.RefactorExtract,
            vscode.CodeActionKind.RefactorInline,
            vscode.CodeActionKind.RefactorRewrite,
          ],
        }
      )
    );

    outputChannel.appendLine("[activate] Registered all language providers.");

    // === LINTER ===
    const linter = new PhipromptLinter(outputChannel);
    context.subscriptions.push(linter);

    // Document event handlers
    context.subscriptions.push(
      vscode.workspace.onDidOpenTextDocument((doc) => {
        if (doc.languageId === "phiprompt") {
          outputChannel.appendLine(`[lint] Document opened: ${doc.fileName}`);
          linter.runLint(doc, true);
        }
      }),

      vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document.languageId === "phiprompt") {
          linter.runLint(event.document, false);
        }
      }),

      vscode.workspace.onDidSaveTextDocument((doc) => {
        if (doc.languageId === "phiprompt") {
          outputChannel.appendLine(`[lint] Document saved: ${doc.fileName}`);
          linter.runLint(doc, true);

          // AUTO-GENERATE SYMBOL MAPPING ON SAVE
          const editor = vscode.window.activeTextEditor;
          if (editor && editor.document === doc) {
            outputChannel.appendLine(
              `[mapping] Auto-generating symbol mapping for ${doc.fileName}`
            );
            generateCompactSymbolMapping(editor, true, outputChannel);
          }
        }
      })
    );

    // Lint existing documents
    vscode.workspace.textDocuments.forEach((doc) => {
      if (doc.languageId === "phiprompt") {
        linter.runLint(doc, true);
      }
    });

    // Enhanced onWillSaveTextDocument with format + symbol mapping
    vscode.workspace.onWillSaveTextDocument((event) => {
      if (event.document.languageId === "phiprompt") {
        event.waitUntil(
          vscode.commands.executeCommand(
            "editor.action.formatDocument",
            event.document.uri
          )
        );
      }
    });

    outputChannel.appendLine("[activate] Registered linter.");

    // === AUTOMATIC VALIDATION ON SAVE ===

    const onSaveValidation = vscode.workspace.onDidSaveTextDocument(
      (document) => {
        if (document.languageId === "phiprompt") {
          // Auto-validate on save
          const validation = validateFrameworkCompliance(document.getText());

          if (!validation.isValid) {
            vscode.window
              .showWarningMessage(
                `⚠️ Framework validation issues detected. Run "Validate Framework" for details.`,
                "Validate Now"
              )
              .then((selection) => {
                if (selection === "Validate Now") {
                  vscode.commands.executeCommand("phiprompt.validateFramework");
                }
              });
          }
        }
      }
    );

    context.subscriptions.push(onSaveValidation);

    // === OTHER INTEGRATIONS ===
    activateCopilotConfig(context);

    const tutorialCommand = vscode.commands.registerCommand(
      "phiprompt.showTutorial",
      () => {
        showTutorialPanel(context);
      }
    );
    context.subscriptions.push(tutorialCommand);

    outputChannel.appendLine(
      "[activate] PHIPROMPT Framework Extension fully activated with enhanced features."
    );
    outputChannel.appendLine(
      `[activate] Available commands: 8 enhanced commands registered.`
    );
    outputChannel.appendLine(
      `[activate] Supported patterns: ${
        Object.keys(PHIPROMPT_SYMBOLIC_MAP).length
      } symbols.`
    );
    outputChannel.appendLine(
      `[activate] Framework validation: Active with auto-validation on save.`
    );
  } catch (error) {
    outputChannel.appendLine(`[activate] ERROR: ${error}`);
    vscode.window.showErrorMessage(
      `PHIPROMPT Extension activation failed: ${error}`
    );
  }
}

/**
 * Enhanced symbol mapping generator with proper exclusion and logging
 */
function generateCompactSymbolMapping(
  editor: vscode.TextEditor,
  isAutoUpdate = false,
  outputChannel?: vscode.OutputChannel
) {
  const doc = editor.document;
  const text = doc.getText();

  if (outputChannel) {
    outputChannel.appendLine(
      `[mapping] Starting symbol mapping generation for ${doc.fileName}`
    );
  }

  // Find existing LOOKUP_MAPS block to exclude from symbol detection
  const mappingBlockRegex =
    /##\s*\[\s*LOOKUP_MAPS\s*\]\s*```javascript[\s\S]*?```\s*/g;
  const mappingBlocks = [...text.matchAll(mappingBlockRegex)];

  // Create text without the mapping blocks for symbol detection
  let textForAnalysis = text;
  for (let i = mappingBlocks.length - 1; i >= 0; i--) {
    const block = mappingBlocks[i];
    const startIndex = block.index!;
    const endIndex = startIndex + block[0].length;
    textForAnalysis =
      textForAnalysis.slice(0, startIndex) + textForAnalysis.slice(endIndex);
  }

  if (outputChannel) {
    outputChannel.appendLine(
      `[mapping] Analyzing ${textForAnalysis.length} characters (excluded ${
        text.length - textForAnalysis.length
      } characters from mapping blocks)`
    );
  }

  // Find used symbols in the content (excluding mapping blocks)
  const usedSymbols = new Set<string>();
  for (const symbol of Object.keys(PHIPROMPT_SYMBOLIC_MAP)) {
    if (textForAnalysis.includes(symbol)) {
      usedSymbols.add(symbol);
    }
  }

  if (outputChannel) {
    outputChannel.appendLine(
      `[mapping] Found ${usedSymbols.size} unique symbols: ${Array.from(
        usedSymbols
      ).join(", ")}`
    );
  }

  if (usedSymbols.size === 0) {
    if (!isAutoUpdate) {
      vscode.window.showInformationMessage(
        "No mapped symbols found in document content"
      );
    }
    if (outputChannel) {
      outputChannel.appendLine(
        `[mapping] No symbols found, skipping mapping generation`
      );
    }
    return;
  }

  // Build filtered symbol map
  const filteredMap: Record<string, string[]> = {};
  for (const symbol of usedSymbols) {
    filteredMap[symbol] = PHIPROMPT_SYMBOLIC_MAP[symbol];
  }

  // Format the symbol map
  const compactMapStr = JSON.stringify(filteredMap)
    .replace(/"([^"]+)":/g, "$1:")
    .replace(/\],/g, "], ");

  const compactJS = `## [LOOKUP_MAPS]
\`\`\`javascript
const PHIPROMPT_SYMBOLIC_MAP = ${compactMapStr};

const MERGED_SYMBOLIC_MAP = {
  ...PHIPROMPT_SYMBOLIC_MAP, ...(typeof CUSTOM_SYMBOLIC_MAP !== 'undefined' ? CUSTOM_SYMBOLIC_MAP : {})
};

const SYMBOL_TO_TEXT = Object.fromEntries(
  Object.entries(MERGED_SYMBOLIC_MAP).map(([symbol, aliases]) => [symbol, aliases[0]])
);

const AUTO_ALIAS_MAP = {};
for (const [symbol, aliases] of Object.entries(MERGED_SYMBOLIC_MAP)) {
  for (const alias of aliases) {
    AUTO_ALIAS_MAP[alias] = symbol;
  }
}
\`\`\`
`;

  // Update or insert the mapping block
  editor
    .edit((editBuilder) => {
      if (mappingBlocks.length > 0) {
        // Replace existing mapping blocks
        if (outputChannel) {
          outputChannel.appendLine(
            `[mapping] Replacing ${mappingBlocks.length} existing mapping block(s)`
          );
        }

        // Replace the first block
        const firstBlock = mappingBlocks[0];
        const startPos = doc.positionAt(firstBlock.index!);
        const endPos = doc.positionAt(firstBlock.index! + firstBlock[0].length);
        editBuilder.replace(new vscode.Range(startPos, endPos), compactJS);

        // Remove any additional blocks (duplicates)
        for (let i = 1; i < mappingBlocks.length; i++) {
          const duplicateBlock = mappingBlocks[i];
          const dupStartPos = doc.positionAt(duplicateBlock.index!);
          const dupEndPos = doc.positionAt(
            duplicateBlock.index! + duplicateBlock[0].length
          );
          editBuilder.delete(new vscode.Range(dupStartPos, dupEndPos));
          if (outputChannel) {
            outputChannel.appendLine(
              `[mapping] Removed duplicate mapping block ${i + 1}`
            );
          }
        }
      } else {
        // Insert new mapping block at the start of the document
        if (outputChannel) {
          outputChannel.appendLine(
            `[mapping] Creating new mapping block at start of document`
          );
        }
        const insertPos = new vscode.Position(0, 0);
        editBuilder.insert(insertPos, compactJS + "\n\n");
      }
    })
    .then((success) => {
      if (success) {
        if (!isAutoUpdate) {
          vscode.window.showInformationMessage(
            `📊 Updated symbol mapping: ${usedSymbols.size} symbols`
          );
        }
        if (outputChannel) {
          outputChannel.appendLine(
            `[mapping] Successfully updated mapping with ${usedSymbols.size} symbols`
          );
        }
      } else {
        if (outputChannel) {
          outputChannel.appendLine(`[mapping] Failed to update symbol mapping`);
        }
      }
    });
}

export function deactivate() {
  if (outputChannel) {
    outputChannel.appendLine(
      "[deactivate] PHIPROMPT Framework Extension deactivated."
    );
    outputChannel.dispose();
  }
}
