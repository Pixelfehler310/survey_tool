/**
 * Survey Engine Type Definitions
 *
 * This file contains TypeScript type definitions for the Survey Engine JSON structure.
 * Use these types when creating or modifying survey definitions.
 *
 * @example
 * ```typescript
 * import type { Survey, Question, SurveySettings } from './survey.types';
 *
 * const survey: Survey = {
 *   id: "my_survey",
 *   title: "My Survey",
 *   questions: [...],
 *   settings: {...}
 * };
 * ```
 */

// =============================================================================
// QUESTION TYPES
// =============================================================================

/**
 * All supported question types in the survey engine.
 *
 * @description
 * - `text` - Single-line text input
 * - `textarea` - Multi-line text input for longer responses
 * - `radio` - Single choice from multiple options
 * - `checkbox` - Multiple choice from multiple options
 * - `dropdown` - Single choice from dropdown menu
 * - `scale` - Numeric scale (e.g., 1-5 rating)
 * - `ranking` - Drag & drop ranking of options
 * - `hidden` - Hidden field (auto-filled from URL params, not shown to user)
 */
export type QuestionType = "text" | "textarea" | "radio" | "checkbox" | "dropdown" | "scale" | "ranking" | "hidden";

// =============================================================================
// QUESTION OPTION
// =============================================================================

/**
 * Option for choice-based questions (radio, checkbox, dropdown, ranking).
 *
 * @property value - The internal value stored in the response (use snake_case or numeric IDs)
 * @property label - The human-readable label displayed to the user
 *
 * @example
 * ```json
 * {
 *   "value": "very_satisfied",
 *   "label": "Sehr zufrieden"
 * }
 * ```
 */
export interface QuestionOption {
  /**
   * Internal value stored in the response.
   * Use consistent naming (snake_case recommended).
   * This is what appears in the analytics/export.
   */
  value: string;

  /**
   * Human-readable label shown to users.
   * Can include emojis and special characters.
   */
  label: string;
}

// =============================================================================
// SCALE CONFIGURATION
// =============================================================================

/**
 * Configuration for scale questions.
 * Defines the numeric range and optional labels for endpoints.
 *
 * @example
 * ```json
 * {
 *   "min": 1,
 *   "max": 5,
 *   "min_label": "Stimme nicht zu",
 *   "max_label": "Stimme voll zu"
 * }
 * ```
 */
export interface ScaleConfig {
  /** Minimum value of the scale (typically 1) */
  min: number;

  /** Maximum value of the scale (typically 5 or 10) */
  max: number;

  /** Optional label for the minimum value endpoint */
  min_label?: string;

  /** Optional label for the maximum value endpoint */
  max_label?: string;
}

// =============================================================================
// QUESTION
// =============================================================================

/**
 * A single survey question.
 *
 * @description
 * Questions are the building blocks of surveys. Each question has an ID, type,
 * and display text. Some types require additional configuration (options, config).
 *
 * Skip logic is supported via `show_if` expressions.
 *
 * @example Radio Question
 * ```json
 * {
 *   "id": "satisfaction",
 *   "type": "radio",
 *   "text": "How satisfied are you?",
 *   "required": true,
 *   "options": [
 *     { "value": "1", "label": "Not satisfied" },
 *     { "value": "2", "label": "Somewhat satisfied" },
 *     { "value": "3", "label": "Very satisfied" }
 *   ]
 * }
 * ```
 *
 * @example Scale Question with Labels
 * ```json
 * {
 *   "id": "nps",
 *   "type": "scale",
 *   "text": "How likely are you to recommend us?",
 *   "config": {
 *     "min": 0,
 *     "max": 10,
 *     "min_label": "Not likely",
 *     "max_label": "Very likely"
 *   }
 * }
 * ```
 *
 * @example Conditional Question (Skip Logic)
 * ```json
 * {
 *   "id": "why_not",
 *   "type": "textarea",
 *   "text": "Why are you not satisfied?",
 *   "show_if": "answers.satisfaction == '1'"
 * }
 * ```
 */
export interface Question {
  /**
   * Unique identifier for the question.
   * Must be unique within the survey. Used as the key in response data.
   * Recommended format: snake_case (e.g., "user_satisfaction", "q1_name")
   */
  id: string;

  /**
   * The type of question input.
   * Determines how the question is rendered and what data is collected.
   */
  type: QuestionType;

  /**
   * The question text displayed to users.
   * Supports markdown-style formatting in some renderers.
   */
  text: string;

  /**
   * Optional phase/section label.
   * Used for grouping questions visually (e.g., "Phase 1: Demographics")
   */
  phase?: string;

  /**
   * Available options for choice questions.
   * Required for: radio, checkbox, dropdown, ranking
   * Ignored for: text, textarea, scale, hidden
   */
  options?: QuestionOption[];

  /**
   * Configuration for scale questions.
   * Required for: scale
   * Ignored for other types.
   */
  config?: ScaleConfig;

  /**
   * Whether this question requires an answer.
   * If true, user cannot proceed without answering.
   * @default false
   */
  required?: boolean;

  /**
   * Expression for conditional display (skip logic).
   *
   * The expression is evaluated against the current answers.
   * If the expression returns false, the question is skipped.
   *
   * @example
   * ```
   * // Show only if user selected 'yes' for question 'has_pet'
   * "show_if": "answers.has_pet == 'yes'"
   *
   * // Show only if user selected rating 3 or below
   * "show_if": "answers.satisfaction <= 3"
   *
   * // Show if user selected specific checkbox option (use 'in' operator)
   * "show_if": "answers.interests in ['technology']"
   *
   * // Multiple conditions with 'and'/'or'
   * "show_if": "answers.age == 'under_18' or answers.age == '18_35'"
   * ```

   */
  show_if?: string;

  /**
   * Question ID to skip to after this question.
   * Useful for branching surveys.
   * @deprecated Consider using show_if instead for clearer logic.
   */
  skip_to?: string;
}

// =============================================================================
// THANK YOU PAGE CONFIGURATION
// =============================================================================

/**
 * Configuration for the thank-you page displayed after survey completion.
 *
 * @description
 * Customize the completion screen with a title, message, and optional
 * call-to-action button. Can also auto-redirect after a delay.
 *
 * @example
 * ```json
 * {
 *   "title": "Thank you! 🎉",
 *   "message": "Your feedback helps us improve.",
 *   "cta_text": "Visit our website",
 *   "cta_url": "https://example.com",
 *   "redirect_delay": 5
 * }
 * ```
 */
export interface ThankYouConfig {
  /** Title displayed on the thank-you page */
  title?: string;

  /**
   * Message body. Supports newlines with \n.
   * Can include markdown in some renderers.
   */
  message?: string;

  /** Text for the call-to-action button */
  cta_text?: string;

  /** URL the CTA button links to */
  cta_url?: string;

  /**
   * Seconds to wait before auto-redirecting.
   * If set, shows a countdown and redirects to cta_url.
   */
  redirect_delay?: number;
}

// =============================================================================
// BRANDING CONFIGURATION
// =============================================================================

/**
 * Custom branding for the survey.
 * Allows customization of colors and logo.
 *
 * @example
 * ```json
 * {
 *   "logo_url": "/logo.png",
 *   "primary_color": "#6366f1",
 *   "background_color": "#f8fafc"
 * }
 * ```
 */
export interface BrandingConfig {
  /** URL to logo image (displayed in survey header) */
  logo_url?: string;

  /** Primary brand color (buttons, accents) in hex format */
  primary_color?: string;

  /** Background color in hex format */
  background_color?: string;
}

// =============================================================================
// DUPLICATE PREVENTION
// =============================================================================

/**
 * Mode for preventing duplicate submissions.
 *
 * @description
 * - `none` - Allow unlimited responses from same device
 * - `client` - Browser-based prevention using localStorage (can be bypassed)
 * - `server` - Server-side prevention using hashed fingerprints (more secure)
 */
export type DuplicatePreventionMode = "none" | "client" | "server";

// =============================================================================
// SURVEY SETTINGS
// =============================================================================

/**
 * Global settings for the survey behavior and appearance.
 *
 * @example
 * ```json
 * {
 *   "show_progress": true,
 *   "allow_back": true,
 *   "captcha": false,
 *   "duplicate_prevention": "client",
 *   "thank_you": {
 *     "title": "Thanks!",
 *     "message": "We appreciate your feedback."
 *   }
 * }
 * ```
 */
export interface SurveySettings {
  /**
   * Show progress indicator (e.g., "Question 3 of 10").
   * @default true
   */
  show_progress?: boolean;

  /**
   * Where to store survey progress.
   *
   * Privacy Implications:
   * - 'local' (Default): Uses localStorage. Survives browser restart.
   *   ⚠️ GDPR-Note: Data persists on device. Pro: User comfort. Con: Risk on shared devices.
   *
   * - 'session': Uses sessionStorage. Cleared when tab/window closed.
   *   ✅ Recommended for sensitive data. Balances UX (reload works) and privacy.
   *
   * - 'none': Memory only. Cleared on reload.
   *   🛡️ Maximum Privacy. No data ever touches the disk. Con: Progress lost on reload.
   *
   * @default 'local'
   */
  storage?: "local" | "session" | "none";

  /**
   * Allow users to navigate back to previous questions.
   * @default true
   */
  allow_back?: boolean;

  /**
   * Enable Cloudflare Turnstile CAPTCHA verification.
   * Requires TURNSTILE_SECRET_KEY in backend environment.
   * @default false
   */
  captcha?: boolean;

  /**
   * URL to redirect to after submission.
   * If not set, shows the built-in thank-you page.
   */
  submit_redirect?: string;

  /**
   * Duplicate submission prevention mode.
   * - 'none': Allow multiple submissions
   * - 'client': Browser localStorage check (can be cleared)
   * - 'server': Server-side fingerprint hashing (more secure)
   * @default 'none'
   */
  duplicate_prevention?: DuplicatePreventionMode;

  /**
   * @deprecated Use duplicate_prevention instead.
   * Legacy flag for multiple response allowance.
   */
  allow_multiple_responses?: boolean;

  /** Custom thank-you page configuration */
  thank_you?: ThankYouConfig;

  /** Custom branding (logo, colors) */
  branding?: BrandingConfig;
}

// =============================================================================
// A/B TEST VARIANT
// =============================================================================

/**
 * Variant configuration for A/B testing.
 * Each variant can override questions and has a weight for random assignment.
 *
 * @description
 * When multiple variants are defined, users are randomly assigned based on weights.
 * The variant ID is stored with the response for analysis.
 *
 * @example
 * ```json
 * {
 *   "variants": [
 *     { "id": "control", "weight": 50, "questions": [...] },
 *     { "id": "treatment", "weight": 50, "questions": [...] }
 *   ]
 * }
 * ```
 */
export interface SurveyVariant {
  /** Unique identifier for the variant */
  id: string;

  /**
   * Weight for random assignment (relative to other variants).
   * E.g., weight 50 vs weight 50 = 50% each.
   */
  weight: number;

  /** Questions for this variant (replaces or extends base questions) */
  questions: Question[];
}

// =============================================================================
// SURVEY (ROOT TYPE)
// =============================================================================

/**
 * Complete survey definition.
 * This is the root type for survey JSON files.
 *
 * @description
 * A survey consists of:
 * - Metadata (id, title, description)
 * - Questions array
 * - Optional settings for behavior customization
 * - Optional variants for A/B testing
 *
 * @example Minimal Survey
 * ```json
 * {
 *   "id": "simple_survey",
 *   "title": "Quick Feedback",
 *   "questions": [
 *     {
 *       "id": "feedback",
 *       "type": "textarea",
 *       "text": "What can we improve?"
 *     }
 *   ]
 * }
 * ```
 *
 * @example Full Survey with Settings
 * ```json
 * {
 *   "id": "customer_satisfaction",
 *   "title": "Customer Satisfaction Survey",
 *   "description": "Help us serve you better",
 *   "settings": {
 *     "show_progress": true,
 *     "duplicate_prevention": "client",
 *     "thank_you": {
 *       "title": "Thank you!",
 *       "cta_text": "Visit our site",
 *       "cta_url": "https://example.com"
 *     }
 *   },
 *   "questions": [...]
 * }
 * ```
 */
export interface Survey {
  /**
   * Unique identifier for the survey.
   * Used in URLs: /survey/{id}
   * Must be URL-safe (lowercase, underscores, hyphens).
   */
  id: string;

  /** Display title shown to users */
  title: string;

  /** Optional description/subtitle */
  description?: string;

  /** Array of questions in display order */
  questions: Question[];

  /** Survey behavior and appearance settings */
  settings?: SurveySettings;

  /**
   * A/B test variants.
   * If defined, users are randomly assigned to a variant.
   */
  variants?: SurveyVariant[];
}

// =============================================================================
// RESPONSE TYPES (for API/Data handling)
// =============================================================================

/**
 * Answer value types.
 * Different question types produce different answer formats.
 *
 * @description
 * - text/textarea: string
 * - radio/dropdown: string (the option value)
 * - checkbox: string[] (array of selected option values)
 * - scale: number
 * - ranking: string[] (ordered array of option values)
 * - hidden: string | null
 */
export type AnswerValue = string | number | string[] | null;

/**
 * Response answers object.
 * Maps question IDs to their answer values.
 *
 * @example
 * ```typescript
 * const answers: ResponseAnswers = {
 *   name: "John Doe",
 *   satisfaction: "5",
 *   features: ["dark_mode", "analytics"],
 *   priority_ranking: ["security", "speed", "design"]
 * };
 * ```
 */
export type ResponseAnswers = Record<string, AnswerValue>;

/**
 * Metadata attached to a response.
 * Typically auto-collected by the survey engine.
 */
export interface ResponseMeta {
  /** Traffic source (from URL param) */
  source?: string;

  /** UTM source parameter */
  utm_source?: string;

  /** UTM medium parameter */
  utm_medium?: string;

  /** UTM campaign parameter */
  utm_campaign?: string;

  /** User agent string */
  user_agent?: string;

  /** Any additional custom metadata */
  [key: string]: unknown;
}

/**
 * A submitted survey response.
 * This is what gets stored in the database.
 */
export interface SurveyResponse {
  /** Unique response ID (UUID) */
  id: string;

  /** Survey ID this response belongs to */
  survey_id: string;

  /** A/B test variant ID (if applicable) */
  variant_id?: string;

  /** All answers keyed by question ID */
  answers: ResponseAnswers;

  /** Response metadata */
  meta: ResponseMeta;

  /** When the user started the survey */
  started_at?: string;

  /** When the user completed the survey */
  completed_at?: string;

  /** When the response was created in the database */
  created_at: string;
}

// =============================================================================
// EXPRESSION LANGUAGE (for show_if)
// =============================================================================

/**
 * Expression Language Reference
 *
 * The `show_if` field uses a simple expression language to evaluate conditions.
 * Expressions are evaluated against the `answers` object.
 *
 * ## Available Operators
 * - `==` - Equality check
 * - `!=` - Inequality check
 * - `<`, `>`, `<=`, `>=` - Numeric comparisons
 * - `and` - Logical AND (NOTE: use 'and', not '&&')
 * - `or` - Logical OR (NOTE: use 'or', not '||')
 * - `not` - Logical NOT
 * - `in` - Membership check (for arrays/checkbox answers)
 *
 * ## Accessing Values
 * - `answers.{id}` - Access answer value for question ID
 *
 * ## Examples
 * ```
 * // Simple equality
 * "answers.has_pet == 'yes'"
 *
 * // Numeric comparison
 * "answers.age >= 18"
 *
 * // Check if checkbox contains a value (use 'in' operator)
 * "answers.interests in ['technology']"
 *
 * // Combined conditions with 'and'
 * "answers.status == 'student' and answers.age >= 18"
 *
 * // Multiple OR conditions
 * "answers.role == 'admin' or answers.role == 'editor'"
 *
 * // Negation
 * "not answers.skip_section in ['yes']"
 *
 * // Complex: Check if any checkbox value matches
 * "answers.features in ['dark_mode', 'analytics']"
 * ```
 *
 * ## Important Notes
 * - Use `and` / `or` keywords, NOT `&&` / `||` operators
 * - Use `value in ['a', 'b']` for array membership, NOT `.includes()`
 * - String values must be quoted with single quotes: `'value'`
 */

export type ShowIfExpression = string;

// =============================================================================
// TYPE GUARDS (Runtime Validation)
// =============================================================================

/**
 * Type guard to check if a value is a valid QuestionType.
 */
export function isValidQuestionType(type: string): type is QuestionType {
  return ["text", "textarea", "radio", "checkbox", "dropdown", "scale", "ranking", "hidden"].includes(type);
}

/**
 * Type guard to check if a question requires options.
 */
export function requiresOptions(type: QuestionType): boolean {
  return ["radio", "checkbox", "dropdown", "ranking"].includes(type);
}

/**
 * Type guard to check if a question requires config.
 */
export function requiresConfig(type: QuestionType): boolean {
  return type === "scale";
}
