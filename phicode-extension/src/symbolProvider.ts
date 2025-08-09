import * as vscode from 'vscode';
import { phicodeToPython } from './extension';

interface ParsedSymbol {
    name: string;
    kind: vscode.SymbolKind;
    line: number;
    character: number;
    endLine: number;
    endCharacter: number;
    containerName?: string;
    detail?: string;
}

export class PhicodeDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    async provideDocumentSymbols(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): Promise<vscode.DocumentSymbol[]> {
        if (token.isCancellationRequested) {
            return [];
        }

        try {
            const text = document.getText();
            const parsedSymbols = this.parsePhicodeSymbols(text);
            return this.buildSymbolHierarchy(parsedSymbols, document);
        } catch (error) {
            console.error('Error parsing PHICODE symbols:', error);
            return [];
        }
    }

    private parsePhicodeSymbols(text: string): ParsedSymbol[] {
        const symbols: ParsedSymbol[] = [];
        const lines = text.split(/\r?\n/);

        // Enhanced regex patterns for PHICODE symbols
        const patterns = {
            function: /^(\s*)ƒ\s+([a-zA-Z_]\w*)\s*\(/,              // ƒ function_name(
            class: /^(\s*)ℂ\s+([a-zA-Z_]\w*)\s*(?:\(|:)/,          // ℂ ClassName( or ℂ ClassName:
            asyncFunction: /^(\s*)⟳\s*ƒ\s+([a-zA-Z_]\w*)\s*\(/,     // ⟳ ƒ async_function(
            variable: /^(\s*)([a-zA-Z_]\w*)\s*=\s*(?!.*ƒ|.*ℂ)/,     // variable = value (not function/class)
            import: /^(\s*)(?:⇒|←)\s+([a-zA-Z_]\w*)/,              // ⇒ module or ← module
            decorator: /^(\s*)@([a-zA-Z_]\w*)/,                      // @decorator
        };

        let currentClass: { name: string, indentLevel: number, startLine: number } | null = null;
        let bracketStack: Array<{ line: number, character: number, type: 'class' | 'function' }> = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();

            // Skip empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith('#')) {
                continue;
            }

            const indentLevel = line.length - line.trimStart().length;

            // Reset current class if we're at a lower indent level
            if (currentClass && indentLevel <= currentClass.indentLevel) {
                currentClass = null;
            }

            // Check for class definition
            let match = line.match(patterns.class);
            if (match) {
                const className = match[2];
                const startChar = line.indexOf(className);
                const endLine = this.findBlockEnd(lines, i, indentLevel);
                
                symbols.push({
                    name: className,
                    kind: vscode.SymbolKind.Class,
                    line: i,
                    character: startChar,
                    endLine: endLine,
                    endCharacter: line.length,
                    detail: this.generateClassDetail(lines, i)
                });

                currentClass = { name: className, indentLevel, startLine: i };
                continue;
            }

            // Check for function definition (regular or async)
            match = line.match(patterns.function) || line.match(patterns.asyncFunction);
            if (match) {
                const funcName = match[2];
                const startChar = line.indexOf(funcName);
                const endLine = this.findBlockEnd(lines, i, indentLevel);
                const isAsync = line.includes('⟳');
                const isMethod = currentClass !== null;

                symbols.push({
                    name: funcName,
                    kind: isMethod ? vscode.SymbolKind.Method : vscode.SymbolKind.Function,
                    line: i,
                    character: startChar,
                    endLine: endLine,
                    endCharacter: line.length,
                    containerName: currentClass?.name,
                    detail: this.generateFunctionDetail(lines, i, isAsync, isMethod)
                });
                continue;
            }

            // Check for variable assignment
            match = line.match(patterns.variable);
            if (match && indentLevel === 0) { // Only top-level variables
                const varName = match[2];
                const startChar = line.indexOf(varName);
                
                symbols.push({
                    name: varName,
                    kind: vscode.SymbolKind.Variable,
                    line: i,
                    character: startChar,
                    endLine: i,
                    endCharacter: startChar + varName.length,
                    detail: this.generateVariableDetail(line)
                });
                continue;
            }

            // Check for imports
            match = line.match(patterns.import);
            if (match) {
                const moduleName = match[2];
                const startChar = line.indexOf(moduleName);
                const isFromImport = line.includes('←');
                
                symbols.push({
                    name: moduleName,
                    kind: vscode.SymbolKind.Module,
                    line: i,
                    character: startChar,
                    endLine: i,
                    endCharacter: startChar + moduleName.length,
                    detail: isFromImport ? 'from import' : 'import'
                });
            }
        }

        return symbols;
    }

    private findBlockEnd(lines: string[], startLine: number, baseIndent: number): number {
        for (let i = startLine + 1; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            
            // Skip empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith('#')) {
                continue;
            }

            const currentIndent = line.length - line.trimStart().length;
            
            // If we find a line at the same or lower indent level, the block has ended
            if (currentIndent <= baseIndent) {
                return i - 1;
            }
        }
        
        // Block extends to end of file
        return lines.length - 1;
    }

    private generateClassDetail(lines: string[], lineIndex: number): string {
        const line = lines[lineIndex];
        
        // Check if it has inheritance
        const inheritanceMatch = line.match(/ℂ\s+\w+\s*\(([^)]+)\)/);
        if (inheritanceMatch) {
            return `class (inherits from ${inheritanceMatch[1]})`;
        }
        
        return 'class';
    }

    private generateFunctionDetail(lines: string[], lineIndex: number, isAsync: boolean, isMethod: boolean): string {
        const line = lines[lineIndex];
        
        // Extract parameters
        const paramMatch = line.match(/\(([^)]*)\)/);
        const params = paramMatch ? paramMatch[1].trim() : '';
        
        let detail = '';
        if (isAsync) detail += 'async ';
        if (isMethod) detail += 'method';
        else detail += 'function';
        
        if (params) {
            // Simplify parameter display
            const paramList = params.split(',').map(p => p.trim().split('=')[0].trim());
            if (paramList.length > 3) {
                detail += `(${paramList.slice(0, 3).join(', ')}, ...)`;
            } else {
                detail += `(${paramList.join(', ')})`;
            }
        } else {
            detail += '()';
        }

        return detail;
    }

    private generateVariableDetail(line: string): string {
        // Try to infer the type from the assignment
        const assignmentMatch = line.match(/=\s*(.+)/);
        if (assignmentMatch) {
            const value = assignmentMatch[1].trim();
            
            if (value === '✓' || value === '⊥') return 'bool';
            if (value === 'Ø') return 'None';
            if (value.match(/^\d+$/)) return 'int';
            if (value.match(/^\d+\.\d+$/)) return 'float';
            if (value.match(/^["'].*["']$/)) return 'str';
            if (value.match(/^\[.*\]$/)) return 'list';
            if (value.match(/^\{.*\}$/)) return 'dict';
            if (value.match(/^λ/)) return 'lambda';
            
            return 'variable';
        }
        
        return 'variable';
    }

    private buildSymbolHierarchy(parsedSymbols: ParsedSymbol[], document: vscode.TextDocument): vscode.DocumentSymbol[] {
        const rootSymbols: vscode.DocumentSymbol[] = [];
        const classSymbols = new Map<string, vscode.DocumentSymbol>();

        // First pass: create all symbols
        for (const symbol of parsedSymbols) {
            const range = new vscode.Range(
                new vscode.Position(symbol.line, symbol.character),
                new vscode.Position(symbol.endLine, symbol.endCharacter)
            );

            const selectionRange = new vscode.Range(
                new vscode.Position(symbol.line, symbol.character),
                new vscode.Position(symbol.line, symbol.character + symbol.name.length)
            );

            const documentSymbol = new vscode.DocumentSymbol(
                symbol.name,
                symbol.detail || '',
                symbol.kind,
                range,
                selectionRange
            );

            if (symbol.kind === vscode.SymbolKind.Class) {
                classSymbols.set(symbol.name, documentSymbol);
                rootSymbols.push(documentSymbol);
            } else if (symbol.containerName && classSymbols.has(symbol.containerName)) {
                // Add methods/properties to their parent class
                const parentClass = classSymbols.get(symbol.containerName)!;
                parentClass.children.push(documentSymbol);
            } else {
                // Top-level symbol (function, variable, import)
                rootSymbols.push(documentSymbol);
            }
        }

        return rootSymbols;
    }
}

// Optional: Enhanced symbol provider that can also convert to Python for fallback
export class EnhancedPhicodeSymbolProvider extends PhicodeDocumentSymbolProvider {
    async provideDocumentSymbols(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): Promise<vscode.DocumentSymbol[]> {
        // First try our PHICODE parser
        const phicodeSymbols = await super.provideDocumentSymbols(document, token);
        
        // If we have symbols, return them
        if (phicodeSymbols.length > 0) {
            return phicodeSymbols;
        }

        // Fallback: try converting to Python and using Python's symbol provider
        try {
            const phicodeText = document.getText();
            const pythonText = this.convertPhicodeToPython(phicodeText);
            
            // Create a temporary Python document
            const tempUri = document.uri.with({ 
                scheme: 'untitled',
                path: document.uri.path.replace('.φ', '.py')
            });
            
            const tempDoc = await vscode.workspace.openTextDocument({
                content: pythonText,
                language: 'python'
            });

            const pythonSymbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
                'vscode.executeDocumentSymbolProvider',
                tempDoc.uri
            );

            // Convert back to PHICODE positions if needed
            return pythonSymbols || [];

        } catch (error) {
            console.warn('Fallback Python symbol parsing failed:', error);
            return [];
        }
    }

    private convertPhicodeToPython(text: string): string {
        let result = text;
        for (const [phicode, python] of Object.entries(phicodeToPython)) {
            const isAlphaKey = /^[a-zA-Z]/.test(python);
            const regex = isAlphaKey
                ? new RegExp(`\\b${phicode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')
                : new RegExp(phicode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            result = result.replace(regex, python);
        }
        return result;
    }
}