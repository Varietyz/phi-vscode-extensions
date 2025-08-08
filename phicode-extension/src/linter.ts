import * as vscode from 'vscode';
import { pythonToPhicode } from './extension';

export class PhicodeLinter {
    private diagnosticCollection: vscode.DiagnosticCollection;
    private context: {
        inAsyncFunction: boolean;
        inFunction: boolean;
        inLoop: boolean;
        inTryBlock: boolean;
    };

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('phicode-linter');
        this.context = {
            inAsyncFunction: false,
            inFunction: false,
            inLoop: false,
            inTryBlock: false
        };
    }

    public runLint(document: vscode.TextDocument) {
        if (document.languageId !== 'phicode') {
            this.clearDiagnosticsForDoc(document);
            return;
        }

        const diagnostics: vscode.Diagnostic[] = [];
        const untranslatedKeywordsFound = new Set<string>();
        this.resetContext();

        for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
            const line = document.lineAt(lineIndex);
            const text = line.text;
            const trimmedText = text.trim();

            // Update context tracking
            this.updateContext(text);

            // Find untranslated Python keywords
            Object.keys(pythonToPhicode).forEach(kw => {
                let searchStart = 0;
                while (true) {
                    const idx = text.indexOf(kw, searchStart);
                    if (idx === -1) break;

                    if (!this.isInsideStringOrComment(text, idx)) {
                        untranslatedKeywordsFound.add(kw);
                    }

                    searchStart = idx + kw.length;
                }
            });


            // Rule 1: Function declaration must follow pattern: [async?] ƒ name(params)
            if (trimmedText.includes('ƒ')) {
                this.validateFunctionDeclaration(text, lineIndex, diagnostics);
            }

            // Rule 2: Import statements should follow proper patterns
            if (trimmedText.startsWith('⇒') || trimmedText.startsWith('←')) {
                this.validateImportStatement(text, lineIndex, diagnostics);
            }

            // Rule 3: ∀ loops must include ∈ membership operator
            if (text.includes('∀')) {
                const idx = text.indexOf('∀');
                if (this.isInsideStringOrComment(text, idx)) continue;

                // Check if '∀' is followed closely by '∈' somewhere on the line (loop with membership)
                // Use regex to match: '∀' ... '∈'
                const forallLoopPattern = /∀\s*[^∈]*∈/;

                // Also exclude lines that look like list comprehensions or conditionals (containing '[' or '¿')
                const isListCompOrCond = text.includes('[') || text.includes('¿');

                if (!forallLoopPattern.test(text) && !isListCompOrCond) {
                    diagnostics.push(this.createDiagnostic(
                        lineIndex, idx, idx + 1,
                        '∀ loops must include ∈ membership operator (e.g., "∀ item ∈ iterable")',
                        vscode.DiagnosticSeverity.Error
                    ));
                }
            }

            // Rule 5: ⌛ (await) requires async context
            if (text.includes('⌛') && !this.context.inAsyncFunction) {
                const idx = text.indexOf('⌛');
                if (this.isInsideStringOrComment(text, idx)) continue;
                diagnostics.push(this.createDiagnostic(
                    lineIndex, idx, idx + 1,
                    '⌛ await must be used inside async functions (⟳ ƒ)',
                    vscode.DiagnosticSeverity.Error
                ));
            }

            // Rule 6: ⇲/⇉ (break/continue) require loop context
            if ((text.includes('⇲') || text.includes('⇉')) && !this.context.inLoop) {
                const symbol = text.includes('⇲') ? '⇲' : '⇉';
                const idx = text.indexOf(symbol);
                if (this.isInsideStringOrComment(text, idx)) continue;
                diagnostics.push(this.createDiagnostic(
                    lineIndex, idx, idx + 1,
                    `${symbol} must be used inside loops (∀ or ↻)`,
                    vscode.DiagnosticSeverity.Error
                ));
            }

            // Rule 7: Lambda expressions must have parameters and colon
            if (text.includes('λ')) {
                const idx = text.indexOf('λ');
                if (this.isInsideStringOrComment(text, idx)) continue;

                const afterLambda = text.slice(idx + 1).trimStart();

                // Regex to check if:
                // - either a single identifier followed by colon, e.g. `e:`
                // - or parentheses with params followed by colon, e.g. `(x):`
                const lambdaParamPattern = /^(\([^\)]*\)|[^\s():]+)\s*:/;

                if (!lambdaParamPattern.test(afterLambda)) {
                    diagnostics.push(this.createDiagnostic(
                        lineIndex, idx, idx + 1,
                        'λ must be followed by parameters and colon (e.g., "λ e: x*2" or "λ(x): x*2")',
                        vscode.DiagnosticSeverity.Error
                    ));
                }
            }


            // Rule 8: Boolean values must be used properly
            ['⊥', '✓', 'Ø'].forEach(sym => {
                if (text.includes(sym)) {
                    const idx = text.indexOf(sym);
                    const before = idx > 0 ? text[idx - 1] : null;
                    const after = idx < text.length - 1 ? text[idx + 1] : null;
                    
                    if (!this.isWordBoundary(before) || !this.isWordBoundary(after)) {
                        if (this.isInsideStringOrComment(text, idx)) return;
                        diagnostics.push(this.createDiagnostic(
                            lineIndex, idx, idx + 1,
                            `${sym} should be used as a standalone value, not in identifiers`,
                            vscode.DiagnosticSeverity.Warning
                        ));
                    }
                }
            });

            // Rule 9: Try blocks must have handlers
            if (text.includes('∴')) {
                const idx = text.indexOf('∴');
                if (this.isInsideStringOrComment(text, idx)) continue;

                // Check current line for handlers as well as all following lines till document end
                const hasHandlerCurrentLine = text.includes('⛒') || text.includes('⇗');

                // Calculate remaining lines to check after current line
                const linesToCheck = document.lineCount - lineIndex - 1;

                const hasHandlerNextLines = this.findInFollowingLines(document, lineIndex, linesToCheck, lineText =>
                    lineText.includes('⛒') || lineText.includes('⇗')
                );

                if (!hasHandlerCurrentLine && !hasHandlerNextLines) {
                    diagnostics.push(this.createDiagnostic(
                        lineIndex, idx, idx + 1,
                        '∴ try must be followed by ⛒ except or ⇗ finally',
                        vscode.DiagnosticSeverity.Warning
                    ));
                }
            }
        }

        // Rule 10: Untranslated keywords
        if (untranslatedKeywordsFound.size > 0) {
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(0, 0, 0, 0),
                `Untranslated Python keywords: ${Array.from(untranslatedKeywordsFound).join(', ')}`,
                vscode.DiagnosticSeverity.Information
            ));
        }

        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    private validateFunctionDeclaration(text: string, lineIndex: number, diagnostics: vscode.Diagnostic[]) {
        const funcPattern = /(⟳\s*)?ƒ\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/;
        const match = text.match(funcPattern);
        
        if (!match) {
            const idx = text.indexOf('ƒ');
            if (this.isInsideStringOrComment(text, idx)) return;
            diagnostics.push(this.createDiagnostic(
                lineIndex, idx, idx + 1,
                'Function declaration: "ƒ name(params)" or "⟳ ƒ name(params)"',
                vscode.DiagnosticSeverity.Error
            ));
        }
    }

    private validateImportStatement(text: string, lineIndex: number, diagnostics: vscode.Diagnostic[]) {
        const standaloneImport = /^⇒\s+[a-zA-Z_][\w.]*\s*(↦\s*[a-zA-Z_][\w]*)?\s*$/m;

        // Named imports WITHOUT parentheses, comma-separated
        const namedImportWithoutParens = /^←\s+[a-zA-Z_][\w.]*\s+⇒\s*[a-zA-Z_][\w]*(?:\s*,\s*[a-zA-Z_][\w]*)*\s*$/m;

        // Named imports WITH parentheses, multiline allowed
        const namedImportWithParens = /^←\s+[a-zA-Z_][\w.]*\s+⇒\s*\(\s*([\s\S]*?)\s*\)\s*$/m;

        if (
        text.includes('⇒') &&
        !standaloneImport.test(text) &&
        !namedImportWithoutParens.test(text) &&
        !namedImportWithParens.test(text)
        ) {
        const idx = text.indexOf('⇒');
        if (this.isInsideStringOrComment(text, idx)) return;
        diagnostics.push(this.createDiagnostic(
            lineIndex, idx, idx + 1,
            'Valid imports: "⇒ module", "← module ⇒ name1, name2", or "← module ⇒ (name1, name2)"',
            vscode.DiagnosticSeverity.Error
        ));
        }
    }

    private createDiagnostic(
        line: number, 
        startChar: number, 
        endChar: number,
        message: string,
        severity: vscode.DiagnosticSeverity
    ): vscode.Diagnostic {
        const range = new vscode.Range(
            new vscode.Position(line, startChar),
            new vscode.Position(line, endChar)
        );
        return new vscode.Diagnostic(range, message, severity);
    }

    private updateContext(text: string) {
        // Reset context at empty lines
        if (text.trim() === '') {
            this.context.inFunction = false;
            this.context.inAsyncFunction = false;
            this.context.inLoop = false;
            this.context.inTryBlock = false;
            return;
        }

        // Check for function declarations
        if (text.includes('ƒ')) {
            this.context.inFunction = true;
            this.context.inAsyncFunction = text.includes('⟳');
        }
        
        // Check for loops
        if (text.includes('∀') || text.includes('↻')) {
            this.context.inLoop = true;
        }
        
        // Check for try blocks
        if (text.includes('∴')) {
            this.context.inTryBlock = true;
        }
        
        // End of blocks (simplified)
        if (text.includes('⟲') || text.includes('⇗') || text.includes('⛒')) {
            this.context.inFunction = false;
            this.context.inAsyncFunction = false;
            this.context.inLoop = false;
            this.context.inTryBlock = false;
        }
    }

    private resetContext() {
        this.context = {
            inAsyncFunction: false,
            inFunction: false,
            inLoop: false,
            inTryBlock: false
        };
    }

    private findInFollowingLines(
        document: vscode.TextDocument,
        startLine: number, 
        lineCount: number,
        predicate: (text: string) => boolean
    ): boolean {
        const endLine = Math.min(startLine + lineCount + 1, document.lineCount);
        
        for (let i = startLine + 1; i < endLine; i++) {
            if (predicate(document.lineAt(i).text)) {
                return true;
            }
        }
        return false;
    }

    private wordBoundaryMatch(text: string, word: string): boolean {
        return new RegExp(`\\b${word}\\b`).test(text);
    }

    private isWordBoundary(char: string | null): boolean {
        return char === null || !/[a-zA-Z0-9_]/.test(char);
    }

    private isInsideStringOrComment(lineText: string, index: number): boolean {
        // Check if index is after comment start
        const commentIndex = lineText.indexOf('#');
        if (commentIndex !== -1 && index > commentIndex) return true;

        // Simple string check: count quotes before index, if odd => inside string
        const before = lineText.slice(0, index);
        const singleQuotes = (before.match(/'/g) || []).length;
        const doubleQuotes = (before.match(/"/g) || []).length;

        if ((singleQuotes % 2) === 1 || (doubleQuotes % 2) === 1) return true;

        return false;
    }

    
    public clearDiagnosticsForDoc(document: vscode.TextDocument) {
        this.diagnosticCollection.delete(document.uri);
    }

    public dispose() {
        this.diagnosticCollection.dispose();
    }
}