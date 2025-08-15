# PHIPROMPT VSCode Extension

<div align="center">

![PHICODE Logo](icons/phiprompt-light.png)

[![VSCode Extension](https://img.shields.io/badge/VSCode-Extension-blue.svg)](https://marketplace.visualstudio.com/items?itemName=Banes-Lab.phiprompt)
[![Framework](https://img.shields.io/badge/Framework-PHIPROMPT-purple.svg)](https://github.com/Varietyz/phi-vscode-extensions/tree/main/phiprompt-extension)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.1-orange.svg)](package.json)
[![Accessibility](https://img.shields.io/badge/accessibility-WCAG%202.1%20AA-green)](https://www.w3.org/WAI/WCAG21/AA/)

**Enhanced Φ framework support with full hierarchical navigation, breadcrumb trails, framework validation, and comprehensive symbolic language integration for Visual Studio Code.**

A comprehensive development environment for the PHIPROMPT symbolic framework, enabling advanced AI prompt engineering through mathematical notation, Greek letter modules, and sophisticated pipeline architectures.

</div>

---

## 🚀 Quick Start (3 steps)

- [x] ✅ **Step 1**: Install dependencies
- [ ] ⚙️ **Step 2**: Configure settings  
- [ ] 🎯 **Step 3**: Run your first example

### ⚡ Installation (2 minutes)

```bash
# Install from VSCode Marketplace
code --install-extension Banes-Lab.phiprompt

# Or download from GitHub releases
git clone https://github.com/Varietyz/phi-vscode-extensions/tree/main/phiprompt-extension.git
cd phi-vscode-extension
npm install && npm run package
```

### ✅ First Steps

1. **Create a new file** with extension `.φp`
2. **Start typing** framework patterns - auto-completion will guide you
3. **Use Ctrl+Shift+P** to access the command palette for framework tools
4. **Enable breadcrumbs** for hierarchical navigation through complex frameworks

> **💡 Pro Tip:** Use `Ctrl+Shift+M` to automatically generate symbol mappings for your frameworks.

---

## 📖 Table of Contents

- [🎯 Core Features](#-core-features)
- [📋 System Requirements](#-system-requirements)
- [⚙️ Configuration](#️-configuration)
- [🔧 Framework Architecture](#-framework-architecture)
- [📝 Usage Examples](#-usage-examples)
- [🎨 Symbol Reference](#-symbol-reference)
- [🛠️ Development Features](#️-development-features)
- [♿ Accessibility](#-accessibility)
- [🤝 Contributing](#-contributing)
- [❓ Support & FAQ](#-support--faq)
- [📄 License](#-license)

---

## 🎯 Core Features

### **🔍 Advanced Language Support**
- **Symbolic Language Recognition** - Complete PHIPROMPT syntax highlighting with mathematical notation
- **Greek Letter Modules** - Full support for Φ, Ψ, ρ, ν, α, κ, μ, ℜ, Π framework components
- **Unicode Math Symbols** - Comprehensive rendering of ∀, ∃, →, ∧, ∨, ⟹ and specialized operators
- **File Type Association** - Native support for `.φp`, `.phip`, and `.φc` files

### **🎨 Enhanced Development Experience**
- **Intelligent Auto-Completion** - Context-aware suggestions for framework patterns and symbolic operators
- **Framework Validation** - Real-time compliance checking with automatic error detection on save
- **Hierarchical Navigation** - Advanced breadcrumb system for complex framework structures
- **Pipeline Visualization** - Visual representation of ξ→ε→α→ρ→ω→φ→κ→σ→δ processing chains

### **🏗️ Professional Workflow Integration**
- **GitHub Copilot Support** - Seamless integration with AI coding assistance for symbolic frameworks
- **Symbolic Mapping Generation** - Automatic creation of natural language equivalents for complex symbolic expressions
- **Framework Templates** - Built-in snippets for common patterns including business analysis, technical documentation, and creative content frameworks
- **Uncertainty Flag Highlighting** - Visual indicators for ⚠️, 🌀, 🧱, 🧪 challenge markers

### **✅ Quality Assurance Tools**
- **Complexity Analysis** - Automated assessment of framework sophistication with performance recommendations
- **Code Actions** - Quick fixes for common framework syntax issues and optimization suggestions
- **Format Conversion** - Bidirectional transformation between symbolic notation and natural language
- **Tutorial Integration** - Interactive learning system for framework development best practices

---

## 📋 System Requirements

| Component | Requirement | Notes |
|-----------|-------------|-------|
| **VS Code** | ≥ 1.74.0 | Latest stable recommended |
| **Node.js** | ≥ 16.0.0 | For development contributions only |
| **TypeScript** | ≥ 4.9.4 | Included with development setup |
| **Memory** | ≥ 4GB RAM | For large project indexing |

> **⚠️ Note:** This extension focuses on VSCode integration. For runtime execution capabilities, see the companion [PHICODE Runtime Engine](https://pypi.org/project/phicode/).

---

## ⚙️ Configuration

### **🎛️ User Settings**

Access settings through `File > Preferences > Settings` and search for "PHIPROMPT":

```json
{
  "phiprompt.autoValidation": true,
  "phiprompt.showBreadcrumbs": true,
  "phiprompt.enableSubmoduleNavigation": true,
  "phiprompt.validatePipelineSequences": true,
  "phiprompt.highlightUncertaintyFlags": true,
  "phiprompt.uncertaintyThreshold": 0.2,
  "phiprompt.enableComplexityAnalysis": true
}
```

### **⌨️ Keyboard Shortcuts**

| Shortcut | Command | Description |
|----------|---------|-------------|
| `Ctrl+Shift+V` | Validate Framework | Run comprehensive framework compliance check |
| `Ctrl+Shift+N` | Navigate to Section | Quick navigation through framework hierarchy |
| `Ctrl+Shift+C` | Convert to Text | Transform symbols to natural language |
| `Ctrl+Shift+S` | Convert to Symbols | Transform text to symbolic notation |
| `Ctrl+Shift+A` | Analyze Complexity | Assess framework sophistication level |
| `Ctrl+Shift+M` | Generate Symbol Mapping | Auto-create symbol reference documentation |

<details>
<summary>🔧 **Advanced Setup** (Click to expand)</summary>

### **🎨 Workspace Configuration**

For team projects, create a `.vscode/settings.json` file:

```json
{
  "[phiprompt]": {
    "editor.insertSpaces": true,
    "editor.tabSize": 2,
    "editor.formatOnSave": true,
    "editor.quickSuggestions": {
      "other": true,
      "comments": false,
      "strings": false
    },
    "breadcrumbs.enabled": true
  }
}
```

### **🔗 File Associations**

```json
{
  "files.associations": {
    "*.phi": "phiprompt",
    "*.phicode": "phiprompt"
  }
}
```

</details>

---

## 🔧 Framework Architecture

### **🧠 Core Components**

The PHIPROMPT framework implements a sophisticated pipeline architecture:

```javascript
Φ = {
    Ψ: {  // Optimizer Module
        ρ: {filter: /dup|overconf|loops/g, consolidator: [merge,collapse]},
        ν: [entity,attr,val,rel], α: [conflicts,claims,loops,novelty],
        μ: [abstract,fig,subj], κ: [nest,vague,impl]
    },
    ℜ: {  // Forensics Module
        models: [causal,triangulation,anomaly,custody,refinement],
        principles: [evidence,falsify,docs,error]
    },
    Π: {  // Processor Module
        compile: { ξ→ε→α→ν→ρ→χ→ω→φ→β→κ→σ→λ→μ→τ→π→δ }
    }
}
```

### **🏗️ Module Hierarchy**

- **Φ (Framework)** - Main pipeline coordinator
- **Ψ (Optimizer)** - Input processing and validation
  - **ρ (Filter)** - Data cleaning and consolidation
  - **ν (Normalizer)** - Entity standardization
  - **α (Validator)** - Conflict detection
  - **μ (Detector)** - Content classification
  - **κ (Handler)** - Nested structure management
- **ℜ (Forensics)** - Evidence-based analysis
- **Π (Processor)** - Sequential transformation pipeline

### **⚙️ Pipeline Processing Chain**

The standard processing sequence follows this pattern:

1. **ξ (Domain Analysis)** - Context classification and challenge detection
2. **ε (Entity Identification)** - Object, concept, and relationship extraction
3. **α (Attribute Extraction)** - Property and specification mapping
4. **ν (Value Capture)** - Data normalization and categorization
5. **ρ (Relationship Mapping)** - Connection analysis and validation
6. **χ (Context Preservation)** - Temporal and spatial awareness
7. **ω (Coherence Validation)** - Consistency and completeness checking
8. **φ (Feedback Calibration)** - Response optimization
9. **σ (Symbolic Synthesis)** - Pattern integration
10. **δ (Implementation)** - Final output generation

---

## 📝 Usage Examples

### **🚀 Basic Framework Creation**

```phiprompt
##[P.T.S.U.INPUT]
Collect.project_elements.P_T_S_U : {
    Project.technical_specifications, 
    Target.audience_requirements, 
    Structure.navigation_patterns, 
    Usability.accessibility_standards
}

##[ACTIVATE_MODULE]
activate.Φ = ∀(P, T, S, U) → ALWAYS{
    ν.preprocess.capture(input_request) → 
    μ.input_collection.extract(P, T, S, U) → 
    Π.processing → 
    Ω.output[
        Technical_Documentation : P → system_specifications ∧ 🔧comprehensive_setup,
        User_Guide : T → interaction_patterns ∧ 📝step_by_step_guidance,
        Architecture : S → navigation_design ∧ 🏗️structural_integrity
    ]
}
```

### **🔬 Advanced Pipeline with Uncertainty Handling**

```phiprompt
Φ.complexAnalysis = {
    ν.preprocess : {
        input_capture : [M.requirements ∧ C.context ∧ I.intent ∧ U.uncertainty⚠️], 
        validation : [completeness_check ; accuracy_verify ; consistency_assess]
    },
    
    Π.processing : {
        → ξ : [domain_classify, complexity_assess🌀, framework_selection],
        → ε : [entity_extract🔍, relationship_identify, dependency_map📝],
        → α : [validation🧱_run, conflict_detect, compatibility_check⚠️],
        → ω : [coherence_validate, consistency_verify, quality_assess🧪],
        → δ : [output_synthesize ∧ format_apply ∧ uncertainty_integrate⚠️]
    }
}
```

<details>
<summary>📋 **Business Analysis Framework** (Click to expand)</summary>

```phiprompt
##[S.M.A.R.T.INPUT]
Collect.business_elements.S_M_A_R_T : {
    Strategy.market_positioning, 
    Metrics.performance_indicators, 
    Analysis.competitive_landscape, 
    Resources.capability_assessment, 
    Timeline.implementation_roadmap
}

##[ACTIVATE_MODULE]
activate.Φ = ∀(S, M, A, R, T) → ALWAYS{
    ν.preprocess.capture(business_request) → 
    μ.input_collection.extract(S, M, A, R, T) → 
    Π.business_analysis → 
    Ω.output[
        Strategic_Assessment : S → market_analysis ∧ 🎯positioning_clarity,
        Performance_Framework : M → kpi_system ∧ 📊measurement_protocols,
        Competitive_Intelligence : A → landscape_mapping ∧ 🔍opportunity_identification,
        Resource_Optimization : R → capability_enhancement ∧ ⚙️efficiency_improvement,
        Implementation_Plan : T → timeline_coordination ∧ 🚀execution_strategy
    ] ⊕ risk_assessment⚠️ ⊕ success_metrics📊
}
```

</details>

---

## 🎨 Symbol Reference

### **🔢 Core Language Constructs**

| PHIPROMPT | Description | Example |
|---------|-------------|---------|
| **Φ** | Main framework pipeline | `Φ = { Ψ: {...}, ℜ: {...}, Π: {...} }` |
| **Ψ** | Optimizer module | `Ψ.filter: remove_duplicates ∧ consolidate_similar` |
| **ℜ** | Forensics module | `ℜ.analyze: evidence → causal_chain → conclusion` |
| **Π** | Processor module | `Π.compile: source_code → bytecode → execution` |

### **🔀 Control Flow**

| PHIPROMPT | Description | Example |
|---------|-------------|---------|
| **→** | Transformation arrow | `input_data → validate → process` |
| **∀** | Universal quantifier | `∀ user ∈ system → authenticated` |
| **∃** | Existential quantifier | `∃ error ∈ log → alert_admin` |
| **∧** | Logical AND | `authenticated ∧ authorized → access_granted` |
| **∨** | Logical OR | `admin ∨ owner → edit_permissions` |

### **🚩 Challenge Flags**

| PHIPROMPT | Description | Example |
|---------|-------------|---------|
| **🌀** | Metaphorical content | `user_journey 🌀(flows_like_river) → navigation_design` |
| **🧱** | Nested conditional | `🧱(if auth ∧ (admin ∨ owner) ∧ ¬suspended) → full_access` |
| **🎭** | Affective intent | `error_message 🎭(reassuring_tone) → user_confidence` |
| **🧪** | Unverified claim | `🧪(performance_improves_with_caching) → implement_cache` |
| **⚠️** | Explicit uncertainty | `server_response_time ⚠️(varies_by_load) → dynamic_scaling` |

> **🔍 Interactive Learning**: Use `Ctrl+Shift+P` → "PHIPROMPT: Show Symbol Tutorial" for hands-on exploration with live examples.

---

## 🛠️ Development Features

### **🎨 Code Formatting**

PHIPROMPT includes a sophisticated formatter that maintains mathematical elegance:

#### Formatting Rules:
- **Symbol Spacing**: Consistent spacing around mathematical operators
- **Hierarchical Indentation**: Clear visual structure for nested blocks  
- **Line Length Management**: Automatic wrapping for readability
- **Comment Preservation**: Maintains documentation integrity

### **🔍 Real-time Linting**

**Advanced Error Detection**:
- **Symbol Validation**: Ensures proper PHIPROMPT symbol usage
- **Context Analysis**: Validates symbols in appropriate contexts
- **Performance Optimization**: Debounced linting reduces CPU usage
- **Educational Feedback**: Helpful error messages for learning

### **🧭 Navigation & IntelliSense**

#### Go-to-Definition Features:
- **Cross-file Navigation**: Jump between PHIPROMPT and related files
- **Symbol Indexing**: Workspace-wide symbol tracking
- **Method Resolution**: Smart method and property lookup
- **Import Following**: Navigate to imported modules

#### Auto-completion Capabilities:
- **Context-aware Suggestions**: Different symbols for different scopes
- **Fuzzy Matching**: Type partial keywords for symbol suggestions
- **Documentation Integration**: Hover tooltips with explanations
- **Snippet Expansion**: Complete code patterns with Tab completion

---

## ♿ Accessibility

### **🌟 Universal Design Principles**

PHIPROMPT is designed with accessibility at its core:

#### **🔍 Screen Reader Support**
- **Semantic Markup**: Proper HTML structure in documentation
- **Alternative Text**: Descriptive labels for all visual elements
- **Keyboard Navigation**: Full functionality without mouse interaction
- **Voice Commands**: Compatible with voice recognition software

#### **🎨 Visual Accessibility**
- **High Contrast Support**: Adapts to system contrast preferences
- **Customizable Fonts**: Support for dyslexia-friendly typefaces
- **Zoom Compatibility**: Scales properly with browser/editor zoom
- **Color Independence**: Information conveyed beyond color alone

#### **⌨️ Keyboard Navigation**

| Key Combination | Action | Context |
|-----------------|--------|---------|
| `Tab` | Navigate forward | All interactive elements |
| `Shift + Tab` | Navigate backward | All interactive elements |
| `Enter` / `Space` | Activate | Buttons and links |
| `Escape` | Close/Cancel | Modal dialogs |
| `F1` | Help/Documentation | Context-sensitive help |

### **📋 Accessibility Compliance**

✅ **WCAG 2.1 AA Compliant**
- **Perceivable**: Content available to assistive technologies
- **Operable**: Interface usable with various input methods  
- **Understandable**: Information and UI operation is clear
- **Robust**: Compatible with current and future assistive technologies

> **🤝 Accessibility Commitment**: We strive to continuously improve accessibility. Report barriers via our [accessibility feedback form](https://github.com/Varietyz/phi-vscode-extensions/tree/main/phiprompt-extension/issues/new?template=accessibility.md).

---

## 🤝 Contributing

### **🌟 Ways to Contribute**

Contributions welcome from developers of all experience levels:

#### **🔧 Code Contributions**
- **Bug Fixes**: Resolve issues and improve stability
- **Feature Development**: Implement new PHIPROMPT capabilities
- **Performance Optimization**: Enhance extension speed and efficiency
- **Testing**: Expand test coverage and quality assurance

#### **📚 Documentation**
- **Tutorial Content**: Create learning materials and examples
- **Translation**: Localize documentation for global accessibility
- **Video Guides**: Develop multimedia learning resources
- **Best Practices**: Document coding standards and patterns

### **🚀 Development Setup**

#### Prerequisites
```bash
# Required tools
node --version    # ≥ 16.0.0
npm --version     # ≥ 8.0.0
code --version    # ≥ 1.74.0
git --version     # ≥ 2.25.0
```

#### **Getting Started**
```bash
# 1️⃣ Clone repository
git clone https://github.com/Varietyz/phi-vscode-extensions/tree/main/phiprompt-extension.git
cd phiprompt-extension

# 2️⃣ Install dependencies
npm install

# 3️⃣ Build extension
npm run compile

# 4️⃣ Launch development environment
code .
# Press F5 to start debugging session
```

### **📋 Contribution Guidelines**

#### **Pull Request Process**
1. **Fork** the repository and create a feature branch
2. **Implement** changes with comprehensive tests
3. **Document** new features and update existing documentation  
4. **Test** across multiple platforms and VS Code versions
5. **Submit** pull request with detailed description

> **🎖️ Recognition**: Contributors are recognized in README, release notes, and our Hall of Fame for significant contributions.

---

## ❓ Support & FAQ

### **🆘 Getting Help**

#### **Community Support**
- **📋 GitHub Discussions**: [Community forum](https://github.com/Varietyz/phi-vscode-extensions/tree/main/phiprompt-extension/discussions)
- **📧 Email Support**: jay@banes-lab.com
- **📖 Documentation**: Comprehensive guides available in the `/docs` folder

#### **Estimated Response Times**
- **Critical Bugs**: Within 24 hours
- **General Issues**: Within 72 hours  
- **Feature Requests**: Within 1 week
- **Documentation**: Within 48 hours

<details>
<summary><strong>📝 Can I use custom symbolic mappings?</strong></summary>

Yes! Define a `CUSTOM_SYMBOLIC_MAP` in your workspace and the extension will automatically merge it with the base framework.

```typescript
// Add custom symbols like this
export const CUSTOM_SYMBOLIC_MAP = {
  "🏭": ["manufacturing", "industrial_process"],
  "🧬": ["biotechnology", "genetic_analysis"],
  "🌍": ["global_network", "distributed_system"]
};
```

</details>

<details>
<summary><strong>🔍 How do I enable advanced validation features?</strong></summary>

Enable comprehensive validation in your settings:
```json
{
  "phiprompt.autoValidation": true,
  "phiprompt.validatePipelineSequences": true,
  "phiprompt.uncertaintyThreshold": 0.2
}
```
</details>

<details>
<summary><strong>⚡ How do I optimize framework performance?</strong></summary>

Use the complexity analysis tool (`Ctrl+Shift+A`) to identify optimization opportunities and follow the suggestions for module simplification.

**Performance Best Practices:**
- **Modular Design**: Break complex frameworks into smaller, reusable components
- **Selective Validation**: Disable real-time validation for very large files
- **Symbolic Density**: Balance symbolic complexity with readability requirements
- **Memory Management**: Use the symbol mapping generator sparingly on large documents

</details>

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

## 🌟 Project Information

**Developed by:** [Jay Baleine](https://github.com/Varietyz) at [Banes Lab](https://banes-lab.com)  
**Repository:** [GitHub - phiprompt-extension](https://github.com/Varietyz/phi-vscode-extensions/tree/main/phiprompt-extension)  
**Website:** [banes-lab.com](https://banes-lab.com)  
**Version:** 1.0.1  
**Last Updated:** August 2025

> **🎯 Mission Statement:** Advancing the frontier of AI prompt engineering through mathematical alignment, symbolics, and developer-friendly tooling that transforms complex structures into intuitive, maintainable frameworks.

**⭐ If this project helps your development workflow, please consider starring the repository to support continued development!**

---

**Made with ❤️ by [Jay Baleine - Banes Lab](https://banes-lab.com)** 

<img src="https://banes-lab.com/assets/images/banes_lab/700px_Main_Animated.gif" width="100" alt="Banes Lab"/>

**© 2025 Banes Lab • MIT License • [Extensions Repository](https://github.com/Varietyz/phi-vscode-extensions)**


</div>