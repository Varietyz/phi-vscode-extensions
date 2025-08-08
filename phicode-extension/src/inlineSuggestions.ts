import * as vscode from 'vscode';
import { pythonToPhicode } from './extension';

// --- Shared utility ---
function fuzzyMatch(input: string, keyword: string): boolean {
    if (!input) return false;
    const lowerInput = input.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    return lowerKeyword.startsWith(lowerInput) || lowerKeyword.includes(lowerInput);
}

export class PhicodeInlineSuggestions implements vscode.InlineCompletionItemProvider {
    async provideInlineCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): Promise<vscode.InlineCompletionList> {
        const items: vscode.InlineCompletionItem[] = [];
        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        const lastWord = linePrefix.trim().split(/\s+/).pop() || '';

        // Suggest PHICODE symbols early with fuzzy matching
        for (const [pythonKeyword, phicodeSymbol] of Object.entries(pythonToPhicode)) {
            if (fuzzyMatch(lastWord, pythonKeyword)) {
                const start = position.translate(0, -lastWord.length);
                const item = new vscode.InlineCompletionItem(
                    phicodeSymbol,
                    new vscode.Range(start, position),
                    { title: 'Use PHICODE symbol', command: 'editor.action.triggerSuggest' }
                );
                items.push(item);
            }
        }

        return new vscode.InlineCompletionList(items);
    }
}
