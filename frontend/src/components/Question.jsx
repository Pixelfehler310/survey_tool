/**
 * Question - Wrapper component that delegates to appropriate question type
 */

import { TextInput, TextArea, RadioGroup, CheckboxGroup, Scale, Dropdown } from "./QuestionTypes";

const QUESTION_COMPONENTS = {
  text: TextInput,
  textarea: TextArea,
  radio: RadioGroup,
  checkbox: CheckboxGroup,
  scale: Scale,
  dropdown: Dropdown,
};

export default function Question({ question, value, onChange, error }) {
  const QuestionComponent = QUESTION_COMPONENTS[question.type];

  if (!QuestionComponent) {
    return <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">Unbekannter Fragetyp: {question.type}</div>;
  }

  return (
    <div className="animate-fade-in">
      {/* Question text */}
      <h2 className="text-xl md:text-2xl font-semibold text-slate-800 mb-2">
        {question.text}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </h2>

      {/* Helper text */}
      {question.description && <p className="text-slate-500 mb-6">{question.description}</p>}

      {/* Question component */}
      <div className="mt-6">
        <QuestionComponent question={question} value={value} onChange={onChange} />
      </div>

      {/* Validation error */}
      {error && (
        <p className="mt-4 text-red-500 text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
