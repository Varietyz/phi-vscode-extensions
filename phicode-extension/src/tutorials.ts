import * as vscode from 'vscode';

const tutorialContent = [
    { symbol: 'ƒ', description: 'Function definition symbol, replaces "def".', example: 'ƒ add(a, b): return a + b' },
    { symbol: 'ℂ', description: 'Class definition symbol, replaces "class".', example: 'ℂ Person:\n  ƒ __init__(self, name):\n    self.name = name' },
    { symbol: '¿', description: 'If statement symbol, replaces "if".', example: '¿ x > 0:\n  print("Positive")' },
    { symbol: '⤷', description: 'Elif statement symbol, replaces "elif".', example: '¿ x > 0:\n  print("Positive")\n⤷ x == 0:\n  print("Zero")' },
    { symbol: '⋄', description: 'Else statement symbol, replaces "else".', example: '¿ x > 0:\n  print("Positive")\n⋄:\n  print("Non-positive")' },
    { symbol: '∀', description: 'Universal quantifier - used for "for" loops.', example: '∀ i ∈ range(5):\n  print(i)' },
    { symbol: '∈', description: 'Set membership - means "in".', example: 'x ∈ my_list' },
    { symbol: '↻', description: 'While loop symbol, replaces "while".', example: '↻ condition:\n  do_something()' },
    { symbol: '⇲', description: 'Break statement symbol.', example: '⇲' },
    { symbol: '⇉', description: 'Continue statement symbol.', example: '⇉' },
    { symbol: '⟲', description: 'Return statement symbol.', example: '⟲ result' },
    { symbol: '⟰', description: 'Yield statement symbol.', example: '⟰ item' },
    { symbol: '↑', description: 'Raise exception symbol.', example: '↑ ValueError("error")' },
    { symbol: '∴', description: 'Try block symbol.', example: '∴:\n  risky_code()' },
    { symbol: '⛒', description: 'Except block symbol.', example: '⛒ ValueError:\n  handle_error()' },
    { symbol: '⇗', description: 'Finally block symbol.', example: '⇗:\n  cleanup()' },
    { symbol: '∥', description: 'With statement symbol.', example: '∥ open("file.txt") as f:\n  data = f.read()' },
    { symbol: '↦', description: 'As keyword symbol.', example: '∥ open("file.txt") ↦ f:' },
    { symbol: '⇒', description: 'Import statement symbol.', example: '⇒ os' },
    { symbol: '←', description: 'From-import statement symbol.', example: '← math import sqrt' },
    { symbol: '✓', description: 'Boolean True symbol.', example: 'flag = ✓' },
    { symbol: '⊥', description: 'Boolean False symbol.', example: 'flag = ⊥' },
    { symbol: 'Ø', description: 'None/null symbol.', example: 'result = Ø' },
    { symbol: '∧', description: 'Logical AND symbol.', example: 'x > 0 ∧ y > 0' },
    { symbol: '∨', description: 'Logical OR symbol.', example: 'x < 0 ∨ y < 0' },
    { symbol: '¬', description: 'Logical NOT symbol.', example: '¬ done' },
    { symbol: '≡', description: 'Identity comparison symbol, replaces "is".', example: 'a ≡ b' },
    { symbol: 'λ', description: 'Lambda (anonymous function) symbol.', example: 'ƒ f = λ x: x * 2' },
    { symbol: '∂', description: 'Delete symbol, replaces "del".', example: '∂ my_var' },
    { symbol: '⟁', description: 'Global scope symbol.', example: '⟁ x' },
    { symbol: '∇', description: 'Nonlocal scope symbol.', example: '∇ x' },
    { symbol: '‼', description: 'Assert statement symbol.', example: '‼ x > 0' },
    { symbol: '⟳', description: 'Async keyword symbol.', example: '⟳ ƒ async_func():' },
    { symbol: '⌛', description: 'Await keyword symbol.', example: 'result = ⌛ async_call()' },
    { symbol: '⋯', description: 'Pass statement symbol.', example: '⋯' },
    { symbol: 'π', description: 'Print function symbol.', example: 'π("Hello, PHICODE")' },
];


export async function showTutorialPanel(context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
        'phicodeTutorial',
        'PHICODE Symbol Tutorial',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

    const html = generateHtml(tutorialContent);
    panel.webview.html = html;
}

function generateHtml(content: { symbol: string; description: string; example: string }[]) {
    let stepsHtml = '';
    content.forEach(({ symbol, description, example }, i) => {
        stepsHtml += `
        <section style="margin-bottom:1.5em;">
            <h2>${symbol}</h2>
            <p>${description}</p>
            <pre style="background:#f3f3f3; padding:10px; border-radius:4px;">${example}</pre>
        </section>`;
    });

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>PHICODE Symbol Tutorial</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; padding: 20px; line-height: 1.6; }
            h2 { color: #007acc; }
            pre { font-family: 'Courier New', monospace; }
        </style>
    </head>
    <body>
        <h1>PHICODE Symbol Usage Tutorial</h1>
        ${stepsHtml}
    </body>
    </html>
    `;
}
