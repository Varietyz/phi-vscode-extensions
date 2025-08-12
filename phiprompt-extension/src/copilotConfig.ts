import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { PHIPROMPT_SYMBOLIC_MAP, SYMBOL_TO_TEXT } from './symbolicMap';

/**
 * Activates GitHub Copilot integration for PHIPROMPT files
 * Provides context injection and real-time interpretation hints
 */
export function activateCopilotConfig(context: vscode.ExtensionContext) {
  const debounceDelay = 300; // milliseconds
  const timers = new Map<string, NodeJS.Timeout>();

  // Context injection for Copilot understanding
  const disposable = vscode.workspace.onDidChangeTextDocument(async event => {
    const document = event.document;
    if (document.languageId !== 'phiprompt') return;

    const docUri = document.uri.toString();

    // Debounce multiple rapid changes
    if (timers.has(docUri)) {
      clearTimeout(timers.get(docUri)!);
    }

    timers.set(docUri, setTimeout(async () => {
      timers.delete(docUri);
      await injectPhipromptContext(document);
    }, debounceDelay));
  });

  // Also inject context when document is opened
  const onDocumentOpen = vscode.workspace.onDidOpenTextDocument(async document => {
    if (document.languageId === 'phiprompt') {
      await injectPhipromptContext(document);
    }
  });

  context.subscriptions.push(disposable, onDocumentOpen);
}

/**
 * Injects the PHIPROMPT framework context header into a document if not already present.
 * 
 * This adds symbolic reference metadata at the top of the file, useful for PHIPROMPT-based
 * AI workflows. Designed to be idempotent and safe for repeated runs.
 * 
 * If a '.φc' file is missing, it will be created automatically with default context.
 */
export async function injectPhipromptContext(document: vscode.TextDocument): Promise<void> {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
  if (!workspaceFolder) {
    console.warn(`No workspace folder found for document: ${document.uri.fsPath}`);
    return;
  }

  const relativePath = path
    .relative(workspaceFolder.uri.fsPath, document.uri.fsPath)
    .replace(/\\/g, '/');

  const phiConfigPath = path.join(workspaceFolder.uri.fsPath, '.φc');

  let contextLines: string[];

  try {
    let fileContent: string;
    try {
      fileContent = await fs.readFile(phiConfigPath, 'utf8');
    } catch {
      // File doesn't exist → create with default content
      const defaultContent = getDefaultContext(relativePath).join('\n');
      await fs.writeFile(phiConfigPath, defaultContent, 'utf8');
      fileContent = defaultContent;
    }

    if (fileContent.trim().length > 0) {
      contextLines = fileContent.split(/\r?\n/);
    } else {
      // Empty file → use default context inline (do not overwrite)
      contextLines = getDefaultContext(relativePath);
    }
  } catch (error) {
    console.error(`Error reading or creating '.φc':`, error);
    // Fallback to default context if anything fails
    contextLines = getDefaultContext(relativePath);
  }

  // Prevent duplicate insertion
  const scanLineLimit = Math.min(document.lineCount, 20);
  let hasContext = false;
  for (let i = 0; i < scanLineLimit; i++) {
    if (document.lineAt(i).text.includes('PHIPROMPT Framework Context')) {
      hasContext = true;
      break;
    }
  }

  if (!hasContext) {
    const edit = new vscode.WorkspaceEdit();

    try {
      const success = await vscode.workspace.applyEdit(edit);
      if (!success) {
        console.warn(`PHIPROMPT context injection failed for: ${relativePath}`);
      }
    } catch (error) {
      console.error(`Error injecting PHIPROMPT context for: ${relativePath}`, error);
    }
  }
}

function getDefaultContext(relativePath: string): string[] {
  return [
    `// ============================================================================`,
    `// PHIPROMPT Framework Context - ${relativePath}`,
    `// Symbolic Language: Mathematical notation for AI prompt structuring`,
    `// Core Symbols: ∀(for_all) ∃(exists) ∧(and) ∨(or) →(transforms_to) ⟹(implies)`,
    `// Challenge Flags: 🌀(metaphorical) 🧱(nested_conditional) 🎭(affective) 🧪(unverified) ⚠(uncertain)`,
    `// Greek Modules: Ψ(optimizer) ρ(filter) ℜ(forensics) Π(processor)`,
    `// Framework Pipeline: Φ = {Ψ→ρ→ν→α→μ→κ→...}`,
    `// Domain Notation: modal.pos(possible) modal.req(necessary) state.hold(pause)`,
    `// Conversion: Use symbol→text mapping for natural language equivalents`,
    `// ============================================================================`,
    ''
  ];
}

/**
 * Provides symbol interpretation for Copilot inline suggestions
 */
export class PhipromptCopilotInterpreter {
  
  /**
   * Interprets a PHIPROMPT symbol and provides natural language explanation
   */
  static interpretSymbol(symbol: string, context: string = ''): string {
    const aliases = PHIPROMPT_SYMBOLIC_MAP[symbol];
    if (!aliases) return `Unknown symbol: ${symbol}`;

    const primaryMeaning = aliases[0];
    const alternatives = aliases.slice(1);
    
    let interpretation = `Symbol '${symbol}' means '${primaryMeaning}'`;
    
    if (alternatives.length > 0) {
      interpretation += ` (also: ${alternatives.join(', ')})`;
    }

    // Add contextual hints based on surrounding content
    if (context.includes('∀') && symbol === '→') {
      interpretation += ' - typically used in universal quantification for logical implication';
    } else if (context.includes('🧪') && ['∀', '∃', '→'].includes(symbol)) {
      interpretation += ' - verify this logical relationship as it\'s marked as unverified';
    } else if (context.includes('⚠') && symbol === '≈') {
      interpretation += ' - approximate equality with explicit uncertainty';
    }

    return interpretation;
  }

  /**
   * Suggests appropriate symbols for natural language text
   */
  static suggestSymbols(naturalText: string): Array<{symbol: string, confidence: number, reason: string}> {
    const suggestions: Array<{symbol: string, confidence: number, reason: string}> = [];
    const lowerText = naturalText.toLowerCase();

    // High confidence mappings
    const highConfidenceMappings = [
      { patterns: ['for all', 'every', 'all'], symbol: '∀', confidence: 0.9 },
      { patterns: ['exists', 'there exists', 'some'], symbol: '∃', confidence: 0.9 },
      { patterns: ['and', 'while', 'during'], symbol: '∧', confidence: 0.8 },
      { patterns: ['or', 'either'], symbol: '∨', confidence: 0.8 },
      { patterns: ['implies', 'then', 'therefore'], symbol: '⟹', confidence: 0.85 },
      { patterns: ['transforms to', 'becomes', 'leads to'], symbol: '→', confidence: 0.8 },
      { patterns: ['not', 'negation'], symbol: '¬', confidence: 0.85 }
    ];

    for (const mapping of highConfidenceMappings) {
      for (const pattern of mapping.patterns) {
        if (lowerText.includes(pattern)) {
          suggestions.push({
            symbol: mapping.symbol,
            confidence: mapping.confidence,
            reason: `Detected pattern: '${pattern}'`
          });
        }
      }
    }

    // Challenge flag suggestions based on content analysis
    const challengePatterns = [
      { patterns: ['metaphor', 'like', 'similar to', 'analogy'], symbol: '🌀', confidence: 0.7, reason: 'Metaphorical language detected' },
      { patterns: ['if', 'complex condition', 'nested'], symbol: '🧱', confidence: 0.6, reason: 'Complex conditional logic' },
      { patterns: ['feel', 'emotion', 'mood', 'sentiment'], symbol: '🎭', confidence: 0.7, reason: 'Affective content detected' },
      { patterns: ['hypothesis', 'assume', 'might be', 'unverified'], symbol: '🧪', confidence: 0.8, reason: 'Unverified claim detected' },
      { patterns: ['uncertain', 'maybe', 'possibly', 'unclear'], symbol: '⚠', confidence: 0.8, reason: 'Uncertainty detected' },
      { patterns: ['complex', 'difficult', 'intricate'], symbol: '⚡', confidence: 0.6, reason: 'High complexity indicated' }
    ];

    for (const pattern of challengePatterns) {
      for (const text of pattern.patterns) {
        if (lowerText.includes(text)) {
          suggestions.push({
            symbol: pattern.symbol,
            confidence: pattern.confidence,
            reason: pattern.reason
          });
        }
      }
    }

    // Sort by confidence descending
    suggestions.sort((a, b) => b.confidence - a.confidence);
    
    // Remove duplicates
    const uniqueSuggestions = suggestions.filter((item, index, array) => 
      array.findIndex(other => other.symbol === item.symbol) === index
    );

    return uniqueSuggestions.slice(0, 5); // Return top 5 suggestions
  }

  /**
   * Validates PHIPROMPT framework compliance
   */
  static validateFrameworkCompliance(construct: string): {
    isCompliant: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check for overconfidence patterns
    const overconfidencePatterns = /\b(always|never|all|every|completely|absolutely)\b/gi;
    if (overconfidencePatterns.test(construct)) {
      const hasUncertaintyMarker = /[⚠🧪]/.test(construct);
      if (!hasUncertaintyMarker) {
        issues.push('Potential overconfidence detected without uncertainty markers');
        suggestions.push('Consider adding ⚠ (uncertainty) or 🧪 (hypothesis) flags');
      }
    }

    // Check for complex statements without challenge flags
    const complexityIndicators = /\b(if|when|while|because|although)\b.*\b(then|and|or|but)\b/gi;
    if (complexityIndicators.test(construct)) {
      const hasFlags = /[🌀🧱🎭🧪⚡🔄📊⚠🔍📝🔗]/.test(construct);
      if (!hasFlags) {
        issues.push('Complex logical structure without challenge flags');
        suggestions.push('Consider adding 🧱 (nested conditional) or ⚡ (complexity) flags');
      }
    }

    // Check for logical operators without proper quantification
    const hasLogicalOps = /[∧∨⟹→]/.test(construct);
    const hasQuantifiers = /[∀∃]/.test(construct);
    if (hasLogicalOps && !hasQuantifiers && construct.length > 50) {
      issues.push('Logical operators without clear quantification scope');
      suggestions.push('Consider adding ∀ (for all) or ∃ (exists) to clarify scope');
    }

    // Check bracket matching
    const brackets = [['(', ')'], ['[', ']'], ['{', '}']];
    for (const [open, close] of brackets) {
      const openCount = (construct.match(new RegExp('\\' + open, 'g')) || []).length;
      const closeCount = (construct.match(new RegExp('\\' + close, 'g')) || []).length;
      if (openCount !== closeCount) {
        issues.push(`Unmatched brackets: ${openCount} '${open}' vs ${closeCount} '${close}'`);
        suggestions.push(`Balance bracket pairs in your construct`);
      }
    }

    return {
      isCompliant: issues.length === 0,
      issues,
      suggestions
    };
  }

  /**
   * Generates natural language explanation for PHIPROMPT constructs
   */
  static generateExplanation(phipromptBlock: string): string {
    let explanation = '';
    
    // Convert symbols to text for base explanation
    let textVersion = phipromptBlock;
    for (const [symbol, aliases] of Object.entries(PHIPROMPT_SYMBOLIC_MAP)) {
      const regex = new RegExp(symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      textVersion = textVersion.replace(regex, ` ${aliases[0]} `);
    }

    explanation += `**Text equivalent**: ${textVersion.trim()}\n\n`;

    // Identify framework components
    const components = [];
    if (/[ΨρνακμλξεπωχυℜΠ]/.test(phipromptBlock)) {
      components.push('Contains framework module definitions');
    }
    if (/[∀∃]/.test(phipromptBlock)) {
      components.push('Uses quantified logic');
    }
    if (/[🌀🧱🎭🧪⚡🔄📊⚠🔍📝🔗]/.test(phipromptBlock)) {
      components.push('Includes challenge flags for special processing');
    }
    if (/\w+\.\w+/.test(phipromptBlock)) {
      components.push('Uses domain notation');
    }

    if (components.length > 0) {
      explanation += `**Framework features**: ${components.join(', ')}\n\n`;
    }

    // Compliance analysis
    const compliance = this.validateFrameworkCompliance(phipromptBlock);
    if (!compliance.isCompliant) {
      explanation += `**Compliance notes**: ${compliance.suggestions.join('; ')}\n\n`;
    }

    return explanation;
  }
}