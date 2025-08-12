import * as vscode from 'vscode';
import { PHIPROMPT_SYMBOLIC_MAP, AUTO_ALIAS_MAP } from './symbolicMap';

export class PhipromptCompletionProvider implements vscode.CompletionItemProvider {
  private outputChannel: vscode.OutputChannel;

  constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
  }

  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    
    const line = document.lineAt(position);
    const lineText = line.text.substring(0, position.character);
    
    // Get word at cursor for filtering
    const wordRange = document.getWordRangeAtPosition(position);
    const currentWord = wordRange ? document.getText(wordRange) : '';

    const completions: vscode.CompletionItem[] = [];

    // Symbol completions
    for (const [symbol, aliases] of Object.entries(PHIPROMPT_SYMBOLIC_MAP)) {
      const item = new vscode.CompletionItem(symbol, vscode.CompletionItemKind.Operator);
      item.detail = `PHIPROMPT Symbol: ${aliases[0]}`;
      item.documentation = new vscode.MarkdownString(
        `**Symbol**: \`${symbol}\`\n\n` +
        `**Primary meaning**: ${aliases[0]}\n\n` +
        `**Aliases**: ${aliases.join(', ')}\n\n` +
        `**Usage**: Insert this symbol to represent "${aliases[0]}" in PHIPROMPT notation.`
      );
      item.insertText = symbol;
      item.sortText = '1_' + symbol; // High priority
      completions.push(item);
    }

    // Alias-to-symbol completions
    for (const [alias, symbol] of Object.entries(AUTO_ALIAS_MAP)) {
      if (alias.toLowerCase().includes(currentWord.toLowerCase()) || currentWord === '') {
        const item = new vscode.CompletionItem(alias, vscode.CompletionItemKind.Text);
        item.detail = `Convert to: ${symbol}`;
        item.documentation = new vscode.MarkdownString(
          `**Alias**: \`${alias}\`\n\n` +
          `**Converts to**: \`${symbol}\`\n\n` +
          `Type this alias and it will be converted to the symbolic notation.`
        );
        item.insertText = symbol;
        item.filterText = alias;
        item.sortText = '2_' + alias; // Lower priority than symbols
        completions.push(item);
      }
    }

    // Framework construct completions
    const frameworkCompletions = this.getFrameworkCompletions(lineText, position);
    completions.push(...frameworkCompletions);

    // Greek module completions
    const greekModules = [
      { symbol: 'Ψ', name: 'Psi', description: 'Optimizer module for filtering and consolidation' },
      { symbol: 'ρ', name: 'rho', description: 'Filter component for removing duplicates and loops' },
      { symbol: 'ν', name: 'nu', description: 'Normalizer for entity-attribute-value processing' },
      { symbol: 'α', name: 'alpha', description: 'Validator for conflicts and claims' },
      { symbol: 'μ', name: 'mu', description: 'Detector for abstract and subjective content' },
      { symbol: 'κ', name: 'kappa', description: 'Handler for nested and vague implementations' },
      { symbol: 'ℜ', name: 'R', description: 'Forensics module for evidence and analysis' },
      { symbol: 'Π', name: 'Pi', description: 'Processor module for compilation and execution' }
    ];

    for (const module of greekModules) {
      const item = new vscode.CompletionItem(module.symbol, vscode.CompletionItemKind.Module);
      item.detail = `Greek Module: ${module.name}`;
      item.documentation = new vscode.MarkdownString(
        `**Module**: \`${module.symbol}\` (${module.name})\n\n` +
        `**Purpose**: ${module.description}\n\n` +
        `**Usage**: Use this module symbol to define framework components.`
      );
      item.insertText = module.symbol;
      item.sortText = '0_' + module.symbol; // Highest priority
      completions.push(item);
    }

    // Challenge flag completions with explanations
    const challengeFlags = [
      { flag: '🌀', name: 'Metaphorical', description: 'Content is metaphorical or ambiguous' },
      { flag: '🧱', name: 'Nested Conditional', description: 'Complex nested conditional logic' },
      { flag: '🎭', name: 'Affective Intent', description: 'Emotional tone or affective content' },
      { flag: '🧪', name: 'Unverified Claim', description: 'Hypothesis or unsubstantiated claim' },
      { flag: '⚡', name: 'High Complexity', description: 'Complex processing required' },
      { flag: '🔄', name: 'Iterative', description: 'Iterative refinement or loop' },
      { flag: '📊', name: 'Baseline Required', description: 'Baseline measurement needed' },
      { flag: '⚠', name: 'Uncertainty', description: 'Explicit uncertainty marker' },
      { flag: '🔍', name: 'Investigation', description: 'Investigation or examination required' },
      { flag: '📝', name: 'Qualitative', description: 'Qualitative assessment needed' },
      { flag: '🔗', name: 'Relationship', description: 'Inferred relationship or link' }
    ];

    for (const challenge of challengeFlags) {
      const item = new vscode.CompletionItem(challenge.flag, vscode.CompletionItemKind.Constant);
      item.detail = `Challenge Flag: ${challenge.name}`;
      item.documentation = new vscode.MarkdownString(
        `**Flag**: \`${challenge.flag}\`\n\n` +
        `**Type**: ${challenge.name}\n\n` +
        `**Purpose**: ${challenge.description}\n\n` +
        `**Usage**: Mark content that requires special attention or processing.`
      );
      item.insertText = challenge.flag;
      item.sortText = '3_' + challenge.flag;
      completions.push(item);
    }

    this.outputChannel.appendLine(`[completion] Generated ${completions.length} completions for position ${position.line}:${position.character}`);

    return completions;
  }

  private getFrameworkCompletions(lineText: string, position: vscode.Position): vscode.CompletionItem[] {
    const completions: vscode.CompletionItem[] = [];

    // Section header completion
    if (lineText.includes('##') || lineText.includes('[')) {
      const sections = [
        'LOOKUP_MAPS', 'ℜ.FORENSICS', 'Ψ.OPTIMIZER', 'Π.PROCESSOR', 
        'COMPLIANCE', 'DEPLOYMENT', 'META_COMMUNICATION'
      ];
      
      for (const section of sections) {
        const item = new vscode.CompletionItem(section, vscode.CompletionItemKind.Keyword);
        item.detail = 'Framework Section';
        item.documentation = new vscode.MarkdownString(`**Section**: \`## [${section}]\`\n\nFramework section header.`);
        item.insertText = section;
        item.sortText = '0_section_' + section;
        completions.push(item);
      }
    }

    // Domain notation completions
    const domains = [
      { prefix: 'modal', properties: ['pos', 'req'], desc: 'Modal logic operators' },
      { prefix: 'state', properties: ['hold', 'active', 'pending'], desc: 'State management' },
      { prefix: 'data', properties: ['quant', 'qual'], desc: 'Data type qualifiers' },
      { prefix: 'meta', properties: ['infer', 'explicit'], desc: 'Meta-information' },
      { prefix: 'flag', properties: ['warn', 'error', 'info'], desc: 'Flag types' },
      { prefix: 'link', properties: ['rel', 'causal'], desc: 'Relationship types' }
    ];

    for (const domain of domains) {
      // Domain prefix completion
      const domainItem = new vscode.CompletionItem(domain.prefix, vscode.CompletionItemKind.Class);
      domainItem.detail = `Domain: ${domain.desc}`;
      domainItem.documentation = new vscode.MarkdownString(
        `**Domain**: \`${domain.prefix}\`\n\n` +
        `**Description**: ${domain.desc}\n\n` +
        `**Properties**: ${domain.properties.join(', ')}`
      );
      domainItem.insertText = domain.prefix + '.';
      domainItem.command = {
        command: 'editor.action.triggerSuggest',
        title: 'Trigger property suggestions'
      };
      domainItem.sortText = '1_domain_' + domain.prefix;
      completions.push(domainItem);

      // Property completions for this domain
      for (const prop of domain.properties) {
        const propItem = new vscode.CompletionItem(`${domain.prefix}.${prop}`, vscode.CompletionItemKind.Property);
        propItem.detail = `${domain.desc} property`;
        propItem.documentation = new vscode.MarkdownString(
          `**Property**: \`${domain.prefix}.${prop}\`\n\n` +
          `**Domain**: ${domain.desc}`
        );
        propItem.insertText = `${domain.prefix}.${prop}`;
        propItem.sortText = '2_property_' + domain.prefix + '_' + prop;
        completions.push(propItem);
      }
    }

    return completions;
  }
}