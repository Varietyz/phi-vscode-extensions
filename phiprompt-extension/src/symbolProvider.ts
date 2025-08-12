import * as vscode from 'vscode';

export class PhipromptDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
  provideDocumentSymbols(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DocumentSymbol[]> {
    
    const symbols: vscode.DocumentSymbol[] = [];
    const text = document.getText();
    const lines = text.split('\n');

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      
      // Parse section headers: ## [SECTION_NAME]
      const sectionMatch = line.match(/^##\s*\[([^\]]+)\]/);
      if (sectionMatch) {
        const sectionName = sectionMatch[1];
        const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
        const selectionRange = new vscode.Range(
          lineIndex, 
          sectionMatch.index! + 3, 
          lineIndex, 
          sectionMatch.index! + 3 + sectionName.length
        );
        
        const sectionSymbol = new vscode.DocumentSymbol(
          sectionName,
          'Framework Section',
          vscode.SymbolKind.Namespace,
          range,
          selectionRange
        );

        // Look for subsections within this section
        const subsectionEndIndex = this.findNextSectionIndex(lines, lineIndex + 1);
        const subsections = this.parseSubsections(lines, lineIndex + 1, subsectionEndIndex);
        sectionSymbol.children = subsections;

        symbols.push(sectionSymbol);
      }

      // Parse Greek module definitions: Ψ = {...}, ρ.filter = {...}
      const greekMatch = line.match(/^([ΨρνακμλξεπωχυℜΠ])(\.[\w_]+)?\s*[=:]/);
      if (greekMatch) {
        const moduleSymbol = greekMatch[1];
        const property = greekMatch[2] || '';
        const fullName = moduleSymbol + property;
        
        const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
        const selectionRange = new vscode.Range(
          lineIndex,
          greekMatch.index!,
          lineIndex,
          greekMatch.index! + fullName.length
        );

        const moduleInfo = this.getModuleInfo(moduleSymbol);
        const symbol = new vscode.DocumentSymbol(
          fullName,
          moduleInfo.description,
          vscode.SymbolKind.Module,
          range,
          selectionRange
        );

        symbols.push(symbol);
      }

      // Parse domain notation: modal.pos, state.hold, etc.
      const domainMatches = line.matchAll(/(\w+)\.(\w+)/g);
      for (const match of domainMatches) {
        const domain = match[1];
        const property = match[2];
        const fullNotation = `${domain}.${property}`;
        
        const range = new vscode.Range(lineIndex, match.index!, lineIndex, match.index! + match[0].length);
        const symbol = new vscode.DocumentSymbol(
          fullNotation,
          `Domain notation: ${domain} → ${property}`,
          vscode.SymbolKind.Property,
          range,
          range
        );

        symbols.push(symbol);
      }

      // Parse entity definitions and relationships
      const entityMatch = line.match(/^(\w+)\s*[∈∉]\s*(\w+)/);
      if (entityMatch) {
        const entity = entityMatch[1];
        const domain = entityMatch[2];
        const operator = line.includes('∈') ? '∈' : '∉';
        
        const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
        const selectionRange = new vscode.Range(
          lineIndex,
          entityMatch.index!,
          lineIndex,
          entityMatch.index! + entity.length
        );

        const symbol = new vscode.DocumentSymbol(
          entity,
          `Entity ${operator} ${domain}`,
          vscode.SymbolKind.Variable,
          range,
          selectionRange
        );

        symbols.push(symbol);
      }

      // Parse quantified statements: ∀ x ∈ domain, ∃ y ∈ set
      const quantifierMatch = line.match(/([∀∃])\s*(\w+)\s*∈\s*(\w+)/);
      if (quantifierMatch) {
        const quantifier = quantifierMatch[1];
        const variable = quantifierMatch[2];
        const domain = quantifierMatch[3];
        const quantifierType = quantifier === '∀' ? 'Universal' : 'Existential';
        
        const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
        const selectionRange = new vscode.Range(
          lineIndex,
          quantifierMatch.index! + quantifierMatch[0].indexOf(variable),
          lineIndex,
          quantifierMatch.index! + quantifierMatch[0].indexOf(variable) + variable.length
        );

        const symbol = new vscode.DocumentSymbol(
          variable,
          `${quantifierType} quantification over ${domain}`,
          vscode.SymbolKind.Variable,
          range,
          selectionRange
        );

        symbols.push(symbol);
      }

      // Parse challenge flag groups
      const flagMatches = line.matchAll(/([🌀🧱🎭🧪⚡🔄📊⚠🔍📝🔗])(\([^)]+\))?/g);
      for (const match of flagMatches) {
        const flag = match[1];
        const explanation = match[2] ? match[2].slice(1, -1) : '';
        const flagInfo = this.getFlagInfo(flag);
        
        const range = new vscode.Range(lineIndex, match.index!, lineIndex, match.index! + match[0].length);
        const symbol = new vscode.DocumentSymbol(
          flag,
          explanation || flagInfo.name,
          vscode.SymbolKind.Constant,
          range,
          range
        );

        symbols.push(symbol);
      }
    }

    // Sort symbols by line number for better navigation
    symbols.sort((a, b) => a.range.start.line - b.range.start.line);

    return symbols;
  }

  private parseSubsections(lines: string[], startIndex: number, endIndex: number): vscode.DocumentSymbol[] {
    const subsections: vscode.DocumentSymbol[] = [];

    for (let i = startIndex; i < endIndex; i++) {
      const line = lines[i];
      
      // Look for subsection patterns like "### Subsection" or indented sections
      const subsectionMatch = line.match(/^###\s+(.+)/) || line.match(/^\s{2,}([A-Z][^:]+):/);
      if (subsectionMatch) {
        const name = subsectionMatch[1].trim();
        const range = new vscode.Range(i, 0, i, line.length);
        const selectionRange = new vscode.Range(
          i,
          subsectionMatch.index! + subsectionMatch[0].indexOf(name),
          i,
          subsectionMatch.index! + subsectionMatch[0].indexOf(name) + name.length
        );

        const subsection = new vscode.DocumentSymbol(
          name,
          'Subsection',
          vscode.SymbolKind.Class,
          range,
          selectionRange
        );

        subsections.push(subsection);
      }

      // Look for key-value definitions within sections
      const definitionMatch = line.match(/^\s*(\w+):\s*(.+)/);
      if (definitionMatch) {
        const key = definitionMatch[1];
        const value = definitionMatch[2];
        
        const range = new vscode.Range(i, 0, i, line.length);
        const selectionRange = new vscode.Range(
          i,
          definitionMatch.index! + line.indexOf(key),
          i,
          definitionMatch.index! + line.indexOf(key) + key.length
        );

        const definition = new vscode.DocumentSymbol(
          key,
          value.length > 50 ? value.substring(0, 50) + '...' : value,
          vscode.SymbolKind.Field,
          range,
          selectionRange
        );

        subsections.push(definition);
      }
    }

    return subsections;
  }

  private findNextSectionIndex(lines: string[], startIndex: number): number {
    for (let i = startIndex; i < lines.length; i++) {
      if (lines[i].match(/^##\s*\[/)) {
        return i;
      }
    }
    return lines.length;
  }

  private getModuleInfo(moduleSymbol: string): { name: string; description: string } {
    const moduleMap: Record<string, { name: string; description: string }> = {
      'Ψ': { name: 'Psi (Optimizer)', description: 'Filters and consolidates information' },
      'ρ': { name: 'Rho (Filter)', description: 'Removes duplicates and loops' },
      'ν': { name: 'Nu (Normalizer)', description: 'Normalizes entity-attribute-value structures' },
      'α': { name: 'Alpha (Validator)', description: 'Validates conflicts and claims' },
      'κ': { name: 'Kappa (Handler)', description: 'Handles nested and vague implementations' },
      'μ': { name: 'Mu (Detector)', description: 'Detects abstract and subjective content' },
      'ℜ': { name: 'R (Forensics)', description: 'Evidence analysis and investigative reasoning' },
      'Π': { name: 'Pi (Processor)', description: 'Core compilation and execution engine' },
      'λ': { name: 'Lambda (Function)', description: 'Function definitions and transformations' },
      'ξ': { name: 'Xi (Domain)', description: 'Domain analysis and classification' },
      'ε': { name: 'Epsilon (Entity)', description: 'Entity identification and processing' },
      'π': { name: 'Pi (Process)', description: 'Process definitions and workflows' },
      'ω': { name: 'Omega (Output)', description: 'Output formatting and validation' },
      'χ': { name: 'Chi (Context)', description: 'Context preservation and analysis' },
      'υ': { name: 'Upsilon (Utility)', description: 'Utility functions and helpers' }
    };

    return moduleMap[moduleSymbol] || { name: moduleSymbol, description: 'Framework module' };
  }

  private getFlagInfo(flag: string): { name: string; description: string } {
    const flagMap: Record<string, { name: string; description: string }> = {
      '🌀': { name: 'Metaphorical', description: 'Metaphorical or ambiguous content' },
      '🧱': { name: 'Nested Conditional', description: 'Complex nested conditional logic' },
      '🎭': { name: 'Affective Intent', description: 'Emotional tone or affective content' },
      '🧪': { name: 'Unverified Claim', description: 'Hypothesis or unsubstantiated claim' },
      '⚡': { name: 'High Complexity', description: 'Complex processing required' },
      '🔄': { name: 'Iterative', description: 'Iterative refinement or loop structure' },
      '📊': { name: 'Baseline Required', description: 'Baseline measurement needed' },
      '⚠': { name: 'Uncertainty', description: 'Explicit uncertainty marker' },
      '🔍': { name: 'Investigation', description: 'Investigation or examination required' },
      '📝': { name: 'Qualitative', description: 'Qualitative assessment needed' },
      '🔗': { name: 'Relationship', description: 'Inferred relationship or link' }
    };

    return flagMap[flag] || { name: flag, description: 'Challenge flag' };
  }
}