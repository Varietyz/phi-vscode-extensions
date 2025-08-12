import * as vscode from "vscode";
import { PHIPROMPT_SYMBOLIC_MAP, SYMBOL_TO_TEXT } from "./symbolicMap";

// Comprehensive framework module documentation
const getFrameworkModuleInfo = (
  symbol: string
): { name: string; purpose: string; components: string[] } | null => {
  const moduleInfo: Record<
    string,
    { name: string; purpose: string; components: string[] }
  > = {
    Φ: {
      name: "Phi - Main Framework Pipeline",
      purpose: "Core PHIPROMPT framework orchestrator and pipeline controller",
      components: ["Ψ (Optimizer)", "ℜ (Forensics)", "Π (Processor)"],
    },
    Ψ: {
      name: "Psi - Optimizer Module",
      purpose:
        "Filters and consolidates information, removes duplicates and loops",
      components: [
        "ρ (filter)",
        "ν (normalizer)",
        "α (validator)",
        "μ (detector)",
        "κ (handler)",
      ],
    },
    ρ: {
      name: "Rho - Filter Component",
      purpose: "Removes duplicates, overconfidence, and loops",
      components: ["deduplication", "consolidation", "cycle detection"],
    },
    ℜ: {
      name: "R - Forensics Module",
      purpose: "Evidence analysis and investigative reasoning",
      components: [
        "causal models",
        "triangulation",
        "anomaly detection",
        "bias analysis",
      ],
    },
    Π: {
      name: "Pi - Processor Module",
      purpose: "Core compilation and execution engine",
      components: ["compilation", "runtime", "decompress", "synthesis"],
    },
    ν: {
      name: "Nu - Normalizer",
      purpose: "Entity normalization and standardization",
      components: [
        "entity processing",
        "attribute validation",
        "value normalization",
      ],
    },
    α: {
      name: "Alpha - Validator",
      purpose: "Attribute and conflict validation",
      components: [
        "conflict detection",
        "claim validation",
        "novelty assessment",
      ],
    },
    κ: {
      name: "Kappa - Handler",
      purpose: "Nested content and complexity handler",
      components: ["nested parsing", "vague content", "implicit meaning"],
    },
    μ: {
      name: "Mu - Detector",
      purpose: "Content type detection and analysis",
      components: [
        "abstract content",
        "figurative language",
        "subjective content",
      ],
    },
    λ: {
      name: "Lambda - Function Module",
      purpose: "Function processing and lambda operations",
      components: [
        "function definitions",
        "lambda expressions",
        "callable operations",
      ],
    },
    ξ: {
      name: "Xi - Domain Classifier",
      purpose: "Domain analysis and context classification",
      components: ["tech", "sci", "biz", "creative", "med", "edu", "social"],
    },
    ε: {
      name: "Epsilon - Entity Identifier",
      purpose: "Entity extraction and identification",
      components: ["people", "objects", "concepts", "locations", "events"],
    },
    π: {
      name: "Pi - Process Step",
      purpose: "Pipeline step processing and execution",
      components: ["step execution", "process flow", "pipeline management"],
    },
    ω: {
      name: "Omega - Validation Step",
      purpose: "Coherence validation and final checks",
      components: [
        "structure validation",
        "internal coherence",
        "external validation",
      ],
    },
    χ: {
      name: "Chi - Context Preserver",
      purpose: "Context preservation and temporal/spatial mapping",
      components: [
        "temporal context",
        "spatial context",
        "conditional context",
      ],
    },
    υ: {
      name: "Upsilon - Utility Module",
      purpose: "Utility functions and helper operations",
      components: [
        "entity utils",
        "attribute utils",
        "value utils",
        "context utils",
      ],
    },
    φ: {
      name: "Phi Small - Feedback Calibrator",
      purpose:
        "Pipeline Annotation - Feedback calibration and response measurement",
      components: [
        "measured response",
        "evidence evaluation",
        "limitation tracking",
      ],
    },
    β: {
      name: "Beta - Anthropic Auditor",
      purpose: "Bias checking and language validation",
      components: [
        "language validation",
        "technical accuracy",
        "bias detection",
      ],
    },
    σ: {
      name: "Sigma - Synthesizer",
      purpose: "Symbolic synthesis and aggregation",
      components: [
        "element aggregation",
        "operator synthesis",
        "logic flow preservation",
      ],
    },
    τ: {
      name: "Tau - Relationship Mapper",
      purpose: "Relationship mapping and temporal processing",
      components: [
        "connection mapping",
        "temporal relationships",
        "causal links",
      ],
    },
    δ: {
      name: "Delta - Code Synthesizer",
      purpose: "Implementation and code synthesis",
      components: [
        "code generation",
        "technical implementation",
        "quality assessment",
      ],
    },
    γ: {
      name: "Gamma - Conversion Module",
      purpose: "Symbolic conversion and transformation",
      components: [
        "symbolic attempt",
        "text conversion",
        "format transformation",
      ],
    },
    ι: {
      name: "Iota - Consistency Checker",
      purpose: "Integrity validation and consistency checking",
      components: [
        "consistency mapping",
        "challenge detection",
        "integrity validation",
      ],
    },
    θ: {
      name: "Theta - Threshold Module",
      purpose: "Boundary detection and threshold management",
      components: [
        "threshold detection",
        "boundary analysis",
        "limit validation",
      ],
    },
    η: {
      name: "Eta - Efficiency Module",
      purpose: "Performance optimization and efficiency tracking",
      components: [
        "optimization tracking",
        "performance metrics",
        "efficiency analysis",
      ],
    },
    ζ: {
      name: "Zeta - Zero Handler",
      purpose: "Null value processing and edge case handling",
      components: ["null processing", "edge cases", "boundary conditions"],
    },
  };

  return moduleInfo[symbol] || null;
};

// Challenge flag meanings
const challengeFlagMeanings: Record<string, string> = {
  "🌀": "Metaphorical or ambiguous content that requires interpretive processing",
  "🧱": "Nested conditional logic that may need careful parsing",
  "🎭": "Affective intent or emotional tone present in content",
  "🧪": "Unverified claim or hypothesis requiring validation",
  "⚡": "High complexity content requiring advanced processing",
  "🔄": "Iterative refinement or loop structure present",
  "📊": "Baseline measurement or quantification required",
  "⚠": "Explicit uncertainty or incomplete information",
  "🔍": "Investigation or detailed examination required",
  "📝": "Qualitative assessment or description needed",
  "🔗": "Inferred relationship or connection present",
};

// Domain notation mappings
const domainMeanings: Record<string, string> = {
  modal: "Modal logic operators for possibility and necessity",
  state: "State management and lifecycle operations",
  data: "Data type and quality qualifiers",
  meta: "Meta-information and inference markers",
  flag: "System flags for warnings and notifications",
  link: "Relationship and connection types",
};

const propertyMeanings: Record<string, Record<string, string>> = {
  modal: {
    pos: "Possible/might/could - indicates possibility",
    req: "Required/must/necessary - indicates necessity",
  },
  state: {
    hold: "Pause/wait - temporarily suspend processing",
    active: "Currently active or in progress",
    pending: "Waiting for external condition",
  },
  data: {
    quant: "Quantitative/measured/numerical data",
    qual: "Qualitative/descriptive/categorical data",
  },
  meta: {
    infer: "Inferred/deduced information",
    explicit: "Explicitly stated information",
  },
};

export class PhipromptHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    const line = document.lineAt(position);
    const lineText = line.text;
    const character = position.character;

    // Debug logging - remove in production
    console.log(
      `[HOVER DEBUG] Position: ${position.line}:${character}, Line: "${lineText}"`
    );
    console.log(
      `[HOVER DEBUG] Character at position: "${lineText.charAt(character)}"`
    );

    // Get the character at cursor position
    const symbolAtCursor = lineText.charAt(character);

    // Check all symbol types in priority order
    // 1. Check challenge flags first (emojis)
    if (this.isChallengeFlag(symbolAtCursor)) {
      console.log(`[HOVER DEBUG] Found challenge flag: "${symbolAtCursor}"`);
      const symbolRange = new vscode.Range(
        position.line,
        character,
        position.line,
        character + 1
      );
      return this.createSymbolHover(symbolAtCursor, symbolRange);
    }

    // 2. Check Greek letters
    if (this.isGreekLetter(symbolAtCursor)) {
      console.log(`[HOVER DEBUG] Found Greek letter: "${symbolAtCursor}"`);
      const symbolRange = new vscode.Range(
        position.line,
        character,
        position.line,
        character + 1
      );
      return this.createSymbolHover(symbolAtCursor, symbolRange);
    }

    // 3. Check other Unicode symbols from PHIPROMPT_SYMBOLIC_MAP
    if (this.isUnicodeSymbol(symbolAtCursor)) {
      console.log(`[HOVER DEBUG] Found Unicode symbol: "${symbolAtCursor}"`);
      const symbolRange = new vscode.Range(
        position.line,
        character,
        position.line,
        character + 1
      );
      return this.createSymbolHover(symbolAtCursor, symbolRange);
    }

    // 4. Check for multi-character patterns
    // Check for domain notation (word.word pattern)
    const domainRange = this.getDomainNotationRange(document, position);
    if (domainRange) {
      const domainNotation = document.getText(domainRange);
      console.log(`[HOVER DEBUG] Found domain notation: "${domainNotation}"`);
      return this.createDomainHover(domainNotation, domainRange);
    }

    // Check for Greek module with property (e.g., Ψ.filter)
    const moduleRange = this.getModulePropertyRange(document, position);
    if (moduleRange) {
      const moduleProperty = document.getText(moduleRange);
      console.log(`[HOVER DEBUG] Found module property: "${moduleProperty}"`);
      return this.createModulePropertyHover(moduleProperty, moduleRange);
    }

    // Check for challenge flag with explanation pattern
    const flagExplanationMatch = this.getFlagExplanationAtPosition(
      lineText,
      character
    );
    if (flagExplanationMatch) {
      console.log(
        `[HOVER DEBUG] Found flag explanation: "${flagExplanationMatch.flag}" - "${flagExplanationMatch.explanation}"`
      );
      const flagRange = new vscode.Range(
        position.line,
        flagExplanationMatch.startIndex,
        position.line,
        flagExplanationMatch.endIndex
      );
      return this.createFlagExplanationHover(
        flagExplanationMatch.flag,
        flagExplanationMatch.explanation,
        flagRange
      );
    }

    // Check for words that might be identifiers
    const wordRange = document.getWordRangeAtPosition(position);
    if (wordRange) {
      const word = document.getText(wordRange);
      if (PHIPROMPT_SYMBOLIC_MAP[word]) {
        console.log(`[HOVER DEBUG] Found word symbol: "${word}"`);
        return this.createSymbolHover(word, wordRange);
      }
    }

    console.log(`[HOVER DEBUG] No hover match found`);
    return null;
  }

  private isAnySymbol(char: string): boolean {
    // Comprehensive check for any recognizable symbol
    return (
      this.isChallengeFlag(char) ||
      this.isGreekLetter(char) ||
      this.isUnicodeSymbol(char)
    );
  }

  private isChallengeFlag(char: string): boolean {
    return challengeFlagMeanings.hasOwnProperty(char);
  }

  private isGreekLetter(char: string): boolean {
    // Greek alphabet ranges
    const greekRanges = [
      [0x0391, 0x03a9], // Greek uppercase
      [0x03b1, 0x03c9], // Greek lowercase
      [0x1f00, 0x1fff], // Greek extended
    ];

    const charCode = char.charCodeAt(0);
    return (
      greekRanges.some(
        ([start, end]) => charCode >= start && charCode <= end
      ) || PHIPROMPT_SYMBOLIC_MAP.hasOwnProperty(char)
    );
  }

  private isUnicodeSymbol(char: string): boolean {
    // Check if character is in the PHIPROMPT symbolic map
    return PHIPROMPT_SYMBOLIC_MAP.hasOwnProperty(char);
  }

  private getDomainNotationRange(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.Range | null {
    const line = document.lineAt(position);
    const lineText = line.text;

    // Look for domain.property pattern around cursor
    const domainPattern = /\b(\w+)\.(\w+)\b/g;
    let match;

    while ((match = domainPattern.exec(lineText)) !== null) {
      const startPos = match.index;
      const endPos = match.index + match[0].length;

      if (position.character >= startPos && position.character <= endPos) {
        return new vscode.Range(position.line, startPos, position.line, endPos);
      }
    }

    return null;
  }

  private getModulePropertyRange(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.Range | null {
    const line = document.lineAt(position);
    const lineText = line.text;

    // Look for Greek.property pattern
    const modulePattern =
      /([ΦΨρνακμλξεπωχυℜΠαβγδεζηθιικλμνξοπρστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΡΣΤΥΦΧΨΩ])\.(\w+)/g;
    let match;

    while ((match = modulePattern.exec(lineText)) !== null) {
      const startPos = match.index;
      const endPos = match.index + match[0].length;

      if (position.character >= startPos && position.character <= endPos) {
        return new vscode.Range(position.line, startPos, position.line, endPos);
      }
    }

    return null;
  }

  private getFlagExplanationAtPosition(
    lineText: string,
    character: number
  ): {
    flag: string;
    explanation: string;
    startIndex: number;
    endIndex: number;
  } | null {
    const flagPattern = /([🌀🧱🎭🧪⚡🔄📊⚠🔍📝🔗])\(([^)]+)\)/g;
    let match;

    while ((match = flagPattern.exec(lineText)) !== null) {
      const startPos = match.index;
      const endPos = match.index + match[0].length;

      if (character >= startPos && character <= endPos) {
        return {
          flag: match[1],
          explanation: match[2],
          startIndex: startPos,
          endIndex: endPos,
        };
      }
    }

    return null;
  }

  private createSymbolHover(symbol: string, range: vscode.Range): vscode.Hover {
    const markdown = new vscode.MarkdownString();
    markdown.isTrusted = true;

    // Get symbol info from multiple sources
    const aliases = PHIPROMPT_SYMBOLIC_MAP[symbol];
    const moduleInfo = getFrameworkModuleInfo(symbol);
    const challengeFlagInfo = challengeFlagMeanings[symbol];

    // Determine symbol category
    const isGreekLetter = this.isGreekLetter(symbol);
    const isChallengeFlag = this.isChallengeFlag(symbol);
    const isLogicSymbol =
      /^[∀∃∈∉∅∧∨¬⟹→><≥≤≈≡≫≪⇒⊕↑↻∥⊤⊥⇔⊢⊨∴∵≜⋀⋁↦⊕□◇♾⌛⚙]$/.test(symbol);
    const isAlchemical = /^[🜃🜄🜂🜔🜚🜛🜍🜖]$/.test(symbol);
    const isMathSymbol = /^[∇∂↻⇑⇓±≅≬☉☽↪⇨⇦⊣]$/.test(symbol);
    const isMLSymbol = /^[ℛ𝔏𝔇𝔐𝔽𝔾↝⇝☯]$/.test(symbol);

    // Header with appropriate icon
    let headerIcon = "🔢";
    if (isGreekLetter) headerIcon = "🇬🇷";
    else if (isChallengeFlag) headerIcon = "🚩";
    else if (isLogicSymbol) headerIcon = "🔬";
    else if (isAlchemical) headerIcon = "⚗️";
    else if (isMathSymbol) headerIcon = "📐";
    else if (isMLSymbol) headerIcon = "🤖";

    markdown.appendMarkdown(
      `### ${headerIcon} PHIPROMPT Symbol: \`${symbol}\`\n\n`
    );

    // Handle challenge flags specially
    if (isChallengeFlag && challengeFlagInfo) {
      markdown.appendMarkdown(`**Challenge Flag**: ${challengeFlagInfo}\n\n`);
      markdown.appendMarkdown(
        `**Usage**: Place this flag near content that requires the indicated type of special processing.\n\n`
      );
      
      // Add symbolic mapping if available
      if (aliases) {
        markdown.appendMarkdown(`**Text equivalent**: ${aliases[0]}\n\n`);
        if (aliases.length > 1) {
          markdown.appendMarkdown(
            `**Alternative meanings**: ${aliases.slice(1).join(", ")}\n\n`
          );
        }
      }
    } 
    // Handle other symbols
    else if (aliases) {
      markdown.appendMarkdown(`**Primary meaning**: ${aliases[0]}\n\n`);

      // Alternative meanings
      if (aliases.length > 1) {
        markdown.appendMarkdown(
          `**Alternative meanings**: ${aliases.slice(1).join(", ")}\n\n`
        );
      }

      // Framework module info for Greek letters
      if (moduleInfo) {
        markdown.appendMarkdown(`**Framework Module**: ${moduleInfo.name}\n\n`);
        markdown.appendMarkdown(`**Purpose**: ${moduleInfo.purpose}\n\n`);
        markdown.appendMarkdown(`**Components**:\n`);
        for (const component of moduleInfo.components) {
          markdown.appendMarkdown(`- ${component}\n`);
        }
        markdown.appendMarkdown("\n");
      }

      // Category-specific usage hints
      if (isLogicSymbol) {
        markdown.appendMarkdown(`**Category**: Logic & Quantification\n\n`);
      } else if (isAlchemical) {
        markdown.appendMarkdown(
          `**Category**: Alchemical Transformation Operators\n\n`
        );
      } else if (isMathSymbol) {
        markdown.appendMarkdown(`**Category**: Mathematical Operations\n\n`);
      } else if (isMLSymbol) {
        markdown.appendMarkdown(`**Category**: Machine Learning Symbols\n\n`);
      }
    } else {
      markdown.appendMarkdown(`### ❓ Unknown Symbol: \`${symbol}\`\n\n`);
      markdown.appendMarkdown(
        `This symbol is not recognized in the current PHIPROMPT symbol map.\n\n`
      );
    }

    // Add conversion hint for known symbols
    if (aliases || challengeFlagInfo) {
      markdown.appendMarkdown(
        `---\n\n💡 **Tip**: Use \`Ctrl+Shift+P\` → "PHIPROMPT: Convert Symbols to Text" to convert to natural language.`
      );
    }

    return new vscode.Hover(markdown, range);
  }

  private createDomainHover(
    domainNotation: string,
    range: vscode.Range
  ): vscode.Hover {
    const [domain, property] = domainNotation.split(".");
    const markdown = new vscode.MarkdownString();
    markdown.isTrusted = true;

    markdown.appendMarkdown(
      `### 🏷️ Domain Notation: \`${domainNotation}\`\n\n`
    );

    if (domainMeanings[domain]) {
      markdown.appendMarkdown(
        `**Domain**: ${domain} - ${domainMeanings[domain]}\n\n`
      );
    }

    if (propertyMeanings[domain] && propertyMeanings[domain][property]) {
      markdown.appendMarkdown(
        `**Property**: ${property} - ${propertyMeanings[domain][property]}\n\n`
      );
    } else {
      markdown.appendMarkdown(`**Property**: ${property}\n\n`);
    }

    markdown.appendMarkdown(
      `**Usage**: Domain notation provides structured semantics for framework operations.\n\n`
    );

    return new vscode.Hover(markdown, range);
  }

  private createModulePropertyHover(
    moduleProperty: string,
    range: vscode.Range
  ): vscode.Hover {
    const [module, property] = moduleProperty.split(".");
    const markdown = new vscode.MarkdownString();
    markdown.isTrusted = true;

    const moduleInfo = getFrameworkModuleInfo(module);

    markdown.appendMarkdown(
      `### 🏛️ Framework Module Property: \`${moduleProperty}\`\n\n`
    );

    if (moduleInfo) {
      markdown.appendMarkdown(`**Module**: ${moduleInfo.name}\n\n`);
      markdown.appendMarkdown(`**Purpose**: ${moduleInfo.purpose}\n\n`);
      markdown.appendMarkdown(`**Property**: ${property}\n\n`);
    } else {
      markdown.appendMarkdown(`**Module**: ${module}\n\n`);
      markdown.appendMarkdown(`**Property**: ${property}\n\n`);
    }

    markdown.appendMarkdown(
      `**Usage**: Module property defines specific functionality within the framework component.\n\n`
    );

    return new vscode.Hover(markdown, range);
  }

  private createFlagExplanationHover(
    flag: string,
    explanation: string,
    range: vscode.Range
  ): vscode.Hover {
    const markdown = new vscode.MarkdownString();
    markdown.isTrusted = true;

    markdown.appendMarkdown(`### 🚩 Challenge Flag with Explanation\n\n`);
    markdown.appendMarkdown(
      `**Flag**: \`${flag}\` - ${
        challengeFlagMeanings[flag] || "Challenge flag"
      }\n\n`
    );
    markdown.appendMarkdown(`**Explanation**: \`${explanation}\`\n\n`);
    markdown.appendMarkdown(
      `**Purpose**: This flag marks content requiring special attention during processing.\n\n`
    );

    return new vscode.Hover(markdown, range);
  }
}