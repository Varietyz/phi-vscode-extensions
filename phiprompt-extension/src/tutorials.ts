import * as vscode from 'vscode';
import { PHIPROMPT_SYMBOLIC_MAP } from './symbolicMap';

interface TutorialItem {
  symbol: string;
  description: string;
  example: string;
  naturalExample: string;
  category: string;
}

const tutorialContent: TutorialItem[] = [
  // Core Logic Symbols
  {
    symbol: '∀',
    description: 'Universal quantifier - applies to all elements in a domain',
    example: '∀ user ∈ system → authenticated',
    naturalExample: 'For all users in the system, they must be authenticated',
    category: 'logic'
  },
  {
    symbol: '∃', 
    description: 'Existential quantifier - at least one element exists',
    example: '∃ error ∈ log → alert_admin',
    naturalExample: 'If there exists an error in the log, alert the admin',
    category: 'logic'
  },
  {
    symbol: '∧',
    description: 'Logical AND operator',
    example: 'authenticated ∧ authorized → access_granted',
    naturalExample: 'If authenticated AND authorized, then grant access',
    category: 'logic'
  },
  {
    symbol: '∨',
    description: 'Logical OR operator', 
    example: 'admin ∨ owner → edit_permissions',
    naturalExample: 'If admin OR owner, then grant edit permissions',
    category: 'logic'
  },
  {
    symbol: '→',
    description: 'Transformation or implication arrow',
    example: 'input_data → validate → process',
    naturalExample: 'Input data transforms to validation then to processing',
    category: 'logic'
  },
  {
    symbol: '⟹',
    description: 'Strong logical implication',
    example: 'security_breach ⟹ immediate_lockdown',
    naturalExample: 'Security breach strongly implies immediate lockdown',
    category: 'logic'
  },

  // Challenge Flags
  {
    symbol: '🌀',
    description: 'Metaphorical or ambiguous content flag',
    example: 'user_journey 🌀(flows_like_river) → navigation_design',
    naturalExample: 'User journey (metaphorically flows like a river) informs navigation design',
    category: 'flags'
  },
  {
    symbol: '🧱',
    description: 'Nested conditional logic flag',
    example: '🧱(if auth ∧ (admin ∨ owner) ∧ ¬suspended) → full_access',
    naturalExample: 'Complex nested condition: if authenticated AND (admin OR owner) AND not suspended, grant full access',
    category: 'flags'
  },
  {
    symbol: '🎭',
    description: 'Affective intent or emotional tone flag',
    example: 'error_message 🎭(reassuring_tone) → user_confidence',
    naturalExample: 'Error message with reassuring emotional tone maintains user confidence',
    category: 'flags'
  },
  {
    symbol: '🧪',
    description: 'Unverified claim or hypothesis flag',
    example: '🧪(performance_improves_with_caching) → implement_cache',
    naturalExample: 'Hypothesis: performance improves with caching, therefore implement cache',
    category: 'flags'
  },
  {
    symbol: '⚠',
    description: 'Explicit uncertainty marker',
    example: 'server_response_time ⚠(varies_by_load) → dynamic_scaling',
    naturalExample: 'Server response time (uncertain, varies by load) requires dynamic scaling',
    category: 'flags'
  },

  // Greek Framework Modules
  {
    symbol: 'Ψ',
    description: 'Psi - Optimizer module for filtering and consolidation',
    example: 'Ψ.filter: remove_duplicates ∧ consolidate_similar',
    naturalExample: 'Optimizer filter: remove duplicates and consolidate similar items',
    category: 'modules'
  },
  {
    symbol: 'ρ',
    description: 'Rho - Filter component for removing redundancy',
    example: 'ρ.dedup: unique_entities → cleaned_dataset',
    naturalExample: 'Filter deduplication: unique entities transform to cleaned dataset',
    category: 'modules'
  },
  {
    symbol: 'ℜ',
    description: 'R - Forensics module for evidence analysis',
    example: 'ℜ.analyze: evidence → causal_chain → conclusion',
    naturalExample: 'Forensics analysis: evidence leads to causal chain then conclusion',
    category: 'modules'
  },
  {
    symbol: 'Π',
    description: 'Pi - Processor module for compilation and execution',
    example: 'Π.compile: source_code → bytecode → execution',
    naturalExample: 'Processor compilation: source code transforms to bytecode then execution',
    category: 'modules'
  },

  // Domain Notation
  {
    symbol: 'modal.pos',
    description: 'Modal possibility - something might be true',
    example: 'modal.pos(user_preference_change) → adaptive_interface',
    naturalExample: 'Possibly user preferences change, so create adaptive interface',
    category: 'domain'
  },
  {
    symbol: 'modal.req',
    description: 'Modal necessity - something must be true',
    example: 'modal.req(data_validation) → security_compliance',
    naturalExample: 'Data validation is necessarily required for security compliance',
    category: 'domain'
  },
  {
    symbol: 'state.hold',
    description: 'State management - pause or wait operation',
    example: 'state.hold(user_input) → validate → proceed',
    naturalExample: 'Hold state for user input, then validate, then proceed',
    category: 'domain'
  },

  // Mathematical Operations
  {
    symbol: '≈',
    description: 'Approximately equal - rough equivalence',
    example: 'performance ≈ baseline ⚠(within_tolerance)',
    naturalExample: 'Performance approximately equals baseline (within tolerance, uncertain)',
    category: 'math'
  },
  {
    symbol: '≡',
    description: 'Exactly equal or equivalent',
    example: 'user_input ≡ sanitized_input → safe_processing',
    naturalExample: 'User input exactly equals sanitized input, enabling safe processing',
    category: 'math'
  },
  {
    symbol: '∈',
    description: 'Set membership - element belongs to set',
    example: 'user ∈ admin_group → elevated_privileges',
    naturalExample: 'User belongs to admin group, therefore has elevated privileges',
    category: 'math'
  },

  // Advanced Symbols
  {
    symbol: '⊤',
    description: 'Truth value - always true',
    example: 'system_available = ⊤ → normal_operation',
    naturalExample: 'System availability is true, therefore normal operation continues',
    category: 'advanced'
  },
  {
    symbol: '⊥',
    description: 'False value - always false',
    example: 'unauthorized_access = ⊥ → security_maintained',
    naturalExample: 'Unauthorized access is false, therefore security is maintained',
    category: 'advanced'
  }
];

const categoryColors = {
  'logic': '#4FC3F7',
  'flags': '#FF8A65', 
  'modules': '#81C784',
  'domain': '#FFB74D',
  'math': '#BB86FC',
  'advanced': '#66BB6A'
};

export async function showTutorialPanel(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    'phipromptTutorial',
    'PHIPROMPT Symbol Reference & Tutorial',
    vscode.ViewColumn.One,
    { 
      enableScripts: true,
      retainContextWhenHidden: true 
    }
  );

  const html = generateTutorialHtml(tutorialContent);
  panel.webview.html = html;

  // Handle messages from the webview
  panel.webview.onDidReceiveMessage(
    message => {
      switch (message.command) {
        case 'copy':
          vscode.env.clipboard.writeText(message.text);
          vscode.window.showInformationMessage(`Copied "${message.text}" to clipboard!`);
          break;
        case 'insertSymbol':
          insertSymbolIntoEditor(message.symbol);
          break;
        case 'convertExample':
          insertSymbolIntoEditor(message.example);
          break;
      }
    },
    undefined,
    context.subscriptions
  );
}

function insertSymbolIntoEditor(text: string) {
  const editor = vscode.window.activeTextEditor;
  if (editor && editor.document.languageId === 'phiprompt') {
    editor.edit(editBuilder => {
      editBuilder.insert(editor.selection.active, text);
    });
    vscode.window.showInformationMessage(`Inserted: ${text}`);
  } else {
    vscode.window.showWarningMessage('Please open a PHIPROMPT (.φp) file to insert symbols');
  }
}

function generateTutorialHtml(content: TutorialItem[]) {
  // Group content by category
  const grouped = content.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, TutorialItem[]>);

  const categoryNames = {
    'logic': 'Logic & Quantifiers',
    'flags': 'Challenge Flags', 
    'modules': 'Framework Modules',
    'domain': 'Domain Notation',
    'math': 'Mathematical Operations',
    'advanced': 'Advanced Symbols'
  };

  let categoriesHtml = '';
  Object.entries(grouped).forEach(([category, items]) => {
    const categoryColor = categoryColors[category as keyof typeof categoryColors] || '#6C757D';
    let itemsHtml = '';
    
    items.forEach(({ symbol, description, example, naturalExample }) => {
      itemsHtml += `
        <div class="symbol-card" data-category="${category}">
          <div class="symbol-header">
            <div class="symbol-display">${symbol}</div>
            <div class="symbol-actions">
              <button class="action-btn" onclick="copySymbol('${symbol}')" title="Copy symbol">
                📋 Copy
              </button>
              <button class="action-btn" onclick="insertSymbol('${symbol}')" title="Insert into editor">
                ➕ Insert
              </button>
            </div>
          </div>
          <div class="symbol-description">${description}</div>
          
          <div class="example-container">
            <div class="example-header">
              <span>🔢 PHIPROMPT Example</span>
              <button class="copy-example-btn" onclick="convertExample(\`${example.replace(/`/g, '\\`')}\`)" title="Insert example">
                ➕ Insert
              </button>
            </div>
            <pre class="example-code phiprompt"><code>${example}</code></pre>
          </div>
          
          <div class="example-container natural">
            <div class="example-header">
              <span>💬 Natural Language</span>
              <button class="copy-example-btn" onclick="copyText(\`${naturalExample.replace(/`/g, '\\`')}\`)" title="Copy natural language">
                📋 Copy
              </button>
            </div>
            <pre class="example-code natural"><code>${naturalExample}</code></pre>
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
        <title>PHIPROMPT Tutorial & Reference</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
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
                margin-bottom: 16px;
            }

            .intro-section {
                background: var(--vscode-textCodeBlock-background, #f8f9fa);
                padding: 16px;
                border-radius: 8px;
                border-left: 4px solid var(--vscode-focusBorder, #007ACC);
                margin-bottom: 16px;
            }

            .intro-section h3 {
                color: var(--vscode-focusBorder, #007ACC);
                margin-bottom: 8px;
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
                grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
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
                font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
                text-shadow: 0 1px 2px rgba(0,0,0,0.1);
            }

            .symbol-actions {
                display: flex;
                gap: 8px;
            }

            .action-btn, .copy-example-btn {
                background: var(--vscode-button-secondaryBackground, #f3f4f6);
                border: none;
                border-radius: 6px;
                padding: 6px 12px;
                cursor: pointer;
                color: var(--vscode-button-secondaryForeground, #666);
                transition: all 0.2s ease;
                font-size: 12px;
                font-weight: 500;
            }

            .action-btn:hover, .copy-example-btn:hover {
                background: var(--vscode-button-background, #007ACC);
                color: var(--vscode-button-foreground, #fff);
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

            .example-container.natural {
                background: #f0f7ff;
                border-color: #c3dafe;
            }

            .example-container.natural .example-header {
                background: #dbeafe;
                color: #1e40af;
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
                font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
                font-size: 13px;
                line-height: 1.5;
                background: transparent;
                color: var(--vscode-editor-foreground, #333);
                overflow-x: auto;
                border: none;
            }

            .example-code.phiprompt {
                color: var(--vscode-symbolIcon-functionForeground, #007ACC);
                font-weight: 500;
            }

            .example-code.natural {
                color: #1e40af;
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
                padding: 8px 16px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
                color: var(--vscode-button-secondaryForeground, #666);
                font-weight: 500;
            }

            .quick-nav-btn:hover, .quick-nav-btn.active {
                background: var(--vscode-button-background, #007ACC);
                color: var(--vscode-button-foreground, #fff);
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

            .getting-started {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 24px;
                border-radius: 12px;
                margin-bottom: 32px;
            }

            .getting-started h3 {
                margin-bottom: 12px;
                font-size: 20px;
            }

            .getting-started p {
                opacity: 0.9;
                line-height: 1.6;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔢 PHIPROMPT Tutorial & Reference</h1>
            <p class="header-subtitle">Complete guide to PHIPROMPT's symbolic mathematical notation for AI prompts</p>
            
            <div class="intro-section">
                <h3>What is PHIPROMPT?</h3>
                <p>PHIPROMPT (.φp) is a symbolic language that uses mathematical notation to create precise, unambiguous AI prompts. It combines logical operators, Greek framework modules, and challenge flags to build structured, analyzable prompt systems.</p>
            </div>

            <div class="search-container">
                <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                </svg>
                <input type="text" class="search-input" placeholder="Search symbols, descriptions, or examples..." id="searchInput">
            </div>

            <div class="quick-nav">
                <button class="quick-nav-btn active" onclick="filterCategory('all')">All Symbols</button>
                <button class="quick-nav-btn" onclick="filterCategory('logic')">Logic</button>
                <button class="quick-nav-btn" onclick="filterCategory('flags')">Challenge Flags</button>
                <button class="quick-nav-btn" onclick="filterCategory('modules')">Framework</button>
                <button class="quick-nav-btn" onclick="filterCategory('domain')">Domain</button>
                <button class="quick-nav-btn" onclick="filterCategory('math')">Math</button>
                <button class="quick-nav-btn" onclick="filterCategory('advanced')">Advanced</button>
            </div>
        </div>

        <div class="content">
            <div class="getting-started">
                <h3>🚀 Getting Started with PHIPROMPT</h3>
                <p><strong>Step 1:</strong> Create a new file with .φp extension<br>
                <strong>Step 2:</strong> Use symbols from this reference to build your prompts<br>
                <strong>Step 3:</strong> Click "Insert" buttons to add symbols directly to your editor<br>
                <strong>Step 4:</strong> Use Ctrl+Shift+P → "PHIPROMPT: Convert" to switch between symbolic and natural language</p>
            </div>

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

            function insertSymbol(symbol) {
                vscode.postMessage({
                    command: 'insertSymbol',
                    symbol: symbol
                });
            }

            function convertExample(example) {
                vscode.postMessage({
                    command: 'convertExample',
                    example: example
                });
            }

            function copyText(text) {
                vscode.postMessage({
                    command: 'copy',
                    text: text
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
                    const examples = Array.from(card.querySelectorAll('.example-code')).map(el => el.textContent.toLowerCase()).join(' ');
                    
                    const matches = symbol.includes(query) || 
                                    description.includes(query) || 
                                    examples.includes(query);
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