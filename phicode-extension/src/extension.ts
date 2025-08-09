import * as vscode from 'vscode';
import { Buffer } from 'buffer';
import { PhicodeCompletionProvider } from './completionProvider';
import { PhicodeInlineSuggestions } from './inlineSuggestions';
import { PhicodeCodeActionProvider } from './codeActionProvider';
import { PhicodeHoverProvider } from './hoverProvider';
import { PhicodeFormatter, PhicodeRangeFormatter } from './formatter';
import { activateCopilotConfig } from './copilotConfig';
import { PhicodeRenameProvider } from './refactorProvider';
import { PhicodeLinter } from './linter';
import { showTutorialPanel } from './tutorials';
import { PhicodeDefinitionProvider} from './definitionProvider';
import { PhicodeDocumentSymbolProvider } from './symbolProvider';

// Symbol mappings for conversion
export const pythonToPhicode: Record<string, string> = {
    'def': 'ƒ',
    'class': 'ℂ',
    'if': '¿',
    'elif': '⤷',
    'else': '⋄',
    'for': '∀',
    'in': '∈',
    'while': '↻',
    'break': '⇲',
    'continue': '⇉',
    'return': '⟲',
    'yield': '⟰',
    'raise': '↑',
    'try': '∴',
    'except': '⛒',
    'finally': '⇗',
    'with': '∥',
    'as': '↦',
    'import': '⇒',
    'from': '←',
    'True': '✓',
    'False': '⊥',
    'None': 'Ø',
    'and': '∧',
    'or': '∨',
    'not': '¬',
    'is': '≡',
    'lambda': 'λ',
    'del': '∂',
    'global': '⟁',
    'nonlocal': '∇',
    'assert': '‼',
    'async': '⟳',
    'await': '⌛',
    'pass': '⋯',
    'print': 'π'
};

// Reverse mapping for phicode to python
export const phicodeToPython: Record<string, string> = {};
for (const [key, value] of Object.entries(pythonToPhicode)) {
    phicodeToPython[value] = key;
}

/**
 * Convert text from one language to another using symbol mappings.
 * Handles keyword boundaries for Python keywords.
 */
export function convertText(text: string, mapping: Record<string, string>, outputChannel?: vscode.OutputChannel): string {
    let result = text;

    if (outputChannel) {
        outputChannel.appendLine(`[convertText] Starting conversion with mapping keys: ${Object.keys(mapping).join(', ')}`);
    }
    
    // Sort keys by descending length for longest match first
    const sortedKeys = Object.keys(mapping).sort((a, b) => b.length - a.length);

    for (const key of sortedKeys) {
        const value = mapping[key];
        const isAlphaKey = /^[a-zA-Z]/.test(key);
        const regex = isAlphaKey
            ? new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')
            : new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');

        const matches = result.match(regex);
        if (outputChannel) {
            outputChannel.appendLine(`[convertText] Replacing '${key}' with '${value}', matches found: ${matches ? matches.length : 0}`);
        }

        result = result.replace(regex, value);
    }

    if (outputChannel) {
        outputChannel.appendLine(`[convertText] Conversion completed.`);
    }

    return result;
}

async function convertPythonToPhicode(outputChannel: vscode.OutputChannel) {
    outputChannel.appendLine(`[convertPythonToPhicode] Triggered`);
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        outputChannel.appendLine(`[convertPythonToPhicode] No active editor found.`);
        vscode.window.showWarningMessage('No active editor found.');
        return;
    }

    const document = editor.document;
    outputChannel.appendLine(`[convertPythonToPhicode] Active document: ${document.uri.toString()}, languageId: ${document.languageId}`);

    if (document.languageId !== 'python') {
        outputChannel.appendLine(`[convertPythonToPhicode] Document is not Python.`);
        vscode.window.showWarningMessage('Current document is not Python.');
        return;
    }

    const newUri = document.uri.with({ path: document.uri.path.replace(/\.py$/i, '.φ') });
    outputChannel.appendLine(`[convertPythonToPhicode] Target URI: ${newUri.toString()}`);

    const convertedText = convertText(document.getText(), pythonToPhicode, outputChannel);
    const viewColumn = editor.viewColumn;

    try {
        outputChannel.appendLine(`[convertPythonToPhicode] Closing active editor...`);
        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
        outputChannel.appendLine(`[convertPythonToPhicode] Writing converted text to ${newUri.fsPath}...`);
        await vscode.workspace.fs.writeFile(newUri, Buffer.from(convertedText));
        outputChannel.appendLine(`[convertPythonToPhicode] Deleting original document ${document.uri.fsPath}...`);
        await vscode.workspace.fs.delete(document.uri);
        const newDoc = await vscode.workspace.openTextDocument(newUri);
        outputChannel.appendLine(`[convertPythonToPhicode] Opening new document...`);
        await vscode.window.showTextDocument(newDoc, viewColumn);
        outputChannel.appendLine(`[convertPythonToPhicode] Setting language mode to 'phicode'...`);
        await vscode.languages.setTextDocumentLanguage(newDoc, 'phicode');
        outputChannel.appendLine(`[convertPythonToPhicode] Conversion successful.`);
    } catch (error) {
        outputChannel.appendLine(`[convertPythonToPhicode] Error during conversion: ${error}`);
        vscode.window.showErrorMessage(`Conversion to PHICODE failed: ${error}`);
    }
}

async function convertPhicodeToPython(outputChannel: vscode.OutputChannel) {
    outputChannel.appendLine(`[convertPhicodeToPython] Triggered`);
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        outputChannel.appendLine(`[convertPhicodeToPython] No active editor found.`);
        vscode.window.showWarningMessage('No active editor found.');
        return;
    }

    const document = editor.document;
    outputChannel.appendLine(`[convertPhicodeToPython] Active document: ${document.uri.toString()}, languageId: ${document.languageId}`);

    if (document.languageId !== 'phicode') {
        outputChannel.appendLine(`[convertPhicodeToPython] Document is not PHICODE.`);
        vscode.window.showWarningMessage('Current document is not PHICODE.');
        return;
    }

    const newUri = document.uri.with({ path: document.uri.path.replace(/\.φ$/i, '.py') });
    outputChannel.appendLine(`[convertPhicodeToPython] Target URI: ${newUri.toString()}`);

    const convertedText = convertText(document.getText(), phicodeToPython, outputChannel);
    const viewColumn = editor.viewColumn;

    try {
        outputChannel.appendLine(`[convertPhicodeToPython] Closing active editor...`);
        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
        outputChannel.appendLine(`[convertPhicodeToPython] Writing converted text to ${newUri.fsPath}...`);
        await vscode.workspace.fs.writeFile(newUri, Buffer.from(convertedText));
        outputChannel.appendLine(`[convertPhicodeToPython] Deleting original document ${document.uri.fsPath}...`);
        await vscode.workspace.fs.delete(document.uri);
        const newDoc = await vscode.workspace.openTextDocument(newUri);
        outputChannel.appendLine(`[convertPhicodeToPython] Opening new document...`);
        await vscode.window.showTextDocument(newDoc, viewColumn);
        outputChannel.appendLine(`[convertPhicodeToPython] Setting language mode to 'python'...`);
        await vscode.languages.setTextDocumentLanguage(newDoc, 'python');
        outputChannel.appendLine(`[convertPhicodeToPython] Conversion successful.`);
    } catch (error) {
        outputChannel.appendLine(`[convertPhicodeToPython] Error during conversion: ${error}`);
        vscode.window.showErrorMessage(`Conversion to Python failed: ${error}`);
    }
}

/**
 * Extension activation entry point.
 */
export function activate(context: vscode.ExtensionContext) {
    const outputChannel = vscode.window.createOutputChannel('PHICODE');
    context.subscriptions.push(outputChannel);

    outputChannel.appendLine('[activate] Extension activation started.');

    // Register conversion commands
    context.subscriptions.push(
        vscode.commands.registerCommand('phicode.convertPythonToPhicode', () => convertPythonToPhicode(outputChannel)),
        vscode.commands.registerCommand('phicode.convertPhicodeToPython', () => convertPhicodeToPython(outputChannel))
    );

    outputChannel.appendLine('[activate] Registered conversion commands.');

    // Register completion provider for PHICODE
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            'phicode',
            new PhicodeCompletionProvider(),
            '.', ' '
        )
    );
    outputChannel.appendLine('[activate] Registered completion provider.');

    // Register code actions for PHICODE
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            'phicode',
            new PhicodeCodeActionProvider(),
            { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
        )
    );
    outputChannel.appendLine('[activate] Registered code action provider.');

    // Register inline suggestions for PHICODE
    context.subscriptions.push(
        vscode.languages.registerInlineCompletionItemProvider(
            'phicode',
            new PhicodeInlineSuggestions()
        )
    );
    outputChannel.appendLine('[activate] Registered inline suggestions provider.');

    // Register hover provider
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            'phicode',
            new PhicodeHoverProvider()
        )
    );
    outputChannel.appendLine('[activate] Registered hover provider.');

    // Register document formatter
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            'phicode',
            new PhicodeFormatter()
        ),
        vscode.languages.registerDocumentRangeFormattingEditProvider(
            'phicode', 
            new PhicodeRangeFormatter()
        )
    );
    outputChannel.appendLine('[activate] Registered document formatter.');

    

    // Activate Copilot config helpers
    activateCopilotConfig(context);
    outputChannel.appendLine('[activate] Activated Copilot config.');

    // Register rename provider
    context.subscriptions.push(
        vscode.languages.registerRenameProvider('phicode', new PhicodeRenameProvider())
    );
    outputChannel.appendLine('[activate] Registered rename provider.');
    // Register linter
    const linter = new PhicodeLinter();
    context.subscriptions.push(linter);

    // Lint on document open (immediate)
    const onDocumentOpen = vscode.workspace.onDidOpenTextDocument(doc => {
        if (doc.languageId === 'phicode') {
            outputChannel.appendLine(`[lint] Document opened: ${doc.fileName}`);
            linter.runLint(doc, true); // immediate = true for document open
        }
    });
    context.subscriptions.push(onDocumentOpen);

    // Debounced lint on document change
    const onDocumentChange = vscode.workspace.onDidChangeTextDocument(event => {
        if (event.document.languageId === 'phicode') {
            // Only log occasionally to reduce spam
            if (Math.random() < 0.1) { // Log only 10% of changes
                outputChannel.appendLine(`[lint] Document changed: ${event.document.fileName} (debounced)`);
            }
            linter.runLint(event.document, false); // debounced linting
        }
    });
    context.subscriptions.push(onDocumentChange);

    // Immediate lint on document save
    const onDocumentSave = vscode.workspace.onDidSaveTextDocument(doc => {
        if (doc.languageId === 'phicode') {
            outputChannel.appendLine(`[lint] Document saved: ${doc.fileName}`);
            linter.runLint(doc, true); // immediate = true for save
        }
    });
    context.subscriptions.push(onDocumentSave);

    outputChannel.appendLine('[activate] Registered linter event handlers with debouncing.');

    // Initial lint on already open documents (immediate)
    vscode.workspace.textDocuments.forEach(doc => {
        if (doc.languageId === 'phicode') {
            outputChannel.appendLine(`[lint] Initial lint on open document: ${doc.fileName}`);
            linter.runLint(doc, true);
        }
    });
    
    // Register definition provider which leverages virtual Python documents
    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider('phicode', new PhicodeDefinitionProvider())
    );
    outputChannel.appendLine('[activate] Registered definition provider.');

    // Register document symbol provider for PHICODE
    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(
            'phicode',
            new PhicodeDocumentSymbolProvider()
        )
    );
    outputChannel.appendLine('[activate] Registered document symbol provider.');

    // Register tutorial command and auto-show on first install
    const tutorialCmd = vscode.commands.registerCommand('phicode.showTutorial', () => {
        outputChannel.appendLine('[tutorial] Show tutorial command triggered.');
        showTutorialPanel(context);
    });
    context.subscriptions.push(tutorialCmd);

    const didShowTutorial = context.globalState.get('didShowTutorial');
    if (!didShowTutorial) {
        outputChannel.appendLine('[activate] Showing tutorial panel for first time.');
        showTutorialPanel(context);
        context.globalState.update('didShowTutorial', true);
    }

    outputChannel.appendLine('[activate] Extension activation completed.');
}

export function deactivate() {
    // Cleanup if needed
}
