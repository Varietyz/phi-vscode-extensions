import * as vscode from 'vscode';
import { pythonToPhicode } from './extension';

export class PhicodeFormatter implements vscode.DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(
        document: vscode.TextDocument
    ): vscode.TextEdit[] {
        const edits: vscode.TextEdit[] = [];
        const indentSize = vscode.workspace.getConfiguration('editor').get<number>('tabSize') || 4;
        const useSpaces = vscode.workspace.getConfiguration('editor').get<boolean>('insertSpaces') ?? true;

        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
        );
        let text = document.getText(fullRange);

        // 1. Ensure single space after PHICODE symbols
        const symbolPattern = Object.values(pythonToPhicode)
            .map(escapeRegExp)
            .join('|');
        const singleSpaceRegex = new RegExp(`(${symbolPattern})(\\s*)`, 'g');
        text = text.replace(singleSpaceRegex, (_, symbol: string, space: string) => {
            return `${symbol} `;
        });

        // 2. Remove trailing spaces
        text = text.replace(/[ \t]+$/gm, '');

        // 3. Enforce indentation style
        if (useSpaces) {
            const tabsToSpaces = new RegExp(`^\\t+`, 'gm');
            text = text.replace(tabsToSpaces, match => ' '.repeat(match.length * indentSize));
        } else {
            const spacesToTabs = new RegExp(`^( {${indentSize}})+`, 'gm');
            text = text.replace(spacesToTabs, match => '\t'.repeat(match.length / indentSize));
        }

        edits.push(vscode.TextEdit.replace(fullRange, text));
        return edits;
    }
}

// Utility: Escape special regex chars
function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
