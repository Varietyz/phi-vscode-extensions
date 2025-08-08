import * as vscode from 'vscode';
import { pythonToPhicode } from './extension';

const symbolDocumentation: Record<string, string> = {
    'ƒ': 'Function definition (equivalent to Python "def")',
    'ℂ': 'Class definition (equivalent to Python "class")',
    '¿': 'If statement (equivalent to Python "if")',
    '⤷': 'Else if (equivalent to Python "elif")',
    '⋄': 'Else (equivalent to Python "else")',
    '∀': 'For loop (equivalent to Python "for")',
    '∈': 'Membership test (equivalent to Python "in")',
    '↻': 'While loop (equivalent to Python "while")',
    '⇲': 'Break (equivalent to Python "break")',
    '⇉': 'Continue (equivalent to Python "continue")',
    '⟲': 'Return (equivalent to Python "return")',
    '⟰': 'Yield (equivalent to Python "yield")',
    '↑': 'Raise exception (equivalent to Python "raise")',
    '∴': 'Try block (equivalent to Python "try")',
    '⛒': 'Except block (equivalent to Python "except")',
    '⇗': 'Finally block (equivalent to Python "finally")',
    '∥': 'With statement (equivalent to Python "with")',
    '↦': 'As assignment (equivalent to Python "as")',
    '⇒': 'Import (equivalent to Python "import")',
    '←': 'From import (equivalent to Python "from")',
    '✓': 'Boolean True (equivalent to Python "True")',
    '⊥': 'Boolean False (equivalent to Python "False")',
    'Ø': 'None value (equivalent to Python "None")',
    '∧': 'Logical AND (equivalent to Python "and")',
    '∨': 'Logical OR (equivalent to Python "or")',
    '¬': 'Logical NOT (equivalent to Python "not")',
    '≡': 'Identity test (equivalent to Python "is")',
    'λ': 'Lambda function (equivalent to Python "lambda")',
    '∂': 'Delete (equivalent to Python "del")',
    '⟁': 'Global declaration (equivalent to Python "global")',
    '∇': 'Nonlocal declaration (equivalent to Python "nonlocal")',
    '‼': 'Assert (equivalent to Python "assert")',
    '⟳': 'Async (equivalent to Python "async")',
    '⌛': 'Await (equivalent to Python "await")',
    '⋯': 'Pass (equivalent to Python "pass")',
    'π': 'Print (equivalent to Python "print")'
};

export class PhicodeHoverProvider implements vscode.HoverProvider {
    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        const wordRange = document.getWordRangeAtPosition(position, /[⊥Ø✓∧↦‼⟳⌛⇲ℂ⇉ƒ∂⤷⋄⛒⇗∀←⟁¿⇒∈≡λ∇¬∨⋯↑⟲∴↻∥⟰π]/);
        if (!wordRange) return null;
        
        const symbol = document.getText(wordRange);
        if (!symbolDocumentation[symbol]) return null;
        
        const markdown = new vscode.MarkdownString();
        markdown.appendMarkdown(`### PHICODE Symbol: \`${symbol}\`\n\n`);
        markdown.appendMarkdown(`${symbolDocumentation[symbol]}\n\n`);
        
        // Find Python equivalent
        for (const [py, sym] of Object.entries(pythonToPhicode)) {
            if (sym === symbol) {
                markdown.appendMarkdown(`**Python equivalent**: \`${py}\``);
                break;
            }
        }
        
        return new vscode.Hover(markdown);
    }
}