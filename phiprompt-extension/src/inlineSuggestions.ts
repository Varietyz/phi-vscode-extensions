import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { PHIPROMPT_SYMBOLIC_MAP, AUTO_ALIAS_MAP } from './symbolicMap';
import { PhipromptCopilotInterpreter } from './copilotConfig';

interface SuggestionPattern {
    trigger: RegExp;
    suggestions: (match: RegExpMatchArray, context: string) => string[];
    priority: number;
}

interface DocumentState {
    isEmpty: boolean;
    hasPhiPipeline: boolean;
    hasPartialPipeline: boolean;
    hasSections: boolean;
    missingComponents: string[];
}

interface TemplateConfig {
    framework_templates: Record<string, TemplateDefinition>;
    section_templates: Record<string, TemplateDefinition>;
    quantifier_patterns: Record<string, TemplateDefinition>;
    module_definitions: Record<string, TemplateDefinition>;
    challenge_flag_patterns: Record<string, TemplateDefinition>;
    transformation_patterns: Record<string, TemplateDefinition>;
    domain_notation_patterns: Record<string, TemplateDefinition>;
    validation_patterns: Record<string, TemplateDefinition>;
    execution_patterns: Record<string, TemplateDefinition>;
    compliance_patterns: Record<string, TemplateDefinition>;
}

interface TemplateDefinition {
    trigger: string[];
    priority: number;
    content: string;
    description: string;
}

export class PhipromptInlineSuggestions implements vscode.InlineCompletionItemProvider {
    private suggestionPatterns: SuggestionPattern[] = [];
    private templateConfig: TemplateConfig | null = null;
    private recentContext = new Map<string, string>();

    constructor(private context: vscode.ExtensionContext) {
        this.loadTemplateConfiguration();
        this.initializeSuggestionPatterns();
    }

    private loadTemplateConfiguration(): void {
        try {
            const configPath = path.join(this.context.extensionPath, 'snippets', 'phiprompt-suggestions.json');
            if (fs.existsSync(configPath)) {
                const configData = fs.readFileSync(configPath, 'utf8');
                this.templateConfig = JSON.parse(configData) as TemplateConfig;
            } else {
                console.warn('PHIPROMPT suggestions configuration file not found');
                this.templateConfig = this.getDefaultTemplateConfig();
            }
        } catch (error) {
            console.error('Failed to load PHIPROMPT template configuration:', error);
            this.templateConfig = this.getDefaultTemplateConfig();
        }
    }

    private getDefaultTemplateConfig(): TemplateConfig {
        return {
            framework_templates: {},
            section_templates: {},
            quantifier_patterns: {},
            module_definitions: {},
            challenge_flag_patterns: {},
            transformation_patterns: {},
            domain_notation_patterns: {},
            validation_patterns: {},
            execution_patterns: {},
            compliance_patterns: {}
        };
    }

    async provideInlineCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.InlineCompletionContext,
        token: vscode.CancellationToken
    ): Promise<vscode.InlineCompletionItem[] | vscode.InlineCompletionList | null> {

        if (document.languageId !== 'phiprompt') return null;
        if (!this.templateConfig) return null;

        const documentState = this.analyzeDocumentState(document);

        // Priority 1: Empty document pipeline scaffold
        if (documentState.isEmpty) {
            return this.createPipelineScaffoldSuggestion(position);
        }

        // Priority 2: Partial pipeline completion
        if (documentState.hasPartialPipeline && documentState.missingComponents.length > 0) {
            return this.createPipelineCompletionSuggestions(position, documentState.missingComponents);
        }

        // Priority 3: Section suggestions after complete pipeline
        if (documentState.hasPhiPipeline && !documentState.hasSections) {
            return this.createSectionSuggestions(position);
        }

        const line = document.lineAt(position);
        const textBeforeCursor = line.text.substring(0, position.character);
        const textAfterCursor = line.text.substring(position.character);
        const fullContext = this.getContextAround(document, position, 3);

        // Priority 4: Context-aware pattern suggestions
        const suggestions = await this.generateSuggestions(
            textBeforeCursor,
            textAfterCursor,
            fullContext,
            position,
            documentState
        );

        if (suggestions.length === 0) return null;

        return {
            items: suggestions.map(suggestion => this.createInlineCompletionItem(
                suggestion,
                position,
                textBeforeCursor
            ))
        };
    }

    private analyzeDocumentState(document: vscode.TextDocument): DocumentState {
        const text = document.getText();
        const trimmedText = text.trim();

        const isEmpty = trimmedText.length === 0 ||
            text.split('\n').filter(line => line.trim().length > 0).length === 0;

        const hasPhiPipeline = /Φ\s*=\s*{[\s\S]*}/.test(text);
        const hasPartialPipeline = text.includes('Φ =') && !hasPhiPipeline;
        const hasSections = /##\s*\[/.test(text);

        const missingComponents: string[] = [];
        if (text.includes('Φ =')) {
            if (!text.includes('Ψ:')) missingComponents.push('Ψ');
            if (!text.includes('ℜ:')) missingComponents.push('ℜ');
            if (!text.includes('Π:')) missingComponents.push('Π');
        }

        return {
            isEmpty,
            hasPhiPipeline,
            hasPartialPipeline,
            hasSections,
            missingComponents
        };
    }

    private createPipelineScaffoldSuggestion(position: vscode.Position): vscode.InlineCompletionList {
        const fullPipelineTemplate = this.templateConfig?.framework_templates?.full_pipeline;
        const basicPipelineTemplate = this.templateConfig?.framework_templates?.basic_pipeline;

        const pipelineContent = fullPipelineTemplate?.content || basicPipelineTemplate?.content || this.getDefaultPipelineScaffold();

        const item = new vscode.InlineCompletionItem(
            pipelineContent,
            new vscode.Range(position, position)
        );

        return { items: [item] };
    }

    private getDefaultPipelineScaffold(): string {
        return `##[ACTIVE_PIPELINE]
Φ = {
    Ψ : {
        ρ : {
            filter : /dup|overconf|loops/g,
            consolidator : [merge, collapse],
            ν : [entity, attr, val, rel],
            α : [conflicts, claims, loops, novelty],
            μ : [abstract, fig, subj],
            κ : [nest, vague, impl]
        },
        ℜ : {
            models : [causal, triangulation, anomaly, custody, refinement, signal, bayes, bias, scaffold],
            principles : [evidence, falsify, docs, error],
            domains : [criminal, digital, biomed, research, cognitive],
            limits : [incomplete, uncertainty, observer, temporal, resources],
            QA : [peer_review, transparency, error_rates, bias]
        },
    },
    Π : {
        [COMPILE]
        Π.compile{
            ξ : [tech, sci, biz, creative, med, edu, social, temp, spatial, quant, qual, proc, meta, cond, affect, claim],
            ε : [infer, adapt, entities, attrs, vals, rels, assess, meta, cond, affect, claim, exec],
            π : [ξ → ε → α → ν → ρ → χ → ω → φ → β → κ → σ → λ → μ → τ → π → δ]≡{
                ξ : domain_analysis → context.classification ∧ challenge.detect ∧ ⚠,
                ε : entity_ident → {people, objects, concepts, locations, events} ∧ 🌀.analyze ∧ 🔍,
                α : attr_extract → {properties, qualities, specs, features} ∧ 🧱.map ∧ ⚠,
                ν : value_capture → {numeric, textual, categorical, boolean, temporal} ∧ 🎭.indicators ∧ 📝,
                ρ : rel_map → connections ∧ 🧪.validate ∧ 🔗,
                χ : context_preserve → temporal ⊕ spatial ⊕ conditional ∧ complexity.assess ∧ ⚠,
                ω : validate_cohere → flag(⚠ ⊕ 🔍) ∧ challenge.flags,
                φ : feedback_calibrate → measured.response ⊕ evidence.eval ∧ limitation.explicit ∧ ⚠,
                β : anthrop_audit → language.validate ∧ tech.accuracy.verify ∧ 🔍,
                κ : credibility_assess → claim.verify ∧ mechanism.accuracy.check ∧ 🧪,
                σ : symbolic_synth → elements → operators ∧ preserve.logic.flow ∧ ⚠,
                λ : flag_integrate → embed(🌀🧱🎭🧪) ∧ best_effort,
                μ : uncertainty_embed → confidence.levels ∧ explicit.limits,
                τ : rel_symbolic_map → connections → operators ∧ 🔗,
                π : phicode_gen → symbolic.rep ∧ completeness.⚠,
                δ : code_synth → IF(ξ∈technical ∧ feasible) → implementation ∧ ⚠(quality)
            },
            ω : [structure, internal, external, matrix, narrative, flags],
            χ : [domain, entities, vals, missing, rels, enthusiasm, evidence, meta, cond, affect, claim, exec],
            υ : [entity, attr, val, context, rels, performance, meta, cond, affect, claim],
            ℜ : [claims, comparisons, confidence, limits, meta, cond, affect, performance, exec],
            σ : [completeness, quality, realistic]
        },
        [RUN]
        Π.run{
            ι : [consistency, mapping, challenge],
            σ : [extract, compile, forensics, optimize, decompress, meta, generate, synthesize],
            γ : symbolic_attempted,
            δ : IF code → symbolic+code ELSE narrative,
            ν : [natural, flags, tone],
            φ : [format, feedback, constraints]
        },
        [DECOMPILE]
        Π.decompile{
            σ : SYMBOL_TO_TEXT,
            τ : [convert, avoid, include, focus, maintain, preserve],
            ι : [convert, expand, output, include, use, preserve],
            χ : flag_explanations,
            Ψ : [filter, normalize, validate]
        }
    },
    compliance : [overconfidence, execution, validation, empirical, anthropomorphism],
    deploy : [phase1, phase2, phase3, continuous],
    limits : [processing, capabilities, scope],
    success : [goals, quality, failure_prevention],
    meta : {
        scaffold : [metaphor, narrative, implicature, compression],
        distortion : [pressure, ambiguity, virality],
        intent : [clarify, influence, conceal],
        meaning : Δ = Σdistortions + Σrecontext,
        validation : [scientific, political, ad, informal, lit],
        convergence : [compression, ambiguity],
        constraints : [preservation, distortion, validation]
    }
}

##[ACTIVATE]
Activate.System = ∀.input → ALWAYS{
    ξ.classify → Ψ.filter → ℜ.analyze → Π.compile → Π.run → Π.decompile → output.narrative+flags+⚠
}`;
    }

    private createPipelineCompletionSuggestions(
        position: vscode.Position,
        missingComponents: string[]
    ): vscode.InlineCompletionList {
        const items: vscode.InlineCompletionItem[] = [];

        for (const component of missingComponents) {
            const templateKey = `${component.toLowerCase()}_optimizer`;
            const template = this.templateConfig?.module_definitions?.[templateKey];
            
            let componentText = template?.content || this.getDefaultComponentContent(component);

            if (componentText) {
                const item = new vscode.InlineCompletionItem(
                    componentText,
                    new vscode.Range(position, position)
                );
                items.push(item);
            }
        }

        return { items };
    }

    private getDefaultComponentContent(component: string): string {
        const defaults: Record<string, string> = {
            'Ψ': `    Ψ : {
        ρ : {
            filter : /dup|overconf|loops/g,
            consolidator : [merge, collapse],
            ν : [entity, attr, val, rel],
            α : [conflicts, claims, loops, novelty],
            μ : [abstract, fig, subj],
            κ : [nest, vague, impl]
        },
        ℜ : {
            models : [causal, triangulation, anomaly, custody, refinement, signal, bayes, bias, scaffold],
            principles : [evidence, falsify, docs, error],
            domains : [criminal, digital, biomed, research, cognitive],
            limits : [incomplete, uncertainty, observer, temporal, resources],
            QA : [peer_review, transparency, error_rates, bias]
        },
    },`,
            'ℜ': `        ℜ : {
            models : [causal, triangulation, anomaly, custody, refinement, signal, bayes, bias, scaffold],
            principles : [evidence, falsify, docs, error],
            domains : [criminal, digital, biomed, research, cognitive],
            limits : [incomplete, uncertainty, observer, temporal, resources],
            QA : [peer_review, transparency, error_rates, bias]
        },`,
            'Π': `    Π : {
        [COMPILE]
        Π.compile{
            ξ : [tech, sci, biz, creative, med, edu, social, temp, spatial, quant, qual, proc, meta, cond, affect, claim],
            ε : [infer, adapt, entities, attrs, vals, rels, assess, meta, cond, affect, claim, exec],
            π : [ξ → ε → α → ν → ρ → χ → ω → φ → β → κ → σ → λ → μ → τ → π → δ]≡{
                ξ : domain_analysis → context.classification ∧ challenge.detect ∧ ⚠,
                ε : entity_ident → {people, objects, concepts, locations, events} ∧ 🌀.analyze ∧ 🔍,
                α : attr_extract → {properties, qualities, specs, features} ∧ 🧱.map ∧ ⚠,
                ν : value_capture → {numeric, textual, categorical, boolean, temporal} ∧ 🎭.indicators ∧ 📝,
                ρ : rel_map → connections ∧ 🧪.validate ∧ 🔗,
                χ : context_preserve → temporal ⊕ spatial ⊕ conditional ∧ complexity.assess ∧ ⚠,
                ω : validate_cohere → flag(⚠ ⊕ 🔍) ∧ challenge.flags,
                φ : feedback_calibrate → measured.response ⊕ evidence.eval ∧ limitation.explicit ∧ ⚠,
                β : anthrop_audit → language.validate ∧ tech.accuracy.verify ∧ 🔍,
                κ : credibility_assess → claim.verify ∧ mechanism.accuracy.check ∧ 🧪,
                σ : symbolic_synth → elements → operators ∧ preserve.logic.flow ∧ ⚠,
                λ : flag_integrate → embed(🌀🧱🎭🧪) ∧ best_effort,
                μ : uncertainty_embed → confidence.levels ∧ explicit.limits,
                τ : rel_symbolic_map → connections → operators ∧ 🔗,
                π : phicode_gen → symbolic.rep ∧ completeness.⚠,
                δ : code_synth → IF(ξ∈technical ∧ feasible) → implementation ∧ ⚠(quality)
            },
            ω : [structure, internal, external, matrix, narrative, flags],
            χ : [domain, entities, vals, missing, rels, enthusiasm, evidence, meta, cond, affect, claim, exec],
            υ : [entity, attr, val, context, rels, performance, meta, cond, affect, claim],
            ℜ : [claims, comparisons, confidence, limits, meta, cond, affect, performance, exec],
            σ : [completeness, quality, realistic]
        },
        [RUN]
        Π.run{
            ι : [consistency, mapping, challenge],
            σ : [extract, compile, forensics, optimize, decompress, meta, generate, synthesize],
            γ : symbolic_attempted,
            δ : IF code → symbolic+code ELSE narrative,
            ν : [natural, flags, tone],
            φ : [format, feedback, constraints]
        },
        [DECOMPILE]
        Π.decompile{
            σ : SYMBOL_TO_TEXT,
            τ : [convert, avoid, include, focus, maintain, preserve],
            ι : [convert, expand, output, include, use, preserve],
            χ : flag_explanations,
            Ψ : [filter, normalize, validate]
        }
    },`
        };

        return defaults[component] || '';
    }

    private createSectionSuggestions(position: vscode.Position): vscode.InlineCompletionList {
        const sectionTemplates = this.templateConfig?.section_templates || {};
        const items: vscode.InlineCompletionItem[] = [];

        for (const [key, template] of Object.entries(sectionTemplates)) {
            const item = new vscode.InlineCompletionItem(
                template.content,
                new vscode.Range(position, position)
            );
            items.push(item);
        }

        // Fallback if no templates loaded
        if (items.length === 0) {
            items.push(...this.getDefaultSectionSuggestions(position));
        }

        return { items };
    }

    private getDefaultSectionSuggestions(position: vscode.Position): vscode.InlineCompletionItem[] {
        const defaultSections = [
            {
                name: '[ANALYSIS_TARGET]',
                content: `## [ANALYSIS_TARGET]
∀ entity ∈ domain → {
    // Define analysis scope and requirements
    ⚠(specify_constraints) 🧪(validate_assumptions)
}`
            },
            {
                name: '[DATA_PROCESSING]',
                content: `## [DATA_PROCESSING]
Ψ.filter: {
    ρ.sanitize: remove_duplicates ∧ validate_format
    ν.normalize: standardize_encoding ⚠(data_loss_possible)
    α.validate: ∀ record → schema_compliance
}`
            }
        ];

        return defaultSections.map(section => new vscode.InlineCompletionItem(
            section.content,
            new vscode.Range(position, position)
        ));
    }

    private async generateSuggestions(
        textBefore: string,
        textAfter: string,
        context: string,
        position: vscode.Position,
        documentState: DocumentState
    ): Promise<string[]> {
        const suggestions: Array<{text: string, priority: number}> = [];

        // Template-based suggestions from configuration
        const templateSuggestions = this.generateTemplateSuggestions(textBefore, context);
        suggestions.push(...templateSuggestions.map(s => ({ text: s, priority: 8 })));

        // Pattern-based suggestions
        for (const pattern of this.suggestionPatterns) {
            const match = textBefore.match(pattern.trigger);
            if (match) {
                const patternSuggestions = pattern.suggestions(match, context);
                for (const suggestion of patternSuggestions) {
                    suggestions.push({ text: suggestion, priority: pattern.priority });
                }
            }
        }

        // Framework-aware contextual suggestions
        if (documentState.hasPhiPipeline) {
            const frameworkSuggestions = this.generateFrameworkSuggestions(textBefore, context);
            suggestions.push(...frameworkSuggestions.map(s => ({ text: s, priority: 8 })));
        }

        // AI-powered contextual suggestions
        const aiSuggestions = await this.generateAISuggestions(textBefore, context);
        suggestions.push(...aiSuggestions.map(s => ({ text: s, priority: 5 })));

        // Symbol completion suggestions
        const symbolSuggestions = await this.generateSymbolSuggestions(textBefore, context);
        suggestions.push(...symbolSuggestions.map(s => ({ text: s, priority: 7 })));

        // Sort by priority and return unique suggestions
        const sortedSuggestions = suggestions
            .sort((a, b) => b.priority - a.priority)
            .map(s => s.text)
            .filter((text, index, array) => array.indexOf(text) === index)
            .slice(0, 5);

        return sortedSuggestions;
    }

    private generateTemplateSuggestions(textBefore: string, context: string): string[] {
        if (!this.templateConfig) return [];

        const suggestions: string[] = [];
        const lowerTextBefore = textBefore.toLowerCase();

        // Check all template categories
        const templateCategories = [
            this.templateConfig.quantifier_patterns,
            this.templateConfig.module_definitions,
            this.templateConfig.challenge_flag_patterns,
            this.templateConfig.transformation_patterns,
            this.templateConfig.domain_notation_patterns,
            this.templateConfig.validation_patterns,
            this.templateConfig.execution_patterns,
            this.templateConfig.compliance_patterns
        ];

        for (const category of templateCategories) {
            for (const [key, template] of Object.entries(category)) {
                for (const trigger of template.trigger) {
                    if (lowerTextBefore.includes(trigger.toLowerCase()) || 
                        context.toLowerCase().includes(trigger.toLowerCase())) {
                        suggestions.push(template.content);
                        break;
                    }
                }
            }
        }

        return suggestions;
    }

    private generateFrameworkSuggestions(textBefore: string, context: string): string[] {
        const suggestions: string[] = [];

        // Module-specific patterns from templates
        if (textBefore.includes('Ψ.') || context.includes('Optimizer')) {
            const psiTemplate = this.templateConfig?.module_definitions?.psi_optimizer;
            if (psiTemplate) suggestions.push(psiTemplate.content);
        }

        if (textBefore.includes('ℜ.') || context.includes('Forensics')) {
            const forensicsTemplate = this.templateConfig?.section_templates?.forensics_module;
            if (forensicsTemplate) suggestions.push(forensicsTemplate.content);
        }

        if (textBefore.includes('Π.') || context.includes('Processor')) {
            const processorSuggestions = [
                'compile: specification → executable_logic',
                'execute: workflow_steps → measurable_outcomes',
                'validate: output_quality ∧ performance_metrics'
            ];
            suggestions.push(...processorSuggestions);
        }

        return suggestions;
    }

    private initializeSuggestionPatterns() {
        this.suggestionPatterns = [
            {
                trigger: /^Φ\s*=?\s*$/,
                suggestions: (match, context) => {
                    const template = this.templateConfig?.framework_templates?.basic_pipeline;
                    return template ? [template.content] : ['Φ = {\n Ψ: {\n ρ: {filter: /dup|overconf/g}\n }\n}'];
                },
                priority: 10
            },
            {
                trigger: /∀\s*(\w*)\s*$/,
                suggestions: (match, context) => {
                    const template = this.templateConfig?.quantifier_patterns?.universal_basic;
                    if (template) {
                        return [template.content.replace('${1:entity}', match[1] || 'entity')];
                    }
                    return [`∀ ${match[1] || 'entity'} ∈ domain → condition ⚠(scope_specified)`];
                },
                priority: 8
            },
            {
                trigger: /∃\s*(\w*)\s*$/,
                suggestions: (match, context) => {
                    const template = this.templateConfig?.quantifier_patterns?.existential_basic;
                    if (template) {
                        return [template.content.replace('${1:instance}', match[1] || 'instance')];
                    }
                    return [`∃ ${match[1] || 'instance'} ∈ domain → action_triggered`];
                },
                priority: 8
            },
            {
                trigger: /##\s*\[\s*$/,
                suggestions: (match, context) => [
                    '## [ANALYSIS_TARGET]',
                    '## [Ψ.DATA_PROCESSING]',
                    '## [ℜ.VALIDATION_PROTOCOL]',
                    '## [Π.EXECUTION_PLAN]',
                    '## [UNCERTAINTY_ASSESSMENT]'
                ],
                priority: 9
            }
        ];
    }

    private async generateAISuggestions(textBefore: string, context: string): Promise<string[]> {
        try {
            const suggestions = PhipromptCopilotInterpreter.suggestSymbols(textBefore + ' ' + context);

            return suggestions
                .filter(s => s.confidence > 0.6)
                .slice(0, 3)
                .map(s => s.symbol + (s.symbol.length === 1 ? ' ' : ''));
        } catch (error) {
            return [];
        }
    }

    private async generateSymbolSuggestions(textBefore: string, context: string): Promise<string[]> {
        const suggestions: string[] = [];
        const lastWord = textBefore.split(/\s+/).pop()?.toLowerCase() || '';

        if (lastWord.length > 1) {
            for (const [symbol, aliases] of Object.entries(PHIPROMPT_SYMBOLIC_MAP)) {
                for (const alias of aliases) {
                    if (alias.toLowerCase().startsWith(lastWord)) {
                        suggestions.push(symbol);
                        break;
                    }
                }
            }
        }

        return suggestions.slice(0, 3);
    }

    private getContextAround(
        document: vscode.TextDocument,
        position: vscode.Position,
        lineRadius: number
    ): string {
        const startLine = Math.max(0, position.line - lineRadius);
        const endLine = Math.min(document.lineCount - 1, position.line + lineRadius);

        let context = '';
        for (let i = startLine; i <= endLine; i++) {
            if (i !== position.line) {
                context += document.lineAt(i).text + '\n';
            }
        }

        return context;
    }

    private createInlineCompletionItem(
        suggestion: string,
        position: vscode.Position,
        textBefore: string
    ): vscode.InlineCompletionItem {
        const words = textBefore.split(/\s+/);
        const lastWord = words[words.length - 1] || '';

        let insertText = suggestion;
        let range = new vscode.Range(position, position);

        if (lastWord && suggestion.startsWith(lastWord)) {
            const startPos = new vscode.Position(position.line, position.character - lastWord.length);
            range = new vscode.Range(startPos, position);
        }

        const item = new vscode.InlineCompletionItem(insertText, range);
        return item;
    }
}