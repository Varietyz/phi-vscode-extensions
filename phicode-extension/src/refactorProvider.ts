import * as vscode from 'vscode';
import { phicodeToPython, pythonToPhicode } from './extension'; // Your existing maps

export class PhicodeRenameProvider implements vscode.RenameProvider {
    async prepareRename(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.Range | undefined> {
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) return undefined;
        const word = document.getText(wordRange);

        // Allow rename only if the symbol is a known PHICODE symbol or Python keyword mapped
        if (phicodeToPython[word] || pythonToPhicode[word]) {
            return wordRange;
        }
        return undefined;
    }

    async provideRenameEdits(
        document: vscode.TextDocument,
        position: vscode.Position,
        newName: string,
        token: vscode.CancellationToken
    ): Promise<vscode.WorkspaceEdit | undefined> {
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) return undefined;

        const oldSymbol = document.getText(wordRange);
        const edits = new vscode.WorkspaceEdit();

        // Determine old symbol mappings
        let oldPythonKeyword: string | undefined;
        let oldPhicodeSymbol: string | undefined;

        if (phicodeToPython[oldSymbol]) {
            oldPhicodeSymbol = oldSymbol;
            oldPythonKeyword = phicodeToPython[oldSymbol];
        } else if (pythonToPhicode[oldSymbol]) {
            oldPythonKeyword = oldSymbol;
            oldPhicodeSymbol = pythonToPhicode[oldSymbol];
        } else {
            return undefined; // Not a recognized symbol
        }

        // Validate newName is a known PHICODE symbol or Python keyword
        let newPythonKeyword: string | undefined;
        let newPhicodeSymbol: string | undefined;

        if (phicodeToPython[newName]) {
            newPhicodeSymbol = newName;
            newPythonKeyword = phicodeToPython[newName];
        } else if (pythonToPhicode[newName]) {
            newPythonKeyword = newName;
            newPhicodeSymbol = pythonToPhicode[newName];
        } else {
            vscode.window.showErrorMessage(`New name '${newName}' is not a recognized PHICODE symbol or Python keyword.`);
            return undefined;
        }

        // Find all .py and .φ files in the workspace
        const pyFiles = await vscode.workspace.findFiles('**/*.py');
        const phicodeFiles = await vscode.workspace.findFiles('**/*.φ');

        // Replace occurrences in a document
        async function replaceSymbolInDocument(uri: vscode.Uri, oldText: string, newText: string) {
            const doc = await vscode.workspace.openTextDocument(uri);
            const editPositions: vscode.Range[] = [];

            for (let i = 0; i < doc.lineCount; i++) {
                const line = doc.lineAt(i);
                let index = line.text.indexOf(oldText);
                while (index !== -1) {
                    // Ensure whole word match: check boundaries
                    const beforeChar = index > 0 ? line.text[index - 1] : null;
                    const afterChar = index + oldText.length < line.text.length ? line.text[index + oldText.length] : null;
                    const isBoundaryBefore = beforeChar === null || /\W/.test(beforeChar);
                    const isBoundaryAfter = afterChar === null || /\W/.test(afterChar);

                    if (isBoundaryBefore && isBoundaryAfter) {
                        editPositions.push(new vscode.Range(i, index, i, index + oldText.length));
                    }

                    index = line.text.indexOf(oldText, index + oldText.length);
                }
            }

            for (const range of editPositions) {
                edits.replace(uri, range, newText);
            }
        }

        // Replace PHICODE symbols in .φ files
        if (oldPhicodeSymbol && newPhicodeSymbol) {
            for (const uri of phicodeFiles) {
                await replaceSymbolInDocument(uri, oldPhicodeSymbol, newPhicodeSymbol);
            }
        }

        // Replace Python keywords in .py files
        if (oldPythonKeyword && newPythonKeyword) {
            for (const uri of pyFiles) {
                await replaceSymbolInDocument(uri, oldPythonKeyword, newPythonKeyword);
            }
        }

        return edits;
    }
    
}
