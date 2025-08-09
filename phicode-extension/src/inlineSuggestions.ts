import * as vscode from 'vscode';
import { pythonToPhicode } from './extension';

/**
 * Simple fuzzy matching:
 * Returns true if the keyword starts with or contains the input substring (case-insensitive).
 */
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

        // Extract the current line prefix up to the cursor position
        const linePrefix = document.lineAt(position).text.substring(0, position.character);

        // Extract last word token before the cursor for fuzzy matching
        const tokens = linePrefix.trim().split(/\s+/);
        const lastWord = tokens.length > 0 ? tokens[tokens.length - 1] : '';

        if (!lastWord) {
            return new vscode.InlineCompletionList([]);
        }

        // Generate suggestions for PHICODE symbols matching the last word fuzzily
        for (const [pythonKeyword, phicodeSymbol] of Object.entries(pythonToPhicode)) {
            if (fuzzyMatch(lastWord, pythonKeyword)) {
                const startPos = position.translate(0, -lastWord.length);
                const range = new vscode.Range(startPos, position);
                const item = new vscode.InlineCompletionItem(
                    phicodeSymbol,
                    range,
                    {
                        title: 'Use PHICODE symbol',
                        command: 'editor.action.triggerSuggest'
                    }
                );
                items.push(item);
            }
        }

        return new vscode.InlineCompletionList(items);
    }
}
