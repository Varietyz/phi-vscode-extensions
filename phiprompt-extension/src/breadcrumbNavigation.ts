import * as vscode from 'vscode';

interface NavigationItem {
  label: string;
  range: vscode.Range;
  kind: vscode.SymbolKind;
  detail?: string;
}

export class PhipromptBreadcrumbProvider implements vscode.DocumentSymbolProvider {
  
  provideDocumentSymbols(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DocumentSymbol[]> {
    
    const symbols: vscode.DocumentSymbol[] = [];
    const text = document.getText();
    const lines = text.split('\n');

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      
      // ENHANCED: Framework section headers with INPUT/ACTIVATE_MODULE detection
      const frameworkSectionMatch = line.match(/^##\s*\[\s*([^\]]+?)\.(INPUT|ACTIVATE_MODULE|ACTIVATE)\s*\]/);
      if (frameworkSectionMatch) {
        const [, frameworkName, directive] = frameworkSectionMatch;
        const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
        const selectionRange = new vscode.Range(
          lineIndex, 
          line.indexOf(frameworkName), 
          lineIndex, 
          line.indexOf(frameworkName) + frameworkName.length
        );
        
        symbols.push(new vscode.DocumentSymbol(
          `${frameworkName}.${directive}`,
          'Framework Section',
          vscode.SymbolKind.Namespace,
          range,
          selectionRange
        ));
        continue;
      }

      // Standard section headers: ## [SECTION_NAME]
      const sectionMatch = line.match(/^##\s*\[\s*([^\]]+?)\s*\]/);
      if (sectionMatch) {
        const sectionName = sectionMatch[1].trim();
        const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
        const selectionRange = new vscode.Range(
          lineIndex, 
          line.indexOf(sectionName), 
          lineIndex, 
          line.indexOf(sectionName) + sectionName.length
        );
        
        symbols.push(new vscode.DocumentSymbol(
          sectionName,
          'Section',
          vscode.SymbolKind.Namespace,
          range,
          selectionRange
        ));
        continue;
      }

      // ENHANCED: Complete Φ pipeline with framework name detection
      const phiPipelineMatch = line.match(/^(\s*)(Φ)\.(\w+)\s*=\s*\{/);
      if (phiPipelineMatch) {
        const [, indent, phi, frameworkName] = phiPipelineMatch;
        const endLine = this.findClosingBrace(lines, lineIndex);
        const range = new vscode.Range(lineIndex, 0, endLine, lines[endLine]?.length || 0);
        symbols.push(new vscode.DocumentSymbol(
          `Φ.${frameworkName}`,
          'Framework Pipeline',
          vscode.SymbolKind.Module,
          range,
          new vscode.Range(lineIndex, indent.length, lineIndex, indent.length + 1)
        ));
        continue;
      }

      // Standard Φ Pipeline: Φ = {...}
      const phiMatch = line.match(/^(\s*)(Φ)\s*=\s*\{/);
      if (phiMatch) {
        const endLine = this.findClosingBrace(lines, lineIndex);
        const range = new vscode.Range(lineIndex, 0, endLine, lines[endLine]?.length || 0);
        symbols.push(new vscode.DocumentSymbol(
          'Φ Pipeline',
          'Framework Pipeline',
          vscode.SymbolKind.Module,
          range,
          new vscode.Range(lineIndex, phiMatch[1].length, lineIndex, phiMatch[1].length + 1)
        ));
        continue;
      }

      // ENHANCED: Activation module detection
      const activationMatch = line.match(/^(\s*)(activate\.Φ|Activate)\s*=\s*(∀)\s*\(([^)]+)\)\s*(→)\s*(ALWAYS)\s*\{/);
      if (activationMatch) {
        const [, indent, activator, quantifier, variables, arrow, always] = activationMatch;
        const endLine = this.findClosingBrace(lines, lineIndex);
        const range = new vscode.Range(lineIndex, 0, endLine, lines[endLine]?.length || 0);
        symbols.push(new vscode.DocumentSymbol(
          `${activator} = ${quantifier}(${variables}) → ${always}`,
          'Activation Module',
          vscode.SymbolKind.Module,
          range,
          new vscode.Range(lineIndex, indent.length, lineIndex, indent.length + activator.length)
        ));
        continue;
      }

      // ENHANCED: Greek submodule detection (ν.preprocess, μ.input_collection, etc.)
      const submoduleMatch = line.match(/^(\s*)([ΨℜΠρνακμλξεπωχυφβστδγιθηζΦΩΛΘΡΕΝΤΟΞΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ])\.(\w+)\s*:\s*(\{|\[)/);
      if (submoduleMatch) {
        const [, indent, module, submodule, bracket] = submoduleMatch;
        const moduleName = this.getModuleName(module);
        const endLine = bracket === '{' ? this.findClosingBrace(lines, lineIndex) : this.findClosingBracket(lines, lineIndex);
        const range = new vscode.Range(lineIndex, 0, endLine, lines[endLine]?.length || 0);
        symbols.push(new vscode.DocumentSymbol(
          `${module}.${submodule}`,
          `${moduleName} → ${submodule}`,
          vscode.SymbolKind.Class,
          range,
          new vscode.Range(lineIndex, indent.length, lineIndex, indent.length + module.length + 1 + submodule.length)
        ));
        continue;
      }

      // Greek modules: Ψ:, ℜ:, Π: with proper multiline detection
      const greekMatch = line.match(/^(\s*)([ΨℜΠρνακμλξεπωχυφβστδγιθηζΦΩΛΘΡΕΝΤΟΞΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ])\s*:\s*\{/);
      if (greekMatch) {
        const moduleName = this.getModuleName(greekMatch[2]);
        const endLine = this.findClosingBrace(lines, lineIndex);
        const range = new vscode.Range(lineIndex, 0, endLine, lines[endLine]?.length || 0);
        symbols.push(new vscode.DocumentSymbol(
          moduleName,
          `Greek Module`,
          vscode.SymbolKind.Class,
          range,
          new vscode.Range(lineIndex, greekMatch[1].length, lineIndex, greekMatch[1].length + 1)
        ));
        continue;
      }

      // ENHANCED: Processing pipeline step detection (→ ξ, → ε, → α)
      const pipelineStepMatch = line.match(/^(\s*)→\s*([ξεαρωφκσδπβγτιυχ])\s*:\s*\[([^\]]+)\]/);
      if (pipelineStepMatch) {
        const [, indent, step, operations] = pipelineStepMatch;
        const stepName = this.getPipelineStepName(step);
        const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
        symbols.push(new vscode.DocumentSymbol(
          `→ ${step}`,
          `${stepName}: ${operations.length > 30 ? operations.substring(0, 30) + '...' : operations}`,
          vscode.SymbolKind.Function,
          range,
          new vscode.Range(lineIndex, indent.length + 2, lineIndex, indent.length + 3)
        ));
        continue;
      }

      // ENHANCED: Output specification detection (F → technical ∧ T → systematic)
      const outputSpecMatch = line.match(/^(\s*)([FT])\s*→\s*(\w+)(?:\s*∧\s*([FT])\s*→\s*(\w+))?/);
      if (outputSpecMatch) {
        const [, indent, type1, value1, type2, value2] = outputSpecMatch;
        const specName = type2 ? `${type1}→${value1} ∧ ${type2}→${value2}` : `${type1}→${value1}`;
        const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
        symbols.push(new vscode.DocumentSymbol(
          specName,
          'Output Specification',
          vscode.SymbolKind.Constant,
          range,
          new vscode.Range(lineIndex, indent.length, lineIndex, indent.length + specName.length)
        ));
        continue;
      }

      // ENHANCED: Meta-control patterns (⇑.compliance, ⇑.limits, ⇑.success)
      const metaControlMatch = line.match(/^(\s*)(⇑)\.(\w+)\s*:\s*\[([^\]]+)\]/);
      if (metaControlMatch) {
        const [, indent, arrow, category, items] = metaControlMatch;
        const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
        symbols.push(new vscode.DocumentSymbol(
          `⇑.${category}`,
          `Meta Control: ${items.length > 30 ? items.substring(0, 30) + '...' : items}`,
          vscode.SymbolKind.Constant,
          range,
          new vscode.Range(lineIndex, indent.length + 2, lineIndex, indent.length + 2 + category.length)
        ));
        continue;
      }

      // ENHANCED: Collection analysis content detection
      const collectMatch = line.match(/^(\s*)(Collect)\.(\w+)\.([A-Z_]+)\s*:\s*\{([^}]+)\}/);
      if (collectMatch) {
        const [, indent, collect, analysisType, contentType, content] = collectMatch;
        const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
        symbols.push(new vscode.DocumentSymbol(
          `${collect}.${analysisType}.${contentType}`,
          `Collection: ${content.length > 30 ? content.substring(0, 30) + '...' : content}`,
          vscode.SymbolKind.Variable,
          range,
          new vscode.Range(lineIndex, indent.length, lineIndex, indent.length + collect.length)
        ));
        continue;
      }

      // Single Greek letters used in expressions: ξ.classify, ρ.filter, etc.
      const greekRefMatches = line.matchAll(/([ΨℜΠρνακμλξεπωχυφβστδγιθηζΦΩΛΘΡΕΝΤΟΞΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ])(?:\.(\w+))?/g);
      for (const match of greekRefMatches) {
        const symbol = match[1];
        const property = match[2];
        const fullName = property ? `${symbol}.${property}` : symbol;
        const matchIndex = match.index!;
        
        const range = new vscode.Range(lineIndex, matchIndex, lineIndex, matchIndex + match[0].length);
        symbols.push(new vscode.DocumentSymbol(
          fullName,
          this.getModuleName(symbol) + (property ? ` → ${property}` : ''),
          vscode.SymbolKind.Function,
          range,
          range
        ));
      }

      // Properties: property: value
      const propMatch = line.match(/^(\s+)(\w+):\s*(.+)/);
      if (propMatch && propMatch[1].length > 0) {
        const propName = propMatch[2];
        const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
        symbols.push(new vscode.DocumentSymbol(
          propName,
          propMatch[3].length > 30 ? propMatch[3].substring(0, 30) + '...' : propMatch[3],
          vscode.SymbolKind.Property,
          range,
          new vscode.Range(lineIndex, propMatch[1].length, lineIndex, propMatch[1].length + propName.length)
        ));
      }

      // Domain notation: modal.pos, state.hold, etc.
      const domainMatch = line.match(/(\w+)\.(\w+)/g);
      if (domainMatch) {
        for (const match of domainMatch) {
          const [domain, property] = match.split('.');
          const matchIndex = line.indexOf(match);
          const range = new vscode.Range(lineIndex, matchIndex, lineIndex, matchIndex + match.length);
          symbols.push(new vscode.DocumentSymbol(
            match,
            `Domain notation`,
            vscode.SymbolKind.Property,
            range,
            range
          ));
        }
      }
    }

    return this.buildHierarchy(symbols);
  }

  private findClosingBrace(lines: string[], startLine: number): number {
    let braceCount = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (escapeNext) {
          escapeNext = false;
          continue;
        }
        
        if (char === '\\') {
          escapeNext = true;
          continue;
        }
        
        if (char === '"' || char === "'") {
          inString = !inString;
          continue;
        }
        
        if (!inString) {
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
          
          if (braceCount === 0 && i > startLine) {
            return i;
          }
        }
      }
    }
    
    return lines.length - 1;
  }

  private findClosingBracket(lines: string[], startLine: number): number {
    let bracketCount = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (escapeNext) {
          escapeNext = false;
          continue;
        }
        
        if (char === '\\') {
          escapeNext = true;
          continue;
        }
        
        if (char === '"' || char === "'") {
          inString = !inString;
          continue;
        }
        
        if (!inString) {
          if (char === '[') bracketCount++;
          if (char === ']') bracketCount--;
          
          if (bracketCount === 0 && i > startLine) {
            return i;
          }
        }
      }
    }
    
    return lines.length - 1;
  }

  private getModuleName(symbol: string): string {
    const moduleNames: Record<string, string> = {
      // Core Framework Modules
      'Φ': 'Φ Framework Pipeline',
      'Ψ': 'Ψ Optimizer',
      'ℜ': 'ℜ Forensics', 
      'Π': 'Π Processor',
      'Ω': 'Ω Output Config',
      'Λ': 'Λ Lambda Functions',
      
      // Processing Components
      'ρ': 'ρ Filter',
      'ν': 'ν Normalizer',
      'α': 'α Validator',
      'κ': 'κ Handler',
      'μ': 'μ Detector',
      'λ': 'λ Function',
      'ξ': 'ξ Domain',
      'ε': 'ε Entity',
      'π': 'π Process',
      'ω': 'ω Output',
      'χ': 'χ Context',
      'υ': 'υ Utility',
      'φ': 'φ Feedback',
      'β': 'β Audit',
      'σ': 'σ Synthesis',
      'τ': 'τ Relations',
      'δ': 'δ Code',
      'γ': 'γ Symbolic',
      'ι': 'ι Integrity',
      'θ': 'θ Threshold',
      'η': 'η Efficiency',
      'ζ': 'ζ Zero Handler',
      
      // Extended Greek - Uppercase
      'Θ': 'Θ Threshold Module',
      'Ρ': 'Ρ Filtering Engine',
      'Ε': 'Ε Entity Processor/Epsilon Processor',
      'Ν': 'Ν Normalization Engine',
      'Τ': 'Τ Temporal Processor',
      'Ο': 'Ο Output Processor',
      'Ξ': 'Ξ Classification Engine',
      'Α': 'Α Primary Validator',
      'Β': 'Β Secondary Processor',
      'Γ': 'Γ Gamma Processor',
      'Δ': 'Δ Change Detector',
      'Ζ': 'Ζ Zero Processor',
      'Η': 'Η Efficiency Tracker',
      'Ι': 'Ι Integrity Module',
      'Κ': 'Κ Nested Processor',
      'Μ': 'Μ Metadata Processor',
      'Σ': 'Σ Aggregation Engine',
      'Υ': 'Υ Utility Engine',
      'Χ': 'Χ Context Engine'
    };
    
    return moduleNames[symbol] || symbol;
  }

  private getPipelineStepName(step: string): string {
    const stepNames: Record<string, string> = {
      'ξ': 'Domain Analysis',
      'ε': 'Entity Identification', 
      'α': 'Attribute Extraction',
      'ρ': 'Relationship Mapping',
      'ω': 'Coherence Validation',
      'φ': 'Feedback Calibration',
      'κ': 'Uncertainty Handling',
      'σ': 'Symbolic Synthesis',
      'δ': 'Implementation Output',
      'π': 'Process Step',
      'β': 'Anthropic Audit',
      'γ': 'Symbolic Attempt',
      'τ': 'Temporal Relations',
      'ι': 'Consistency Check',
      'υ': 'Utility Functions',
      'χ': 'Context Preservation'
    };
    return stepNames[step] || step;
  }

  private buildHierarchy(symbols: vscode.DocumentSymbol[]): vscode.DocumentSymbol[] {
    const result: vscode.DocumentSymbol[] = [];
    const stack: vscode.DocumentSymbol[] = [];

    for (const symbol of symbols) {
      // Pop stack until we find a parent that contains this symbol
      while (stack.length > 0) {
        const parent = stack[stack.length - 1];
        if (parent.range.contains(symbol.range)) {
          break;
        }
        stack.pop();
      }

      // Add to parent or root
      if (stack.length > 0) {
        stack[stack.length - 1].children.push(symbol);
      } else {
        result.push(symbol);
      }

      // Only push containers to stack
      if (symbol.kind === vscode.SymbolKind.Namespace || 
          symbol.kind === vscode.SymbolKind.Module || 
          symbol.kind === vscode.SymbolKind.Class) {
        stack.push(symbol);
      }
    }

    return result;
  }
}

export class PhipromptDefinitionProvider implements vscode.DefinitionProvider {
  
  provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {
    
    const range = this.getWordRange(document, position);
    if (!range) return null;

    const word = document.getText(range);
    const definitions = this.findDefinitions(document, word, range);
    
    return definitions.length > 0 ? definitions : null;
  }

  private getWordRange(document: vscode.TextDocument, position: vscode.Position): vscode.Range | null {
    const line = document.lineAt(position);
    const char = line.text.charAt(position.character);
    
    // Greek letter or symbol - single character detection
    if (/[ΦΨℜΠρνακμλξεπωχυφβστδγιθηζΩΛΘΡΕΝΤΟΞΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ∀∃∈∉∅∧∨¬⟹→><≥≤≈≡≫≪⇒⊕↑↻∥⊤⊥⇔⊢⊨∴∵≜⋀⋁↦⊕□◇♾⌛⚙🌀🧱🎭🧪⚡🔄📊⚠🔍📝🔗ΔΣ]/.test(char)) {
      // Check if this is part of a module reference like ξ.classify
      const beforeChar = position.character > 0 ? line.text.charAt(position.character - 1) : '';
      const afterChar = position.character < line.text.length - 1 ? line.text.charAt(position.character + 1) : '';
      
      if (afterChar === '.') {
        // This is a module reference, get the full module.property
        const moduleMatch = line.text.substring(position.character).match(/^([ΦΨℜΠρνακμλξεπωχυφβστδγιθηζΩΛΘΡΕΝΤΟΞΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ])\.(\w+)/);
        if (moduleMatch) {
          return new vscode.Range(position, new vscode.Position(position.line, position.character + moduleMatch[0].length));
        }
      }
      
      if (beforeChar === '.') {
        // This is a property after a module, get the module.property
        const fullMatch = line.text.substring(0, position.character + 1).match(/([ΦΨℜΠρνακμλξεπωχυφβστδγιθηζΩΛΘΡΕΝΤΟΞΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ])\.(\w+)$/);
        if (fullMatch) {
          return new vscode.Range(
            new vscode.Position(position.line, position.character - fullMatch[0].length + 1),
            new vscode.Position(position.line, position.character + 1)
          );
        }
      }
      
      // Single symbol
      return new vscode.Range(position, new vscode.Position(position.line, position.character + 1));
    }
    
    // Regular word
    const wordRange = document.getWordRangeAtPosition(position);
    return wordRange ?? null;
  }

  private findDefinitions(
    document: vscode.TextDocument, 
    word: string, 
    currentRange: vscode.Range
  ): vscode.LocationLink[] {
    const definitions: vscode.LocationLink[] = [];
    const text = document.getText();
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip current line
      if (i === currentRange.start.line) continue;

      // ENHANCED: Framework section definitions with flexible spacing
      const frameworkSectionPattern = new RegExp(`##\\s*\\[\\s*([^\\]]*${this.escapeRegex(word)}[^\\]]*)\\.(INPUT|ACTIVATE_MODULE|ACTIVATE)\\s*\\]`);
      const frameworkSectionMatch = line.match(frameworkSectionPattern);
      if (frameworkSectionMatch) {
        const matchIndex = frameworkSectionMatch.index || 0;
        const targetRange = new vscode.Range(i, 0, i, line.length);
        const targetSelectionRange = new vscode.Range(
          i, matchIndex + frameworkSectionMatch[0].indexOf(word), 
          i, matchIndex + frameworkSectionMatch[0].indexOf(word) + word.length
        );

        definitions.push({
          originSelectionRange: currentRange,
          targetUri: document.uri,
          targetRange: targetRange,
          targetSelectionRange: targetSelectionRange
        });
        continue;
      }

      // Standard section headers with flexible spacing
      const sectionPattern = new RegExp(`##\\s*\\[\\s*([^\\]]*${this.escapeRegex(word)}[^\\]]*)\\s*\\]`);
      const sectionMatch = line.match(sectionPattern);
      if (sectionMatch) {
        const matchIndex = sectionMatch.index || 0;
        const targetRange = new vscode.Range(i, 0, i, line.length);
        const targetSelectionRange = new vscode.Range(
          i, matchIndex + sectionMatch[0].indexOf(word), 
          i, matchIndex + sectionMatch[0].indexOf(word) + word.length
        );

        definitions.push({
          originSelectionRange: currentRange,
          targetUri: document.uri,
          targetRange: targetRange,
          targetSelectionRange: targetSelectionRange
        });
        continue;
      }

      // ENHANCED: Greek module definitions with submodules
      const modulePattern = new RegExp(`^\\s*(${this.escapeRegex(word)})\\s*:\\s*[\\{\\[]`);
      const submodulePattern = new RegExp(`^\\s*([ΦΨℜΠρνακμλξεπωχυφβστδγιθηζΩΛΘΡΕΝΤΟΞΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ])\\.${this.escapeRegex(word)}\\s*:`);
      const frameworkPattern = new RegExp(`^\\s*(Φ)\\.${this.escapeRegex(word)}\\s*=\\s*\\{`);
      
      if (modulePattern.test(line) || submodulePattern.test(line) || frameworkPattern.test(line)) {
        const match = line.match(modulePattern) || line.match(submodulePattern) || line.match(frameworkPattern);
        if (match) {
          const matchIndex = match.index || 0;
          const targetRange = new vscode.Range(i, 0, i, line.length);
          const targetSelectionRange = new vscode.Range(
            i, matchIndex + match[0].indexOf(word), 
            i, matchIndex + match[0].indexOf(word) + word.length
          );

          definitions.push({
            originSelectionRange: currentRange,
            targetUri: document.uri,
            targetRange: targetRange,
            targetSelectionRange: targetSelectionRange
          });
        }
        continue;
      }
      
      // ENHANCED: Pipeline step definitions
      const pipelinePattern = new RegExp(`→\\s*${this.escapeRegex(word)}\\s*:`);
      const pipelineMatch = line.match(pipelinePattern);
      if (pipelineMatch) {
        const matchIndex = pipelineMatch.index || 0;
        const targetRange = new vscode.Range(i, 0, i, line.length);
        const targetSelectionRange = new vscode.Range(
          i, matchIndex + pipelineMatch[0].indexOf(word), 
          i, matchIndex + pipelineMatch[0].indexOf(word) + word.length
        );

        definitions.push({
          originSelectionRange: currentRange,
          targetUri: document.uri,
          targetRange: targetRange,
          targetSelectionRange: targetSelectionRange
        });
        continue;
      }

      // ENHANCED: Meta-control definitions (⇑.compliance, ⇑.limits, ⇑.success)
      const metaControlPattern = new RegExp(`⇑\\.${this.escapeRegex(word)}\\s*:`);
      const metaControlMatch = line.match(metaControlPattern);
      if (metaControlMatch) {
        const matchIndex = metaControlMatch.index || 0;
        const targetRange = new vscode.Range(i, 0, i, line.length);
        const targetSelectionRange = new vscode.Range(
          i, matchIndex + metaControlMatch[0].indexOf(word), 
          i, matchIndex + metaControlMatch[0].indexOf(word) + word.length
        );

        definitions.push({
          originSelectionRange: currentRange,
          targetUri: document.uri,
          targetRange: targetRange,
          targetSelectionRange: targetSelectionRange
        });
        continue;
      }

      // ENHANCED: Collection analysis definitions
      const collectPattern = new RegExp(`Collect\\.\\w+\\.${this.escapeRegex(word)}\\s*:`);
      const collectMatch = line.match(collectPattern);
      if (collectMatch) {
        const matchIndex = collectMatch.index || 0;
        const targetRange = new vscode.Range(i, 0, i, line.length);
        const targetSelectionRange = new vscode.Range(
          i, matchIndex + collectMatch[0].indexOf(word), 
          i, matchIndex + collectMatch[0].indexOf(word) + word.length
        );

        definitions.push({
          originSelectionRange: currentRange,
          targetUri: document.uri,
          targetRange: targetRange,
          targetSelectionRange: targetSelectionRange
        });
        continue;
      }

      // Property definitions in pipeline: property: value
      const propertyPattern = new RegExp(`^\\s*(${this.escapeRegex(word)})\\s*:`);
      const propertyMatch = line.match(propertyPattern);
      if (propertyMatch) {
        const matchIndex = propertyMatch.index || 0;
        const targetRange = new vscode.Range(i, 0, i, line.length);
        const targetSelectionRange = new vscode.Range(
          i, matchIndex, 
          i, matchIndex + word.length
        );

        definitions.push({
          originSelectionRange: currentRange,
          targetUri: document.uri,
          targetRange: targetRange,
          targetSelectionRange: targetSelectionRange
        });
        continue;
      }

      // Module usage in pipeline: word→other or other→word
      const pipelineUsagePattern = new RegExp(`${this.escapeRegex(word)}(?=\\s*[→:])|(?<=→\\s*)${this.escapeRegex(word)}`);
      const pipelineUsageMatch = line.match(pipelineUsagePattern);
      if (pipelineUsageMatch) {
        const matchIndex = pipelineUsageMatch.index || 0;
        const targetRange = new vscode.Range(i, 0, i, line.length);
        const targetSelectionRange = new vscode.Range(
          i, matchIndex, 
          i, matchIndex + word.length
        );

        definitions.push({
          originSelectionRange: currentRange,
          targetUri: document.uri,
          targetRange: targetRange,
          targetSelectionRange: targetSelectionRange
        });
        continue;
      }

      // Any other usage - fallback
      const generalPattern = new RegExp(`\\b${this.escapeRegex(word)}\\b`);
      const generalMatch = line.match(generalPattern);
      if (generalMatch) {
        const matchIndex = generalMatch.index || 0;
        const targetRange = new vscode.Range(i, 0, i, line.length);
        const targetSelectionRange = new vscode.Range(
          i, matchIndex, 
          i, matchIndex + word.length
        );

        definitions.push({
          originSelectionRange: currentRange,
          targetUri: document.uri,
          targetRange: targetRange,
          targetSelectionRange: targetSelectionRange
        });
        break; // Only first match for general usage
      }
    }

    return definitions;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

export class PhipromptDocumentLinkProvider implements vscode.DocumentLinkProvider {
  
  provideDocumentLinks(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DocumentLink[]> {
    
    const links: vscode.DocumentLink[] = [];
    const text = document.getText();
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Section references: → see [SECTION_NAME]
      const sectionRefPattern = /→\s*see\s*\[([^\]]+)\]/g;
      let match;
      
      while ((match = sectionRefPattern.exec(line)) !== null) {
        const sectionName = match[1];
        const startPos = new vscode.Position(i, match.index!);
        const endPos = new vscode.Position(i, match.index! + match[0].length);
        const range = new vscode.Range(startPos, endPos);
        
        // Find target section
        const targetLine = this.findSectionDefinition(lines, sectionName);
        if (targetLine !== -1) {
          const link = new vscode.DocumentLink(range);
          link.target = vscode.Uri.parse(`${document.uri}#L${targetLine + 1}`);
          links.push(link);
        }
      }

      // ENHANCED: Module references with submodules: Ψ.property, ξ.classify, etc.
      const moduleRefPattern = /([ΦΨℜΠρνακμλξεπωχυφβστδγιθηζΩΛΘΡΕΝΤΟΞΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ])(?:\.(\w+))?/g;
      while ((match = moduleRefPattern.exec(line)) !== null) {
        const module = match[1];
        const property = match[2];
        const startPos = new vscode.Position(i, match.index!);
        const endPos = new vscode.Position(i, match.index! + match[0].length);
        const range = new vscode.Range(startPos, endPos);
        
        // Find module definition
        const targetLine = property 
          ? this.findSubmoduleDefinition(lines, module, property)
          : this.findModuleDefinition(lines, module);
        
        if (targetLine !== -1) {
          const link = new vscode.DocumentLink(range);
          link.target = vscode.Uri.parse(`${document.uri}#L${targetLine + 1}`);
          links.push(link);
        }
      }

      // ENHANCED: Pipeline step references: → ξ, → ε, etc.
      const pipelineStepPattern = /→\s*([ξεαρωφκσδπβγτιυχ])/g;
      while ((match = pipelineStepPattern.exec(line)) !== null) {
        const step = match[1];
        const startPos = new vscode.Position(i, match.index!);
        const endPos = new vscode.Position(i, match.index! + match[0].length);
        const range = new vscode.Range(startPos, endPos);
        
        // Find pipeline step definition
        const targetLine = this.findPipelineStepDefinition(lines, step);
        if (targetLine !== -1) {
          const link = new vscode.DocumentLink(range);
          link.target = vscode.Uri.parse(`${document.uri}#L${targetLine + 1}`);
          links.push(link);
        }
      }

      // ENHANCED: Meta-control references: ⇑.compliance, ⇑.limits, ⇑.success
      const metaControlPattern = /(⇑)\.(\w+)/g;
      while ((match = metaControlPattern.exec(line)) !== null) {
        const category = match[2];
        const startPos = new vscode.Position(i, match.index!);
        const endPos = new vscode.Position(i, match.index! + match[0].length);
        const range = new vscode.Range(startPos, endPos);
        
        // Find meta-control definition
        const targetLine = this.findMetaControlDefinition(lines, category);
        if (targetLine !== -1) {
          const link = new vscode.DocumentLink(range);
          link.target = vscode.Uri.parse(`${document.uri}#L${targetLine + 1}`);
          links.push(link);
        }
      }

      // ENHANCED: Framework references: Φ.frameworkName
      const frameworkRefPattern = /(Φ)\.(\w+)/g;
      while ((match = frameworkRefPattern.exec(line)) !== null) {
        const frameworkName = match[2];
        const startPos = new vscode.Position(i, match.index!);
        const endPos = new vscode.Position(i, match.index! + match[0].length);
        const range = new vscode.Range(startPos, endPos);
        
        // Find framework definition
        const targetLine = this.findFrameworkDefinition(lines, frameworkName);
        if (targetLine !== -1) {
          const link = new vscode.DocumentLink(range);
          link.target = vscode.Uri.parse(`${document.uri}#L${targetLine + 1}`);
          link.tooltip = `Go to framework: Φ.${frameworkName}`;
          links.push(link);
        }
      }
    }

    return links;
  }

  private findSectionDefinition(lines: string[], sectionName: string): number {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(new RegExp(`##\\s*\\[\\s*${this.escapeRegex(sectionName)}\\s*\\]`))) {
        return i;
      }
    }
    return -1;
  }

  private findModuleDefinition(lines: string[], module: string): number {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(new RegExp(`^\\s*${this.escapeRegex(module)}\\s*:\\s*\\{`))) {
        return i;
      }
    }
    return -1;
  }

  private findSubmoduleDefinition(lines: string[], module: string, submodule: string): number {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(new RegExp(`^\\s*${this.escapeRegex(module)}\\.${this.escapeRegex(submodule)}\\s*:`))) {
        return i;
      }
    }
    return -1;
  }

  private findPipelineStepDefinition(lines: string[], step: string): number {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(new RegExp(`^\\s*→\\s*${this.escapeRegex(step)}\\s*:`))) {
        return i;
      }
    }
    return -1;
  }

  private findMetaControlDefinition(lines: string[], category: string): number {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(new RegExp(`^\\s*⇑\\.${this.escapeRegex(category)}\\s*:`))) {
        return i;
      }
    }
    return -1;
  }

  private findFrameworkDefinition(lines: string[], frameworkName: string): number {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(new RegExp(`^\\s*Φ\\.${this.escapeRegex(frameworkName)}\\s*=\\s*\\{`))) {
        return i;
      }
    }
    return -1;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}