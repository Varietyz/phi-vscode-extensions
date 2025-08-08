"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.phicodeToPython = exports.pythonToPhicode = void 0;
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const buffer_1 = require("buffer");
const completionProvider_1 = require("./completionProvider");
const inlineSuggestions_1 = require("./inlineSuggestions");
const codeActionProvider_1 = require("./codeActionProvider");
const hoverProvider_1 = require("./hoverProvider");
const formatter_1 = require("./formatter");
const copilotConfig_1 = require("./copilotConfig");
const refactorProvider_1 = require("./refactorProvider");
const linter_1 = require("./linter");
const tutorials_1 = require("./tutorials");
// Symbol mappings for conversion
exports.pythonToPhicode = {
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
exports.phicodeToPython = {};
for (const [key, value] of Object.entries(exports.pythonToPhicode)) {
    exports.phicodeToPython[value] = key;
}
function convertText(text, mapping) {
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
    if (!editor)
        return;
    const document = editor.document;
    if (document.languageId !== 'python')
        return;
    // Get new URI with .φ extension
    const newUri = document.uri.with({
        path: document.uri.path.replace(/\.py$/i, '.φ')
    });
    // Convert content
    const convertedText = convertText(document.getText(), exports.pythonToPhicode);
    // Save the original view column to reopen in same position
    const viewColumn = editor.viewColumn;
    // Close original file before rename to avoid conflicts
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    // Write new file with correct extension and content
    await vscode.workspace.fs.writeFile(newUri, buffer_1.Buffer.from(convertedText));
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
    if (!editor)
        return;
    const document = editor.document;
    if (document.languageId !== 'phicode')
        return;
    // Get new URI with .py extension
    const newUri = document.uri.with({
        path: document.uri.path.replace(/\.φ$/i, '.py')
    });
    // Convert content
    const convertedText = convertText(document.getText(), exports.phicodeToPython);
    // Save the original view column
    const viewColumn = editor.viewColumn;
    // Close original file
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    // Write new file
    await vscode.workspace.fs.writeFile(newUri, buffer_1.Buffer.from(convertedText));
    // Delete original file
    await vscode.workspace.fs.delete(document.uri);
    // Open new file
    const newDoc = await vscode.workspace.openTextDocument(newUri);
    await vscode.window.showTextDocument(newDoc, viewColumn);
    // Set to Python language mode
    await vscode.languages.setTextDocumentLanguage(newDoc, 'python');
}
function activate(context) {
    // Register conversion commands
    const convertToPhi = vscode.commands.registerCommand('phicode.convertPythonToPhicode', convertPythonToPhicode);
    const convertToPython = vscode.commands.registerCommand('phicode.convertPhicodeToPython', convertPhicodeToPython);
    context.subscriptions.push(convertToPhi, convertToPython);
    const completionProvider = vscode.languages.registerCompletionItemProvider('phicode', new completionProvider_1.PhicodeCompletionProvider(), '.', // trigger characters
    ' ' // space can trigger completions too
    );
    context.subscriptions.push(completionProvider);
    // Register code actions for auto-conversion
    const codeActionProvider = vscode.languages.registerCodeActionsProvider('phicode', new codeActionProvider_1.PhicodeCodeActionProvider(), { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] });
    context.subscriptions.push(codeActionProvider);
    // Register inline suggestions provider
    const inlineSuggestions = vscode.languages.registerInlineCompletionItemProvider('phicode', new inlineSuggestions_1.PhicodeInlineSuggestions());
    context.subscriptions.push(inlineSuggestions);
    // Register hover provider
    const hoverProvider = vscode.languages.registerHoverProvider('phicode', new hoverProvider_1.PhicodeHoverProvider());
    context.subscriptions.push(hoverProvider);
    const formatter = vscode.languages.registerDocumentFormattingEditProvider('phicode', new formatter_1.PhicodeFormatter());
    context.subscriptions.push(formatter);
    // Activate copilot config
    (0, copilotConfig_1.activateCopilotConfig)(context);
    // Register Rename Provider for PHICODE language
    context.subscriptions.push(vscode.languages.registerRenameProvider('phicode', new refactorProvider_1.PhicodeRenameProvider()));
    // Setup linter
    const linter = new linter_1.PhicodeLinter();
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
        (0, tutorials_1.showTutorialPanel)(context);
    });
    context.subscriptions.push(tutorialCmd);
    // Show tutorial on first install
    const didShowTutorial = context.globalState.get('didShowTutorial');
    if (!didShowTutorial) {
        (0, tutorials_1.showTutorialPanel)(context);
        context.globalState.update('didShowTutorial', true);
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map