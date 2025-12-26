# Expression Language

The expression language is used for conditional logic in surveys (`show_if`) and skip logic (`skip_to`).

## Quick Reference

| Operation          | Syntax   | Example                                 |
| ------------------ | -------- | --------------------------------------- |
| Equals             | `==`     | `answers.gender == 'male'`              |
| Not equals         | `!=`     | `answers.age != 0`                      |
| Greater than       | `>` `>=` | `answers.age >= 18`                     |
| Less than          | `<` `<=` | `answers.score < 5`                     |
| Contains (in list) | `in`     | `answers.role in ['admin', 'mod']`      |
| AND                | `and`    | `answers.a == 'x' and answers.b == 'y'` |
| OR                 | `or`     | `answers.a == 'x' or answers.a == 'y'`  |
| NOT                | `not`    | `not answers.email`                     |
| Grouping           | `()`     | `(a or b) and c`                        |

---

## Accessing Answers

All survey answers are accessed via the `answers` object:

```
answers.<question_id>
```

The `question_id` is the unique identifier set in the Question Editor (e.g., `age`, `gender`, `satisfaction`).

### Value Types

| Question Type   | Value Type              | Example              |
| --------------- | ----------------------- | -------------------- |
| text, textarea  | String                  | `'Hello'`            |
| radio, dropdown | String (selected value) | `'option1'`          |
| checkbox        | Array of strings        | `['opt1', 'opt2']`   |
| scale, nps      | Number                  | `7`                  |
| hidden          | String                  | `'utm_source_value'` |

---

## Comparison Operators

### Equality

```
answers.gender == 'female'
answers.country != 'DE'
```

### Numeric Comparison

```
answers.age >= 18
answers.score < 5
answers.rating > 3
```

### Membership (in)

Check if a value is in a list:

```
answers.country in ['DE', 'AT', 'CH']
```

For checkbox questions (arrays), checks if any selected value is in the list:

```
answers.interests in ['sports', 'music']
```

---

## Logical Operators

### AND

Both conditions must be true:

```
answers.age >= 18 and answers.consent == 'yes'
```

### OR

At least one condition must be true:

```
answers.role == 'student' or answers.role == 'teacher'
```

### NOT

Negates a condition:

```
not answers.email
```

This is `true` if `email` is empty/undefined.

### Grouping

Use parentheses for complex logic:

```
(answers.age >= 18 or answers.parent_consent == 'yes') and answers.terms == 'accepted'
```

---

## show_if Examples

### Show question only if previous answer matches

```json
{
  "id": "follow_up",
  "type": "textarea",
  "text": "Bitte beschreiben Sie das Problem:",
  "show_if": "answers.satisfaction <= 2"
}
```

### Show based on selection

```json
{
  "id": "other_specify",
  "type": "text",
  "text": "Bitte angeben:",
  "show_if": "answers.category == 'other'"
}
```

### Multiple conditions

```json
{
  "id": "student_discount",
  "type": "radio",
  "text": "Möchten Sie den Studentenrabatt?",
  "show_if": "answers.is_student == 'yes' and answers.age < 30"
}
```

### Check if checkbox includes value

```json
{
  "id": "music_genres",
  "type": "checkbox",
  "text": "Welche Genres hören Sie?",
  "show_if": "answers.hobbies in ['music']"
}
```

---

## Common Patterns

### Age gating

```
answers.age >= 18
```

### GDPR consent

```
answers.privacy_consent == 'accepted'
```

### Skip if already answered

```
not answers.question_id
```

### Conditional branching

```
answers.satisfaction >= 4 and answers.recommend == 'yes'
```

### Country-specific questions

```
answers.country in ['DE', 'AT', 'CH']
```

---

## Testing Expressions

### In the Builder

1. Add a `show_if` expression via **LogicEditor**
2. Use the **Code** tab for manual expressions
3. Preview the survey with **Vorschau**
4. Answer questions to see conditional logic

### In the Browser Console

```javascript
import { evaluateExpression } from "./lib/expressionParser";

evaluateExpression("answers.age >= 18", {
  answers: { age: 21 },
}); // true
```

---

## Error Handling

If an expression has a syntax error or references an undefined question:

- **Builder**: Shows the raw expression
- **Survey**: Question is hidden (fails closed)
- **Console**: Warning with error message

### Common Mistakes

| Error              | Fix                       |
| ------------------ | ------------------------- | --- | ------------------- |
| `answer.q1`        | Use `answers.q1` (plural) |
| `answers.q1 = 'x'` | Use `==` not `=`          |
| `answers.q1 && q2` | Use `and` not `&&`        |
| `answers.q1        |                           | q2` | Use `or` not `\|\|` |
| `!answers.q1`      | Use `not answers.q1`      |

---

## Technical Notes

- Parser: `frontend/src/lib/expressionParser.js`
- **No eval()** - expressions are safely tokenized and parsed
- Supports: comparisons, logical operators, membership, grouping
- Does NOT support: arithmetic, function calls, property chains beyond `answers.x`
