import * as vscode from 'vscode';
import { pythonToPhicode } from './extension';

export class PhicodeCodeActionProvider implements vscode.CodeActionProvider {
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection
    ): vscode.ProviderResult<vscode.CodeAction[]> {
        const actions: vscode.CodeAction[] = [];
        const selectionText = document.getText(range);

        // 1. Line-based quick fixes for the current selection/line
        const lineText = document.lineAt(range.start.line).text;
        for (const [pythonKeyword, phicodeSymbol] of Object.entries(pythonToPhicode)) {
            const regex = new RegExp(`\\b${escapeRegExp(pythonKeyword)}\\b`, 'g');
            if (regex.test(lineText)) {
                const action = new vscode.CodeAction(
                    `Convert '${pythonKeyword}' to PHICODE symbol '${phicodeSymbol}' (this line)`,
                    vscode.CodeActionKind.QuickFix
                );
                action.edit = new vscode.WorkspaceEdit();

                let match: RegExpExecArray | null;
                regex.lastIndex = 0; // reset for reuse
                while ((match = regex.exec(lineText)) !== null) {
                    const startPos = new vscode.Position(range.start.line, match.index);
                    const endPos = startPos.translate(0, pythonKeyword.length);
                    action.edit.replace(document.uri, new vscode.Range(startPos, endPos), phicodeSymbol);
                }
                actions.push(action);
            }
        }

        // 2. Batch conversion for the whole document
        const batchAction = new vscode.CodeAction(
            'Convert all Python keywords to PHICODE symbols (entire document)',
            vscode.CodeActionKind.QuickFix
        );
        batchAction.edit = new vscode.WorkspaceEdit();

        for (const [pythonKeyword, phicodeSymbol] of Object.entries(pythonToPhicode)) {
            const regex = new RegExp(`\\b${escapeRegExp(pythonKeyword)}\\b`, 'g');
            const text = document.getText();
            let match: RegExpExecArray | null;
            regex.lastIndex = 0;
            while ((match = regex.exec(text)) !== null) {
                const start = document.positionAt(match.index);
                const end = start.translate(0, pythonKeyword.length);
                batchAction.edit.replace(document.uri, new vscode.Range(start, end), phicodeSymbol);
            }
        }
        actions.push(batchAction);

        return actions.length ? actions : undefined;
    }
}

// Utility: escape special regex characters in keywords
function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
