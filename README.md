# (φ) PHICODE - Symbolic Python Extension for VSCode

![PHICODE Logo](icons/phicode-light.png)

A comprehensive Visual Studio Code extension that transforms Python development with Unicode symbolic operators. Write elegant, mathematically expressive code in PHICODE (`.φ` files) with full IDE support.

## ✨ Features

### 🎯 Core Language Support
- **Full Syntax Highlighting**: Rich color schemes for all PHICODE symbols
- **IntelliSense Autocompletion**: Smart symbol suggestions with context awareness
- **Live Documentation**: Hover tooltips for every PHICODE operator
- **Seamless Conversion**: Instant translation to PHICODE
- **Advanced Linting**: Real-time error detection with PHICODE-specific rules
- **Document Formatting**: Consistent code styling and organization

### 🚀 Advanced Editor Features
- **Context-Aware Suggestions**: Intelligent symbol recommendations based on code structure
- **Right-Click Conversion**: Transform entire files between Python and PHICODE instantly
- **Interactive Tutorial**: Built-in symbol reference with examples and explanations
- **Symbol Navigation**: Go-to-definition and find-all-references for PHICODE symbols
- **Refactoring Tools**: Rename variables and functions across your entire project
- **GitHub Copilot Integration**: Enhanced AI code suggestions optimized for symbolic syntax
- **Document Symbols**: Outline view and breadcrumb navigation for `.φ` files

### 📚 Complete Symbol Reference
| Category | Python | PHICODE | Example Usage |
|----------|--------|---------|---------------|
| **Functions** | `def` | `ƒ` | `ƒ calculate(x, y):` |
| **Classes** | `class` | `ℂ` | `ℂ DataProcessor:` |
| **Conditionals** | `if`/`elif`/`else` | `¿`/`⤷`/`⋄` | `¿ score > 90: ⤷ score > 70: ⋄:` |
| **Loops** | `for`/`in`/`while` | `∀`/`∈`/`↻` | `∀ item ∈ collection:` |
| **Flow Control** | `break`/`continue`/`return` | `⇲`/`⇉`/`⟲` | `¿ found: ⟲ result` |
| **Boolean Values** | `True`/`False`/`None` | `✓`/`⊥`/`Ø` | `is_valid = ✓` |
| **Logic Operators** | `and`/`or`/`not` | `∧`/`∨`/`¬` | `¿ x > 0 ∧ y < 10:` |
| **Async/Await** | `async`/`await` | `⟳`/`⌛` | `⟳ ƒ fetch_data(): ⌛ response` |
| **Imports** | `import`/`from` | `⇒`/`←` | `← math ⇒ sqrt, pi` |
| **Lambda** | `lambda` | `λ` | `squares = map(λ x: x**2, nums)` |
| **Exceptions** | `try`/`except`/`finally` | `∴`/`⛒`/`⇗` | `∴: risky_operation() ⛒ Exception:` |

## 📦 Installation

### From VSCode Marketplace
1. Open VSCode Extensions panel (`Ctrl+Shift+X`)
2. Search for **"PHICODE"**
3. Click **Install**
4. Reload VSCode when prompted

### Manual Installation
```bash
# Download and install from .vsix file
code --install-extension phicode-extension.vsix
```

## 🛠️ Usage Guide

### Creating PHICODE Files
1. Create a new file with `.φ` extension
2. VSCode automatically activates PHICODE language support
3. Start coding with symbolic operators:

```python
# Classic Python approach
def fibonacci(n):
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)

# PHICODE symbolic approach  
ƒ fibonacci(n):
    ¿ n ≤ 1:
        ⟲ n
    ⋄:
        ⟲ fibonacci(n-1) + fibonacci(n-2)
```

### File Conversion Commands
Access via Command Palette (`Ctrl+Shift+P`):

- **Convert Python to PHICODE**: `phicode.convertPythonToPhicode`
  - Transforms `.py` files to `.φ` with symbolic operators
- **Convert PHICODE to Python**: `phicode.convertPhicodeToPython` 
  - Reverts `.φ` files back to standard Python syntax

### Learning Resources
- **Interactive Tutorial**: `phicode.showTutorial`
  - Complete symbol reference with live examples
  - Best practices and coding patterns
  - Keyboard shortcuts and productivity tips

## ⚙️ Configuration Options

Customize PHICODE in your `settings.json`:

```json
{
  // PHICODE-specific settings
  "phicode.enableAutoCompletion": true,
  "phicode.showSymbolHints": true,
  "phicode.lintOnSave": true,
  "phicode.lintOnType": true,
  
  // Editor preferences for .φ files
  "[phicode]": {
    "editor.tabSize": 4,
    "editor.insertSpaces": true,
    "editor.wordWrap": "bounded",
    "editor.rulers": [80, 120],
    "editor.fontSize": 14
  },
  
  // Symbol rendering
  "phicode.symbolFont": "Fira Code",
  "phicode.enableLigatures": true,
  
  // Copilot integration
  "github.copilot.enable": {
    "phicode": true
  }
}
```

## 🎓 Learning PHICODE

### Key Concepts
- **Mathematical Elegance**: Symbols reflect mathematical notation (∀, ∈, λ)
- **Visual Clarity**: Distinct Unicode characters reduce keyword confusion
- **Semantic Meaning**: Each symbol conveys logical meaning beyond syntax

### Best Practices
```python
# Group related operations visually
ƒ process_data(dataset):
    ¿ ¬dataset:
        ⟲ Ø
    
    results = []
    ∀ item ∈ dataset:
        ¿ validate(item):
            results.append(transform(item))
        ⋄:
            ⇉
    
    ⟲ results

# Leverage symbolic clarity in complex expressions
filter_func = λ x: x.age > 18 ∧ x.score ≥ 85 ∨ x.is_premium ≡ ✓
```

## 🐛 Troubleshooting

### Common Issues
- **Symbols not displaying**: Install a Unicode-compatible font (Fira Code recommended)
- **Linting not working**: Check that file extension is `.φ` and language mode is "phicode"
- **Conversion failed**: Ensure active editor contains valid Python/PHICODE syntax

### Debug Information
Check the **PHICODE** output panel for detailed extension logs and error messages.

## 🤝 Contributing

We welcome community contributions! Visit our [GitHub repository](https://github.com/Varietyz/phicode-vscode-extension) for:

- 🐞 **Bug Reports**: Detailed issue templates
- 💡 **Feature Requests**: Enhancement proposals  
- 👩‍💻 **Pull Requests**: Code contributions and improvements
- 📖 **Documentation**: Help improve guides and examples
- 🌍 **Translations**: Localization support

### Development Setup
```bash
git clone https://github.com/Varietyz/phicode-vscode-extension.git
cd phicode-vscode-extension
npm install
code .
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.