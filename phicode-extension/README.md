# (φ) PHICODE - Symbolic Python Extension for VSCode

![PHICODE Logo](icons/phicode-light.png)

A full-featured Visual Studio Code extension that enables symbolic programming with Unicode operators in Python-like syntax (`.φ` files).

## Features

### Core Language Support
- Full syntax highlighting for PHICODE's symbolic operators
- IntelliSense with symbol autocompletion
- Hover documentation for all PHICODE symbols
- Symbol conversion between Python and PHICODE
- Formatting and linting with PHICODE-specific rules

### Advanced Editor Features
- **Smart Symbol Suggestions**: Context-aware symbol recommendations
- **Live Conversion**: Convert between Python and PHICODE with one click
- **Symbol Tutorial**: Built-in interactive symbol reference
- **Refactoring Support**: Rename symbols across files
- **Copilot Integration**: Enhanced AI suggestions for PHICODE

### Complete Symbol Mapping
| Python Keyword | PHICODE Symbol | Example |
|----------------|----------------|---------|
| `def`          | `ƒ`            | `ƒ greet():` |
| `class`        | `ℂ`            | `ℂ Person:` |
| `if/elif/else` | `¿/⤷/⋄`       | `¿ x > 0:` |
| `for/in`       | `∀/∈`          | `∀ x ∈ range(10):` |
| `True/False`   | `✓/⊥`          | `return ✓` |
| *[See full list in tutorial]* | | |

## Installation

### Marketplace Installation
1. Open VSCode Extensions view (`Ctrl+Shift+X`)
2. Search for "PHICODE"
3. Click Install

### Manual Installation
1. Download the `.vsix` package
2. Run in terminal:
   ```bash
   code --install-extension phicode-extension.vsix
   ```

## Usage

### Basic Workflow
1. Create a new file with `.φ` extension
2. Start coding with symbolic operators:
   ```python
   ƒ factorial(n):
       ¿ n ≤ 1:
           ⟲ 1
       ⋄:
           ⟲ n * factorial(n-1)
   ```

### Conversion Commands
- `Convert Python to PHICODE`: Transform Python code to symbolic syntax
- `Convert PHICODE to Python`: Revert to standard Python keywords

### Tutorial Panel
Access the interactive symbol reference via:
- Command Palette → `Show PHICODE Symbol Tutorial`
- Right-click context menu in any `.φ` file

## Configuration

Customize PHICODE behavior in settings:
```json
{
  "phicode.autoConvert": true,
  "phicode.symbolHints": true,
  "[phicode]": {
    "editor.tabSize": 4
  }
}
```

## Contributing
We welcome contributions! Please see our [GitHub repository](https://github.com/Varietyz/phicode-vscode-extension) for:
- Issue reporting
- Feature requests
- Development guidelines

## License
MIT License