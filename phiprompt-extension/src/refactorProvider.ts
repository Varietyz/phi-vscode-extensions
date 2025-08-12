import * as vscode from 'vscode';
import { PHIPROMPT_SYMBOLIC_MAP } from './symbolicMap';

interface SymbolReference {
  uri: vscode.Uri;
  range: vscode.Range;
  context: string;
}

export class PhipromptRenameProvider implements vscode.RenameProvider {
  
  prepareRename(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Range | { range: vscode.Range; placeholder: string }> {
    
    const wordRange = this.getWordRangeAtPosition(document, position);
    if (!wordRange) {
      throw new Error('Cannot rename this symbol. Only user-defined identifiers can be renamed.');
    }

    const word = document.getText(wordRange);
    
    if (!this.canRenameSymbol(word)) {
      throw new Error(`Cannot rename '${word}'. Core PHIPROMPT symbols are protected.`);
    }

    return {
      range: wordRange,
      placeholder: word
    };
  }

  async provideRenameEdits(
    document: vscode.TextDocument,
    position: vscode.Position,
    newName: string,
    token: vscode.CancellationToken
  ): Promise<vscode.WorkspaceEdit | null> {

    const wordRange = this.getWordRangeAtPosition(document, position);
    if (!wordRange) return null;

    const oldName = document.getText(wordRange);
    
    if (!this.isValidNewName(newName)) {
      throw new Error(`'${newName}' is not a valid identifier.`);
    }

    const references = this.findAllReferences(document, oldName);
    if (references.length === 0) return null;

    const workspaceEdit = new vscode.WorkspaceEdit();
    
    for (const reference of references) {
      workspaceEdit.replace(reference.uri, reference.range, newName);
    }

    return workspaceEdit;
  }

  private getWordRangeAtPosition(document: vscode.TextDocument, position: vscode.Position): vscode.Range | null {
    // Try to match identifiers, including domain notation
    const identifierPattern = /[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)?/;
    const range = document.getWordRangeAtPosition(position, identifierPattern);
    return range ?? null;
  }

  private canRenameSymbol(word: string): boolean {
    // Protect core PHIPROMPT symbols
    if (PHIPROMPT_SYMBOLIC_MAP[word]) return false;
    
    // Protect challenge flags
    if (/^[🌀🧱🎭🧪⚡🔄📊⚠🔍📝🔗]$/.test(word)) return false;
    
    // Protect mathematical symbols
    if (/^[∀∃∈∉∅∧∨¬⟹→><≥≤≈≡≫≪⇒⊕↑↻∥⊤⊥⇔⊢⊨∴∵≜⋀⋁↦⊕□◇♾⌛⚙]$/.test(word)) return false;
    
    // Protect standalone Greek letters
    if (/^[ΨρνακμλξεπωχυℜΠ]$/.test(word)) return false;
    
    // Allow user-defined identifiers
    return /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)?$/.test(word);
  }

  private isValidNewName(name: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name) && 
           !PHIPROMPT_SYMBOLIC_MAP[name] && 
           name.length > 0;
  }

  private findAllReferences(document: vscode.TextDocument, symbolName: string): SymbolReference[] {
    const references: SymbolReference[] = [];
    const text = document.getText();
    
    // Create pattern to find word boundaries
    const escapedName = symbolName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`\\b${escapedName}\\b`, 'g');
    
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const startPos = document.positionAt(match.index);
      const endPos = document.positionAt(match.index + match[0].length);
      const range = new vscode.Range(startPos, endPos);
      
      const line = document.lineAt(startPos.line);
      
      references.push({
        uri: document.uri,
        range: range,
        context: line.text
      });
    }

    return references;
  }
}

export class PhipromptRefactorProvider implements vscode.CodeActionProvider {
  
  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
    
    const actions: vscode.CodeAction[] = [];
    const selectedText = document.getText(range);

    if (!selectedText || selectedText.trim().length === 0) {
      return actions;
    }

    // Extract to variable
    if (this.canExtractToVariable(selectedText)) {
      actions.push(this.createExtractVariableAction(document, range, selectedText));
    }

    // Extract to module
    if (this.canExtractToModule(selectedText)) {
      actions.push(this.createExtractModuleAction(document, range, selectedText));
    }

    // Convert quantifiers
    if (selectedText.includes('∀')) {
      actions.push(this.createConvertToExistsAction(document, range, selectedText));
    }
    
    if (selectedText.includes('∃')) {
      actions.push(this.createConvertToForallAction(document, range, selectedText));
    }

    // Simplify logical expressions
    if (this.hasLogicalOperators(selectedText)) {
      actions.push(...this.createSimplificationActions(document, range, selectedText));
    }

    // Reorder challenge flags
    if (this.hasChallengeFlags(selectedText)) {
      actions.push(this.createReorderFlagsAction(document, range, selectedText));
    }

    return actions;
  }

  private canExtractToVariable(text: string): boolean {
    const trimmed = text.trim();
    return trimmed.length > 5 && 
           !trimmed.includes('\n') && 
           (trimmed.includes('→') || trimmed.includes('∧') || trimmed.includes('∨'));
  }

  private canExtractToModule(text: string): boolean {
    const keywords = ['filter', 'validate', 'analyze', 'process', 'transform'];
    return keywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  private hasLogicalOperators(text: string): boolean {
    return /[∧∨¬⟹→]/.test(text);
  }

  private hasChallengeFlags(text: string): boolean {
    return /[🌀🧱🎭🧪⚡🔄📊⚠🔍📝🔗]/.test(text);
  }

  private createExtractVariableAction(
    document: vscode.TextDocument,
    range: vscode.Range,
    selectedText: string
  ): vscode.CodeAction {
    const action = new vscode.CodeAction(
      '📤 Extract to variable',
      vscode.CodeActionKind.RefactorExtract
    );

    const variableName = this.generateVariableName(selectedText);
    const variableDeclaration = `${variableName} = ${selectedText.trim()}\n`;
    
    action.edit = new vscode.WorkspaceEdit();
    
    // Find insertion point
    const insertPosition = this.findInsertionPoint(document, range.start);
    action.edit.insert(document.uri, insertPosition, variableDeclaration);
    
    // Replace selected text
    action.edit.replace(document.uri, range, variableName);

    return action;
  }

  private createExtractModuleAction(
    document: vscode.TextDocument,
    range: vscode.Range,
    selectedText: string
  ): vscode.CodeAction {
    const action = new vscode.CodeAction(
      '🏛️ Extract to module',
      vscode.CodeActionKind.RefactorExtract
    );

    const moduleName = this.generateModuleName(selectedText);
    const moduleDefinition = `Ψ.${moduleName}: {\n    ${selectedText.trim()}\n}\n\n`;
    
    action.edit = new vscode.WorkspaceEdit();
    
    // Insert at end of document
    const endPosition = new vscode.Position(document.lineCount, 0);
    action.edit.insert(document.uri, endPosition, moduleDefinition);
    
    // Replace with module reference
    action.edit.replace(document.uri, range, `Ψ.${moduleName}`);

    return action;
  }

  private createConvertToExistsAction(
    document: vscode.TextDocument,
    range: vscode.Range,
    selectedText: string
  ): vscode.CodeAction {
    const action = new vscode.CodeAction(
      '🔄 Convert ∀ to ∃',
      vscode.CodeActionKind.RefactorRewrite
    );

    const converted = selectedText.replace(/∀/g, '∃');
    
    action.edit = new vscode.WorkspaceEdit();
    action.edit.replace(document.uri, range, converted);

    return action;
  }

  private createConvertToForallAction(
    document: vscode.TextDocument,
    range: vscode.Range,
    selectedText: string
  ): vscode.CodeAction {
    const action = new vscode.CodeAction(
      '🔄 Convert ∃ to ∀',
      vscode.CodeActionKind.RefactorRewrite
    );

    const converted = selectedText.replace(/∃/g, '∀');
    
    action.edit = new vscode.WorkspaceEdit();
    action.edit.replace(document.uri, range, converted);

    return action;
  }

  private createSimplificationActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    selectedText: string
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];

    // Remove double negation
    if (selectedText.includes('¬¬')) {
      const action = new vscode.CodeAction(
        '✂️ Remove double negation',
        vscode.CodeActionKind.RefactorRewrite
      );
      
      const simplified = selectedText.replace(/¬¬/g, '');
      action.edit = new vscode.WorkspaceEdit();
      action.edit.replace(document.uri, range, simplified);
      actions.push(action);
    }

    // Apply De Morgan's law (basic case)
    if (selectedText.includes('¬(') && (selectedText.includes('∧') || selectedText.includes('∨'))) {
      const action = new vscode.CodeAction(
        '🧮 Apply De Morgan\'s law',
        vscode.CodeActionKind.RefactorRewrite
      );
      
      let transformed = selectedText;
      // Simple transformations
      transformed = transformed.replace(/¬\((.+?)\s*∧\s*(.+?)\)/g, '¬$1 ∨ ¬$2');
      transformed = transformed.replace(/¬\((.+?)\s*∨\s*(.+?)\)/g, '¬$1 ∧ ¬$2');
      
      action.edit = new vscode.WorkspaceEdit();
      action.edit.replace(document.uri, range, transformed);
      actions.push(action);
    }

    return actions;
  }

  private createReorderFlagsAction(
    document: vscode.TextDocument,
    range: vscode.Range,
    selectedText: string
  ): vscode.CodeAction {
    const action = new vscode.CodeAction(
      '🚩 Reorder flags by priority',
      vscode.CodeActionKind.RefactorRewrite
    );

    // Define flag priority order
    const flagPriority = ['⚠', '🧪', '🌀', '🧱', '🎭', '⚡', '🔄', '📊', '🔍', '📝', '🔗'];
    
    // Extract all flags
    const flags = selectedText.match(/[🌀🧱🎭🧪⚡🔄📊⚠🔍📝🔗]/g) || [];
    
    // Sort by priority
    const sortedFlags = flags.sort((a, b) => {
      const aPriority = flagPriority.indexOf(a);
      const bPriority = flagPriority.indexOf(b);
      return (aPriority === -1 ? 999 : aPriority) - (bPriority === -1 ? 999 : bPriority);
    });

    // Replace flags in the text
    let reordered = selectedText;
    let flagIndex = 0;
    reordered = reordered.replace(/[🌀🧱🎭🧪⚡🔄📊⚠🔍📝🔗]/g, () => {
      return sortedFlags[flagIndex++] || '';
    });

    action.edit = new vscode.WorkspaceEdit();
    action.edit.replace(document.uri, range, reordered);

    return action;
  }

  private generateVariableName(expression: string): string {
    // Extract meaningful words for variable name
    const words = expression.split(/[^a-zA-Z0-9]+/)
                           .filter(w => w.length > 2)
                           .slice(0, 2);
    
    if (words.length === 0) return 'extracted_var';
    
    return words.join('_').toLowerCase() + '_expr';
  }

  private generateModuleName(expression: string): string {
    if (expression.includes('filter')) return 'filter_logic';
    if (expression.includes('validate')) return 'validation';
    if (expression.includes('analyze')) return 'analysis';
    if (expression.includes('process')) return 'processor';
    if (expression.includes('transform')) return 'transformer';
    return 'extracted_module';
  }

  private findInsertionPoint(document: vscode.TextDocument, position: vscode.Position): vscode.Position {
    // Find the beginning of the current section or document
    for (let i = position.line; i >= 0; i--) {
      const line = document.lineAt(i);
      if (line.text.match(/^##\s*\[/)) {
        // Insert after section header
        return new vscode.Position(i + 1, 0);
      }
    }
    
    // If no section found, insert at the beginning
    return new vscode.Position(0, 0);
  }
}