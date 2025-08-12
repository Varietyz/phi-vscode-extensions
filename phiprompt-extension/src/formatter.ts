import * as vscode from 'vscode';

interface FormatContext {
    nestLevel: number;
    bracketStack: BracketInfo[];
    inCodeBlock: boolean;
}

interface BracketInfo {
    type: '{' | '[' | '(';
    indentSpaces: number;
}

export class PhipromptFormatter implements vscode.DocumentFormattingEditProvider {
    private readonly INDENT_SIZE = 4;
    private readonly MAX_LINE_LENGTH = 120;

    private static readonly PATTERNS = {
        OPENING_BRACE: /[{[(]\s*$/,
        CLOSING_BRACE: /^\s*[}\])]/,
        SECTION_HEADER: /^\s*\[([^\]]+)\]\s*$/,
        CODE_BLOCK: /^\s*```/,
        OPERATOR: /[∧∨⊕→⟹]/
    };

    provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken
    ): vscode.TextEdit[] {
        const fullText = document.getText();
        const formattedText = this.formatDocument(fullText);
        
        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(fullText.length)
        );
        
        return [vscode.TextEdit.replace(fullRange, formattedText)];
    }

    private formatDocument(text: string): string {
        const lines = text.split('\n');
        const context: FormatContext = {
            nestLevel: 0,
            bracketStack: [],
            inCodeBlock: false
        };

        const formattedLines = lines.map(line => {
            const trimmed = line.trim();
            
            // Handle code blocks
            if (PhipromptFormatter.PATTERNS.CODE_BLOCK.test(trimmed)) {
                context.inCodeBlock = !context.inCodeBlock;
                return trimmed;
            }
            if (context.inCodeBlock) return line;

            // Format the line with proper indentation BEFORE updating context for closing brackets
            const formattedLine = this.formatLine(trimmed, context);

            // Update context AFTER formatting the line
            this.updateFormatContext(trimmed, context);

            return formattedLine;
        });

        return formattedLines.join('\n');
    }

    private updateFormatContext(line: string, context: FormatContext): void {
        // Handle closing brackets AFTER the line has been formatted
        if (PhipromptFormatter.PATTERNS.CLOSING_BRACE.test(line)) {
            if (context.bracketStack.length > 0) {
                context.bracketStack.pop();
                context.nestLevel = Math.max(0, context.nestLevel - 1);
            }
            return;
        }

        // Handle opening brackets
        if (PhipromptFormatter.PATTERNS.OPENING_BRACE.test(line)) {
            const bracketType = this.getBracketType(line);
            context.bracketStack.push({
                type: bracketType,
                indentSpaces: context.nestLevel * this.INDENT_SIZE
            });
            context.nestLevel++;
        }
    }

    private getBracketType(line: string): '{' | '[' | '(' {
        if (line.includes('{')) return '{';
        if (line.includes('[')) return '[';
        return '(';
    }

    private formatLine(line: string, context: FormatContext): string {
        const trimmed = line.trim();
        if (trimmed.length === 0) return '';

        // For closing brackets, use the indentation level they should close at
        let indent = 0;
        if (PhipromptFormatter.PATTERNS.CLOSING_BRACE.test(trimmed)) {
            // Closing bracket should align with the line that opened the block
            if (context.bracketStack.length > 0) {
                indent = context.bracketStack[context.bracketStack.length - 1].indentSpaces;
            }
        } else {
            // Regular content uses current nesting level
            indent = context.nestLevel * this.INDENT_SIZE;
        }

        // Clean up operator spacing
        let formatted = trimmed
            .replace(/\s*([{}[\]()=:∧∨⊕→⟹])\s*/g, (match, char) => {
                if (['{', '[', '('].includes(char)) return char;
                if (['}', ']', ')'].includes(char)) return char;
                return ` ${char} `;
            })
            .replace(/\s*,\s*/g, ', ');

        return ' '.repeat(indent) + formatted;
    }
}