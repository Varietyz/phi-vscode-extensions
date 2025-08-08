import * as vscode from 'vscode';
import { Buffer } from 'buffer';
import { PhicodeCompletionProvider } from './completionProvider';
import { PhicodeInlineSuggestions } from './inlineSuggestions';
import { PhicodeCodeActionProvider } from './codeActionProvider';
import { PhicodeHoverProvider } from './hoverProvider';
import { PhicodeFormatter } from './formatter';
import { activateCopilotConfig } from './copilotConfig';
import { PhicodeRenameProvider } from './refactorProvider';
import { PhicodeLinter } from './linter';
import { showTutorialPanel } from './tutorials';

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

function convertText(text: string, mapping: Record<string, string>): string {
    let result = text;
    
    // Sort keys by length (descending) to handle longer matches first
    const sortedKeys = Object.keys(mapping).sort((a, b) => b.length - a.length);
    
    for (const key of sortedKeys) {
        const value = mapping[key];
        // Use word boundaries for Python keywords to avoid partial matches
        const isAlphaKey = /^[a-zA-Z]/.test(key);
        const regex = isAlphaKey 
            ? new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')
            : new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        
        result = result.replace(regex, value);
    }
    
    return result;
}

async function convertPythonToPhicode() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const document = editor.document;
    if (document.languageId !== 'python') return;

    // Get new URI with .φ extension
    const newUri = document.uri.with({ 
        path: document.uri.path.replace(/\.py$/i, '.φ') 
    });

    // Convert content
    const convertedText = convertText(document.getText(), pythonToPhicode);

    // Save the original view column to reopen in same position
    const viewColumn = editor.viewColumn;

    // Close original file before rename to avoid conflicts
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');

    // Write new file with correct extension and content
    await vscode.workspace.fs.writeFile(newUri, Buffer.from(convertedText));

    // Delete original file
    await vscode.workspace.fs.delete(document.uri);

    // Open new file with proper language mode
    const newDoc = await vscode.workspace.openTextDocument(newUri);
    await vscode.window.showTextDocument(newDoc, viewColumn);
    
    // Explicitly set language mode if needed
    await vscode.languages.setTextDocumentLanguage(newDoc, 'phicode');
}

async function convertPhicodeToPython() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const document = editor.document;
    if (document.languageId !== 'phicode') return;

    // Get new URI with .py extension
    const newUri = document.uri.with({ 
        path: document.uri.path.replace(/\.φ$/i, '.py') 
    });

    // Convert content
    const convertedText = convertText(document.getText(), phicodeToPython);

    // Save the original view column
    const viewColumn = editor.viewColumn;

    // Close original file
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');

    // Write new file
    await vscode.workspace.fs.writeFile(newUri, Buffer.from(convertedText));

    // Delete original file
    await vscode.workspace.fs.delete(document.uri);

    // Open new file
    const newDoc = await vscode.workspace.openTextDocument(newUri);
    await vscode.window.showTextDocument(newDoc, viewColumn);
    
    // Set to Python language mode
    await vscode.languages.setTextDocumentLanguage(newDoc, 'python');
}

export function activate(context: vscode.ExtensionContext) {
    // Register conversion commands
    const convertToPhi = vscode.commands.registerCommand('phicode.convertPythonToPhicode', convertPythonToPhicode);
    const convertToPython = vscode.commands.registerCommand('phicode.convertPhicodeToPython', convertPhicodeToPython);

    context.subscriptions.push(convertToPhi, convertToPython);
    const completionProvider = vscode.languages.registerCompletionItemProvider(
        'phicode',
        new PhicodeCompletionProvider(),
        '.', // trigger characters
        ' '  // space can trigger completions too
    );
    
    context.subscriptions.push(completionProvider);
    
    // Register code actions for auto-conversion
    const codeActionProvider = vscode.languages.registerCodeActionsProvider(
        'phicode',
        new PhicodeCodeActionProvider(),
        { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
    );
    context.subscriptions.push(codeActionProvider);

        // Register inline suggestions provider
    const inlineSuggestions = vscode.languages.registerInlineCompletionItemProvider(
        'phicode',
        new PhicodeInlineSuggestions()
    );
    context.subscriptions.push(inlineSuggestions);

        // Register hover provider
    const hoverProvider = vscode.languages.registerHoverProvider(
        'phicode',
        new PhicodeHoverProvider()
    );
    context.subscriptions.push(hoverProvider);

    const formatter = vscode.languages.registerDocumentFormattingEditProvider(
        'phicode',
        new PhicodeFormatter()
    );
    context.subscriptions.push(formatter);

        // Activate copilot config
    activateCopilotConfig(context);

        // Register Rename Provider for PHICODE language
    context.subscriptions.push(
        vscode.languages.registerRenameProvider('phicode', new PhicodeRenameProvider())
    );

    // Setup linter
    const linter = new PhicodeLinter();
    context.subscriptions.push(linter);

    // Run linter on document open, change, save for phicode

    vscode.workspace.onDidOpenTextDocument(doc => {
        if (doc.languageId === 'phicode') {
            linter.runLint(doc);
        }
    });
    vscode.workspace.onDidChangeTextDocument(event => {
        if (event.document.languageId === 'phicode') {
            linter.runLint(event.document);
        }
    });
    vscode.workspace.onDidSaveTextDocument(doc => {
        if (doc.languageId === 'phicode') {
            linter.runLint(doc);
        }
    });

    // And also restrict the initial lint run on open documents:
    vscode.workspace.textDocuments.forEach(doc => {
        if (doc.languageId === 'phicode') {
            linter.runLint(doc);
        }
    });


    // Register tutorial command
    const tutorialCmd = vscode.commands.registerCommand('phicode.showTutorial', () => {
        showTutorialPanel(context);
    });
    context.subscriptions.push(tutorialCmd);

    // Show tutorial on first install
    const didShowTutorial = context.globalState.get('didShowTutorial');
    if (!didShowTutorial) {
        showTutorialPanel(context);
        context.globalState.update('didShowTutorial', true);
    }
}

export function deactivate() {}