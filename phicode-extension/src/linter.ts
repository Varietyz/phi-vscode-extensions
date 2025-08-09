import * as vscode from 'vscode';
import { pythonToPhicode } from './extension';

interface LintContext {
    inAsyncFunction: boolean;
    inFunction: boolean;
    inLoop: boolean;
    inTryBlock: boolean;
    blockStack: Array<{
        type: 'class' | 'function' | 'if' | 'for' | 'while' | 'try' | 'with';
        line: number;
        indentLevel: number;
    }>;
}

export class PhicodeLinter {
    private diagnosticCollection: vscode.DiagnosticCollection;
    private lintTimeouts: Map<string, NodeJS.Timeout> = new Map();
    private readonly LINT_DEBOUNCE_MS = 500; // Wait 500ms after last change
    private readonly SAVE_LINT_DELAY_MS = 100; // Quick lint on save

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('phicode-linter');
    }

    public runLint(document: vscode.TextDocument, immediate: boolean = false) {
        if (document.languageId !== 'phicode') {
            this.clearDiagnosticsForDoc(document);
            return;
        }

        const uri = document.uri.toString();
        
        // Clear existing timeout
        if (this.lintTimeouts.has(uri)) {
            clearTimeout(this.lintTimeouts.get(uri)!);
        }

        // Set up debounced linting
        const delay = immediate ? this.SAVE_LINT_DELAY_MS : this.LINT_DEBOUNCE_MS;
        const timeout = setTimeout(() => {
            this.performLint(document);
            this.lintTimeouts.delete(uri);
        }, delay);

        this.lintTimeouts.set(uri, timeout);
    }

    private performLint(document: vscode.TextDocument) {
        const diagnostics: vscode.Diagnostic[] = [];
        const untranslatedKeywordsFound = new Set<string>();
        const context = this.initializeContext();

        for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
            const line = document.lineAt(lineIndex);
            const text = line.text;
            const trimmedText = text.trim();

            // Skip empty lines and comments for context tracking
            if (trimmedText === '' || trimmedText.startsWith('#')) {
                continue;
            }

            // Update context tracking
            this.updateContext(context, text, lineIndex);

            // Find untranslated Python keywords
            this.checkUntranslatedKeywords(text, untranslatedKeywordsFound);

            // Apply linting rules
            this.applyLintingRules(text, trimmedText, lineIndex, context, diagnostics);
        }

        // Add untranslated keywords diagnostic
        if (untranslatedKeywordsFound.size > 0) {
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(0, 0, 0, 0),
                `Untranslated Python keywords: ${Array.from(untranslatedKeywordsFound).join(', ')}`,
                vscode.DiagnosticSeverity.Information
            ));
        }

        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    private initializeContext(): LintContext {
        return {
            inAsyncFunction: false,
            inFunction: false,
            inLoop: false,
            inTryBlock: false,
            blockStack: []
        };
    }

    private checkUntranslatedKeywords(text: string, untranslatedKeywordsFound: Set<string>) {
        Object.keys(pythonToPhicode).forEach(kw => {
            let searchStart = 0;
            while (true) {
                const idx = text.indexOf(kw, searchStart);
                if (idx === -1) break;

                // Check word boundaries for alphabetic keywords
                const isAlphabetic = /^[a-zA-Z]/.test(kw);
                const validMatch = isAlphabetic ? this.isWordBoundary(text, idx, kw) : true;

                if (validMatch && !this.isInsideStringOrComment(text, idx)) {
                    untranslatedKeywordsFound.add(kw);
                }

                searchStart = idx + kw.length;
            }
        });
    }

    private isWordBoundary(text: string, index: number, keyword: string): boolean {
        const before = index > 0 ? text[index - 1] : null;
        const after = index + keyword.length < text.length ? text[index + keyword.length] : null;
        
        const isWordChar = (char: string | null) => char && /[a-zA-Z0-9_]/.test(char);
        
        return !isWordChar(before) && !isWordChar(after);
    }

    private applyLintingRules(
        text: string, 
        trimmedText: string, 
        lineIndex: number, 
        context: LintContext, 
        diagnostics: vscode.Diagnostic[]
    ) {
        // Rule 1: Function declaration validation
        if (trimmedText.includes('ƒ')) {
            this.validateFunctionDeclaration(text, lineIndex, diagnostics);
        }

        // Rule 2: Import statement validation
        if (trimmedText.startsWith('⇒') || trimmedText.startsWith('←')) {
            this.validateImportStatement(text, lineIndex, diagnostics);
        }

        // Rule 3: For loops must include membership operator
        if (text.includes('∀')) {
            this.validateForLoop(text, lineIndex, diagnostics);
        }

        // Rule 4: Await requires async context
        if (text.includes('⌛') && !context.inAsyncFunction) {
            this.addSymbolDiagnostic(text, '⌛', lineIndex, 
                '⌛ await must be used inside async functions (⟳ ƒ)',
                vscode.DiagnosticSeverity.Error, diagnostics);
        }

        // Rule 5: Break/continue require loop context
        if ((text.includes('⇲') || text.includes('⇉')) && !context.inLoop) {
            const symbol = text.includes('⇲') ? '⇲' : '⇉';
            this.addSymbolDiagnostic(text, symbol, lineIndex,
                `${symbol} must be used inside loops (∀ or ↻)`,
                vscode.DiagnosticSeverity.Error, diagnostics);
        }

        // Rule 6: Lambda expression validation
        if (text.includes('λ')) {
            this.validateLambdaExpression(text, lineIndex, diagnostics);
        }

        // Rule 7: Boolean value usage validation
        ['⊥', '✓', 'Ø'].forEach(sym => {
            this.validateBooleanUsage(text, sym, lineIndex, diagnostics);
        });
    }

    private validateFunctionDeclaration(text: string, lineIndex: number, diagnostics: vscode.Diagnostic[]) {
        const funcPattern = /(⟳\s*)?ƒ\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/;
        const match = text.match(funcPattern);
        
        if (!match) {
            const idx = text.indexOf('ƒ');
            if (!this.isInsideStringOrComment(text, idx)) {
                diagnostics.push(this.createDiagnostic(
                    lineIndex, idx, idx + 1,
                    'Function declaration: "ƒ name(params)" or "⟳ ƒ name(params)"',
                    vscode.DiagnosticSeverity.Error
                ));
            }
        }
    }

    private validateImportStatement(text: string, lineIndex: number, diagnostics: vscode.Diagnostic[]) {
        const patterns = [
            /^⇒\s+[a-zA-Z_][\w.]*\s*(↦\s*[a-zA-Z_][\w]*)?\s*$/,  // import module [as alias]
            /^←\s+[a-zA-Z_][\w.]*\s+⇒\s*[a-zA-Z_][\w]*(?:\s*,\s*[a-zA-Z_][\w]*)*\s*$/,  // from module import name1, name2
            /^←\s+[a-zA-Z_][\w.]*\s+⇒\s*\(\s*[\s\S]*?\s*\)\s*$/  // from module import (name1, name2)
        ];

        const isValid = patterns.some(pattern => pattern.test(text.trim()));

        if (!isValid) {
            const idx = text.includes('⇒') ? text.indexOf('⇒') : text.indexOf('←');
            if (!this.isInsideStringOrComment(text, idx)) {
                diagnostics.push(this.createDiagnostic(
                    lineIndex, idx, idx + 1,
                    'Valid imports: "⇒ module", "← module ⇒ name1, name2", or "← module ⇒ (name1, name2)"',
                    vscode.DiagnosticSeverity.Error
                ));
            }
        }
    }

    private validateForLoop(text: string, lineIndex: number, diagnostics: vscode.Diagnostic[]) {
        const idx = text.indexOf('∀');
        if (this.isInsideStringOrComment(text, idx)) return;

        const forallLoopPattern = /∀\s*[^∈]*∈/;
        const isListCompOrCond = text.includes('[') || text.includes('¿');

        if (!forallLoopPattern.test(text) && !isListCompOrCond) {
            diagnostics.push(this.createDiagnostic(
                lineIndex, idx, idx + 1,
                '∀ loops must include ∈ membership operator (e.g., "∀ item ∈ iterable")',
                vscode.DiagnosticSeverity.Error
            ));
        }
    }

    private validateLambdaExpression(text: string, lineIndex: number, diagnostics: vscode.Diagnostic[]) {
        const idx = text.indexOf('λ');
        if (this.isInsideStringOrComment(text, idx)) return;

        const afterLambda = text.slice(idx + 1).trimStart();
        const lambdaParamPattern = /^(\([^\)]*\)|[^\s():]+)\s*:/;

        if (!lambdaParamPattern.test(afterLambda)) {
            diagnostics.push(this.createDiagnostic(
                lineIndex, idx, idx + 1,
                'λ must be followed by parameters and colon (e.g., "λ e: x*2" or "λ(x): x*2")',
                vscode.DiagnosticSeverity.Error
            ));
        }
    }

    private validateBooleanUsage(text: string, symbol: string, lineIndex: number, diagnostics: vscode.Diagnostic[]) {
        let searchIndex = 0;
        while (true) {
            const idx = text.indexOf(symbol, searchIndex);
            if (idx === -1) break;

            if (!this.isInsideStringOrComment(text, idx)) {
                const before = idx > 0 ? text[idx - 1] : null;
                const after = idx < text.length - 1 ? text[idx + 1] : null;
                
                if (!this.isCharWordBoundary(before) || !this.isCharWordBoundary(after)) {
                    diagnostics.push(this.createDiagnostic(
                        lineIndex, idx, idx + 1,
                        `${symbol} should be used as a standalone value, not in identifiers`,
                        vscode.DiagnosticSeverity.Warning
                    ));
                }
            }

            searchIndex = idx + 1;
        }
    }

    private addSymbolDiagnostic(
        text: string, 
        symbol: string, 
        lineIndex: number, 
        message: string,
        severity: vscode.DiagnosticSeverity,
        diagnostics: vscode.Diagnostic[]
    ) {
        const idx = text.indexOf(symbol);
        if (idx !== -1 && !this.isInsideStringOrComment(text, idx)) {
            diagnostics.push(this.createDiagnostic(lineIndex, idx, idx + 1, message, severity));
        }
    }

    private updateContext(context: LintContext, text: string, lineIndex: number) {
        const trimmed = text.trim();
        const currentIndent = text.length - text.trimStart().length;

        // Handle block ending by indentation
        while (context.blockStack.length > 0 && 
               currentIndent <= context.blockStack[context.blockStack.length - 1].indentLevel &&
               !this.isContinuationKeyword(trimmed)) {
            const poppedBlock = context.blockStack.pop()!;
            
            // Update context flags when exiting blocks
            switch (poppedBlock.type) {
                case 'function':
                    context.inFunction = context.blockStack.some(b => b.type === 'function');
                    context.inAsyncFunction = context.blockStack.some(b => b.type === 'function') && 
                                            context.inAsyncFunction; // Need better async tracking
                    break;
                case 'for':
                case 'while':
                    context.inLoop = context.blockStack.some(b => b.type === 'for' || b.type === 'while');
                    break;
                case 'try':
                    context.inTryBlock = context.blockStack.some(b => b.type === 'try');
                    break;
            }
        }

        // Check for new blocks
        if (this.startsNewBlock(trimmed)) {
            const blockType = this.getBlockType(trimmed);
            const nextIndent = currentIndent + 4; // Assume 4-space indentation

            context.blockStack.push({
                type: blockType,
                line: lineIndex,
                indentLevel: nextIndent
            });

            // Update context flags
            switch (blockType) {
                case 'function':
                    context.inFunction = true;
                    if (text.includes('⟳')) {
                        context.inAsyncFunction = true;
                    }
                    break;
                case 'for':
                case 'while':
                    context.inLoop = true;
                    break;
                case 'try':
                    context.inTryBlock = true;
                    break;
            }
        }
    }

    private startsNewBlock(line: string): boolean {
        return line.match(/:\s*(?:#.*)?$/) !== null;
    }

    private isContinuationKeyword(line: string): boolean {
        return line.match(/^(⤷|⋄|⛒|⇗)/) !== null; // elif, else, except, finally
    }

    private getBlockType(line: string): 'class' | 'function' | 'if' | 'for' | 'while' | 'try' | 'with' {
        if (line.match(/^ℂ\s+/)) return 'class';
        if (line.match(/^⟳?\s*ƒ\s+/)) return 'function';
        if (line.match(/^¿/)) return 'if';
        if (line.match(/^∀/)) return 'for';
        if (line.match(/^↻/)) return 'while';
        if (line.match(/^∴/)) return 'try';
        return 'with'; // fallback
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

    private isCharWordBoundary(char: string | null): boolean {
        return char === null || !/[a-zA-Z0-9_]/.test(char);
    }

    private isInsideStringOrComment(lineText: string, index: number): boolean {
        // Check if index is after comment start
        const commentIndex = lineText.indexOf('#');
        if (commentIndex !== -1 && index > commentIndex) return true;

        // Enhanced string detection
        let inSingleQuote = false;
        let inDoubleQuote = false;
        let inTripleQuote = false;
        let i = 0;

        while (i < index && i < lineText.length) {
            const char = lineText[i];
            const nextTwoChars = lineText.slice(i, i + 3);

            // Handle escape sequences
            if (char === '\\' && (inSingleQuote || inDoubleQuote)) {
                i += 2; // Skip escaped character
                continue;
            }

            // Handle triple quotes
            if ((nextTwoChars === '"""' || nextTwoChars === "'''") && !inSingleQuote && !inDoubleQuote) {
                if (inTripleQuote && nextTwoChars === (inTripleQuote ? '"""' : "'''")) {
                    inTripleQuote = false;
                    i += 3;
                } else if (!inTripleQuote) {
                    inTripleQuote = nextTwoChars === '"""';
                    i += 3;
                } else {
                    i++;
                }
                continue;
            }

            // Handle single quotes
            if (char === "'" && !inDoubleQuote && !inTripleQuote) {
                inSingleQuote = !inSingleQuote;
            }

            // Handle double quotes
            if (char === '"' && !inSingleQuote && !inTripleQuote) {
                inDoubleQuote = !inDoubleQuote;
            }

            i++;
        }

        return inSingleQuote || inDoubleQuote || inTripleQuote;
    }

    public clearDiagnosticsForDoc(document: vscode.TextDocument) {
        const uri = document.uri.toString();
        
        // Clear any pending timeout
        if (this.lintTimeouts.has(uri)) {
            clearTimeout(this.lintTimeouts.get(uri)!);
            this.lintTimeouts.delete(uri);
        }
        
        this.diagnosticCollection.delete(document.uri);
    }

    public dispose() {
        // Clear all timeouts
        this.lintTimeouts.forEach(timeout => clearTimeout(timeout));
        this.lintTimeouts.clear();
        
        this.diagnosticCollection.dispose();
    }
}