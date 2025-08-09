import * as vscode from 'vscode';

// --- Symbol entry type ---
interface SymbolEntry {
    name: string;
    kind: 'function' | 'class' | 'variable' | 'method' | 'property' | 'import';
    line: number;
    character: number;
    endCharacter?: number;
    containerName?: string; // For methods/properties inside classes
}

// --- Import/usage tracking ---
interface ImportEntry {
    name: string;
    fromFile?: string; // For "from file import name"
    alias?: string;    // For "import name as alias"
    line: number;
    character: number;
}

// --- Enhanced workspace-wide PHICODE indexer ---
class PhicodeIndexer {
    private watcher: vscode.FileSystemWatcher;
    private cache = new Map<string, string>();
    public symbolTableCache = new Map<string, SymbolEntry[]>();
    public importTableCache = new Map<string, ImportEntry[]>();

    constructor() {
        this.watcher = vscode.workspace.createFileSystemWatcher('**/*.φ');
        
        this.watcher.onDidCreate(uri => this.updateFile(uri));
        this.watcher.onDidChange(uri => this.updateFile(uri));
        this.watcher.onDidDelete(uri => this.deleteFile(uri));

        this.indexAll();
    }

    async indexAll() {
        const files = await vscode.workspace.findFiles('**/*.φ');
        await Promise.all(files.map(uri => this.updateFile(uri)));
    }

    async updateFile(uri: vscode.Uri) {
        try {
            const doc = await vscode.workspace.openTextDocument(uri);
            const phicodeText = doc.getText();
            this.cache.set(uri.fsPath, phicodeText);

            const { symbols, imports } = parsePhicodeContent(phicodeText);
            this.symbolTableCache.set(uri.fsPath, symbols);
            this.importTableCache.set(uri.fsPath, imports);
        } catch {
            this.cache.delete(uri.fsPath);
            this.symbolTableCache.delete(uri.fsPath);
            this.importTableCache.delete(uri.fsPath);
        }
    }

    deleteFile(uri: vscode.Uri) {
        this.cache.delete(uri.fsPath);
        this.symbolTableCache.delete(uri.fsPath);
        this.importTableCache.delete(uri.fsPath);
    }

    getSymbols(uri: vscode.Uri): SymbolEntry[] | undefined {
        return this.symbolTableCache.get(uri.fsPath);
    }

    getImports(uri: vscode.Uri): ImportEntry[] | undefined {
        return this.importTableCache.get(uri.fsPath);
    }

    // Find all files that export a given symbol
    findSymbolInWorkspace(symbolName: string): Array<{ uri: vscode.Uri, symbol: SymbolEntry }> {
        const results: Array<{ uri: vscode.Uri, symbol: SymbolEntry }> = [];
        
        for (const [fsPath, symbols] of this.symbolTableCache.entries()) {
            const matchingSymbols = symbols.filter(sym => sym.name === symbolName);
            for (const symbol of matchingSymbols) {
                results.push({
                    uri: vscode.Uri.file(fsPath),
                    symbol: symbol
                });
            }
        }
        
        return results;
    }

    dispose() {
        this.watcher.dispose();
        this.cache.clear();
        this.symbolTableCache.clear();
        this.importTableCache.clear();
    }
}

function parsePhicodeContent(text: string): { symbols: SymbolEntry[], imports: ImportEntry[] } {
    const symbols: SymbolEntry[] = [];
    const imports: ImportEntry[] = [];
    const lines = text.split(/\r?\n/);

    // Enhanced regex patterns for PHICODE
    const funcRegex = /^(\s*)ƒ\s+(\w+)/;           // ƒ function_name
    const classRegex = /^(\s*)ℂ\s+(\w+)/;          // ℂ ClassName
    const methodRegex = /^(\s+)ƒ\s+(\w+)/;         // Method inside class
    const varRegex = /^(\s*)(\w+)\s*=/;            // variable = value
    const importRegex = /^(\s*)⇒\s+(\w+)(?:\s+↦\s+(\w+))?/; // ⇒ module ↦ alias
    const fromImportRegex = /^(\s*)←\s+(\w+)\s+⇒\s+(\w+)(?:\s+↦\s+(\w+))?/; // ← module ⇒ name ↦ alias

    let currentClass: string | undefined;
    let classIndentLevel = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        // Skip empty lines and comments
        if (!trimmedLine || trimmedLine.startsWith('#')) {
            continue;
        }

        // Check for class definition
        let match = line.match(classRegex);
        if (match) {
            const indentLevel = match[1].length;
            const className = match[2];
            currentClass = className;
            classIndentLevel = indentLevel;
            
            symbols.push({
                name: className,
                kind: 'class',
                line: i,
                character: line.indexOf(className)
            });
            continue;
        }

        // Check for function definition
        match = line.match(funcRegex);
        if (match) {
            const indentLevel = match[1].length;
            const funcName = match[2];
            
            // Reset current class if we're at top level
            if (indentLevel <= classIndentLevel) {
                currentClass = undefined;
            }
            
            symbols.push({
                name: funcName,
                kind: currentClass ? 'method' : 'function',
                line: i,
                character: line.indexOf(funcName),
                containerName: currentClass
            });
            continue;
        }

        // Check for variable assignment
        match = line.match(varRegex);
        if (match) {
            const indentLevel = match[1].length;
            const varName = match[2];
            
            // Reset current class if we're at top level
            if (indentLevel <= classIndentLevel) {
                currentClass = undefined;
            }
            
            // Skip if it's likely a method parameter or inside a function
            if (indentLevel === 0 || (currentClass && indentLevel === classIndentLevel + 4)) {
                symbols.push({
                    name: varName,
                    kind: currentClass ? 'property' : 'variable',
                    line: i,
                    character: line.indexOf(varName),
                    containerName: currentClass
                });
            }
            continue;
        }

        // Check for imports: ⇒ module ↦ alias
        match = line.match(importRegex);
        if (match) {
            const moduleName = match[2];
            const alias = match[3];
            
            imports.push({
                name: alias || moduleName,
                alias: alias,
                line: i,
                character: line.indexOf(moduleName)
            });
            continue;
        }

        // Check for from imports: ← module ⇒ name ↦ alias
        match = line.match(fromImportRegex);
        if (match) {
            const moduleName = match[2];
            const importedName = match[3];
            const alias = match[4];
            
            imports.push({
                name: alias || importedName,
                fromFile: moduleName,
                alias: alias,
                line: i,
                character: line.indexOf(importedName)
            });
        }
    }

    return { symbols, imports };
}

export const phicodeIndexer = new PhicodeIndexer();

// --- Enhanced PHICODE Definition Provider ---
export class PhicodeDefinitionProvider implements vscode.DefinitionProvider {
    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.Definition | undefined> {
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) return undefined;
        
        const word = document.getText(wordRange);
        const line = document.lineAt(position.line).text;

        // Check if this is a method call (word after dot)
        const beforeWord = line.substring(0, wordRange.start.character);
        const isDotAccess = beforeWord.trim().endsWith('.');
        
        if (isDotAccess) {
            return this.handleMethodAccess(document, position, word, beforeWord);
        }

        // 1. Search in current document first
        const localSymbols = phicodeIndexer.getSymbols(document.uri) ?? [];
        let symbol = localSymbols.find(sym => sym.name === word);
        if (symbol) {
            return new vscode.Location(
                document.uri, 
                new vscode.Position(symbol.line, symbol.character)
            );
        }

        // 2. Check if it's an imported symbol
        const imports = phicodeIndexer.getImports(document.uri) ?? [];
        const importEntry = imports.find(imp => imp.name === word);
        if (importEntry && importEntry.fromFile) {
            return this.findInImportedModule(importEntry.fromFile, importEntry.alias ? importEntry.fromFile : word);
        }

        // 3. Search workspace-wide for top-level symbols
        const workspaceMatches = phicodeIndexer.findSymbolInWorkspace(word);
        if (workspaceMatches.length > 0) {
            // Prefer classes and functions over variables
            const prioritizedMatch = workspaceMatches.find(m => 
                m.symbol.kind === 'function' || m.symbol.kind === 'class'
            ) || workspaceMatches[0];
            
            return new vscode.Location(
                prioritizedMatch.uri,
                new vscode.Position(prioritizedMatch.symbol.line, prioritizedMatch.symbol.character)
            );
        }

        return undefined;
    }

    private async handleMethodAccess(
        document: vscode.TextDocument,
        position: vscode.Position,
        methodName: string,
        beforeWord: string
    ): Promise<vscode.Definition | undefined> {
        // Extract the object/class name before the dot
        const objectMatch = beforeWord.match(/(\w+)\s*\.$/);
        if (!objectMatch) return undefined;
        
        const objectName = objectMatch[1];

        // First, try to find the object's class definition
        const localSymbols = phicodeIndexer.getSymbols(document.uri) ?? [];
        
        // Look for variable assignment to determine the class
        const objectSymbol = localSymbols.find(sym => sym.name === objectName);
        if (objectSymbol && objectSymbol.kind === 'variable') {
            // This would need more sophisticated type inference
            // For now, search for methods with the same name across all classes
        }

        // Search for methods across all files
        for (const [fsPath, symbols] of phicodeIndexer.symbolTableCache.entries()) {
            const method = symbols.find(sym => 
                sym.name === methodName && sym.kind === 'method'
            );
            if (method) {
                return new vscode.Location(
                    vscode.Uri.file(fsPath),
                    new vscode.Position(method.line, method.character)
                );
            }
        }

        return undefined;
    }

    private async findInImportedModule(
        moduleName: string, 
        symbolName: string
    ): Promise<vscode.Definition | undefined> {
        // Try to find a .φ file with the module name
        const possiblePaths = [
            `**/${moduleName}.φ`,
            `**/${moduleName}/__init__.φ`
        ];

        for (const pattern of possiblePaths) {
            const files = await vscode.workspace.findFiles(pattern);
            for (const file of files) {
                const symbols = phicodeIndexer.getSymbols(file) ?? [];
                const symbol = symbols.find(sym => sym.name === symbolName);
                if (symbol) {
                    return new vscode.Location(
                        file,
                        new vscode.Position(symbol.line, symbol.character)
                    );
                }
            }
        }

        return undefined;
    }
}