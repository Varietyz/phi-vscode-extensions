import * as vscode from 'vscode';
import { pythonToPhicode } from './extension';

// --- Utility: Fuzzy match ---
function fuzzyMatch(input: string, keyword: string): boolean {
    if (!input) return false;
    const lowerInput = input.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    return lowerKeyword.startsWith(lowerInput) || lowerKeyword.includes(lowerInput);
}

// --- Utility: Scope detection ---
function detectScope(document: vscode.TextDocument, position: vscode.Position): string {
    const textBefore = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
    const lines = textBefore.split(/\r?\n/).reverse();

    for (const line of lines) {
        if (/^\s*def\s+\w+/.test(line)) return 'function';
        if (/^\s*class\s+\w+/.test(line)) return 'class';
        if (/^\s*(for|while)\s+/.test(line)) return 'loop';
        if (/^\s*if\s+/.test(line)) return 'if';
        if (/^\s*(import|from)\s+/.test(line)) return 'import';
    }
    return 'global';
}

// --- Scope-specific priority symbols ---
const scopeWeights: Record<string, string[]> = {
    if: ['¿', '⤷', '⋄'],
    loop: ['↻', '∀', '∈'],
    import: ['⇒', '←', '↦'],
    function: ['⟲', '⟰', '↑'],
    class: ['ℂ']
};

export class PhicodeCompletionProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        
        const items: vscode.CompletionItem[] = [];
        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        const lastWord = linePrefix.trim().split(/\s+/).pop() || '';

        const scope = detectScope(document, position);

        // Scope-priority completions first
        if (scopeWeights[scope]) {
            for (const symbol of scopeWeights[scope]) {
                const item = new vscode.CompletionItem(symbol, vscode.CompletionItemKind.Keyword);
                item.insertText = symbol;
                item.detail = `PHICODE symbol (priority for ${scope} scope)`;
                items.push(item);
            }
        }

        // Fuzzy match completions
        for (const [pythonKeyword, phicodeSymbol] of Object.entries(pythonToPhicode)) {
            if (fuzzyMatch(lastWord, pythonKeyword)) {
                const item = new vscode.CompletionItem(
                    phicodeSymbol,
                    vscode.CompletionItemKind.Keyword
                );
                item.insertText = phicodeSymbol;
                item.detail = `PHICODE symbol for ${pythonKeyword}`;
                item.documentation = new vscode.MarkdownString(`Replace \`${pythonKeyword}\` with \`${phicodeSymbol}\``);
                item.range = new vscode.Range(
                    position.translate(0, -lastWord.length),
                    position
                );
                items.push(item);
            }
        }

        // Special case: import conversion
        const currentLine = document.lineAt(position).text;
        if (currentLine.startsWith('import ') || currentLine.startsWith('from ')) {
            const importItem = new vscode.CompletionItem(
                'Convert to PHICODE import',
                vscode.CompletionItemKind.Snippet
            );
            importItem.insertText = currentLine
                .replace('import', '⇒')
                .replace('from', '←')
                .replace(' as ', ' ↦ ');
            importItem.additionalTextEdits = [
                vscode.TextEdit.delete(
                    new vscode.Range(
                        position.with(undefined, 0),
                        position.with(undefined, currentLine.length)
                    )
                )
            ];
            items.push(importItem);
        }

        return items;
    }
}
