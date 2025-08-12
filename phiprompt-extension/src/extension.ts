import * as vscode from 'vscode';
import { PhipromptBreadcrumbProvider, PhipromptDocumentLinkProvider } from './breadcrumbNavigation';
import { PhipromptDefinitionProvider } from './definitionProvider';
import { PHIPROMPT_SYMBOLIC_MAP, SYMBOL_TO_TEXT, AUTO_ALIAS_MAP, validateFrameworkCompliance, detectFrameworkPatterns, getFrameworkSuggestions } from './symbolicMap';

let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel('PHIPROMPT Framework Extension');
  outputChannel.appendLine('[activate] Starting PHIPROMPT Framework Extension...');

  try {
    // === ENHANCED BREADCRUMB NAVIGATION PROVIDERS ===
    // Document symbols for enhanced breadcrumb trail with framework awareness
    const breadcrumbProvider = new PhipromptBreadcrumbProvider();
    context.subscriptions.push(
      vscode.languages.registerDocumentSymbolProvider(
        'phiprompt',
        breadcrumbProvider
      )
    );

    // Enhanced Ctrl+click navigation (Go to Definition) with framework context
    const definitionProvider = new PhipromptDefinitionProvider();
    context.subscriptions.push(
      vscode.languages.registerDefinitionProvider(
        'phiprompt',
        definitionProvider
      )
    );

    // Enhanced clickable links for section references and framework navigation
    const linkProvider = new PhipromptDocumentLinkProvider();
    context.subscriptions.push(
      vscode.languages.registerDocumentLinkProvider(
        'phiprompt',
        linkProvider
      )
    );

    outputChannel.appendLine('[activate] Registered enhanced breadcrumb navigation providers.');

    // === ENHANCED FRAMEWORK VALIDATION COMMANDS ===
    
    // Enhanced framework validation command
    const validateCommand = vscode.commands.registerCommand('phiprompt.validateFramework', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active PHIPROMPT document found.');
        return;
      }

      const document = editor.document;
      if (document.languageId !== 'phiprompt') {
        vscode.window.showWarningMessage('Current document is not a PHIPROMPT file.');
        return;
      }

      const content = document.getText();
      const validation = validateFrameworkCompliance(content);
      
      // Clear previous diagnostics
      const diagnosticCollection = vscode.languages.createDiagnosticCollection('phiprompt-framework');
      const diagnostics: vscode.Diagnostic[] = [];

      // Add errors as diagnostics
      validation.errors.forEach(error => {
        const diagnostic = new vscode.Diagnostic(
          new vscode.Range(0, 0, 0, 0),
          error,
          vscode.DiagnosticSeverity.Error
        );
        diagnostic.source = 'PHIPROMPT Framework';
        diagnostics.push(diagnostic);
      });

      // Add warnings as diagnostics
      validation.warnings.forEach(warning => {
        const diagnostic = new vscode.Diagnostic(
          new vscode.Range(0, 0, 0, 0),
          warning,
          vscode.DiagnosticSeverity.Warning
        );
        diagnostic.source = 'PHIPROMPT Framework';
        diagnostics.push(diagnostic);
      });

      diagnosticCollection.set(document.uri, diagnostics);

      // Show validation results
      if (validation.isValid) {
        vscode.window.showInformationMessage(
          `✅ Framework validation passed! ${validation.warnings.length} warnings, ${validation.suggestions.length} suggestions.`
        );
      } else {
        vscode.window.showErrorMessage(
          `❌ Framework validation failed! ${validation.errors.length} errors, ${validation.warnings.length} warnings.`
        );
      }

      // Log detailed results
      outputChannel.appendLine(`[validateFramework] Validation Results:`);
      outputChannel.appendLine(`  Valid: ${validation.isValid}`);
      outputChannel.appendLine(`  Errors: ${validation.errors.length}`);
      outputChannel.appendLine(`  Warnings: ${validation.warnings.length}`);
      outputChannel.appendLine(`  Suggestions: ${validation.suggestions.length}`);
      
      validation.errors.forEach(error => outputChannel.appendLine(`  ERROR: ${error}`));
      validation.warnings.forEach(warning => outputChannel.appendLine(`  WARNING: ${warning}`));
      validation.suggestions.forEach(suggestion => outputChannel.appendLine(`  SUGGESTION: ${suggestion}`));
    });

    context.subscriptions.push(validateCommand);

    // Enhanced framework pattern analysis command
    const analyzeCommand = vscode.commands.registerCommand('phiprompt.analyzeComplexity', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.languageId !== 'phiprompt') {
        vscode.window.showWarningMessage('No active PHIPROMPT document found.');
        return;
      }

      const content = editor.document.getText();
      const patterns = detectFrameworkPatterns(content);
      
      const patternSummary = {
        framework_headers: patterns.filter(p => p.type === 'framework_header').length,
        pipeline_sequences: patterns.filter(p => p.type === 'pipeline_sequence').length,
        output_specifications: patterns.filter(p => p.type === 'output_specification').length,
        meta_controls: patterns.filter(p => p.type === 'meta_control').length,
        module_definitions: patterns.filter(p => p.type === 'module_definition').length
      };

      const complexity = Object.values(patternSummary).reduce((sum, count) => sum + count, 0);
      
      let complexityLevel = 'Simple';
      if (complexity > 20) complexityLevel = 'Complex';
      else if (complexity > 10) complexityLevel = 'Moderate';

      vscode.window.showInformationMessage(
        `📊 Framework Complexity: ${complexityLevel} (${complexity} patterns detected)`
      );

      outputChannel.appendLine(`[analyzeComplexity] Pattern Analysis:`);
      outputChannel.appendLine(`  Framework Headers: ${patternSummary.framework_headers}`);
      outputChannel.appendLine(`  Pipeline Sequences: ${patternSummary.pipeline_sequences}`);
      outputChannel.appendLine(`  Output Specifications: ${patternSummary.output_specifications}`);
      outputChannel.appendLine(`  Meta Controls: ${patternSummary.meta_controls}`);
      outputChannel.appendLine(`  Module Definitions: ${patternSummary.module_definitions}`);
      outputChannel.appendLine(`  Total Complexity: ${complexity} (${complexityLevel})`);
    });

    context.subscriptions.push(analyzeCommand);

    // === ENHANCED SYMBOL CONVERSION COMMANDS ===
    
    // Convert symbols to natural language
    const convertToTextCommand = vscode.commands.registerCommand('phiprompt.convertToText', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selection = editor.selection;
      const text = editor.document.getText(selection);
      
      let convertedText = text;
      for (const [symbol, aliases] of Object.entries(PHIPROMPT_SYMBOLIC_MAP)) {
        const regex = new RegExp(symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        convertedText = convertedText.replace(regex, aliases[0]);
      }

      if (convertedText !== text) {
        await editor.edit(editBuilder => {
          editBuilder.replace(selection, convertedText);
        });
        vscode.window.showInformationMessage('✅ Symbols converted to natural language.');
      } else {
        vscode.window.showInformationMessage('ℹ️ No symbols found to convert.');
      }
    });

    context.subscriptions.push(convertToTextCommand);

    // Convert natural language to symbols
    const convertFromTextCommand = vscode.commands.registerCommand('phiprompt.convertFromText', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const selection = editor.selection;
      const text = editor.document.getText(selection);
      
      let convertedText = text;
      for (const [alias, symbol] of Object.entries(AUTO_ALIAS_MAP)) {
        const regex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
        convertedText = convertedText.replace(regex, symbol);
      }

      if (convertedText !== text) {
        await editor.edit(editBuilder => {
          editBuilder.replace(selection, convertedText);
        });
        vscode.window.showInformationMessage('✅ Text converted to PHICODE symbols.');
      } else {
        vscode.window.showInformationMessage('ℹ️ No convertible text found.');
      }
    });

    context.subscriptions.push(convertFromTextCommand);

    // === ENHANCED FRAMEWORK TEMPLATE COMMANDS ===
    
    // Insert complete Φ pipeline template
    const insertPhiPipelineCommand = vscode.commands.registerCommand('phiprompt.insertPhiPipeline', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const frameworkName = await vscode.window.showInputBox({
        prompt: 'Enter framework name (e.g., contentAnalyzer, strategyBuilder)',
        placeHolder: 'frameworkName'
      });

      if (!frameworkName) return;

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

      await editor.edit(editBuilder => {
        editBuilder.insert(editor.selection.active, template);
      });

      vscode.window.showInformationMessage(`✅ Φ.${frameworkName} pipeline template inserted.`);
    });

    context.subscriptions.push(insertPhiPipelineCommand);

    // Generate Greek module template
    const generateGreekModuleCommand = vscode.commands.registerCommand('phiprompt.generateGreekModule', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const modules = ['Ψ (Optimizer)', 'ℜ (Forensics)', 'Π (Processor)', 'Ω (Output)', 'Λ (Lambda)'];
      const selectedModule = await vscode.window.showQuickPick(modules, {
        placeHolder: 'Select Greek module to generate'
      });

      if (!selectedModule) return;

      const moduleSymbol = selectedModule.split(' ')[0];
      let template = '';

      switch (moduleSymbol) {
        case 'Ψ':
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
        case 'ℜ':
          template = `    ℜ : {
        models : [forensic_analysis ∪ evidence_validation ∪ pattern_detection ∪ causality_mapping ∪ verification_protocols],
        principles : [evidence_based ∧ systematic_investigation ∧ bias_mitigation ∧ transparency],
        domains : [investigation_domain ⊕ evidence_analysis ⊕ validation_frameworks],
        limits : [evidence_availability ∪ investigation_scope ∪ certainty_constraints ∪ temporal_boundaries],
        QA : [peer_review ; cross_validation ; evidence_verification ; bias_assessment]
    }`;
          break;
        case 'Π':
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
        case 'Ω':
          template = `    Ω.output_config : {
        format_structure : [F → format_type ∧ T → tone_category ∧ S → structure_requirements],
        presentation : [hierarchy_organization ; content_structuring ; readability_optimization],
        consistency : [template_adherence ∧ quality_standards ∧ compliance_requirements],
        validation : [output_verification ; format_checking ; quality_assessment],
        delivery : [stakeholder_alignment ; accessibility_compliance ; performance_optimization]
    }`;
          break;
        case 'Λ':
          template = `    Λ.function_processing : {
        lambda_operations : [transformation_functions ∪ mapping_operations ∪ filtering_logic ∪ validation_rules],
        functional_composition : [operation_chaining → result_transformation ∧ error_handling ∧ ⚠performance_monitoring],
        context_preservation : [scope_management ∪ state_tracking ∪ dependency_resolution],
        optimization : [performance_tuning ∧ resource_efficiency ∧ scalability_enhancement]
    }`;
          break;
      }

      await editor.edit(editBuilder => {
        editBuilder.insert(editor.selection.active, template);
      });

      vscode.window.showInformationMessage(`✅ ${moduleSymbol} module template inserted.`);
    });

    context.subscriptions.push(generateGreekModuleCommand);

    // === ENHANCED SYMBOL INSERTION COMMAND ===
    
    const insertSymbolCommand = vscode.commands.registerCommand('phiprompt.insertSymbol', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const symbolCategories = [
        'Greek Modules (Φ, Ψ, ℜ, Π, ρ, ν, α, κ, μ)',
        'Pipeline Steps (ξ, ε, α, ρ, ω, φ, κ, σ, δ)',
        'Logical Operators (→, ∧, ∪, ⊕, ∀, ∃)',
        'Uncertainty Flags (⚠, 🔍, 🌀, 🧱, 🎭, 🧪)',
        'Mathematical Symbols (∇, ∂, ↻, ⇑, ⇓, ±)',
        'All Symbols'
      ];

      const selectedCategory = await vscode.window.showQuickPick(symbolCategories, {
        placeHolder: 'Select symbol category'
      });

      if (!selectedCategory) return;

      let symbolOptions: string[] = [];

      if (selectedCategory.includes('Greek Modules')) {
        symbolOptions = ['Φ', 'Ψ', 'ℜ', 'Π', 'ρ', 'ν', 'α', 'κ', 'μ', 'λ', 'ξ', 'ε', 'π', 'ω', 'χ', 'υ', 'φ', 'β', 'σ', 'τ', 'δ', 'γ', 'ι', 'θ', 'η', 'ζ'];
      } else if (selectedCategory.includes('Pipeline Steps')) {
        symbolOptions = ['ξ', 'ε', 'α', 'ρ', 'ω', 'φ', 'κ', 'σ', 'δ', 'π', 'β', 'γ', 'τ', 'ι', 'υ', 'χ'];
      } else if (selectedCategory.includes('Logical Operators')) {
        symbolOptions = ['→', '∧', '∪', '⊕', '∀', '∃', '∈', '∉', '∅', '∨', '¬', '⟹', '≡', '⊤', '⊥', '⇔'];
      } else if (selectedCategory.includes('Uncertainty Flags')) {
        symbolOptions = ['⚠', '🔍', '🌀', '🧱', '🎭', '🧪', '⚡', '🔄', '📊', '📝', '🔗'];
      } else if (selectedCategory.includes('Mathematical')) {
        symbolOptions = ['∇', '∂', '↻', '⇑', '⇓', '±', '≅', '≬', '☉', '☽', '↪', '⇨', '⇦', '⊣'];
      } else {
        symbolOptions = Object.keys(PHIPROMPT_SYMBOLIC_MAP);
      }

      const symbolItems = symbolOptions.map(symbol => ({
        label: symbol,
        description: PHIPROMPT_SYMBOLIC_MAP[symbol]?.[0] || 'Symbol',
        detail: PHIPROMPT_SYMBOLIC_MAP[symbol]?.slice(1).join(', ') || ''
      }));

      const selectedSymbol = await vscode.window.showQuickPick(symbolItems, {
        placeHolder: 'Select symbol to insert',
        matchOnDescription: true,
        matchOnDetail: true
      });

      if (!selectedSymbol) return;

      await editor.edit(editBuilder => {
        editBuilder.insert(editor.selection.active, selectedSymbol.label);
      });
    });

    context.subscriptions.push(insertSymbolCommand);

    // === ENHANCED NAVIGATION COMMAND ===
    
    const navigateToSectionCommand = vscode.commands.registerCommand('phiprompt.navigateToSection', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.languageId !== 'phiprompt') {
        vscode.window.showWarningMessage('No active PHIPROMPT document found.');
        return;
      }

      const content = editor.document.getText();
      const patterns = detectFrameworkPatterns(content);
      
      const navigationItems = patterns.map(pattern => ({
        label: pattern.content,
        description: `Line ${pattern.line} - ${pattern.type}`,
        detail: pattern.framework || pattern.module || pattern.category || '',
        line: pattern.line
      }));

      if (navigationItems.length === 0) {
        vscode.window.showInformationMessage('No framework patterns found for navigation.');
        return;
      }

      const selectedItem = await vscode.window.showQuickPick(navigationItems, {
        placeHolder: 'Navigate to framework section',
        matchOnDescription: true,
        matchOnDetail: true
      });

      if (!selectedItem) return;

      const position = new vscode.Position(selectedItem.line - 1, 0);
      editor.selection = new vscode.Selection(position, position);
      editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
    });

    context.subscriptions.push(navigateToSectionCommand);

    // === ENHANCED SYMBOL MAPPING COMMAND ===
    
    const generateSymbolMappingCommand = vscode.commands.registerCommand('phiprompt.generateSymbolMapping', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.languageId !== 'phiprompt') {
        vscode.window.showWarningMessage('No active PHIPROMPT document found.');
        return;
      }

      const content = editor.document.getText();
      const usedSymbols = new Set<string>();
      
      // Extract all symbols used in the document
      for (const symbol of Object.keys(PHIPROMPT_SYMBOLIC_MAP)) {
        if (content.includes(symbol)) {
          usedSymbols.add(symbol);
        }
      }

      if (usedSymbols.size === 0) {
        vscode.window.showInformationMessage('No PHIPROMPT symbols found in current document.');
        return;
      }

      // Generate mapping document
      let mapping = `# Symbol Mapping for Current Document\n\n`;
      mapping += `Generated on: ${new Date().toLocaleString()}\n`;
      mapping += `Document: ${editor.document.fileName}\n`;
      mapping += `Symbols Used: ${usedSymbols.size}\n\n`;

      const categorizedSymbols = {
        'Framework Modules': [] as string[],
        'Pipeline Steps': [] as string[],
        'Logical Operators': [] as string[],
        'Uncertainty Flags': [] as string[],
        'Mathematical Symbols': [] as string[],
        'Other': [] as string[]
      };

      for (const symbol of usedSymbols) {
        if (['Φ', 'Ψ', 'ℜ', 'Π', 'Ω', 'Λ'].includes(symbol)) {
          categorizedSymbols['Framework Modules'].push(symbol);
        } else if (['ξ', 'ε', 'α', 'ρ', 'ω', 'φ', 'κ', 'σ', 'δ'].includes(symbol)) {
          categorizedSymbols['Pipeline Steps'].push(symbol);
        } else if (['→', '∧', '∪', '⊕', '∀', '∃'].includes(symbol)) {
          categorizedSymbols['Logical Operators'].push(symbol);
        } else if (['⚠', '🔍', '🌀', '🧱', '🎭', '🧪'].includes(symbol)) {
          categorizedSymbols['Uncertainty Flags'].push(symbol);
        } else if (['∇', '∂', '↻', '⇑', '⇓'].includes(symbol)) {
          categorizedSymbols['Mathematical Symbols'].push(symbol);
        } else {
          categorizedSymbols['Other'].push(symbol);
        }
      }

      for (const [category, symbols] of Object.entries(categorizedSymbols)) {
        if (symbols.length > 0) {
          mapping += `## ${category}\n\n`;
          for (const symbol of symbols) {
            const info = PHIPROMPT_SYMBOLIC_MAP[symbol];
            mapping += `- **${symbol}**: ${info[0]} (${info.slice(1).join(', ')})\n`;
          }
          mapping += `\n`;
        }
      }

      // Create new document with mapping
      const newDoc = await vscode.workspace.openTextDocument({
        content: mapping,
        language: 'markdown'
      });
      
      await vscode.window.showTextDocument(newDoc);
      vscode.window.showInformationMessage(`✅ Symbol mapping generated with ${usedSymbols.size} symbols.`);
    });

    context.subscriptions.push(generateSymbolMappingCommand);

    // === ENHANCED COMPLETION PROVIDER ===
    
    const completionProvider = vscode.languages.registerCompletionItemProvider(
      'phiprompt',
      {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
          const lineText = document.lineAt(position).text;
          const linePrefix = lineText.substr(0, position.character);
          
          const completionItems: vscode.CompletionItem[] = [];
          
          // Framework-aware suggestions
          const suggestions = getFrameworkSuggestions(linePrefix, position.character);
          
          for (const suggestion of suggestions) {
            const item = new vscode.CompletionItem(suggestion.symbol, vscode.CompletionItemKind.Snippet);
            item.detail = suggestion.description;
            item.documentation = `Category: ${suggestion.category}`;
            item.insertText = suggestion.insertText;
            completionItems.push(item);
          }
          
          // Add general symbol completions
          for (const [symbol, aliases] of Object.entries(PHIPROMPT_SYMBOLIC_MAP)) {
            const item = new vscode.CompletionItem(symbol, vscode.CompletionItemKind.Constant);
            item.detail = aliases[0];
            item.documentation = aliases.slice(1).join(', ');
            item.insertText = symbol;
            completionItems.push(item);
          }
          
          return completionItems;
        }
      },
      '→', '∧', '∪', '⊕', 'Φ', 'Ψ', 'ℜ', 'Π' // Trigger characters
    );

    context.subscriptions.push(completionProvider);

    // === AUTOMATIC VALIDATION ON SAVE ===
    
    const onSaveValidation = vscode.workspace.onDidSaveTextDocument((document) => {
      if (document.languageId === 'phiprompt') {
        // Auto-validate on save
        const validation = validateFrameworkCompliance(document.getText());
        
        if (!validation.isValid) {
          vscode.window.showWarningMessage(
            `⚠️ Framework validation issues detected. Run "Validate Framework" for details.`,
            'Validate Now'
          ).then(selection => {
            if (selection === 'Validate Now') {
              vscode.commands.executeCommand('phiprompt.validateFramework');
            }
          });
        }
      }
    });

    context.subscriptions.push(onSaveValidation);

    outputChannel.appendLine('[activate] PHIPROMPT Framework Extension fully activated with enhanced features.');
    outputChannel.appendLine(`[activate] Available commands: 8 enhanced commands registered.`);
    outputChannel.appendLine(`[activate] Supported patterns: ${Object.keys(PHIPROMPT_SYMBOLIC_MAP).length} symbols.`);
    outputChannel.appendLine(`[activate] Framework validation: Active with auto-validation on save.`);

  } catch (error) {
    outputChannel.appendLine(`[activate] ERROR: ${error}`);
    vscode.window.showErrorMessage(`PHIPROMPT Extension activation failed: ${error}`);
  }
}

export function deactivate() {
  if (outputChannel) {
    outputChannel.appendLine('[deactivate] PHIPROMPT Framework Extension deactivated.');
    outputChannel.dispose();
  }
}