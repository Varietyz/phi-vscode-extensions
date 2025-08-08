"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
// Symbol mappings for conversion
const pythonToPhicode = {
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
const phicodeToPython = {};
for (const [key, value] of Object.entries(pythonToPhicode)) {
    phicodeToPython[value] = key;
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
function convertPythonToPhicode() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return;
    }
    const document = editor.document;
    const text = document.getText();
    const convertedText = convertText(text, pythonToPhicode);
    // Create new document with .φ extension
    const originalUri = document.uri;
    const newPath = originalUri.fsPath.replace(/\.py$/, '.φ');
    vscode.workspace.openTextDocument({
        content: convertedText,
        language: 'phicode'
    }).then(newDoc => {
        vscode.window.showTextDocument(newDoc);
    });
}
function convertPhicodeToPython() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return;
    }
    const document = editor.document;
    const text = document.getText();
    const convertedText = convertText(text, phicodeToPython);
    // Create new document with .py extension
    vscode.workspace.openTextDocument({
        content: convertedText,
        language: 'python'
    }).then(newDoc => {
        vscode.window.showTextDocument(newDoc);
    });
}
function activate(context) {
    // Register conversion commands
    const convertToPhi = vscode.commands.registerCommand('phicode.convertPythonToPhicode', convertPythonToPhicode);
    const convertToPython = vscode.commands.registerCommand('phicode.convertPhicodeToPython', convertPhicodeToPython);
    context.subscriptions.push(convertToPhi, convertToPython);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map