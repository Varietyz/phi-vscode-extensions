import * as vscode from 'vscode';

const tutorialContent = [
    { 
        symbol: 'ƒ', 
        description: 'Function definition symbol, replaces "def".', 
        example: 'ƒ add(a, b):\n    ⟲ a + b',
        pythonExample: 'def add(a, b):\n    return a + b',
        category: 'core'
    },
    { 
        symbol: 'ℂ', 
        description: 'Class definition symbol, replaces "class".', 
        example: 'ℂ Person:\n    ƒ __init__(self, name):\n        self.name = name',
        pythonExample: 'class Person:\n    def __init__(self, name):\n        self.name = name',
        category: 'core'
    },
    { 
        symbol: '¿', 
        description: 'If statement symbol, replaces "if".', 
        example: '¿ x > 0:\n    π("Positive")',
        pythonExample: 'if x > 0:\n    print("Positive")',
        category: 'control'
    },
    { 
        symbol: '⤷', 
        description: 'Elif statement symbol, replaces "elif".', 
        example: '¿ x > 0:\n    π("Positive")\n⤷ x == 0:\n    π("Zero")',
        pythonExample: 'if x > 0:\n    print("Positive")\nelif x == 0:\n    print("Zero")',
        category: 'control'
    },
    { 
        symbol: '⋄', 
        description: 'Else statement symbol, replaces "else".', 
        example: '¿ x > 0:\n    π("Positive")\n⋄:\n    π("Non-positive")',
        pythonExample: 'if x > 0:\n    print("Positive")\nelse:\n    print("Non-positive")',
        category: 'control'
    },
    { 
        symbol: '∀', 
        description: 'Universal quantifier - used for "for" loops.', 
        example: '∀ i ∈ range(5):\n    π(i)',
        pythonExample: 'for i in range(5):\n    print(i)',
        category: 'loops'
    },
    { 
        symbol: '∈', 
        description: 'Set membership - means "in".', 
        example: '¿ "key" ∈ my_dict:\n    π("Found!")',
        pythonExample: 'if "key" in my_dict:\n    print("Found!")',
        category: 'operators'
    },
    { 
        symbol: '↻', 
        description: 'While loop symbol, replaces "while".', 
        example: '↻ condition:\n    do_something()',
        pythonExample: 'while condition:\n    do_something()',
        category: 'loops'
    },
    { 
        symbol: '⇲', 
        description: 'Break statement symbol.', 
        example: '∀ item ∈ items:\n    ¿ item == target:\n        ⇲',
        pythonExample: 'for item in items:\n    if item == target:\n        break',
        category: 'control'
    },
    { 
        symbol: '⇉', 
        description: 'Continue statement symbol.', 
        example: '∀ item ∈ items:\n    ¿ item < 0:\n        ⇉\n    process(item)',
        pythonExample: 'for item in items:\n    if item < 0:\n        continue\n    process(item)',
        category: 'control'
    },
    { 
        symbol: '⟲', 
        description: 'Return statement symbol.', 
        example: 'ƒ calculate():\n    ⟲ result * 2',
        pythonExample: 'def calculate():\n    return result * 2',
        category: 'core'
    },
    { 
        symbol: '⟰', 
        description: 'Yield statement symbol.', 
        example: 'ƒ generator():\n    ∀ i ∈ range(10):\n        ⟰ i * i',
        pythonExample: 'def generator():\n    for i in range(10):\n        yield i * i',
        category: 'advanced'
    },
    { 
        symbol: '↑', 
        description: 'Raise exception symbol.', 
        example: '¿ value < 0:\n    ↑ ValueError("Negative value")',
        pythonExample: 'if value < 0:\n    raise ValueError("Negative value")',
        category: 'exceptions'
    },
    { 
        symbol: '∴', 
        description: 'Try block symbol.', 
        example: '∴:\n    risky_operation()\n⛒ Exception:\n    handle_error()',
        pythonExample: 'try:\n    risky_operation()\nexcept Exception:\n    handle_error()',
        category: 'exceptions'
    },
    { 
        symbol: '⛒', 
        description: 'Except block symbol.', 
        example: '∴:\n    parse_data()\n⛒ ValueError ↦ e:\n    π(f"Parse error: {e}")',
        pythonExample: 'try:\n    parse_data()\nexcept ValueError as e:\n    print(f"Parse error: {e}")',
        category: 'exceptions'
    },
    { 
        symbol: '⇗', 
        description: 'Finally block symbol.', 
        example: '∴:\n    open_resource()\n⇗:\n    cleanup()',
        pythonExample: 'try:\n    open_resource()\nfinally:\n    cleanup()',
        category: 'exceptions'
    },
    { 
        symbol: '∥', 
        description: 'With statement symbol.', 
        example: '∥ open("file.txt") ↦ f:\n    data = f.read()',
        pythonExample: 'with open("file.txt") as f:\n    data = f.read()',
        category: 'advanced'
    },
    { 
        symbol: '↦', 
        description: 'As keyword symbol.', 
        example: '← json ⇒ loads ↦ parse_json',
        pythonExample: 'from json import loads as parse_json',
        category: 'imports'
    },
    { 
        symbol: '⇒', 
        description: 'Import statement symbol.', 
        example: '⇒ os\n⇒ sys',
        pythonExample: 'import os\nimport sys',
        category: 'imports'
    },
    { 
        symbol: '←', 
        description: 'From-import statement symbol.', 
        example: '← math ⇒ sqrt, pi\n← pathlib ⇒ Path',
        pythonExample: 'from math import sqrt, pi\nfrom pathlib import Path',
        category: 'imports'
    },
    { 
        symbol: '✓', 
        description: 'Boolean True symbol.', 
        example: 'is_valid = ✓\ndebug_mode = ✓',
        pythonExample: 'is_valid = True\ndebug_mode = True',
        category: 'constants'
    },
    { 
        symbol: '⊥', 
        description: 'Boolean False symbol.', 
        example: 'is_complete = ⊥\nshow_debug = ⊥',
        pythonExample: 'is_complete = False\nshow_debug = False',
        category: 'constants'
    },
    { 
        symbol: 'Ø', 
        description: 'None/null symbol.', 
        example: 'result = Ø\ndefault_value = Ø',
        pythonExample: 'result = None\ndefault_value = None',
        category: 'constants'
    },
    { 
        symbol: '∧', 
        description: 'Logical AND symbol.', 
        example: '¿ x > 0 ∧ x < 100:\n    π("Valid range")',
        pythonExample: 'if x > 0 and x < 100:\n    print("Valid range")',
        category: 'operators'
    },
    { 
        symbol: '∨', 
        description: 'Logical OR symbol.', 
        example: '¿ is_admin ∨ is_owner:\n    grant_access()',
        pythonExample: 'if is_admin or is_owner:\n    grant_access()',
        category: 'operators'
    },
    { 
        symbol: '¬', 
        description: 'Logical NOT symbol.', 
        example: '¿ ¬ is_empty:\n    process_data()',
        pythonExample: 'if not is_empty:\n    process_data()',
        category: 'operators'
    },
    { 
        symbol: '≡', 
        description: 'Identity comparison symbol, replaces "is".', 
        example: '¿ value ≡ Ø:\n    π("Value is None")',
        pythonExample: 'if value is None:\n    print("Value is None")',
        category: 'operators'
    },
    { 
        symbol: 'λ', 
        description: 'Lambda (anonymous function) symbol.', 
        example: 'square = λ x: x ** 2\nmapped = map(λ x: x * 2, numbers)',
        pythonExample: 'square = lambda x: x ** 2\nmapped = map(lambda x: x * 2, numbers)',
        category: 'advanced'
    },
    { 
        symbol: '∂', 
        description: 'Delete symbol, replaces "del".', 
        example: '∂ temporary_var\n∂ cache[key]',
        pythonExample: 'del temporary_var\ndel cache[key]',
        category: 'advanced'
    },
    { 
        symbol: '⟁', 
        description: 'Global scope symbol.', 
        example: '⟁ counter\ncounter += 1',
        pythonExample: 'global counter\ncounter += 1',
        category: 'scope'
    },
    { 
        symbol: '∇', 
        description: 'Nonlocal scope symbol.', 
        example: 'ƒ outer():\n    x = 0\n    ƒ inner():\n        ∇ x\n        x += 1',
        pythonExample: 'def outer():\n    x = 0\n    def inner():\n        nonlocal x\n        x += 1',
        category: 'scope'
    },
    { 
        symbol: '‼', 
        description: 'Assert statement symbol.', 
        example: '‼ len(items) > 0, "List cannot be empty"\n‼ isinstance(value, int)',
        pythonExample: 'assert len(items) > 0, "List cannot be empty"\nassert isinstance(value, int)',
        category: 'debugging'
    },
    { 
        symbol: '⟳', 
        description: 'Async keyword symbol.', 
        example: '⟳ ƒ fetch_data():\n    ⟲ ⌛ http_request()',
        pythonExample: 'async def fetch_data():\n    return await http_request()',
        category: 'async'
    },
    { 
        symbol: '⌛', 
        description: 'Await keyword symbol.', 
        example: 'data = ⌛ fetch_api()\nresult = ⌛ process_async(data)',
        pythonExample: 'data = await fetch_api()\nresult = await process_async(data)',
        category: 'async'
    },
    { 
        symbol: '⋯', 
        description: 'Pass statement symbol.', 
        example: 'ƒ todo():\n    ⋯  # Implement later',
        pythonExample: 'def todo():\n    pass  # Implement later',
        category: 'core'
    },
    { 
        symbol: 'π', 
        description: 'Print function symbol.', 
        example: 'π("Hello, PHICODE!")\nπ(f"Value: {x}")',
        pythonExample: 'print("Hello, PHICODE!")\nprint(f"Value: {x}")',
        category: 'io'
    },
];

const categoryColors = {
    'core': '#007ACC',
    'control': '#D73A49', 
    'loops': '#6F42C1',
    'operators': '#E36209',
    'constants': '#28A745',
    'imports': '#6C757D',
    'exceptions': '#DC3545',
    'advanced': '#17A2B8',
    'scope': '#FD7E14',
    'debugging': '#20C997',
    'async': '#6610F2',
    'io': '#198754'
};

export async function showTutorialPanel(context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
        'phicodeTutorial',
        'PHICODE Symbol Reference',
        vscode.ViewColumn.One,
        { 
            enableScripts: true,
            retainContextWhenHidden: true 
        }
    );

    const html = generateHtml(tutorialContent);
    panel.webview.html = html;

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(
        message => {
            switch (message.command) {
                case 'copy':
                    vscode.env.clipboard.writeText(message.text);
                    vscode.window.showInformationMessage(`Copied "${message.text}" to clipboard!`);
                    break;
                case 'search':
                    // Could implement search functionality
                    break;
            }
        },
        undefined,
        context.subscriptions
    );
}

function generateHtml(content: Array<{ symbol: string; description: string; example: string; pythonExample: string; category: string }>) {
    // Group content by category
    const grouped = content.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, typeof content>);

    const categoryNames = {
        'core': 'Core Syntax',
        'control': 'Control Flow',
        'loops': 'Loops',
        'operators': 'Operators',
        'constants': 'Constants',
        'imports': 'Imports',
        'exceptions': 'Exception Handling',
        'advanced': 'Advanced',
        'scope': 'Scope',
        'debugging': 'Debugging',
        'async': 'Async/Await',
        'io': 'Input/Output'
    };

    let categoriesHtml = '';
    Object.entries(grouped).forEach(([category, items]) => {
        const categoryColor = categoryColors[category as keyof typeof categoryColors] || '#6C757D';
        let itemsHtml = '';
        
        items.forEach(({ symbol, description, example, pythonExample }) => {
            itemsHtml += `
                <div class="symbol-card" data-category="${category}">
                    <div class="symbol-header">
                        <div class="symbol-display">${symbol}</div>
                        <button class="copy-btn" onclick="copySymbol('${symbol}')" title="Copy symbol">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                                <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                            </svg>
                        </button>
                    </div>
                    <div class="symbol-description">${description}</div>
                    
                    <div class="example-container">
                        <div class="example-header">
                            <span>PHICODE Example</span>
                            <button class="copy-example-btn" onclick="copyExample(\`${example.replace(/`/g, '\\`')}\`)" title="Copy example">
                                Copy
                            </button>
                        </div>
                        <pre class="example-code"><code>${example}</code></pre>
                    </div>
                    
                    <div class="example-container python">
                        <div class="example-header">
                            <span>Python Equivalent</span>
                            <button class="copy-example-btn" onclick="copyExample(\`${pythonExample.replace(/`/g, '\\`')}\`)" title="Copy example">
                                Copy
                            </button>
                        </div>
                        <pre class="example-code"><code>${pythonExample}</code></pre>
                    </div>
                </div>
            `;
        });

        categoriesHtml += `
            <section class="category-section">
                <div class="category-header" style="border-left: 4px solid ${categoryColor}">
                    <h2 style="color: ${categoryColor}">${categoryNames[category as keyof typeof categoryNames] || category}</h2>
                    <span class="item-count">${items.length} symbols</span>
                </div>
                <div class="symbols-grid">
                    ${itemsHtml}
                </div>
            </section>
        `;
    });

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>PHICODE Symbol Reference</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
                line-height: 1.6;
                color: var(--vscode-foreground, #333);
                background: var(--vscode-editor-background, #fff);
                padding: 0;
                margin: 0;
            }

            .header {
                position: sticky;
                top: 0;
                background: var(--vscode-editor-background, #fff);
                border-bottom: 1px solid var(--vscode-panel-border, #e1e4e8);
                padding: 20px;
                z-index: 100;
                backdrop-filter: blur(10px);
            }

            .header h1 {
                font-size: 28px;
                font-weight: 600;
                color: var(--vscode-foreground, #333);
                margin-bottom: 8px;
            }

            .header-subtitle {
                color: var(--vscode-descriptionForeground, #666);
                font-size: 16px;
            }

            .search-container {
                margin-top: 20px;
                position: relative;
            }

            .search-input {
                width: 100%;
                padding: 12px 16px 12px 40px;
                border: 1px solid var(--vscode-input-border, #d1d5da);
                border-radius: 8px;
                font-size: 14px;
                background: var(--vscode-input-background, #fff);
                color: var(--vscode-input-foreground, #333);
                transition: all 0.2s ease;
            }

            .search-input:focus {
                outline: none;
                border-color: var(--vscode-focusBorder, #007ACC);
                box-shadow: 0 0 0 2px var(--vscode-focusBorder, #007ACC)22;
            }

            .search-icon {
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: var(--vscode-descriptionForeground, #666);
            }

            .content {
                padding: 20px;
                max-width: 1200px;
                margin: 0 auto;
            }

            .category-section {
                margin-bottom: 40px;
            }

            .category-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 20px;
                margin-bottom: 20px;
                background: var(--vscode-editor-background, #f8f9fa);
                border-radius: 8px;
            }

            .category-header h2 {
                font-size: 22px;
                font-weight: 600;
                margin: 0;
            }

            .item-count {
                background: var(--vscode-badge-background, #007ACC);
                color: var(--vscode-badge-foreground, #fff);
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
            }

            .symbols-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 20px;
            }

            .symbol-card {
                background: var(--vscode-editor-background, #fff);
                border: 1px solid var(--vscode-panel-border, #e1e4e8);
                border-radius: 12px;
                padding: 20px;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }

            .symbol-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px var(--vscode-widget-shadow, rgba(0,0,0,0.1));
                border-color: var(--vscode-focusBorder, #007ACC);
            }

            .symbol-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 12px;
            }

            .symbol-display {
                font-size: 32px;
                font-weight: 700;
                color: var(--vscode-symbolIcon-functionForeground, #007ACC);
                font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
                text-shadow: 0 1px 2px rgba(0,0,0,0.1);
            }

            .copy-btn, .copy-example-btn {
                background: var(--vscode-button-secondaryBackground, #f3f4f6);
                border: none;
                border-radius: 6px;
                padding: 8px;
                cursor: pointer;
                color: var(--vscode-button-secondaryForeground, #666);
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
            }

            .copy-btn:hover, .copy-example-btn:hover {
                background: var(--vscode-button-secondaryHoverBackground, #e5e7eb);
                transform: scale(1.05);
            }

            .symbol-description {
                color: var(--vscode-descriptionForeground, #666);
                font-size: 14px;
                margin-bottom: 16px;
                line-height: 1.5;
            }

            .example-container {
                background: var(--vscode-textCodeBlock-background, #f8f9fa);
                border-radius: 8px;
                overflow: hidden;
                border: 1px solid var(--vscode-panel-border, #e1e4e8);
                margin-bottom: 12px;
            }

            .example-container.python {
                background: #f8f9fa;
                border-color: #e1e4e8;
            }

            .example-container.python .example-header {
                background: #e5f6fd;
                color: #032f62;
            }

            .example-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                background: var(--vscode-editorGroupHeader-tabsBackground, #f1f3f4);
                border-bottom: 1px solid var(--vscode-panel-border, #e1e4e8);
                font-size: 12px;
                font-weight: 500;
                color: var(--vscode-descriptionForeground, #666);
            }

            .example-code {
                margin: 0;
                padding: 16px;
                font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
                font-size: 13px;
                line-height: 1.5;
                background: transparent;
                color: var(--vscode-editor-foreground, #333);
                overflow-x: auto;
            }

            .fade-in {
                animation: fadeIn 0.5s ease-in;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .hidden {
                display: none;
            }

            /* Dark theme support */
            @media (prefers-color-scheme: dark) {
                body {
                    --fallback-bg: #1e1e1e;
                    --fallback-fg: #d4d4d4;
                    --fallback-border: #3c3c3c;
                }
                
                .example-container.python {
                    background: #1e1e1e;
                    border-color: #3c3c3c;
                }
                
                .example-container.python .example-header {
                    background: #0d293e;
                    color: #83b6e0;
                }
            }

            .quick-nav {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
                margin-top: 16px;
            }

            .quick-nav-btn {
                background: var(--vscode-button-secondaryBackground, #f3f4f6);
                border: none;
                border-radius: 16px;
                padding: 6px 12px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
                color: var(--vscode-button-secondaryForeground, #666);
            }

            .quick-nav-btn:hover, .quick-nav-btn.active {
                background: var(--vscode-button-background, #007ACC);
                color: var(--vscode-button-foreground, #fff);
            }
            
            .tab-buttons {
                display: flex;
                margin-bottom: 16px;
                border-bottom: 1px solid var(--vscode-panel-border, #e1e4e8);
            }
            
            .tab-button {
                padding: 8px 16px;
                background: none;
                border: none;
                border-bottom: 2px solid transparent;
                cursor: pointer;
                font-size: 14px;
                color: var(--vscode-descriptionForeground, #666);
                transition: all 0.2s ease;
            }
            
            .tab-button.active {
                border-bottom-color: var(--vscode-focusBorder, #007ACC);
                color: var(--vscode-foreground, #333);
                font-weight: 500;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔢 PHICODE Symbol Reference</h1>
            <p class="header-subtitle">Complete guide to PHICODE's mathematical programming symbols</p>
            
            <div class="search-container">
                <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                </svg>
                <input type="text" class="search-input" placeholder="Search symbols, descriptions, or examples..." id="searchInput">
            </div>

            <div class="quick-nav">
                <button class="quick-nav-btn active" onclick="filterCategory('all')">All</button>
                <button class="quick-nav-btn" onclick="filterCategory('core')">Core</button>
                <button class="quick-nav-btn" onclick="filterCategory('control')">Control</button>
                <button class="quick-nav-btn" onclick="filterCategory('loops')">Loops</button>
                <button class="quick-nav-btn" onclick="filterCategory('operators')">Operators</button>
                <button class="quick-nav-btn" onclick="filterCategory('constants')">Constants</button>
                <button class="quick-nav-btn" onclick="filterCategory('imports')">Imports</button>
                <button class="quick-nav-btn" onclick="filterCategory('exceptions')">Exceptions</button>
                <button class="quick-nav-btn" onclick="filterCategory('advanced')">Advanced</button>
                <button class="quick-nav-btn" onclick="filterCategory('scope')">Scope</button>
                <button class="quick-nav-btn" onclick="filterCategory('debugging')">Debugging</button>
                <button class="quick-nav-btn" onclick="filterCategory('async')">Async</button>
                <button class="quick-nav-btn" onclick="filterCategory('io')">I/O</button>
            </div>
        </div>

        <div class="content">
            ${categoriesHtml}
        </div>

        <script>
            const vscode = acquireVsCodeApi();

            function copySymbol(symbol) {
                vscode.postMessage({
                    command: 'copy',
                    text: symbol
                });
            }

            function copyExample(example) {
                vscode.postMessage({
                    command: 'copy',
                    text: example
                });
            }

            // Search functionality
            const searchInput = document.getElementById('searchInput');
            const symbolCards = document.querySelectorAll('.symbol-card');
            const categorySection = document.querySelectorAll('.category-section');

            searchInput.addEventListener('input', function() {
                const query = this.value.toLowerCase();
                
                symbolCards.forEach(card => {
                    const symbol = card.querySelector('.symbol-display').textContent.toLowerCase();
                    const description = card.querySelector('.symbol-description').textContent.toLowerCase();
                    const example = card.querySelector('.example-code').textContent.toLowerCase();
                    const pythonExample = card.querySelectorAll('.example-code')[1].textContent.toLowerCase();
                    
                    const matches = symbol.includes(query) || 
                                    description.includes(query) || 
                                    example.includes(query) || 
                                    pythonExample.includes(query);
                    card.style.display = matches ? 'block' : 'none';
                });

                // Hide empty categories
                categorySection.forEach(section => {
                    const visibleCards = section.querySelectorAll('.symbol-card:not([style*="display: none"])');
                    section.style.display = visibleCards.length > 0 ? 'block' : 'none';
                });
            });

            // Category filtering
            function filterCategory(category) {
                // Update active button
                document.querySelectorAll('.quick-nav-btn').forEach(btn => btn.classList.remove('active'));
                event.target.classList.add('active');

                if (category === 'all') {
                    symbolCards.forEach(card => card.style.display = 'block');
                    categorySection.forEach(section => section.style.display = 'block');
                } else {
                    symbolCards.forEach(card => {
                        const matches = card.dataset.category === category;
                        card.style.display = matches ? 'block' : 'none';
                    });

                    categorySection.forEach(section => {
                        const visibleCards = section.querySelectorAll('.symbol-card:not([style*="display: none"])');
                        section.style.display = visibleCards.length > 0 ? 'block' : 'none';
                    });
                }

                // Clear search when filtering
                searchInput.value = '';
            }

            // Add fade-in animation to cards
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in');
                    }
                });
            });

            symbolCards.forEach(card => observer.observe(card));
        </script>
    </body>
    </html>
    `;
}