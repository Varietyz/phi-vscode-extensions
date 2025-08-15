// ENHANCED PHIPROMPT Symbolic Map with Framework Validation
export const PHIPROMPT_SYMBOLIC_MAP: Record<string, string[]> = {
  // Core Logic Symbols
  "∀": ["for_all", "all"],
  "∃": ["exists", "there_exists", "some"],
  "∈": ["in_set", "in", "belongs_to"],
  "∉": ["not_in_set", "not_in"],
  "∅": ["empty_set", "empty"],
  "∧": ["and", "while", "during"],
  "∨": ["or"],
  "¬": ["not", "no"],
  "⟹": ["implies", "imply", "then"],
  "→": ["transforms_to", "to"],
  ">": ["greater_than"],
  "<": ["less_than"],
  "≥": ["greater_equal", "at_least"],
  "≤": ["less_equal", "at_most"],
  "≈": ["approx_equal", "approximately"],
  "≡": ["equal", "equals"],
  "!=": ["not_equal", "unequal"],
  "≫": ["much_greater"],
  "≪": ["much_less"],
  "=>": ["if_then", "if"],
  "<T": ["before", "earlier_than"],
  ">T": ["after", "later_than"],
  "||": ["concurrent", "parallel"],
  "->": ["next_step", "next"],
  "+": ["plus", "add"],

  // Domain Notation!
  "state.hold": ["pause", "wait"],
  "modal.pos": ["possible", "might", "could"],
  "modal.req": ["necessary", "must", "require", "need"],
  "flag.warn": ["warning", "caution"],
  "meta.infer": ["inferred", "deduced"],
  "data.quant": ["quantified", "measured", "counted"],
  "data.qual": ["qualitative", "descriptive"],
  "link.rel": ["related", "connected_to", "correlated"],

  // Challenge Flags
  "🌀": ["metaphorical_ambiguous", "metaphorical"],
  "🧱": ["nested_conditional", "complex_condition", "nested_if"],
  "🎭": ["affective_intent", "emotional_tone"],
  "🧪": ["unverified_claim", "hypothesis", "claim"],
  "⚡": ["complexity_high", "complex"],
  "🔄": ["iterative_refinement", "loop", "iteration"],
  "📊": ["baseline_required", "baseline"],
  "⚠": ["uncertainty_explicit", "uncertain"],
  "🔍": ["investigation_required", "investigate", "examine"],
  "📝": ["qualitative_assessment", "describe", "qualitative_assess"],
  "🔗": ["relationship_inferred", "link"],

  // Advanced Logic Symbols
  "⊤": ["truth", "true"],
  "⊥": ["falsehood", "false"],
  "⇔": ["iff", "if_and_only_if"],
  "⊢": ["provable", "derivable"],
  "⊨": ["model_satisfies", "satisfies"],
  "∴": ["therefore", "thus"],
  "∵": ["because", "since"],
  "≜": ["defined_as", "is_defined_as"],
  "⋀": ["forall_conjunction", "for_all_and"],
  "⋁": ["exists_disjunction", "exists_or"],
  "↦": ["maps_to", "maps"],
  "⊕": ["exclusive_or", "xor"],
  "□": ["necessarily", "must_be"],
  "◇": ["possibly", "may_be"],
  "♾": ["infinite", "unbounded"],
  "⌛": ["time_limit", "deadline"],
  "⚙": ["process", "operation"],

  // Alchemical Transformation Symbols
  "🜃": ["transform_increase", "increase"],
  "🜄": ["transform_decrease", "decrease"],
  "🜂": ["transform_balance", "balance"],
  "🜔": ["purification", "refinement"],
  "🜚": ["distillation", "filtering"],
  "🜛": ["calcination", "burning"],
  "🜍": ["conjunction", "and_conjunction"],
  "🜖": ["multiplication", "multiply"],

  // Mathematical Operations
  "∇": ["gradient", "derivative"],
  "∂": ["partial_derivative", "partial_diff"],
  "↻": ["iteration", "repeat", "loop"],
  "⇑": ["increase_priority", "raise"],
  "⇓": ["decrease_priority", "lower"],
  "±": ["uncertainty_range", "plus_minus"],
  "≅": ["approximate_equal", "approx_equal_to"],
  "≬": ["probabilistic_equiv", "prob_equiv"],
  "☉": ["certainty_high", "certain"],
  "☽": ["uncertainty_low", "unlikely"],
  "↪": ["redirect", "redirect_to"],
  "⇨": ["strong_implication", "implies_strong"],
  "⇦": ["reverse_implication", "implied_by"],
  "⊣": ["left_adjoint"],

  // Machine Learning Symbols
  ℛ: ["reward", "reward_function"],
  "𝔏": ["loss", "loss_function"],
  "𝔇": ["dataset", "data"],
  "𝔐": ["model", "predictive_model"],
  "𝔽": ["feature", "input_feature"],
  "𝔾": ["gradient_function", "gradient"],
  "↝": ["approximate_mapping", "approx_map"],
  "⇝": ["probabilistic_mapping", "prob_map"],
  "☯": ["dual", "dual_operator"],

  // ML/LLM Specific Symbols
  "𝒲": ["weight_matrix", "model_weights", "parameter_weights"],
  "𝒯": ["threshold_tuning", "activation_threshold", "decision_boundary"],
  "𝒞": ["confidence_calibration", "certainty_scoring", "prediction_confidence"],
  "𝒟": [
    "distribution_analysis",
    "probability_distribution",
    "weight_distribution",
  ],
  "𝒮": ["scaling_factor", "normalization_scale", "adaptive_scaling"],
  "𝒫": [
    "probability_estimation",
    "likelihood_calculation",
    "bayesian_probability",
  ],
  "𝒢": ["gradient_optimization", "gradient_descent", "parameter_optimization"],
  "𝒩": [
    "neural_network_processing",
    "network_architecture",
    "connectivity_matrix",
  ],
  "𝒜": ["attention_weighting", "attention_mechanism", "focus_distribution"],
  "𝒞ₚ": ["computational_complexity", "processing_cost", "resource_scaling"],
  "𝒪": ["optimization_objective", "loss_function", "objective_minimization"],
  ℒ: ["learning_rate", "adaptation_speed", "convergence_control"],
  "𝒰": [
    "uncertainty_quantification",
    "epistemic_uncertainty",
    "aleatoric_uncertainty",
  ],
  "𝒦": ["knowledge_distillation", "model_compression", "capability_transfer"],
  ℬ: ["bias_detection", "fairness_metric", "demographic_parity"],
  "𝒱": ["validation_score", "performance_metric", "quality_assessment"],
  ℰ: ["embedding_space", "vector_representation", "latent_space"],
  "𝒯ₐ": [
    "temperature_scaling",
    "softmax_temperature",
    "confidence_calibration",
  ],
  "𝒟ₖₗ": [
    "kullback_leibler_divergence",
    "distribution_distance",
    "model_divergence",
  ],
  "𝒢ₙ": [
    "generalization_capability",
    "out_of_distribution_performance",
    "robustness",
  ],

  // COMPLETE GREEK ALPHABET FRAMEWORK MODULES
  // Core Framework Letters
  Φ: ["phi", "framework_pipeline", "main_pipeline"],
  Ψ: ["psi", "optimizer_module", "optimizer"],
  ρ: ["rho", "filter_component", "filter"],
  ν: ["nu", "normalizer", "entity_normalizer"],
  α: ["alpha", "validator", "attribute_validator"],
  κ: ["kappa", "handler", "nested_handler"],
  μ: ["mu", "detector", "content_detector"],
  ℜ: ["R", "forensics_module", "forensics"],
  Π: ["Pi", "processor_module", "processor"],

  // Extended Greek Letters for Framework
  λ: ["lambda", "function_module", "lambda_function"],
  ξ: ["xi", "domain_classifier", "domain_analysis"],
  ε: ["epsilon", "entity_identifier", "entity_extractor"],
  π: ["pi", "process_step", "pipeline_step"],
  ω: ["omega", "validation_step", "coherence_validator"],
  χ: ["chi", "context_preserver", "context_module"],
  υ: ["upsilon", "utility_module", "utilities"],
  φ: ["phi_small", "feedback_calibrator", "feedback_module"],
  β: ["beta", "anthropic_auditor", "bias_checker"],
  σ: ["sigma", "synthesizer", "symbolic_synthesizer"],
  τ: ["tau", "relationship_mapper", "temporal_module"],
  δ: ["delta", "code_synthesizer", "implementation_module"],
  γ: ["gamma", "symbolic_attempt", "conversion_module"],
  ι: ["iota", "consistency_checker", "integrity_module"],
  θ: ["theta", "threshold_module", "boundary_detector"],
  η: ["eta", "efficiency_module", "optimization_tracker"],
  ζ: ["zeta", "zero_handler", "null_processor"],

  // Uppercase Greek Extensions
  Α: ["Alpha", "primary_validator", "main_validator"],
  Β: ["Beta", "secondary_processor", "beta_processor"],
  Γ: ["Gamma", "gamma_processor", "tertiary_module"],
  Δ: ["Delta", "change_detector", "difference_module"],
  Ε: ["Epsilon", "entity_processor", "primary_entity"],
  Ζ: ["Zeta", "zero_processor", "null_handler"],
  Η: ["Eta", "efficiency_tracker", "performance_module"],
  Θ: ["Theta", "threshold_processor", "boundary_module"],
  Ι: ["Iota", "integrity_module", "consistency_validator"],
  Κ: ["Kappa", "nested_processor", "complexity_handler"],
  Λ: ["Lambda", "function_processor", "lambda_module"],
  Μ: ["Mu", "metadata_processor", "content_analyzer"],
  Ν: ["Nu", "normalization_engine", "standardizer"],
  Ξ: ["Xi", "classification_engine", "categorizer"],
  Ο: ["Omicron", "output_processor", "result_formatter"],
  Ρ: ["Rho", "filtering_engine", "deduplicator"],
  Σ: ["Sigma", "aggregation_engine", "summarizer"],
  Τ: ["Tau", "temporal_processor", "time_handler"],
  Υ: ["Upsilon", "utility_engine", "helper_module"],
  Χ: ["Chi", "context_engine", "preservation_module"],
  Ω: ["Omega", "final_processor", "output_validator"],
};

// Generate symbol to text mapping (for conversion)
export const SYMBOL_TO_TEXT = Object.fromEntries(
  Object.entries(PHIPROMPT_SYMBOLIC_MAP).map(([symbol, aliases]) => [
    symbol,
    aliases[0],
  ])
);

// Generate alias → symbol mapping (for parsing text to symbols)
export const AUTO_ALIAS_MAP: Record<string, string> = {};
for (const [symbol, aliases] of Object.entries(PHIPROMPT_SYMBOLIC_MAP)) {
  for (const alias of aliases) {
    AUTO_ALIAS_MAP[alias] = symbol;
  }
}

export const FRAMEWORK_CONTEXT_MAP = {
  pipeline_steps: [
    "ξ",
    "ε",
    "α",
    "ρ",
    "ω",
    "φ",
    "κ",
    "σ",
    "δ",
    "π",
    "β",
    "γ",
    "τ",
    "ι",
    "υ",
    "χ",
  ],
  core_modules: ["Φ", "Ψ", "ℜ", "Π", "Ω", "Λ"],
  processing_modules: ["ρ", "ν", "α", "κ", "μ"],
  logical_operators: ["→", "∧", "∪", "⊕", "⇑", "∀", "∃", "∈", "∉"],
  uncertainty_flags: ["⚠", "🔍", "🌀", "🧱", "🎭", "🧪", "📊", "📝", "🔗"],
  meta_controls: ["⇑.compliance", "⇑.limits", "⇑.success"],
  format_controls: ["F", "T"],
  domain_notation: ["modal", "state", "data", "meta", "flag", "link"],
};

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export function validateFrameworkCompliance(content: string): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: [],
  };

  const lines = content.split("\n");

  // Check for framework header compliance
  const hasFrameworkHeader = lines.some((line) =>
    /^##\s*\[.*\.(INPUT|ACTIVATE_MODULE|ACTIVATE)\]/.test(line)
  );

  if (!hasFrameworkHeader) {
    result.errors.push(
      "Missing framework header with .INPUT or .ACTIVATE_MODULE directive"
    );
    result.isValid = false;
  }

  // Check for Φ pipeline definition
  const hasPhiPipeline = lines.some((line) =>
    /^(\s*)(Φ)(\.\w+)?\s*=\s*\{/.test(line)
  );

  if (!hasPhiPipeline) {
    result.errors.push("Missing Φ pipeline definition");
    result.isValid = false;
  }

  // Check for complete pipeline sequence
  const pipelineSteps = FRAMEWORK_CONTEXT_MAP.pipeline_steps;
  const foundSteps = new Set<string>();

  lines.forEach((line) => {
    const stepMatch = line.match(/→\s*([ξεαρωφκσδπβγτιυχ])\s*:/);
    if (stepMatch) {
      foundSteps.add(stepMatch[1]);
    }
  });

  const missingSteps = pipelineSteps.filter((step) => !foundSteps.has(step));
  if (missingSteps.length > 0) {
    result.warnings.push(`Missing pipeline steps: ${missingSteps.join(", ")}`);
  }

  // Check for output specifications
  const hasOutputSpecs = lines.some((line) => /[FT]\s*→\s*\w+/.test(line));

  if (!hasOutputSpecs) {
    result.warnings.push(
      "Missing output specifications (F → format, T → tone)"
    );
  }

  // Check for meta-controls
  const hasMetaControls = lines.some((line) =>
    /⇑\.(compliance|limits|success)/.test(line)
  );

  if (!hasMetaControls) {
    result.warnings.push(
      "Missing meta-control specifications (⇑.compliance, ⇑.limits, ⇑.success)"
    );
  }

  // Validate Greek module usage
  lines.forEach((line, index) => {
    const greekMatches = line.matchAll(
      /([ΦΨℜΠρνακμλξεπωχυφβστδγιθηζΩΛΘΡΕΝΤΟΞΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ])/g
    );

    for (const match of greekMatches) {
      const symbol = match[1];
      if (!PHIPROMPT_SYMBOLIC_MAP[symbol]) {
        result.warnings.push(
          `Line ${index + 1}: Unrecognized Greek symbol '${symbol}'`
        );
      }
    }
  });

  // Check for proper logical operator usage
  lines.forEach((line, index) => {
    // Check for incomplete logical expressions
    if (line.includes("∧") && !line.includes("[") && !line.includes(":")) {
      result.suggestions.push(
        `Line ${index + 1}: Consider using '∧' within proper framework context`
      );
    }

    if (
      line.includes("→") &&
      !line.match(/[FT]\s*→|\w+\s*→|→\s*[ξεαρωφκσδπβγτιυχ]/)
    ) {
      result.suggestions.push(
        `Line ${
          index + 1
        }: Ensure '→' follows framework transformation patterns`
      );
    }
  });

  return result;
}

// ENHANCED: Symbol Resolution with Context Awareness
export function resolveSymbolInContext(
  symbol: string,
  context: "pipeline" | "module" | "operator" | "flag"
): string[] {
  const symbolInfo = PHIPROMPT_SYMBOLIC_MAP[symbol];
  if (!symbolInfo) return [];

  switch (context) {
    case "pipeline":
      if (FRAMEWORK_CONTEXT_MAP.pipeline_steps.includes(symbol)) {
        return [`Pipeline Step: ${symbolInfo[0]}`, ...symbolInfo.slice(1)];
      }
      break;
    case "module":
      if (
        FRAMEWORK_CONTEXT_MAP.core_modules.includes(symbol) ||
        FRAMEWORK_CONTEXT_MAP.processing_modules.includes(symbol)
      ) {
        return [`Framework Module: ${symbolInfo[0]}`, ...symbolInfo.slice(1)];
      }
      break;
    case "operator":
      if (FRAMEWORK_CONTEXT_MAP.logical_operators.includes(symbol)) {
        return [`Logical Operator: ${symbolInfo[0]}`, ...symbolInfo.slice(1)];
      }
      break;
    case "flag":
      if (FRAMEWORK_CONTEXT_MAP.uncertainty_flags.includes(symbol)) {
        return [`Uncertainty Flag: ${symbolInfo[0]}`, ...symbolInfo.slice(1)];
      }
      break;
  }

  return symbolInfo;
}

// ENHANCED: Framework Pattern Detection
export function detectFrameworkPatterns(content: string): FrameworkPattern[] {
  const patterns: FrameworkPattern[] = [];
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    // Framework header pattern
    const headerMatch = line.match(
      /^##\s*\[(.*?)\.(INPUT|ACTIVATE_MODULE|ACTIVATE)\]/
    );
    if (headerMatch) {
      patterns.push({
        type: "framework_header",
        line: index + 1,
        content: headerMatch[0],
        framework: headerMatch[1],
        directive: headerMatch[2],
      });
    }

    // Pipeline sequence pattern
    const sequenceMatch = line.match(
      /(ξ|ε|α|ρ|ω|φ|κ|σ|δ|π|β|γ|τ|ι|υ|χ)→(ξ|ε|α|ρ|ω|φ|κ|σ|δ|π|β|γ|τ|ι|υ|χ)/g
    );
    if (sequenceMatch) {
      patterns.push({
        type: "pipeline_sequence",
        line: index + 1,
        content: line.trim(),
        sequence: sequenceMatch,
      });
    }

    // Output specification pattern
    const outputMatch = line.match(
      /([FT])\s*→\s*(\w+)(?:\s*∧\s*([FT])\s*→\s*(\w+))?/
    );
    if (outputMatch) {
      patterns.push({
        type: "output_specification",
        line: index + 1,
        content: outputMatch[0],
        format: outputMatch[1] === "F" ? outputMatch[2] : outputMatch[4],
        tone: outputMatch[1] === "T" ? outputMatch[2] : outputMatch[4],
      });
    }

    // Meta-control pattern
    const metaMatch = line.match(/⇑\.(compliance|limits|success)/);
    if (metaMatch) {
      patterns.push({
        type: "meta_control",
        line: index + 1,
        content: metaMatch[0],
        category: metaMatch[1],
      });
    }

    // Greek module definition pattern
    const moduleMatch = line.match(
      /^(\s*)([ΦΨℜΠρνακμλξεπωχυφβστδγιθηζΩΛΘΡΕΝΤΟΞΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ])(?:\.(\w+))?\s*:\s*[\{\[]/
    );
    if (moduleMatch) {
      patterns.push({
        type: "module_definition",
        line: index + 1,
        content: moduleMatch[0].trim(),
        module: moduleMatch[2],
        submodule: moduleMatch[3],
      });
    }
  });

  return patterns;
}

// ENHANCED: Auto-completion suggestions
export function getFrameworkSuggestions(
  context: string,
  position: number
): CompletionSuggestion[] {
  const suggestions: CompletionSuggestion[] = [];

  // Pipeline step suggestions
  if (context.includes("→")) {
    FRAMEWORK_CONTEXT_MAP.pipeline_steps.forEach((step) => {
      const info = PHIPROMPT_SYMBOLIC_MAP[step];
      if (info) {
        suggestions.push({
          symbol: step,
          description: info[0],
          category: "pipeline_step",
          insertText: `${step}: [${info[0]}_operations]`,
        });
      }
    });
  }

  // Module suggestions
  if (context.includes("Φ.") || context.match(/^[ΦΨℜΠ]/)) {
    FRAMEWORK_CONTEXT_MAP.core_modules.forEach((module) => {
      const info = PHIPROMPT_SYMBOLIC_MAP[module];
      if (info) {
        suggestions.push({
          symbol: module,
          description: info[0],
          category: "core_module",
          insertText: `${module}: { /* ${info[0]} configuration */ }`,
        });
      }
    });
  }

  // Uncertainty flag suggestions
  if (context.includes("∧") || context.includes("flags")) {
    FRAMEWORK_CONTEXT_MAP.uncertainty_flags.forEach((flag) => {
      const info = PHIPROMPT_SYMBOLIC_MAP[flag];
      if (info) {
        suggestions.push({
          symbol: flag,
          description: info[0],
          category: "uncertainty_flag",
          insertText: flag,
        });
      }
    });
  }

  return suggestions;
}

// Type definitions for framework validation
export interface FrameworkPattern {
  type:
    | "framework_header"
    | "pipeline_sequence"
    | "output_specification"
    | "meta_control"
    | "module_definition";
  line: number;
  content: string;
  framework?: string;
  directive?: string;
  sequence?: RegExpMatchArray;
  format?: string;
  tone?: string;
  category?: string;
  module?: string;
  submodule?: string;
}

export interface CompletionSuggestion {
  symbol: string;
  description: string;
  category:
    | "pipeline_step"
    | "core_module"
    | "uncertainty_flag"
    | "logical_operator";
  insertText: string;
}
