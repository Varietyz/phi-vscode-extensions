import * as vscode from 'vscode';
import { PHIPROMPT_SYMBOLIC_MAP } from './symbolicMap';

export class PhipromptDefinitionProvider implements vscode.DefinitionProvider {
  
  provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {
    
    const range = this.getWordRange(document, position);
    if (!range) return null;

    const word = document.getText(range);
    const definitions = this.findFrameworkDefinitions(document, word, range);
    
    return definitions.length > 0 ? definitions : null;
  }

  private getWordRange(document: vscode.TextDocument, position: vscode.Position): vscode.Range | null {
    const line = document.lineAt(position);
    const char = line.text.charAt(position.character);
    
    // ENHANCED: Greek letter or symbol detection with framework context
    if (/[ΦΨℜΠρνακμλξεπωχυφβστδγιθηζΩΛΘΡΕΝΤΟΞΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ∀∃∈∉∅∧∨¬⟹→><≥≤≈≡≫≪⇒⊕↑↻∥⊤⊥⇔⊢⊨∴∵≜⋀⋁↦⊕□◇♾⌛⚙🌀🧱🎭🧪⚡🔄📊⚠🔍📝🔗ΔΣ⇑]/.test(char)) {
      const beforeChar = position.character > 0 ? line.text.charAt(position.character - 1) : '';
      const afterChar = position.character < line.text.length - 1 ? line.text.charAt(position.character + 1) : '';
      
      // Framework module reference: Φ.frameworkName
      if (char === 'Φ' && afterChar === '.') {
        const frameworkMatch = line.text.substring(position.character).match(/^(Φ)\.(\w+)/);
        if (frameworkMatch) {
          return new vscode.Range(position, new vscode.Position(position.line, position.character + frameworkMatch[0].length));
        }
      }
      
      // Module.submodule reference: ξ.classify, ρ.filter, etc.
      if (afterChar === '.') {
        const moduleMatch = line.text.substring(position.character).match(/^([ΦΨℜΠρνακμλξεπωχυφβστδγιθηζΩΛΘΡΕΝΤΟΞΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ])\.(\w+)/);
        if (moduleMatch) {
          return new vscode.Range(position, new vscode.Position(position.line, position.character + moduleMatch[0].length));
        }
      }
      
      // Property after module: property in module.property
      if (beforeChar === '.') {
        const fullMatch = line.text.substring(0, position.character + 1).match(/([ΦΨℜΠρνακμλξεπωχυφβστδγιθηζΩΛΘΡΕΝΤΟΞΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ])\.(\w+)$/);
        if (fullMatch) {
          return new vscode.Range(
            new vscode.Position(position.line, position.character - fullMatch[0].length + 1),
            new vscode.Position(position.line, position.character + 1)
          );
        }
      }
      
      // Meta-control pattern: ⇑.compliance, ⇑.limits, ⇑.success
      if (char === '⇑' && afterChar === '.') {
        const metaMatch = line.text.substring(position.character).match(/^(⇑)\.(\w+)/);
        if (metaMatch) {
          return new vscode.Range(position, new vscode.Position(position.line, position.character + metaMatch[0].length));
        }
      }
      
      // Pipeline step: → followed by Greek letter
      if (char === '→') {
        const pipelineMatch = line.text.substring(position.character).match(/^(→)\s*([ξεαρωφκσδπβγτιυχ])/);
        if (pipelineMatch) {
          return new vscode.Range(position, new vscode.Position(position.line, position.character + pipelineMatch[0].length));
        }
      }
      
      // Single Greek symbol
      return new vscode.Range(position, new vscode.Position(position.line, position.character + 1));
    }
    
    // Regular word detection
    const wordRange = document.getWordRangeAtPosition(position);
    return wordRange ?? null;
  }

  private findFrameworkDefinitions(
    document: vscode.TextDocument, 
    word: string, 
    currentRange: vscode.Range
  ): vscode.LocationLink[] {
    const definitions: vscode.LocationLink[] = [];
    const text = document.getText();
    const lines = text.split('\n');

    // Parse word for different contexts
    const wordAnalysis = this.analyzeWord(word);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip current line to avoid self-references
      if (i === currentRange.start.line) continue;

      // ENHANCED: Framework section definitions with INPUT/ACTIVATE patterns
      if (wordAnalysis.type === 'framework_section') {
        const frameworkSectionPattern = new RegExp(`##\\s*\\[\\s*([^\\]]*${this.escapeRegex(wordAnalysis.name)}[^\\]]*)\\.(INPUT|ACTIVATE_MODULE|ACTIVATE)\\s*\\]`);
        const frameworkSectionMatch = line.match(frameworkSectionPattern);
        if (frameworkSectionMatch) {
          definitions.push(this.createLocationLink(document, currentRange, i, wordAnalysis.name, line));
          continue;
        }
      }

      // Standard section headers
      const sectionPattern = new RegExp(`##\\s*\\[\\s*([^\\]]*${this.escapeRegex(word)}[^\\]]*)\\s*\\]`);
      const sectionMatch = line.match(sectionPattern);
      if (sectionMatch) {
        definitions.push(this.createLocationLink(document, currentRange, i, word, line));
        continue;
      }

      // ENHANCED: Framework pipeline definitions
      if (wordAnalysis.type === 'framework_pipeline') {
        const frameworkPattern = new RegExp(`^\\s*(Φ)\\.${this.escapeRegex(wordAnalysis.property!)}\\s*=\\s*\\{`);
        const frameworkMatch = line.match(frameworkPattern);
        if (frameworkMatch) {
          definitions.push(this.createLocationLink(document, currentRange, i, wordAnalysis.property!, line));
          continue;
        }
      }

      // ENHANCED: Greek module definitions with submodules
      if (wordAnalysis.type === 'module' || wordAnalysis.type === 'submodule') {
        const modulePattern = new RegExp(`^\\s*(${this.escapeRegex(wordAnalysis.module!)})\\s*:\\s*[\\{\\[]`);
        const submodulePattern = new RegExp(`^\\s*(${this.escapeRegex(wordAnalysis.module!)})\\.${this.escapeRegex(wordAnalysis.property || wordAnalysis.name)}\\s*:`);
        
        if (modulePattern.test(line) || submodulePattern.test(line)) {
          const match = line.match(modulePattern) || line.match(submodulePattern);
          if (match) {
            definitions.push(this.createLocationLink(document, currentRange, i, wordAnalysis.name, line));
          }
          continue;
        }
      }

      // ENHANCED: Pipeline step definitions (→ ξ, → ε, → α)
      if (wordAnalysis.type === 'pipeline_step') {
        const pipelinePattern = new RegExp(`^\\s*→\\s*${this.escapeRegex(wordAnalysis.step!)}\\s*:`);
        const pipelineMatch = line.match(pipelinePattern);
        if (pipelineMatch) {
          definitions.push(this.createLocationLink(document, currentRange, i, wordAnalysis.step!, line));
          continue;
        }

        // Also check for pipeline sequences: ξ→ε→α
        const sequencePattern = new RegExp(`${this.escapeRegex(wordAnalysis.step!)}\\s*→`);
        const sequenceMatch = line.match(sequencePattern);
        if (sequenceMatch) {
          definitions.push(this.createLocationLink(document, currentRange, i, wordAnalysis.step!, line));
          continue;
        }
      }

      // ENHANCED: Meta-control definitions (⇑.compliance, ⇑.limits, ⇑.success)
      if (wordAnalysis.type === 'meta_control') {
        const metaControlPattern = new RegExp(`^\\s*⇑\\.${this.escapeRegex(wordAnalysis.category!)}\\s*:`);
        const metaControlMatch = line.match(metaControlPattern);
        if (metaControlMatch) {
          definitions.push(this.createLocationLink(document, currentRange, i, wordAnalysis.category!, line));
          continue;
        }
      }

      // ENHANCED: Collection analysis definitions
      if (wordAnalysis.type === 'collection') {
        const collectPattern = new RegExp(`Collect\\.\\w+\\.${this.escapeRegex(word)}\\s*:`);
        const collectMatch = line.match(collectPattern);
        if (collectMatch) {
          definitions.push(this.createLocationLink(document, currentRange, i, word, line));
          continue;
        }
      }

      // ENHANCED: Output specification definitions (F → technical, T → systematic)
      if (wordAnalysis.type === 'output_spec') {
        const outputPattern = new RegExp(`${this.escapeRegex(wordAnalysis.type_char!)}\\s*→\\s*${this.escapeRegex(wordAnalysis.value!)}`);
        const outputMatch = line.match(outputPattern);
        if (outputMatch) {
          definitions.push(this.createLocationLink(document, currentRange, i, wordAnalysis.value!, line));
          continue;
        }
      }

      // ENHANCED: PHIPROMPT_SYMBOLIC_MAP integration
      if (this.isSymbolInMap(word)) {
        const symbolDefinitions = this.findSymbolMapDefinitions(lines, word);
        definitions.push(...symbolDefinitions.map(lineIndex => 
          this.createLocationLink(document, currentRange, lineIndex, word, lines[lineIndex])
        ));
      }

      // Property definitions: property: value
      const propertyPattern = new RegExp(`^\\s*(${this.escapeRegex(word)})\\s*:`);
      const propertyMatch = line.match(propertyPattern);
      if (propertyMatch) {
        definitions.push(this.createLocationLink(document, currentRange, i, word, line));
        continue;
      }

      // General usage patterns
      const generalPattern = new RegExp(`\\b${this.escapeRegex(word)}\\b`);
      const generalMatch = line.match(generalPattern);
      if (generalMatch && definitions.length === 0) {
        definitions.push(this.createLocationLink(document, currentRange, i, word, line));
        break; // Only first general match to avoid overwhelming results
      }
    }

    return definitions;
  }

  private analyzeWord(word: string): WordAnalysis {
    // Framework pipeline: Φ.frameworkName
    const frameworkMatch = word.match(/^(Φ)\.(\w+)$/);
    if (frameworkMatch) {
      return {
        type: 'framework_pipeline',
        name: word,
        module: frameworkMatch[1],
        property: frameworkMatch[2]
      };
    }

    // Module.submodule: ξ.classify, ρ.filter
    const moduleMatch = word.match(/^([ΦΨℜΠρνακμλξεπωχυφβστδγιθηζΩΛΘΡΕΝΤΟΞΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ])\.(\w+)$/);
    if (moduleMatch) {
      return {
        type: 'submodule',
        name: word,
        module: moduleMatch[1],
        property: moduleMatch[2]
      };
    }

    // Meta-control: ⇑.compliance, ⇑.limits, ⇑.success
    const metaMatch = word.match(/^(⇑)\.(\w+)$/);
    if (metaMatch) {
      return {
        type: 'meta_control',
        name: word,
        category: metaMatch[2]
      };
    }

    // Pipeline step: → ξ, → ε
    const pipelineMatch = word.match(/^(→)\s*([ξεαρωφκσδπβγτιυχ])$/);
    if (pipelineMatch) {
      return {
        type: 'pipeline_step',
        name: word,
        step: pipelineMatch[2]
      };
    }

    // Output specification: F → technical, T → systematic
    const outputMatch = word.match(/^([FT])\s*→\s*(\w+)$/);
    if (outputMatch) {
      return {
        type: 'output_spec',
        name: word,
        type_char: outputMatch[1],
        value: outputMatch[2]
      };
    }

    // Single Greek module
    if (/^[ΦΨℜΠρνακμλξεπωχυφβστδγιθηζΩΛΘΡΕΝΤΟΞΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ]$/.test(word)) {
      return {
        type: 'module',
        name: word,
        module: word
      };
    }

    // Framework section identifier
    if (word.includes('.INPUT') || word.includes('.ACTIVATE')) {
      return {
        type: 'framework_section',
        name: word.split('.')[0]
      };
    }

    // Default to general word
    return {
      type: 'general',
      name: word
    };
  }

  private isSymbolInMap(symbol: string): boolean {
    return symbol in PHIPROMPT_SYMBOLIC_MAP;
  }

  private findSymbolMapDefinitions(lines: string[], symbol: string): number[] {
    const definitions: number[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for symbol definitions in symbolic map or related files
      if (line.includes(`"${symbol}"`) || line.includes(`'${symbol}'`)) {
        definitions.push(i);
      }
      
      // Look for symbol usage in comments or documentation
      if (line.includes(symbol) && (line.includes('//') || line.includes('/*') || line.includes('#'))) {
        definitions.push(i);
      }
    }
    
    return definitions;
  }

  private createLocationLink(
    document: vscode.TextDocument,
    originRange: vscode.Range,
    targetLine: number,
    targetWord: string,
    lineText: string
  ): vscode.LocationLink {
    const targetWordIndex = lineText.indexOf(targetWord);
    const targetRange = new vscode.Range(targetLine, 0, targetLine, lineText.length);
    const targetSelectionRange = new vscode.Range(
      targetLine, 
      Math.max(0, targetWordIndex), 
      targetLine, 
      Math.max(targetWordIndex + targetWord.length, lineText.length)
    );

    return {
      originSelectionRange: originRange,
      targetUri: document.uri,
      targetRange: targetRange,
      targetSelectionRange: targetSelectionRange
    };
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\  private escapeRegex(');
  }
}

interface WordAnalysis {
  type: 'framework_pipeline' | 'module' | 'submodule' | 'pipeline_step' | 'meta_control' | 'output_spec' | 'framework_section' | 'collection' | 'general';
  name: string;
  module?: string;
  property?: string;
  step?: string;
  category?: string;
  type_char?: string;
  value?: string;
}