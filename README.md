<div align="center">

# 🧬 Banes Lab VSCode (φ) Extensions

<img src="https://banes-lab.com/assets/images/banes_lab/700px_Main_Animated.gif" width="130" alt="Banes Lab"/>

[![Build Status](https://img.shields.io/github/workflow/status/Varietyz/phi-vscode-extensions//CI?style=flat-square)](https://github.com/Varietyz/phi-vscode-extensions/actions)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Marketplace](https://img.shields.io/badge/VSCode-Marketplace-brightgreen.svg?style=flat-square)](https://marketplace.visualstudio.com/publishers/Banes-Lab)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/Banes-Lab.phicode?style=flat-square&label=PHICODE%20Downloads)](https://marketplace.visualstudio.com/items?itemName=Banes-Lab.phicode)
[![Accessibility](https://img.shields.io/badge/accessibility-WCAG%202.1%20AA-green?style=flat-square)](https://www.w3.org/WAI/WCAG21/AA/)

**Symbolic programming and AI framework development extensions for Visual Studio Code**

*Mathematical notation integration and systematic prompt engineering tools for enhanced development workflows*

[📦 Install Extensions](#-quick-installation) • [📖 Documentation](#-comprehensive-documentation) • [🤝 Community](#-community--support) • [🚀 Get Started](#-quick-start)

</div>

---

## 🎯 Project Overview

**Banes Lab VSCode Extensions** provides two complementary development tools that enhance code representation and AI prompt engineering through mathematical notation and systematic framework design. This repository contains extensions that apply cognitive ergonomics principles to software development and AI interaction design.

### 🌟 **Core Capabilities**

- **🔬 Mathematical Code Representation**: Unicode mathematical notation integration for Python development with enhanced readability patterns
- **🧠 Systematic AI Framework Engineering**: Greek letter module systems for structured prompt architecture and uncertainty handling
- **⚡ Integrated Development Experience**: Extensions function independently or together for flexible workflow adaptation
- **🎓 Research-Based Design**: Implementation based on cognitive load theory and programming language ergonomics research 🧪

---

## 📦 Dual Extension Ecosystem

<div align="center">

| 🐍 **PHICODE Extension** | 🧬 **PHIPROMPT Extension** |
|:------------------------:|:--------------------------:|
| Symbolic Python Programming | AI Framework Engineering |
| Mathematical notation for code | Greek letter module systems |
| Unicode symbol transformation | Uncertainty flag integration |
| Cognitive load considerations 🌀 | Systematic prompt architecture |

</div>

### 🚀 **PHICODE: Symbolic Python Programming**

Mathematical notation integration for Python development:

```python
# Traditional Python
def fibonacci(n):
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(f"fib({i}) = {fibonacci(i)}")
```

```phicode
# PHICODE: Mathematical Python
ƒ fibonacci(n):
    ¿ n ≤ 1:
        ⟲ n
    ⋄:
        ⟲ fibonacci(n-1) + fibonacci(n-2)

∀ i ∈ range(10):
    π(f"fib({i}) = {fibonacci(i)}")
```

### 🧬 **PHIPROMPT: AI Framework Engineering**

Systematic AI prompt development using symbolic frameworks:

```phiprompt
##[M.A.I.N.INPUT]
Collect.project_elements.M_A_I_N : {
    Methodology.systematic_approach, 
    Architecture.framework_design, 
    Implementation.practical_execution, 
    Navigation.user_experience
}

##[ACTIVATE_MODULE]
activate.Φ = ∀(M, A, I, N) → ALWAYS{
    ν.preprocess.capture(project_request) → 
    μ.input_collection.extract(M, A, I, N) → Ψ.ρ → Ψ.ℜ → Π.run → 
    Ω.output[
        Technical_Documentation : M → system_specifications ∧ 🔧comprehensive_setup,
        User_Guide : A → interaction_patterns ∧ 📝step_by_step_guidance,
        Architecture : I → implementation_design ∧ 🗃️structural_integrity,
        Navigation : N → user_experience ∧ ⚠accessibility_considerations
    ] ⊕ uncertainty_flags ⊕ complexity_indicators
}
```

---

## 📋 System Requirements

| Component | Requirement | Notes |
|-----------|-------------|-------|
| **VS Code** | ≥ 1.74.0 | Latest stable recommended |
| **Node.js** | ≥ 16.0.0 | For development contributions |
| **Python** | ≥ 3.8 | Required for PHICODE execution |
| **Memory** | ≥ 4GB RAM | For large project indexing |
| **Font Support** | Unicode compatibility | Mathematical symbol rendering |

---

## 🚀 Quick Installation

### ⚡ **Complete Setup (3 steps)**

```bash
# 1️⃣ Install PHICODE Extension
code --install-extension Banes-Lab.phicode

# 2️⃣ Install PHIPROMPT Extension  
code --install-extension Banes-Lab.phiprompt

# 3️⃣ Install PHICODE Runtime (for execution)
pip install phicode
```

### ✅ **Verification Steps**

```bash
# Check extensions
code --list-extensions | grep -E "(phicode|phiprompt)"

# Test PHICODE functionality
echo 'π("Hello, PHICODE!")' > test.φ
phicode test.φ
# Expected: Hello, PHICODE!

# Test PHIPROMPT functionality
# Create test.φp file and verify syntax highlighting
```

> **💡 Quick Start**: Create `.φ` files for PHICODE or `.φp` files for PHIPROMPT to experience enhanced development capabilities immediately.

---

## 🛠️ Extension Features

### 🐍 **PHICODE Extension Capabilities**

**Core Language Support**:
- **Syntax Highlighting**: Mathematical symbol recognition with semantic coloring
- **IntelliSense**: Context-aware symbol completion with Python equivalents
- **Error Detection**: Real-time validation for symbolic syntax patterns
- **Code Actions**: Bidirectional conversion between Python and PHICODE

**Development Tools**:
- **Symbol Reference**: Interactive tutorial system with live examples
- **Format on Save**: Automatic mathematical notation formatting
- **Go-to Definition**: Cross-file navigation between PHICODE and Python modules
- **Runtime Integration**: Direct execution via `phicode` command ⚠ *requires separate installation*

**Key Symbol Mappings**:
| PHICODE | Python | Context | Example |
|---------|--------|---------|---------|
| **ƒ** | `def` | Function definition | `ƒ calculate(x):` |
| **¿** | `if` | Conditional statement | `¿ x > 0:` |
| **∀** | `for` | Iteration | `∀ item ∈ collection:` |
| **⟲** | `return` | Return value | `⟲ result` |
| **π** | `print` | Output function | `π("message")` |

### 🧬 **PHIPROMPT Extension Capabilities**

**Framework Architecture**:
- **Greek Module System**: Φ, Ψ, ρ, ν, α, κ, μ, ℜ, Π processing pipeline support
- **Uncertainty Integration**: Challenge flags (🌀, 🧱, 🧪, ⚠) with semantic highlighting
- **Breadcrumb Navigation**: Hierarchical framework structure visualization
- **Template Generation**: Built-in patterns for common framework types

**Advanced Features**:
- **Framework Validation**: Real-time compliance checking with configurable rules
- **Symbol Mapping**: Automatic natural language equivalent generation
- **Complexity Analysis**: Automated assessment of framework sophistication 📊
- **Pipeline Visualization**: ξ→ε→α→ρ→ω→φ→κ→σ→δ processing chain representation

**Challenge Flag System**:
| Flag | Meaning | Usage Context |
|------|---------|---------------|
| **🌀** | Metaphorical content | Interpretive statements requiring human judgment |
| **🧱** | Complex logic | Nested conditional structures |
| **🧪** | Unverified claims | Hypotheses requiring empirical validation |
| **⚠** | Explicit uncertainty | Incomplete or variable information |

---

## 📁 Repository Structure

```
vscode-extensions/
├─ 📄 .φc
├─ ⚖️ LICENSE
├─ 📘 README.md
├─ 📂 phicode-extension
│   ├─ 📂 icons
│   │   ├─ 🖼️ phicode-dark.png
│   │   ├─ 📄 phicode-file-icon.svg
│   │   ├─ 🔧 phicode-icon-theme.json
│   │   ├─ 🖼️ phicode-light.png
│   │   └─ 🖼️ python-logo.png
│   ├─ 🔧 language-configuration.json
│   ├─ ⚖️ LICENSE
│   ├─ 🔧 package.json
│   ├─ 📘 README.md
│   ├─ 📂 snippets
│   │   └─ 🔧 phicode.json
│   ├─ 📂 src
│   │   ├─ 📄 codeActionProvider.ts
│   │   ├─ 📄 completionProvider.ts
│   │   ├─ 📄 copilotConfig.ts
│   │   ├─ 📄 definitionProvider.ts
│   │   ├─ 📄 extension.ts
│   │   ├─ 📄 formatter.ts
│   │   ├─ 📄 hoverProvider.ts
│   │   ├─ 📄 inlineSuggestions.ts
│   │   ├─ 📄 linter.ts
│   │   ├─ 📄 refactorProvider.ts
│   │   ├─ 📄 symbolProvider.ts
│   │   └─ 📄 tutorials.ts
│   ├─ 📂 syntaxes
│   │   └─ 🔧 phicode.tmLanguage.json
│   └─ 🔧 tsconfig.json
│
└─ 📂 phiprompt-extension
    ├─ 📂 icons
    │   ├─ 🖼️ phiprompt-dark.png
    │   ├─ 📄 phiprompt-file-icon.svg
    │   ├─ 🔧 phiprompt-icon-theme.json
    │   └─ 🖼️ phiprompt-light.png
    ├─ 🔧 language-configuration.json
    ├─ ⚖️ LICENSE
    ├─ 🔧 package.json
    ├─ 📘 README.md
    ├─ 📂 snippets
    │   ├─ 🔧 phiprompt-suggestions.json
    │   └─ 🔧 phiprompt.json
    ├─ 📂 src
    │   ├─ 📄 breadcrumbNavigation.ts
    │   ├─ 📄 codeActionProvider.ts
    │   ├─ 📄 completionProvider.ts
    │   ├─ 📄 copilotConfig.ts
    │   ├─ 📄 definitionProvider.ts
    │   ├─ 📄 extension.bak
    │   ├─ 📄 extension.bak2
    │   ├─ 📄 extension.ts
    │   ├─ 📄 formatter.ts
    │   ├─ 📄 hoverProvider.ts
    │   ├─ 📄 inlineSuggestions.ts
    │   ├─ 📄 linter.ts
    │   ├─ 📄 refactorProvider.ts
    │   ├─ 📄 symbolicMap.ts
    │   ├─ 📄 symbolProvider.ts
    │   └─ 📄 tutorials.ts
    ├─ 📂 syntaxes
    │   └─ 🔧 phiprompt.tmLanguage.json
    └─ 🔧 tsconfig.json
```

---

## 🔧 Configuration

### ⚙️ **Extension Settings**

Access via `File → Preferences → Settings` and search for "PHICODE" or "PHIPROMPT":

**PHICODE Configuration**:
```json
{
  "phicode.autoConvert": true,
  "phicode.symbolHints": true,
  "phicode.formatting.spaceAroundOperators": true,
  "phicode.enableComplexityAnalysis": true
}
```

**PHIPROMPT Configuration**:
```json
{
  "phiprompt.autoValidation": true,
  "phiprompt.showBreadcrumbs": true,
  "phiprompt.uncertaintyThreshold": 0.2,
  "phiprompt.enableSubmoduleNavigation": true
}
```

### ⌨️ **Keyboard Shortcuts**

| Shortcut | Command | Extension | Description |
|----------|---------|-----------|-------------|
| `Ctrl+Alt+P` | Convert Python → PHICODE | PHICODE | Transform traditional syntax |
| `Ctrl+Alt+Shift+P` | Convert PHICODE → Python | PHICODE | Reverse transformation |
| `Ctrl+Shift+V` | Validate Framework | PHIPROMPT | Check framework compliance |
| `Ctrl+Shift+M` | Generate Symbol Mapping | PHIPROMPT | Create reference documentation |

---

## 📖 Comprehensive Documentation

### 🎓 **Learning Resources**

**PHICODE Learning Path**:
1. **[Symbol Reference](phicode-extension/README.md#symbol-reference)** - Complete mathematical notation guide
2. **[Usage Examples](phicode-extension/README.md#usage-examples)** - Practical implementation patterns
3. **[Runtime Integration](phicode-extension/README.md#runtime-integration)** - Execution environment setup
4. **[Best Practices](phicode-extension/README.md#best-practices)** - Coding conventions and optimization

**PHIPROMPT Learning Path**:
1. **[Framework Architecture](phiprompt-extension/README.md#framework-architecture)** - Greek module system overview
2. **[Pipeline Processing](phiprompt-extension/README.md#pipeline-processing)** - ξ→ε→α→ρ→ω→φ→κ→σ→δ sequence
3. **[Uncertainty Handling](phiprompt-extension/README.md#uncertainty-handling)** - Challenge flag implementation
4. **[Advanced Patterns](phiprompt-extension/README.md#advanced-patterns)** - Complex framework development

### 📚 **Academic Foundation**

The extensions are built upon research in:
- **Cognitive Load Theory**: Sweller's framework for optimizing mental processing
- **Programming Language Ergonomics**: Human-computer interaction in code representation
- **Mathematical Semiotics**: Symbol-meaning relationships in formal notation
- **AI Prompt Engineering**: Systematic approaches to language model interaction

🧪 *Empirical validation of cognitive benefits is ongoing through controlled user studies*

---

## 🛡️ Development Features

### 🎨 **Code Quality Tools**

**PHICODE Quality Assurance**:
- **Real-time Linting**: Immediate feedback for syntax errors and style violations
- **Symbol Validation**: Mathematical notation correctness verification
- **Performance Optimization**: Debounced analysis for responsive editing experience
- **Cross-platform Testing**: Compatibility verification across operating systems

**PHIPROMPT Quality Assurance**:
- **Framework Validation**: Structural integrity checking for Greek module systems
- **Pipeline Verification**: Sequential processing chain validation
- **Uncertainty Flag Analysis**: Challenge marker placement optimization
- **Complexity Assessment**: Automated sophistication level evaluation

### 🔍 **Debugging and Navigation**

**Advanced Navigation Features**:
- **Go-to Definition**: Symbol resolution across files and languages
- **Find All References**: Comprehensive usage tracking
- **Breadcrumb Navigation**: Hierarchical structure visualization (PHIPROMPT)
- **Symbol Indexing**: Workspace-wide mathematical notation cataloging

**Error Detection and Recovery**:
- **Context-aware Validation**: Scope-sensitive error identification
- **Quick Fix Suggestions**: Automated correction proposals
- **Educational Feedback**: Learning-oriented error explanations
- **Progressive Error Recovery**: Graceful handling of partial syntax

---

## ♿ Accessibility

### 🌟 **Universal Design Implementation**

**Visual Accessibility**:
- **High Contrast Support**: Automatic adaptation to system preferences
- **Font Customization**: Support for dyslexia-friendly and accessibility-optimized typefaces
- **Zoom Compatibility**: Proper scaling with editor zoom levels
- **Color Independence**: Information conveyed through multiple visual channels

**Motor Accessibility**:
- **Keyboard Navigation**: Complete functionality without mouse interaction
- **Voice Recognition**: Compatibility with speech-to-text software
- **Switch Navigation**: Support for alternative input devices
- **Gesture Customization**: Configurable interaction patterns

**Cognitive Accessibility**:
- **Clear Documentation**: Jargon-free explanations with progressive complexity
- **Consistent Terminology**: Standardized vocabulary throughout interfaces
- **Memory Aids**: Visual cues and reference materials integration
- **Error Prevention**: Validation and confirmation for potentially destructive actions

### 📋 **Compliance Standards**

✅ **WCAG 2.1 AA Compliant**
- **Perceivable**: Content accessible to assistive technologies
- **Operable**: Interface usable with various input methods
- **Understandable**: Clear information and operation patterns
- **Robust**: Compatibility with current and future assistive technologies

**Testing Protocols**:
- **Automated Accessibility Scanning**: Continuous compliance verification
- **Manual Assistive Technology Testing**: Regular validation with screen readers and other tools
- **User Feedback Integration**: Community input from accessibility advocates
- **Expert Review Process**: Professional accessibility audit participation

> **🤝 Accessibility Commitment**: We continuously improve accessibility features. Report barriers through our [accessibility feedback form](https://github.com/Varietyz/phi-vscode-extensions/issues/new?template=accessibility.md).

---

## 🤝 Contributing

### 🌟 **Contribution Opportunities**

**Code Development**:
- **Bug Resolution**: Issue identification and systematic fixing
- **Feature Implementation**: New capability development with comprehensive testing
- **Performance Optimization**: Efficiency improvements and resource usage reduction
- **Testing Expansion**: Coverage improvement and quality assurance enhancement

**Documentation and Education**:
- **Tutorial Creation**: Learning material development for various skill levels
- **Translation Services**: Localization for international accessibility
- **Video Content**: Multimedia educational resource creation
- **Best Practice Documentation**: Usage pattern and optimization guideline development

**Design and User Experience**:
- **Icon Design**: Accessible and intuitive visual asset creation
- **Theme Development**: Color scheme and visual style design
- **Interface Optimization**: User workflow and interaction pattern improvement
- **Accessibility Enhancement**: Universal design feature development

### 🚀 **Development Setup**

**Prerequisites**:
```bash
# Required development tools
node --version    # ≥ 16.0.0
npm --version     # ≥ 8.0.0
code --version    # ≥ 1.74.0
git --version     # ≥ 2.25.0
```

**Getting Started**:
```bash
# 1️⃣ Repository setup
git clone https://github.com/Varietyz/phi-vscode-extensions.git
cd phi-vscode-extension

# 2️⃣ Extension-specific setup
cd phicode-extension  # or phiprompt-extension
npm install
npm run compile

# 3️⃣ Development environment launch
code .
# Press F5 to start debugging session
```

**Development Workflow**:
```bash
# Continuous compilation
npm run watch

# Testing execution
npm test

# Extension packaging
npm run build
```

### 📋 **Contribution Guidelines**

**Pull Request Process**:
1. **Fork and Branch**: Repository duplication and feature branch creation
2. **Implementation**: Change development with comprehensive test coverage
3. **Documentation**: Feature documentation and existing material updates
4. **Testing**: Multi-platform and VS Code version compatibility verification
5. **Submission**: Pull request creation with detailed change description

**Code Standards**:
- **TypeScript**: Strict type checking and modern language features
- **ESLint**: Automated code quality and style consistency
- **Prettier**: Uniform formatting across all source files
- **Testing**: Minimum 80% coverage for new feature implementations

**Commit Convention**:
```bash
# Format: type(scope): description
feat(completion): add fuzzy matching for symbol completion
fix(linter): resolve async context validation error
docs(readme): update installation instructions
test(formatter): expand edge case coverage
```

---

## ❓ Support & FAQ

### 🆘 **Getting Help**

**Community Support Channels**:
- **📋 GitHub Discussions**: [Community forum](https://github.com/Varietyz/phi-vscode-extensions/discussions) for questions and collaboration
- **📧 Direct Support**: jay@banes-lab.com for technical assistance and feedback
- **📖 Documentation Hub**: Comprehensive guides available in extension-specific README files
- **🎓 Tutorial System**: Interactive learning available through VS Code command palette

**Response Time Expectations**:
- **Critical Issues**: Within 24 hours for functionality-blocking problems
- **General Questions**: Within 72 hours for usage and configuration support
- **Feature Requests**: Within 1 week for enhancement proposal evaluation
- **Documentation**: Within 48 hours for clarification and correction requests

### ❓ **Frequently Asked Questions**

<details>
<summary><strong>🔄 Can I use both extensions simultaneously?</strong></summary>

**Yes!** The extensions are designed for independent or complementary usage:

- **Independent Use**: Each extension provides complete functionality for its domain
- **Integrated Workflow**: PHICODE for implementation, PHIPROMPT for AI framework design
- **File Type Separation**: `.φ` files for PHICODE, `.φp` files for PHIPROMPT
- **No Conflicts**: Extensions use separate activation patterns and resource allocation

**Configuration Example**:
```json
{
  "files.associations": {
    "*.φ": "phicode",
    "*.φp": "phiprompt"
  }
}
```

</details>

<details>
<summary><strong>⚠ What are the system performance impacts?</strong></summary>

**Performance Characteristics**:

**PHICODE Extension**:
- **Memory Usage**: <50MB baseline, scaling with document complexity
- **CPU Impact**: Minimal during editing, brief spikes during conversion operations
- **Startup Time**: <2 seconds extension activation 🌀 *varies by system configuration*

**PHIPROMPT Extension**:
- **Memory Usage**: <30MB for framework analysis and symbol processing
- **Real-time Analysis**: Debounced validation reduces continuous processing overhead
- **Large Documents**: Optimized handling for frameworks exceeding 1000 lines

**Optimization Recommendations**:
- **Selective Features**: Disable real-time validation for very large files
- **Resource Monitoring**: Use VS Code's built-in performance monitoring tools
- **Hardware Considerations**: 8GB+ RAM recommended for complex project analysis

</details>

<details>
<summary><strong>🔤 How do I input mathematical symbols efficiently?</strong></summary>

**Symbol Input Methods**:

**Auto-completion (Recommended)**:
- Type partial Python keywords to trigger symbol suggestions
- Example: Type "def" → suggests "ƒ" replacement
- Fuzzy matching: "fo" → suggests "∀" (for)

**VS Code Snippets**:
- Built-in snippet expansion for common patterns
- Type framework templates and press Tab for completion
- Customizable snippet creation for personal workflows

**Keyboard Shortcuts**:
- Configure custom key bindings for frequently used symbols
- Support for input method editors (IME) for international users
- Integration with accessibility tools for alternative input methods

**Symbol Reference**:
```bash
# Access interactive symbol guide
Ctrl+Shift+P → "PHICODE: Show Symbol Tutorial"
Ctrl+Shift+P → "PHIPROMPT: Show Symbol Reference"
```

</details>

<details>
<summary><strong>🔧 How do I troubleshoot extension conflicts?</strong></summary>

**Conflict Resolution Process**:

**Step 1: Diagnostic Information Collection**
```bash
# Generate extension debug report
Ctrl+Shift+P → "Developer: Reload Window With Extensions Disabled"
# Test core functionality in clean environment
```

**Step 2: Extension Isolation Testing**
```bash
# Disable other language extensions temporarily
# Test PHICODE/PHIPROMPT functionality individually
# Re-enable extensions one by one to identify conflicts
```

**Step 3: Configuration Reset**
```json
// Remove conflicting settings from settings.json
{
  // Clear all "phicode.*" and "phiprompt.*" entries
  // Restart VS Code and test default configuration
}
```

**Common Conflict Sources**:
- **Language Service Competition**: Multiple Python language servers
- **Keybinding Overlaps**: Conflicting keyboard shortcut assignments
- **Theme Conflicts**: Syntax highlighting color scheme interference
- **Resource Competition**: Memory or CPU intensive extensions

</details>

<details>
<summary><strong>🧪 What is the research foundation for these tools?</strong></summary>

**Academic Research Base**:

**Cognitive Load Theory Applications**:
- **Working Memory Optimization**: Symbol-to-concept mapping reduces translation overhead
- **Intrinsic Load Management**: Mathematical notation aligns with existing mental models
- **Germane Load Enhancement**: Cognitive resources redirected to problem-solving activities

**Programming Language Ergonomics**:
- **Semiotics Research**: Pierce's triadic model applied to programming symbol systems
- **Human-Computer Interaction**: Interface design optimized for mathematical literacy
- **Accessibility Research**: Universal design principles for diverse user populations

**Empirical Validation Status**:
- **🧪 Controlled Studies**: Currently in progress for cognitive benefit measurement
- **📊 User Experience Data**: Collection ongoing through anonymized usage analytics
- **🔍 Longitudinal Analysis**: Extended user adaptation pattern investigation planned

**Research Limitations**:
- **⚠ Limited Sample Size**: Current validation limited to early adopter populations**
- **🌀 Cultural Variance**: Mathematical notation familiarity varies across educational systems**
- **📝 Preliminary Findings**: Cognitive benefit claims require expanded empirical validation**

</details>

---

## 📊 Project Information

### 🏢 **Development Team**

**Creator and Lead Developer**:
- **Jay Baleine** - [@Varietyz](https://github.com/Varietyz)
- **Organization**: [Banes Lab](https://banes-lab.com)
- **Contact**: jay@banes-lab.com

### 📈 **Project Statistics**

![GitHub Stars](https://img.shields.io/github/stars/Varietyz/phi-vscode-extensions/?style=social)
![GitHub Forks](https://img.shields.io/github/forks/Varietyz/phi-vscode-extensions/?style=social)
![GitHub Issues](https://img.shields.io/github/issues/Varietyz/phi-vscode-extensions/)
![GitHub Contributors](https://img.shields.io/github/contributors/Varietyz/phi-vscode-extensions/)

**Project Health Metrics**:

[![Security](https://img.shields.io/snyk/vulnerabilities/github/Varietyz/phi-vscode-extensions/)](https://snyk.io/test/github/Varietyz/phi-vscode-extensions/)

### 📜 **License and Legal**

**License**: MIT License - see [LICENSE](LICENSE) file for complete terms

**Key License Points**:
- ✅ **Commercial Use**: Permitted for business and enterprise applications
- ✅ **Modification**: Source code adaptation and customization allowed
- ✅ **Distribution**: Free sharing and redistribution
- ✅ **Private Use**: No restrictions on personal or internal usage
- ⚠ **No Warranty**: Software provided "as-is" without guarantees

**Privacy and Data Protection**:
- **Local Processing**: All symbol conversion and framework analysis occurs locally
- **Anonymous Analytics**: Optional usage statistics collection (opt-out available)
- **No Code Transmission**: Source code never leaves your development environment
- **GDPR Compliance**: European data protection standards adherence

---

## 🌍 Community & Support

### 💬 **Community Channels**

- **🏠 Website**: [banes-lab.com](https://banes-lab.com)
- **🙋 GitHub Repository**: [VSCode Extensions](https://github.com/Varietyz/phi-vscode-extensions)
- **📧 Email Support**: jay@banes-lab.com
- **📦 PHICODE Runtime**: [PyPI Package](https://pypi.org/project/phicode/)

---

<div align="center">

**🎯 Ready to transform your development workflow?**

[**📦 Install PHICODE**](https://marketplace.visualstudio.com/items?itemName=Banes-Lab.phicode) • [**📦 Install PHIPROMPT**](https://marketplace.visualstudio.com/items?itemName=Banes-Lab.phiprompt) • [**📚 Read Documentation**](phicode-extension/README.md) • [**🤝 Join Community**](https://github.com/Varietyz/phi-vscode-extensions/discussions)

**Complete Installation**:
```bash
# Install both extensions
code --install-extension Banes-Lab.phicode
code --install-extension Banes-Lab.phiprompt

# Install runtime engine
pip install phicode
```

---

---

**Made with ❤️ by [Jay Baleine - Banes Lab](https://banes-lab.com)** 

**© 2025 Banes Lab • MIT License • [PHICODE Runtime](https://github.com/Varietyz/pip-phicode) • [Extensions Repository](https://github.com/Varietyz/phi-vscode-extensions)**

</div>