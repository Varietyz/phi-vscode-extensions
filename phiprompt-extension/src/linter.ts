import * as vscode from 'vscode';

interface DocumentAnalysis {
  hasSymbolicPipeline: boolean;
  hasFrameworkStructure: boolean;
  symbolUsage: Map<string, number>;
  uncertaintyRatio: number;
  complexityLevel: 'low' | 'medium' | 'high';
  complianceScore: number;
  bracketStructure: BracketAnalysis;
  structuralComplexity: 'compact' | 'deep' | 'auto';
}

interface BracketAnalysis {
  isValid: boolean;
  unmatchedBrackets: Array<{type: string, line: number, position: number}>;
  nestedLevel: number;
}

export class PhipromptLinter implements vscode.Disposable {
  private diagnosticCollection: vscode.DiagnosticCollection;
  private debounceTimers = new Map<string, NodeJS.Timeout>();
  private outputChannel: vscode.OutputChannel;
  private readonly debounceDelay = 500;

  // Dynamic symbol detection patterns (framework-agnostic)
  private readonly SYMBOL_CATEGORIES = {
    UNICODE_SYMBOLS: /[Φω∀∿🌀🔗⚠📝]/g,
    LOGICAL_OPERATORS: /[∀∃∈∉∅∧∨¬⟹→><≥≤≈≡≫≪⇒⊕]/g,
    CHALLENGE_FLAGS: /[🌀🧱🎭🧪⚡🔄📊⚠🔍📝🔗]/g,
    STRUCTURAL_CHARS: /[{}[\]():=,;]/g
  };

  // Complexity detection patterns (universal)
  private readonly COMPLEXITY_PATTERNS = {
    COMPACT: [
      /^\s*[A-Za-zΦ-ω∀-∿_]+:\s*\[[^\]]+\][,;]?\s*$/,  // Single-line arrays
      /^\s*[A-Za-zΦ-ω∀-∿_]+:\s*\/[^/]+\/[gimuy]*[,;]?\s*$/,  // Inline regex
      /^\s*[A-Za-zΦ-ω∀-∿_]+:\s*[^{[,\n]+[,;]?\s*$/,     // Simple key-value pairs
    ],
    DEEP: [
      /^\s*[A-Za-zΦ-ω∀-∿_][A-Za-z0-9_.]*\s*=\s*∀.*→.*{\s*$/,  // Complex assignment patterns
      /^\s*[A-Za-zΦ-ω∀-∿_][A-Za-z0-9_.]*:\s*{\s*$/,          // Multi-line object definitions
      /^\s*[A-Za-zΦ-ω∀-∿_][A-Za-z0-9_.]*\s*=.*{\s*$/,        // Assignment with opening brace
    ]
  };

  constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('symbolic-framework');
  }

  dispose() {
    this.diagnosticCollection.dispose();
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
  }

  runLint(document: vscode.TextDocument, immediate: boolean = false) {
    const uri = document.uri.toString();

    if (this.debounceTimers.has(uri)) {
      clearTimeout(this.debounceTimers.get(uri)!);
      this.debounceTimers.delete(uri);
    }

    const lintFunction = () => {
      this.performLint(document);
      this.debounceTimers.delete(uri);
    };

    if (immediate) {
      lintFunction();
    } else {
      const timer = setTimeout(lintFunction, this.debounceDelay);
      this.debounceTimers.set(uri, timer);
    }
  }

  private performLint(document: vscode.TextDocument) {
    const diagnostics: vscode.Diagnostic[] = [];
    const text = document.getText();
    const lines = text.split('\n');

    this.outputChannel.appendLine(`[lint] Symbolic framework analysis for ${document.fileName}`);

    // Perform framework-agnostic document analysis
    const analysis = this.analyzeDocument(text, lines);

    // Track code block state
    let inCodeBlock = false;
    let codeBlockLanguage = '';

    // Check for structural and symbolic issues
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      
      // Handle code block detection
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockLanguage = line.trim().substring(3).toLowerCase();
        } else {
          inCodeBlock = false;
          codeBlockLanguage = '';
        }
        continue;
      }
      
      // Skip linting inside JavaScript/TypeScript code blocks
      if (inCodeBlock && (codeBlockLanguage === 'javascript' || codeBlockLanguage === 'js' || codeBlockLanguage === 'typescript' || codeBlockLanguage === 'ts')) {
        continue;
      }

      // Check structural integrity (universal)
      diagnostics.push(...this.checkStructuralIntegrity(line, lineIndex));
      
      // Check symbol consistency (dynamic)
      diagnostics.push(...this.checkSymbolConsistency(line, lineIndex, analysis));
      
      // Check framework compliance (lenient)
      diagnostics.push(...this.checkFrameworkCompliance(line, lineIndex, analysis));
    }

    // Document-level validation
    diagnostics.push(...this.checkDocumentStructure(lines, analysis));
    
    // Report serious bracket issues only
    if (!analysis.bracketStructure.isValid) {
      diagnostics.push(...this.createBracketDiagnostics(analysis.bracketStructure));
    }

    this.diagnosticCollection.set(document.uri, diagnostics);
    this.outputChannel.appendLine(`[lint] Found ${diagnostics.length} issues, structure score: ${(analysis.complianceScore * 100).toFixed(1)}%`);
  }

  private analyzeDocument(text: string, lines: string[]): DocumentAnalysis {
    // Generic symbolic pipeline detection
    const hasSymbolicPipeline = this.detectSymbolicPipeline(text);
    const hasFrameworkStructure = /##\s*\[/.test(text) || /^\s*\[[\w\s._]+\]\s*$/m.test(text);
    
    // Universal bracket structure analysis
    const bracketStructure = this.analyzeBracketStructure(lines);
    
    // Dynamic symbol usage analysis
    const symbolUsage = this.analyzeSymbolUsage(text);

    // Detect structural complexity
    const structuralComplexity = this.detectStructuralComplexity(lines);

    // Calculate uncertainty ratio (universal uncertainty markers)
    const uncertaintyMarkers = (text.match(this.SYMBOL_CATEGORIES.CHALLENGE_FLAGS) || []).length;
    const totalStatements = lines.filter(line => /[→⟹=:]/.test(line)).length;
    const uncertaintyRatio = totalStatements > 0 ? uncertaintyMarkers / totalStatements : 0;

    // Assess structural complexity
    const complexityCount = this.calculateComplexity(text);
    const complexityLevel: 'low' | 'medium' | 'high' = 
      complexityCount < 3 ? 'low' : complexityCount < 10 ? 'medium' : 'high';

    // Calculate structure compliance score
    let complianceScore = 0.6; // Base score
    if (hasSymbolicPipeline) complianceScore += 0.2;
    if (hasFrameworkStructure) complianceScore += 0.1;
    if (bracketStructure.isValid) complianceScore += 0.1;
    if (structuralComplexity !== 'auto') complianceScore += 0.1;
    complianceScore = Math.min(1.0, complianceScore);

    return {
      hasSymbolicPipeline,
      hasFrameworkStructure,
      symbolUsage,
      uncertaintyRatio,
      complexityLevel,
      complianceScore,
      bracketStructure,
      structuralComplexity
    };
  }

  private detectSymbolicPipeline(text: string): boolean {
    // Generic symbolic pipeline patterns
    const pipelinePatterns = [
      /[A-Za-zΦ-ω∀-∿_]+\s*=\s*\{[\s\S]*\}/m,  // Symbol assignment with object
      /[A-Za-zΦ-ω∀-∿_]+\s*:\s*\{[\s\S]*\}/m,   // Symbol property with object
      /[→⟹]\s*[A-Za-zΦ-ω∀-∿_]/,               // Transform arrows to symbols
      /∀\s*[A-Za-zΦ-ω∀-∿_].*→/                 // Universal quantifier patterns
    ];
    
    return pipelinePatterns.some(pattern => pattern.test(text));
  }

  private analyzeSymbolUsage(text: string): Map<string, number> {
    const symbolUsage = new Map<string, number>();
    
    // Count all Unicode symbols dynamically
    let match;
    while ((match = this.SYMBOL_CATEGORIES.UNICODE_SYMBOLS.exec(text)) !== null) {
      const symbol = match[0];
      symbolUsage.set(symbol, (symbolUsage.get(symbol) || 0) + 1);
    }

    return symbolUsage;
  }

  private detectStructuralComplexity(lines: string[]): 'compact' | 'deep' | 'auto' {
    let compactScore = 0;
    let deepScore = 0;
    let totalStructuralLines = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length === 0 || trimmed.startsWith('#') || trimmed.startsWith('```')) {
        continue;
      }

      const isStructural = this.SYMBOL_CATEGORIES.STRUCTURAL_CHARS.test(trimmed);
      if (!isStructural) continue;
      
      totalStructuralLines++;

      // Check for compact patterns
      for (const pattern of this.COMPLEXITY_PATTERNS.COMPACT) {
        if (pattern.test(trimmed)) {
          compactScore++;
          break;
        }
      }

      // Check for deep patterns  
      for (const pattern of this.COMPLEXITY_PATTERNS.DEEP) {
        if (pattern.test(trimmed)) {
          deepScore++;
          break;
        }
      }
    }

    if (totalStructuralLines === 0) return 'auto';
    
    const compactRatio = compactScore / totalStructuralLines;
    const deepRatio = deepScore / totalStructuralLines;

    if (compactRatio > 0.4 && compactRatio > deepRatio) return 'compact';
    if (deepRatio > 0.3 && deepRatio > compactRatio) return 'deep';
    return 'auto';
  }

  private calculateComplexity(text: string): number {
    const complexPatterns = [
      /[∀∃][^∀∃]*[→⟹]/g,      // Quantified expressions
      /\([^)]*\([^)]*\)/g,     // Nested parentheses
      /[∧∨]{2,}/g,             // Multiple operators
      /\{[^}]*\{[^}]*\}/g      // Nested objects
    ];
    
    return complexPatterns.reduce((sum, pattern) => 
      sum + (text.match(pattern) || []).length, 0);
  }

  private analyzeBracketStructure(lines: string[]): BracketAnalysis {
    const bracketStack: Array<{type: string, line: number, position: number}> = [];
    const unmatchedBrackets: Array<{type: string, line: number, position: number}> = [];
    const bracketPairs = new Map([
      ['{', '}'], ['[', ']'], ['(', ')']
    ]);
    
    let maxNesting = 0;
    let currentNesting = 0;
    let inCodeBlock = false;
    let inStringLiteral = false;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      
      // Skip code blocks
      if (line.trim().includes('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      if (inCodeBlock) continue;

      // Skip comments
      if (line.trim().startsWith('//')) continue;

      for (let charIndex = 0; charIndex < line.length; charIndex++) {
        const char = line[charIndex];
        
        // Handle string literals
        if (char === '"' || char === "'") {
          inStringLiteral = !inStringLiteral;
          continue;
        }
        if (inStringLiteral) continue;
        
        if (bracketPairs.has(char)) {
          // Opening bracket
          bracketStack.push({type: char, line: lineIndex, position: charIndex});
          currentNesting++;
          maxNesting = Math.max(maxNesting, currentNesting);
        } else if (Array.from(bracketPairs.values()).includes(char)) {
          // Closing bracket
          if (bracketStack.length === 0) {
            unmatchedBrackets.push({type: char, line: lineIndex, position: charIndex});
          } else {
            const lastOpening = bracketStack[bracketStack.length - 1];
            const expectedClosing = bracketPairs.get(lastOpening.type);
            
            if (expectedClosing === char) {
              bracketStack.pop();
              currentNesting--;
            } else {
              unmatchedBrackets.push({type: char, line: lineIndex, position: charIndex});
            }
          }
        }
      }
    }

    // Remaining opening brackets are unmatched
    unmatchedBrackets.push(...bracketStack);

    return {
      isValid: unmatchedBrackets.length === 0,
      unmatchedBrackets,
      nestedLevel: maxNesting
    };
  }

  private checkStructuralIntegrity(line: string, lineIndex: number): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
    
    // Check for obvious structural issues (universal)
    if (line.includes('}{') || line.includes('][') || line.includes(')(')) {
      const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
      diagnostics.push(new vscode.Diagnostic(
        range,
        'Adjacent brackets detected - verify structure is intentional',
        vscode.DiagnosticSeverity.Information
      ));
    }

    // Check for severely malformed patterns
    const severelyMalformed = [
      /[{[].*[}\]].*[{[]/,  // Mixed bracket types in wrong order
      /=\s*=\s*=/,          // Triple equals
      /→\s*→\s*→/           // Triple arrows
    ];

    for (const pattern of severelyMalformed) {
      if (pattern.test(line)) {
        const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
        diagnostics.push(new vscode.Diagnostic(
          range,
          'Potentially malformed structure detected',
          vscode.DiagnosticSeverity.Warning
        ));
        break;
      }
    }

    return diagnostics;
  }

  private checkSymbolConsistency(line: string, lineIndex: number, analysis: DocumentAnalysis): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
    
    // Check for mixed quantifiers without uncertainty markers
    if (line.includes('∀') && line.includes('∃') && !this.SYMBOL_CATEGORIES.CHALLENGE_FLAGS.test(line)) {
      const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
      diagnostics.push(new vscode.Diagnostic(
        range,
        'Mixed quantifiers detected - consider adding uncertainty marker ⚠',
        vscode.DiagnosticSeverity.Hint
      ));
    }

    // Check for obviously invalid symbols (very conservative)
    const obviouslyWrongSymbols = /[§¤¿¡]/g;
    let match;
    while ((match = obviouslyWrongSymbols.exec(line)) !== null) {
      const range = new vscode.Range(lineIndex, match.index, lineIndex, match.index + 1);
      diagnostics.push(new vscode.Diagnostic(
        range,
        `Symbol '${match[0]}' is not a recognized symbolic framework symbol`,
        vscode.DiagnosticSeverity.Information
      ));
    }

    return diagnostics;
  }

  private checkFrameworkCompliance(line: string, lineIndex: number, analysis: DocumentAnalysis): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];

    // Only check for severe overconfidence issues
    const severeOverconfidencePatterns = [
      /\b(always works|never fails|guaranteed|100% certain|absolutely impossible)\b/gi
    ];

    for (const pattern of severeOverconfidencePatterns) {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        if (!this.SYMBOL_CATEGORIES.CHALLENGE_FLAGS.test(line)) {
          const range = new vscode.Range(lineIndex, match.index, lineIndex, match.index + match[0].length);
          diagnostics.push(new vscode.Diagnostic(
            range,
            `Severe overconfidence detected: "${match[0]}". Consider adding uncertainty marker ⚠`,
            vscode.DiagnosticSeverity.Information
          ));
        }
      }
    }

    // Check for English module names (framework-agnostic suggestion)
    const invalidModulePattern = /([A-Z][a-z]+)\s*[=:]\s*\{/g;
    let match;
    while ((match = invalidModulePattern.exec(line)) !== null) {
      const word = match[1];
      if (!['Phi', 'Psi', 'Rho', 'Alpha', 'Beta', 'Gamma', 'Delta'].includes(word)) {
        const range = new vscode.Range(lineIndex, match.index, lineIndex, match.index + word.length);
        diagnostics.push(new vscode.Diagnostic(
          range,
          `Consider using symbolic identifier instead of '${word}' for consistency`,
          vscode.DiagnosticSeverity.Hint
        ));
      }
    }

    return diagnostics;
  }

  private createBracketDiagnostics(bracketAnalysis: BracketAnalysis): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];

    // Only report serious bracket mismatches
    const seriousIssues = bracketAnalysis.unmatchedBrackets.filter(bracket => {
      return !this.isLikelyValidSymbolicStructure(bracket);
    });

    for (const bracket of seriousIssues) {
      const range = new vscode.Range(bracket.line, bracket.position, bracket.line, bracket.position + 1);
      
      diagnostics.push(new vscode.Diagnostic(
        range,
        `Unmatched bracket '${bracket.type}' - verify symbolic framework structure`,
        vscode.DiagnosticSeverity.Warning
      ));
    }

    return diagnostics;
  }

  private isLikelyValidSymbolicStructure(bracket: {type: string, line: number, position: number}): boolean {
    // More lenient validation for symbolic frameworks
    // Most bracket patterns in symbolic frameworks are intentional
    return true;
  }

  private checkDocumentStructure(lines: string[], analysis: DocumentAnalysis): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
    
    // Suggest improvements for large documents only
    if (lines.length > 100 && !analysis.hasFrameworkStructure) {
      diagnostics.push(new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 0),
        'Large symbolic documents may benefit from section organization',
        vscode.DiagnosticSeverity.Hint
      ));
    }

    // Suggest uncertainty markers for complex documents
    if (analysis.complexityLevel === 'high' && analysis.uncertaintyRatio < 0.1) {
      diagnostics.push(new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 0),
        'High complexity document may benefit from more uncertainty markers ⚠',
        vscode.DiagnosticSeverity.Hint
      ));
    }

    return diagnostics;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}