# Fun Mode Requirements

Fun Mode is a playful alternate presentation for paged surveys. It keeps the existing survey engine, validation, answer storage, and submission behavior, but renders the active question as a game-style dialogue scene with an animated character.

## Product Intent

- Make selected surveys feel more conversational, warm, and interactive without changing their data model.
- Give authors a builder-controlled mode that can be previewed and published.
- Let participants switch Fun Mode off at any time and continue in the normal paged survey UI without losing progress.
- Prepare the frontend for multiple future character presets while shipping one default character first.

## Mode Rules

| Requirement | Decision |
| --- | --- |
| Availability | Fun Mode is available in the builder preview and in published public surveys. |
| Activation | Fun Mode is a separate UI switcher, not a new layout value. It only applies when `settings.layout` is `paged`. |
| Fallback | If Fun Mode is disabled, unsupported, or toggled off by the participant, the survey renders with the existing paged layout for the current page session. |
| Question support | All existing question types remain supported because Fun Mode changes presentation, not question functionality. |
| Submission | Response payloads, validation, skip/show logic, captcha behavior, duplicate prevention, and analytics events should remain unchanged. |

## Participant Experience

### Desktop and Tablet

- The active question appears inside a text popup inspired by life-sim/game dialogue boxes.
- A simplified SVG character appears on the right side of the scene.
- Answers appear below the dialogue area using the existing question controls in the first implementation.
- The participant can use a compact top-right icon button to switch Fun Mode off and return to normal paged mode.

### Mobile

- The character stacks above the dialogue popup.
- The answer controls remain below the popup.
- The mode toggle stays reachable near the top of the survey UI.

## Visual Direction

- The feel should blend Animal Crossing/Tomodachi-style dialogue pacing with an interview or quiz-show rhythm.
- The first character should read as a friendly mascot-like host.
- The character style should use simple geometric SVG shapes, clean outlines, expressive eyes and mouth, and a bright educational explainer feeling.
- The style should be inspired by the warmth and clarity of kurzgesagt-like educational illustration, without copying any specific character, asset, or proprietary design.
- The default palette should combine the survey branding color with playful secondary accents.
- If branding exists, Fun Mode should derive its primary accent from `branding.primary_color`; otherwise it should use the current default primary color.

## Text Animation

- Question text appears with a typewriter effect at a static speed.
- Speed should be configurable through presets in the builder and stored as a numeric characters-per-second value in JSON.
- The participant can click or tap the dialogue popup to reveal the full text immediately.
- Answers are hidden or disabled until the text reveal is complete.
- If the user has `prefers-reduced-motion`, the full text should appear immediately and character motion should be reduced.
- The character mouth animates while text is being revealed and returns to idle when the text is complete.

## Character Animation

Required in v1:

- Idle blinking.
- Talking mouth animation while the typewriter text is active.
- A simple reaction after an answer is selected, such as a happy bounce or nod.
- Configurable expression names in builder or JSON.
- A character preset id in JSON so the first SVG can later be swapped for other figures.

Deferred:

- Rich per-expression SVG variants.
- Multiple shipped characters.
- Per-question custom animation timelines.
- Complex lip sync or audio.

## Builder Requirements

- Add a dedicated Fun Mode tab to survey settings.
- Show Fun Mode as available only when `settings.layout` is `paged`.
- Provide controls for:
  - Enable Fun Mode.
  - Participant can toggle Fun Mode off.
  - Typewriter speed preset.
  - Numeric characters-per-second value.
  - Character preset id.
  - Default expression name.
  - Answer reaction animation name.
  - Completion or end animation name.
- The preview modal should show Fun Mode when enabled and should still support desktop, tablet, and mobile widths.

## Proposed JSON Shape

```json
{
  "settings": {
    "layout": "paged",
    "fun_mode": {
      "enabled": true,
      "participant_toggle": true,
      "typewriter": {
        "preset": "normal",
        "characters_per_second": 35,
        "skip_on_click": true,
        "answers_after_reveal": true
      },
      "character": {
        "preset": "default_host",
        "default_expression": "friendly",
        "answer_reaction": "happy_bounce",
        "completion_animation": "celebrate"
      }
    }
  }
}
```

## Implementation Notes

- Do not create a new question type for Fun Mode.
- Prefer a new renderer component that wraps the existing paged survey question flow.
- Preserve current `Survey` store state so switching Fun Mode off does not reset answers or the current question.
- Use a character registry or component map internally, keyed by `character.preset`.
- The first character can be a local inline SVG React component.
- Keep the answer area powered by the existing `Question` component for v1.
- Use CSS animations for blinking, mouth movement, and simple reactions unless future needs justify a dedicated animation library.

## Acceptance Criteria

- Authors can enable Fun Mode in builder settings when layout is paged.
- Builder preview renders the Fun Mode scene for enabled surveys.
- Public surveys render Fun Mode by default when enabled.
- Participants can turn Fun Mode off and continue in normal paged mode with the same current answer state.
- The dialogue text types at the configured speed and can be skipped by clicking/tapping the popup.
- Answers become available after the text reveal completes.
- The default character blinks while idle and animates its mouth during text reveal.
- Selecting an answer triggers the configured simple reaction.
- Reduced-motion users see static text and reduced character animation.
- All existing question types continue to work because their current controls are reused.

## Open Questions

- Should authors be able to override expression or reaction settings per question in a later version?
- Should dropdown questions stay as dropdowns in v1 or eventually become choice panels in Fun Mode?
