import * as vscode from 'vscode';
import * as path from 'path';

export function activateCopilotConfig(context: vscode.ExtensionContext) {
    const debounceDelay = 300; // milliseconds, tune this to your liking
    const timers = new Map<string, NodeJS.Timeout>();

    const disposable = vscode.workspace.onDidChangeTextDocument(async event => {
        const document = event.document;
        if (document.languageId !== 'phicode') return;

        const docUri = document.uri.toString();

        if (timers.has(docUri)) {
            clearTimeout(timers.get(docUri)!);
        }

        timers.set(docUri, setTimeout(async () => {
            timers.delete(docUri);

            const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
            if (!workspaceFolder) return;

            const relativePath = path.relative(workspaceFolder.uri.fsPath, document.uri.fsPath).replace(/\\/g, '/');

            const flagMarker = '# (φ) ';
            const hintComment = `${flagMarker}${relativePath}`;

            let flagLineIndex: number | undefined = undefined;
            for (let i = 0; i < Math.min(document.lineCount, 10); i++) {
                const lineText = document.lineAt(i).text;
                if (lineText.startsWith(flagMarker)) {
                    flagLineIndex = i;
                    break;
                }
            }

            const edit = new vscode.WorkspaceEdit();

            if (flagLineIndex !== undefined) {
                if (document.lineAt(flagLineIndex).text !== hintComment) {
                    const range = document.lineAt(flagLineIndex).range;
                    edit.replace(document.uri, range, hintComment);
                }
            } else {
                edit.insert(document.uri, new vscode.Position(0, 0), hintComment + '\n');
            }

            if (!edit.entries().length) return;

            await vscode.workspace.applyEdit(edit);

        }, debounceDelay));
    });

    context.subscriptions.push(disposable);
}

