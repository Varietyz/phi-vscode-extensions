import * as vscode from 'vscode';
import { pythonToPhicode } from './extension';

interface FormattingConfig {
    indentSize: number;
    useSpaces: boolean;
    maxLineLength: number;
    insertFinalNewline: boolean;
    trimTrailingWhitespace: boolean;
    spaceAroundOperators: boolean;
    spaceAfterCommas: boolean;
    blankLinesAroundClasses: number;
    blankLinesAroundFunctions: number;
}

interface Token {
    type: 'keyword' | 'operator' | 'identifier' | 'string' | 'comment' | 'number' | 'punctuation' | 'whitespace';
    value: string;
    start: number;
    end: number;
}

interface BlockContext {
    type: 'module' | 'class' | 'function' | 'if' | 'for' | 'while' | 'try' | 'with';
    indentLevel: number;
    hasContent: boolean;
}

export class PhicodeFormatter implements vscode.DocumentFormattingEditProvider {
    private config: FormattingConfig;
    
    // Symbol categorization for better formatting
    private readonly SPACE_AFTER_SYMBOLS = ['ƒ', 'ℂ', '¿', '⤷', '⋄', '∀', '↻', '∴', '⛒', '⇗', '∥', '⇒', '←', '⟳', '‼'];
    private readonly SPACE_AROUND_SYMBOLS = ['∧', '∨', '≡', '∈'];
    private readonly NO_SPACE_SYMBOLS = ['¬', 'Ø', '✓', '⊥'];
    private readonly OPERATORS = ['=', '==', '!=', '<', '>', '<=', '>=', '+', '-', '*', '/', '%', '**', '//', 
                                 '+=', '-=', '*=', '/=', '%=', '**=', '//=', '&=', '|=', '^=', '>>=', '<<='];

    constructor() {
        this.config = this.loadConfig();
    }

    provideDocumentFormattingEdits(
        document: vscode.TextDocument
    ): vscode.TextEdit[] {
        this.config = this.loadConfig();
        
        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
        );
        
        const originalText = document.getText(fullRange);
        const formattedText = this.formatPhicodeText(originalText);
        
        if (originalText === formattedText) {
            return [];
        }
        
        return [vscode.TextEdit.replace(fullRange, formattedText)];
    }

    private loadConfig(): FormattingConfig {
        const editorConfig = vscode.workspace.getConfiguration('editor');
        const phicodeConfig = vscode.workspace.getConfiguration('phicode.formatting');
        
        return {
            indentSize: editorConfig.get<number>('tabSize') || 4,
            useSpaces: editorConfig.get<boolean>('insertSpaces') ?? true,
            maxLineLength: (editorConfig.get<number[]>('rulers')?.[0]) || 88,
            insertFinalNewline: editorConfig.get<boolean>('insertFinalNewline') ?? true,
            trimTrailingWhitespace: editorConfig.get<boolean>('trimTrailingWhitespace') ?? true,
            spaceAroundOperators: phicodeConfig.get<boolean>('spaceAroundOperators') ?? true,
            spaceAfterCommas: phicodeConfig.get<boolean>('spaceAfterCommas') ?? true,
            blankLinesAroundClasses: phicodeConfig.get<number>('blankLinesAroundClasses') ?? 2,
            blankLinesAroundFunctions: phicodeConfig.get<number>('blankLinesAroundFunctions') ?? 1,
        };
    }

    private formatPhicodeText(text: string): string {
        const lines = text.split(/\r?\n/);
        const formattedLines = this.formatLines(lines);
        
        let result = formattedLines.join('\n');
        
        if (this.config.insertFinalNewline && !result.endsWith('\n')) {
            result += '\n';
        }
        
        return result;
    }

    private formatLines(lines: string[]): string[] {
        const result: string[] = [];
        const blockStack: BlockContext[] = [{ type: 'module', indentLevel: 0, hasContent: false }];
        let previousLineType: 'class' | 'function' | 'import' | 'comment' | 'code' | 'empty' = 'empty';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            
            if (trimmedLine === '') {
                result.push('');
                previousLineType = 'empty';
                continue;
            }
            
            // Update block context
            this.updateBlockContext(blockStack, trimmedLine);
            
            const currentIndentLevel = this.getCurrentIndentLevel(blockStack);
            const lineType = this.getLineType(trimmedLine);
            const formattedLine = this.formatSingleLine(trimmedLine, currentIndentLevel, lineType);
            
            // Handle blank lines
            this.addBlankLines(result, previousLineType, lineType, currentIndentLevel);
            
            result.push(formattedLine);
            previousLineType = lineType;
            
            // Mark current block as having content
            if (blockStack.length > 0) {
                blockStack[blockStack.length - 1].hasContent = true;
            }
        }
        
        return this.cleanupLines(result);
    }

    private tokenizeLine(line: string): Token[] {
        const tokens: Token[] = [];
        let i = 0;
        
        while (i < line.length) {
            const char = line[i];
            
            // Skip whitespace (we'll handle it separately)
            if (/\s/.test(char)) {
                const start = i;
                while (i < line.length && /\s/.test(line[i])) i++;
                tokens.push({
                    type: 'whitespace',
                    value: line.substring(start, i),
                    start,
                    end: i
                });
                continue;
            }
            
            // Comments
            if (char === '#') {
                tokens.push({
                    type: 'comment',
                    value: line.substring(i),
                    start: i,
                    end: line.length
                });
                break;
            }
            
            // Strings
            if (char === '"' || char === "'" || char === '`') {
                const quote = char;
                const start = i;
                i++; // Skip opening quote
                
                // Handle triple quotes
                const isTriple = i + 1 < line.length && line[i] === quote && line[i + 1] === quote;
                if (isTriple) i += 2;
                
                while (i < line.length) {
                    if (line[i] === '\\') {
                        i += 2; // Skip escaped character
                    } else if (isTriple) {
                        if (i + 2 < line.length && line.substring(i, i + 3) === quote.repeat(3)) {
                            i += 3;
                            break;
                        }
                        i++;
                    } else if (line[i] === quote) {
                        i++;
                        break;
                    } else {
                        i++;
                    }
                }
                
                tokens.push({
                    type: 'string',
                    value: line.substring(start, i),
                    start,
                    end: i
                });
                continue;
            }
            
            // Numbers
            if (/\d/.test(char)) {
                const start = i;
                while (i < line.length && /[\d._]/.test(line[i])) i++;
                tokens.push({
                    type: 'number',
                    value: line.substring(start, i),
                    start,
                    end: i
                });
                continue;
            }
            
            // PHICODE symbols and operators
            const symbolMatch = this.findSymbolAt(line, i);
            if (symbolMatch) {
                const symbolType = this.isPhicodeKeyword(symbolMatch) ? 'keyword' : 'operator';
                tokens.push({
                    type: symbolType,
                    value: symbolMatch,
                    start: i,
                    end: i + symbolMatch.length
                });
                i += symbolMatch.length;
                continue;
            }
            
            // Multi-character operators
            const operatorMatch = this.findOperatorAt(line, i);
            if (operatorMatch) {
                tokens.push({
                    type: 'operator',
                    value: operatorMatch,
                    start: i,
                    end: i + operatorMatch.length
                });
                i += operatorMatch.length;
                continue;
            }
            
            // Punctuation
            if (/[()[\]{},.:;]/.test(char)) {
                tokens.push({
                    type: 'punctuation',
                    value: char,
                    start: i,
                    end: i + 1
                });
                i++;
                continue;
            }
            
            // Identifiers (letters, numbers, underscores)
            if (/[a-zA-Z_]/.test(char)) {
                const start = i;
                while (i < line.length && /[a-zA-Z0-9_]/.test(line[i])) i++;
                tokens.push({
                    type: 'identifier',
                    value: line.substring(start, i),
                    start,
                    end: i
                });
                continue;
            }
            
            // Single character fallback
            tokens.push({
                type: 'operator',
                value: char,
                start: i,
                end: i + 1
            });
            i++;
        }
        
        return tokens;
    }

    private findSymbolAt(line: string, index: number): string | null {
        // Sort symbols by length (longest first) for proper matching
        const allSymbols = [
            ...this.SPACE_AFTER_SYMBOLS,
            ...this.SPACE_AROUND_SYMBOLS,
            ...this.NO_SPACE_SYMBOLS
        ].sort((a, b) => b.length - a.length);
        
        for (const symbol of allSymbols) {
            if (line.substring(index, index + symbol.length) === symbol) {
                return symbol;
            }
        }
        return null;
    }

    private findOperatorAt(line: string, index: number): string | null {
        // Sort operators by length (longest first)
        const sortedOperators = this.OPERATORS.sort((a, b) => b.length - a.length);
        
        for (const op of sortedOperators) {
            if (line.substring(index, index + op.length) === op) {
                return op;
            }
        }
        return null;
    }

    private isPhicodeKeyword(symbol: string): boolean {
        return this.SPACE_AFTER_SYMBOLS.includes(symbol) || 
               this.SPACE_AROUND_SYMBOLS.includes(symbol) ||
               this.NO_SPACE_SYMBOLS.includes(symbol);
    }

    private updateBlockContext(blockStack: BlockContext[], line: string) {
        const trimmed = line.trim();
        
        // Handle dedentation - check if we need to pop blocks
        const currentIndent = line.length - line.trimStart().length;
        while (blockStack.length > 1 && currentIndent <= blockStack[blockStack.length - 1].indentLevel) {
            // Check if this is a continuation keyword that shouldn't pop the block
            if (this.isContinuationKeyword(trimmed)) {
                break;
            }
            blockStack.pop();
        }
        
        // Handle new blocks
        if (this.startsNewBlock(trimmed)) {
            const blockType = this.getBlockType(trimmed);
            const nextIndent = currentIndent + this.config.indentSize;
            blockStack.push({
                type: blockType,
                indentLevel: nextIndent,
                hasContent: false
            });
        }
        
        // Handle continuation keywords (elif, else, except, finally)
        if (this.isContinuationKeyword(trimmed)) {
            // These should be at the same level as their parent block
            if (blockStack.length > 1) {
                blockStack[blockStack.length - 1].indentLevel = blockStack[blockStack.length - 2].indentLevel + this.config.indentSize;
            }
        }
    }

    private startsNewBlock(line: string): boolean {
        // Lines ending with colon typically start new blocks
        if (line.match(/:\s*(?:#.*)?$/)) {
            return true;
        }
        return false;
    }

    private isContinuationKeyword(line: string): boolean {
        return line.match(/^(⤷|⋄|⛒|⇗)/) !== null; // elif, else, except, finally
    }

    private getBlockType(line: string): BlockContext['type'] {
        if (line.match(/^ℂ\s+/)) return 'class';
        if (line.match(/^⟳?\s*ƒ\s+/)) return 'function';
        if (line.match(/^¿/)) return 'if';
        if (line.match(/^∀/)) return 'for';
        if (line.match(/^↻/)) return 'while';
        if (line.match(/^∴/)) return 'try';
        if (line.match(/^∥/)) return 'with';
        return 'module';
    }

    private getCurrentIndentLevel(blockStack: BlockContext[]): number {
        if (blockStack.length === 0) return 0;
        return blockStack[blockStack.length - 1].indentLevel;
    }

    private getLineType(line: string): 'class' | 'function' | 'import' | 'comment' | 'code' | 'empty' {
        if (line === '') return 'empty';
        if (line.startsWith('#')) return 'comment';
        if (line.match(/^ℂ\s+/)) return 'class';
        if (line.match(/^⟳?\s*ƒ\s+/)) return 'function';
        if (line.match(/^[⇒←]/)) return 'import';
        return 'code';
    }

    private formatSingleLine(line: string, indentLevel: number, lineType: string): string {
        const tokens = this.tokenizeLine(line);
        const formattedTokens = this.formatTokens(tokens);
        const formattedContent = this.reconstructLine(formattedTokens);
        
        // Handle line length
        const wrappedContent = this.handleLineLength(formattedContent, indentLevel);
        
        // Apply indentation
        const indentString = this.config.useSpaces 
            ? ' '.repeat(indentLevel)
            : '\t'.repeat(Math.floor(indentLevel / this.config.indentSize));
        
        return indentString + wrappedContent.trimEnd();
    }

    private formatTokens(tokens: Token[]): Token[] {
        const formatted: Token[] = [];
        
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const prev = i > 0 ? tokens[i - 1] : null;
            const next = i < tokens.length - 1 ? tokens[i + 1] : null;
            
            // Skip original whitespace - we'll add our own
            if (token.type === 'whitespace') {
                continue;
            }
            
            // Add spacing before token if needed
            const spaceBefore = this.shouldAddSpaceBefore(token, prev);
            if (spaceBefore && formatted.length > 0) {
                formatted.push({
                    type: 'whitespace',
                    value: ' ',
                    start: token.start,
                    end: token.start
                });
            }
            
            // Add the token
            formatted.push(token);
            
            // Add spacing after token if needed
            const spaceAfter = this.shouldAddSpaceAfter(token, next);
            if (spaceAfter && next && next.type !== 'whitespace') {
                formatted.push({
                    type: 'whitespace',
                    value: ' ',
                    start: token.end,
                    end: token.end
                });
            }
        }
        
        return formatted;
    }

    private shouldAddSpaceBefore(token: Token, prev: Token | null): boolean {
        if (!prev || prev.type === 'comment') return false;
        
        // Space around operators
        if (token.type === 'operator' && this.SPACE_AROUND_SYMBOLS.includes(token.value)) {
            return true;
        }
        
        // Space before assignment operators
        if (token.type === 'operator' && this.config.spaceAroundOperators && this.OPERATORS.includes(token.value)) {
            return true;
        }
        
        // No space before punctuation
        if (token.type === 'punctuation' && [',', ':', ';', ')', ']', '}'].includes(token.value)) {
            return false;
        }
        
        // Space after most tokens (except opening punctuation)
        if (prev.type !== 'punctuation' || !['(', '[', '{'].includes(prev.value)) {
            if (token.type === 'keyword' || token.type === 'identifier') {
                return true;
            }
        }
        
        return false;
    }

    private shouldAddSpaceAfter(token: Token, next: Token | null): boolean {
        if (!next || next.type === 'comment') return false;
        
        // Space after keywords that should have space
        if (token.type === 'keyword' && this.SPACE_AFTER_SYMBOLS.includes(token.value)) {
            return true;
        }
        
        // Space around operators
        if (token.type === 'operator' && this.SPACE_AROUND_SYMBOLS.includes(token.value)) {
            return true;
        }
        
        // Space after assignment operators
        if (token.type === 'operator' && this.config.spaceAroundOperators && this.OPERATORS.includes(token.value)) {
            return true;
        }
        
        // Space after commas
        if (token.value === ',' && this.config.spaceAfterCommas) {
            return true;
        }
        
        // Space after colons (except in slices)
        if (token.value === ':' && next.type !== 'punctuation') {
            return true;
        }
        
        // No space for negation operator
        if (this.NO_SPACE_SYMBOLS.includes(token.value)) {
            return false;
        }
        
        return false;
    }

    private reconstructLine(tokens: Token[]): string {
        return tokens.map(token => token.value).join('');
    }

    private handleLineLength(line: string, indentLevel: number): string {
        const indentSize = this.config.useSpaces ? indentLevel : Math.floor(indentLevel / this.config.indentSize);
        const totalLength = indentSize + line.length;
        
        if (totalLength <= this.config.maxLineLength) {
            return line;
        }
        
        // Simple line breaking - could be enhanced
        // For now, just return the original line
        // In a full implementation, you'd break at logical points
        return line;
    }

    private addBlankLines(
        result: string[], 
        previousType: string, 
        currentType: 'class' | 'function' | 'import' | 'comment' | 'code' | 'empty',
        indentLevel: number
    ) {
        if (result.length === 0) return;
        
        // Remove trailing empty lines
        while (result.length > 0 && result[result.length - 1] === '') {
            result.pop();
        }
        
        let blankLinesToAdd = 0;
        
        // Top-level classes and functions need more spacing
        const isTopLevel = indentLevel === 0;
        
        if (currentType === 'class' && previousType !== 'import' && previousType !== 'empty') {
            blankLinesToAdd = isTopLevel ? this.config.blankLinesAroundClasses : 1;
        } else if (currentType === 'function' && previousType !== 'import' && previousType !== 'empty' && previousType !== 'class') {
            blankLinesToAdd = isTopLevel ? this.config.blankLinesAroundFunctions : 1;
        } else if (currentType === 'import' && previousType !== 'import' && previousType !== 'empty') {
            blankLinesToAdd = 1;
        } else if (previousType === 'import' && currentType !== 'import' && currentType !== 'empty') {
            blankLinesToAdd = 1;
        }
        
        for (let i = 0; i < blankLinesToAdd; i++) {
            result.push('');
        }
    }

    private cleanupLines(lines: string[]): string[] {
        const result: string[] = [];
        let consecutiveEmpty = 0;
        
        for (const line of lines) {
            const cleanLine = this.config.trimTrailingWhitespace ? line.trimEnd() : line;
            
            if (cleanLine === '') {
                consecutiveEmpty++;
                if (consecutiveEmpty <= 2) { // Allow max 2 consecutive blank lines
                    result.push(cleanLine);
                }
            } else {
                consecutiveEmpty = 0;
                result.push(cleanLine);
            }
        }
        
        // Remove trailing blank lines
        while (result.length > 0 && result[result.length - 1] === '') {
            result.pop();
        }
        
        return result;
    }
}

// Range formatter with improved logic
export class PhicodeRangeFormatter implements vscode.DocumentRangeFormattingEditProvider {
    private formatter = new PhicodeFormatter();
    
    provideDocumentRangeFormattingEdits(
        document: vscode.TextDocument,
        range: vscode.Range
    ): vscode.TextEdit[] {
        const rangeText = document.getText(range);
        const lines = rangeText.split(/\r?\n/);
        
        // Determine base indentation from context
        const startLine = document.lineAt(range.start.line);
        const baseIndent = startLine.text.length - startLine.text.trimStart().length;
        
        // Format each line while preserving structure
        const formattedLines = lines.map((line, index) => {
            if (line.trim() === '') return '';
            
            const originalIndent = line.length - line.trimStart().length;
            const relativeIndent = Math.max(0, originalIndent - baseIndent);
            
            // Tokenize and format the content
            const tokens = (this.formatter as any).tokenizeLine(line.trim());
            const formattedTokens = (this.formatter as any).formatTokens(tokens);
            const formattedContent = (this.formatter as any).reconstructLine(formattedTokens);
            
            // Apply indentation
            const useSpaces = !document.getText().includes('\t');
            const tabSize = vscode.workspace.getConfiguration('editor').get<number>('tabSize') || 4;
            const indentString = useSpaces 
                ? ' '.repeat(relativeIndent)
                : '\t'.repeat(Math.floor(relativeIndent / tabSize));
                
            return indentString + formattedContent.trim();
        });
        
        const formattedText = formattedLines.join('\n');
        
        if (rangeText === formattedText) {
            return [];
        }
        
        return [vscode.TextEdit.replace(range, formattedText)];
    }
}