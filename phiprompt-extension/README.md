# PHIPROMPT - VS Code Extension for Symbolic AI Prompts

**Symbolic notation system for AI prompt engineering with mathematical precision.** PHIPROMPT provides a structured approach to creating precise AI prompts using mathematical symbols, framework validation, and intelligent analysis capabilities.

## 📋 Overview

PHIPROMPT (.φp) integrates mathematical notation with natural language for AI prompt development, offering:

- **🔢 Symbolic Notation**: Mathematical symbols for logical expressions (∀, ∃, ∧, ∨, →, ⟹)
- **🚩 Challenge Flags**: Uncertainty and complexity markers (🌀, 🧱, 🎭, 🧪, ⚠)
- **🏛️ Framework Modules**: Greek letter organizational system (Ψ, ρ, ℜ, Π)
- **🧠 Editor Integration**: VS Code language support with GitHub Copilot context
- **⚡ Real-time Analysis**: Framework compliance checking 🧪(validation_accuracy_varies)

---

## 🚀 Installation & Setup

### Requirements
- **VS Code**: Version 1.74.0 or higher
- **Font Support**: Unicode mathematical symbols ⚠(rendering_depends_on_font)
- **Optional**: GitHub Copilot for enhanced AI features

### Installation Methods

```bash
# Command line installation
code --install-extension phiprompt.phiprompt-extension

# Or search "PHIPROMPT" in VS Code Extensions marketplace
```

### First PHIPROMPT Document

Create a new file with `.φp` extension:

```phiprompt
## [USER_VALIDATION]
∀ user ∈ system → authenticated ∧ authorized
⚠(edge_cases_exist) 🧪(requires_testing)

## [Ψ.DATA_PROCESSING]
ρ.filter: remove_duplicates ∧ validate_input
α.validate: ∀ claim → evidence_required ⚠(manual_review_needed)

modal.req(data_validation) → security_compliance
🌀(user_experience_flows_intuitively) → design_decisions
```

**Essential Commands:**
- `Ctrl+Shift+H` - Interactive symbol tutorial
- `Ctrl+Shift+T` - Convert symbols to natural language
- `Ctrl+Shift+S` - Convert text to symbols

---

## 📚 Symbol Reference

### Logic & Quantifiers
| Symbol | Meaning | Example Usage |
|--------|---------|---------------|
| `∀` | Universal quantifier (for all) | `∀ user ∈ system → authenticated` |
| `∃` | Existential quantifier (exists) | `∃ error ∈ log → alert_admin` |
| `∧` | Logical AND | `authenticated ∧ authorized → access` |
| `∨` | Logical OR | `admin ∨ owner → edit_privileges` |
| `→` | Implication/transformation | `input → validate → process` |
| `⟹` | Strong logical implication | `security_breach ⟹ immediate_lockdown` |
| `¬` | Logical negation | `¬suspended → active_status` |
| `∈` | Set membership | `user ∈ admin_group` |
| `≡` | Equivalence | `input ≡ sanitized → safe_processing` |

### Challenge Flags 🚩
| Flag | Purpose | Application Context |
|------|---------|-------------------|
| `🌀` | **Metaphorical Content** | Interpretive or ambiguous statements |
| `🧱` | **Complex Logic** | Nested conditional structures |
| `🎭` | **Affective Elements** | Emotional or user experience factors |
| `🧪` | **Unverified Claims** | Hypotheses requiring validation |
| `⚠` | **Explicit Uncertainty** | Variable or incomplete information |
| `⚡` | **High Complexity** | Resource-intensive processing |
| `🔄` | **Iterative Processes** | Loops or refinement cycles |
| `📊` | **Measurement Required** | Quantification needed |
| `🔍` | **Investigation Needed** | Further analysis required |
| `📝` | **Qualitative Assessment** | Descriptive evaluation |
| `🔗` | **Inferred Relationships** | Indirect connections |

### Framework Modules 🏛️
| Module | Function | Implementation Pattern |
|--------|----------|----------------------|
| `Ψ` | **Optimizer** | `Ψ.filter: remove_duplicates` |
| `ρ` | **Filter Component** | `ρ.dedup: unique_entities → cleaned_data` |
| `ℜ` | **Forensics Analysis** | `ℜ.analyze: evidence → conclusions` |
| `Π` | **Processor Engine** | `Π.compile: logic → executable_form` |

### Domain Notation 🏷️
| Notation | Semantic Meaning | Usage Context |
|----------|------------------|---------------|
| `modal.pos` | Possibility/potential | `modal.pos(user_behavior_change) → adaptive_interface` |
| `modal.req` | Necessity/requirement | `modal.req(input_validation) → security_compliance` |
| `state.hold` | Process suspension | `state.hold(user_input) → validation_complete` |
| `data.quant` | Quantitative information | `data.quant(performance_metrics) → optimization` |
| `data.qual` | Qualitative information | `data.qual(user_feedback) → design_insights` |

---

## ⚙️ Language Support Features

### Syntax Highlighting
- **Mathematical Symbols**: Unicode-aware rendering with semantic colors
- **Challenge Flags**: Contextual highlighting for framework elements
- **Greek Modules**: Structured syntax for organizational components
- **Domain Notation**: Pattern recognition for structured semantics

### IntelliSense & Completions
- **Symbol Suggestions**: Context-aware mathematical notation
- **Framework Patterns**: Greek module and domain notation completions
- **Challenge Flag Recommendations**: AI-suggested markers based on content analysis 🧪(accuracy_varies_by_context)
- **Natural Language Integration**: Bidirectional text-symbol conversion

### Documentation & Help
- **Hover Information**: Detailed symbol explanations with usage examples
- **Interactive Tutorial**: Comprehensive symbol reference with copy-to-editor functionality
- **Framework Context**: Integration guidance for PHIPROMPT compliance
- **Error Explanations**: Actionable suggestions for validation issues

### Development Tools
- **Real-time Validation**: Framework compliance checking ⚠(rule_completeness_varies)
- **Code Actions**: Symbol conversion, flag insertion, module extraction
- **Safe Refactoring**: Protected core symbols with smart renaming
- **Format Support**: Mathematical notation spacing and alignment

---

## 🛠️ Configuration Options

### Extension Settings
Access via `File > Preferences > Settings` → Search "PHIPROMPT"

```json
{
  "phiprompt.enableAIInterpretation": true,
  "phiprompt.autoInsertChallengeFlags": true,
  "phiprompt.frameworkValidation": "strict",
  "phiprompt.symbolCompletionMode": "intelligent",
  "phiprompt.showHoverDocumentation": true,
  "phiprompt.enableCopilotContext": true,
  "phiprompt.lintingDelay": 500
}
```

### AI Integration
- **Context Injection**: GitHub Copilot receives PHIPROMPT framework information
- **Symbol Interpretation**: AI-assisted explanation of complex constructs
- **Pattern Recognition**: Contextual suggestions based on surrounding elements ⚠(AI_accuracy_varies)

### Validation Levels
- **Strict**: Framework violations show as errors
- **Lenient**: Framework violations show as warnings
- **Disabled**: No automated compliance checking

---

## 📝 Usage Examples

### Basic Authentication Logic
```phiprompt
## [AUTHENTICATION_FLOW]
∀ user ∈ system → {
    ∃ credentials ∈ user_input → validate_format
    credentials ≡ stored_hash → authentication_success
    authenticated ∧ ¬account_locked → grant_session
    ⚠(rate_limiting_applies) 🧪(lockout_effectiveness)
}

🧱(nested_validation_logic) 🎭(user_experience_priority)
```

### Data Processing Pipeline
```phiprompt
## [Ψ.DATA_PIPELINE]
ρ.sanitization: {
    ∀ input_record ∈ raw_data → format_validation
    remove_duplicates: unique_identifier_check
    normalize_encoding: utf8_conversion ⚠(character_loss_possible)
}

ν.enrichment: {
    geo_lookup: ip_address → location_approximation 🧪(accuracy_varies)
    demographic_inference: behavior_patterns → user_segments ⚠(bias_concerns)
}

## [ℜ.QUALITY_CONTROL]
evidence_validation: {
    ∀ data_source → credibility_assessment ∧ freshness_check
    anomaly_detection: statistical_deviation > threshold → manual_review
    📊(baseline_metrics_required) → performance_comparison
}
```

### API Design Specification
```phiprompt
## [API_ENDPOINT_SPECIFICATION]
endpoint.user_profile: {
    ∀ request ∈ authenticated_requests → {
        rate_limit: requests_per_minute ≤ 100 ⚠(varies_by_plan)
        input_validation: required_fields ⊆ request_body
        
        modal.pos(incomplete_profile) → partial_data_response
        modal.req(privacy_compliance) → sensitive_field_filtering
        
        🔗(user_preferences_influence_format)
        🎭(error_messages_user_friendly)
    }
    
    response_targets: {
        latency: < 200ms ⚠(database_load_dependent)
        availability: > 99.5% 🧪(monitoring_accuracy)
        📊(performance_baseline_establishment_needed)
    }
}
```

---

## 🔍 Advanced Framework Usage

### Uncertainty Management Patterns
```phiprompt
// Framework-compliant uncertainty handling
user_behavior ≈ predictable_patterns ⚠(individual_variation_significant) → 
adaptive_algorithms 🧪(machine_learning_effectiveness_hypothesis)

// Proper evidence qualification  
caching_strategy → performance_improvement 📊(benchmark_measurement_required)
⚠(cache_hit_ratio_environment_dependent)
```

### Challenge Flag Integration
```phiprompt
// Layered uncertainty and verification markers
🌀(user_journey_resembles_flowing_water) → intuitive_navigation_design
🧱(complex_business_rules) ∧ 🎭(user_frustration_minimization) → 
simplified_interface 🧪(usability_testing_needed) ⚠(subjective_preferences)
```

### Greek Module Organization
```phiprompt
## [Ψ.CONTENT_ANALYSIS]
ρ.text_processing: {
    tokenization: natural_language → structured_elements
    sentiment_analysis: emotional_indicators → polarity_scores ⚠(context_dependency)
    entity_extraction: named_entities → relationship_mapping 🧪(accuracy_model_dependent)
}

## [ℜ.VERIFICATION_PROTOCOL]
claim_validation: {
    ∀ assertion ∈ content → evidence_requirement_check
    source_credibility: reputation_score ∧ bias_assessment
    fact_checking: external_verification ⚠(source_availability_varies)
}
```

---

## 🔧 Troubleshooting

### Common Issues

**Symbol Display Problems**
- Install Unicode-compatible fonts (Fira Code, JetBrains Mono, Cascadia Code)
- Verify VS Code font configuration supports mathematical symbols
- Check operating system Unicode rendering capabilities ⚠(platform_differences)

**IntelliSense Functionality**
- Confirm file extension is `.φp` 
- Verify language mode displays "PHIPROMPT" in status bar
- Restart VS Code if language services fail to activate 🧪(restart_effectiveness)

**AI Integration Issues**
- Enable `phiprompt.enableCopilotContext` setting
- Verify GitHub Copilot extension status and authentication
- Check automatic context injection at document beginning

**Performance Considerations**
- Increase `phiprompt.lintingDelay` for large documents (>1000 lines)
- Disable AI features if memory usage becomes problematic ⚠(hardware_dependent)
- Use document folding for navigation in extensive files

---

## 🤝 Development & Contribution

### Local Development Setup
```bash
# Repository access
git clone https://github.com/Varietyz/phicode-vscode-extension.git
cd phicode-vscode-extension

# Dependency installation
npm install

# Development environment
code .
npm run watch
```

### Contribution Guidelines
- **Code Standards**: Follow TypeScript and ESLint configurations
- **Symbol Consistency**: Maintain mathematical and logical semantics
- **Framework Compliance**: Ensure changes align with PHIPROMPT principles ⚠(subjective_interpretation)
- **Testing Requirements**: Validate functionality across different document sizes 🧪(coverage_completeness)

### Development Areas
- **Symbol Extensions**: Mathematical and domain-specific notation additions
- **Framework Enhancements**: Greek module system improvements
- **AI Integration**: Enhanced contextual understanding and suggestions
- **Performance Optimization**: Large document handling improvements 📊(benchmarking_needed)

---

## 📄 Technical Information

### System Requirements
- **VS Code**: 1.74.0+ (⚠platform_compatibility_varies)
- **Node.js**: 16.x+ for development environment
- **Memory**: Minimum 4GB RAM recommended for large documents 🧪(usage_patterns_vary)
- **Font Support**: Unicode mathematical symbol rendering capability

### Extension Architecture
- **Language Services**: TypeScript-based provider implementations
- **Symbol Processing**: Unicode mathematical notation handling
- **AI Integration**: GitHub Copilot API context injection ⚠(API_availability_dependent)
- **Validation Engine**: Framework compliance checking algorithms

### Performance Characteristics
- **Startup Time**: < 2 seconds typical activation ⚠(hardware_dependent)
- **Memory Usage**: < 50MB baseline, scales with document complexity 📊(measurement_methodology_varies)
- **Validation Speed**: Real-time for documents < 1000 lines 🧪(performance_claims_require_verification)

---

## 📋 License & Attribution

**License**: MIT License - see repository for complete terms

**Source Code**: https://github.com/Varietyz/phicode-vscode-extension.git