/**
 * Expression Language Parser for Survey Logic
 * 
 * Evaluates expressions like:
 * - "answers.q1 == 'yes'"
 * - "answers.score >= 5"
 * - "answers.status == 'student' and answers.age >= 18"
 * - "answers.interests in ['dating', 'friends']"
 * 
 * Security: Does NOT use eval() - all expressions are safely parsed.
 */

// Token types
const TOKEN_TYPES = {
    IDENTIFIER: 'IDENTIFIER',
    OPERATOR: 'OPERATOR',
    LITERAL: 'LITERAL',
    LPAREN: 'LPAREN',
    RPAREN: 'RPAREN',
    LBRACKET: 'LBRACKET',
    RBRACKET: 'RBRACKET',
    COMMA: 'COMMA',
    AND: 'AND',
    OR: 'OR',
    NOT: 'NOT',
    IN: 'IN',
};

// Comparison operators
const COMPARISON_OPS = ['==', '!=', '>=', '<=', '>', '<'];

/**
 * Tokenize an expression string into tokens
 */
function tokenize(expression) {
    const tokens = [];
    let pos = 0;

    while (pos < expression.length) {
        // Skip whitespace
        if (/\s/.test(expression[pos])) {
            pos++;
            continue;
        }

        // Check for two-character operators
        const twoChar = expression.slice(pos, pos + 2);
        if (COMPARISON_OPS.includes(twoChar)) {
            tokens.push({ type: TOKEN_TYPES.OPERATOR, value: twoChar });
            pos += 2;
            continue;
        }

        // Check for single-character operators
        const oneChar = expression[pos];
        if (['>', '<'].includes(oneChar)) {
            tokens.push({ type: TOKEN_TYPES.OPERATOR, value: oneChar });
            pos++;
            continue;
        }

        // Parentheses and brackets
        if (oneChar === '(') {
            tokens.push({ type: TOKEN_TYPES.LPAREN });
            pos++;
            continue;
        }
        if (oneChar === ')') {
            tokens.push({ type: TOKEN_TYPES.RPAREN });
            pos++;
            continue;
        }
        if (oneChar === '[') {
            tokens.push({ type: TOKEN_TYPES.LBRACKET });
            pos++;
            continue;
        }
        if (oneChar === ']') {
            tokens.push({ type: TOKEN_TYPES.RBRACKET });
            pos++;
            continue;
        }
        if (oneChar === ',') {
            tokens.push({ type: TOKEN_TYPES.COMMA });
            pos++;
            continue;
        }

        // String literals (single or double quotes)
        if (oneChar === "'" || oneChar === '"') {
            const quote = oneChar;
            let value = '';
            pos++; // Skip opening quote
            while (pos < expression.length && expression[pos] !== quote) {
                value += expression[pos];
                pos++;
            }
            pos++; // Skip closing quote
            tokens.push({ type: TOKEN_TYPES.LITERAL, value, valueType: 'string' });
            continue;
        }

        // Numbers
        if (/\d/.test(oneChar) || (oneChar === '-' && /\d/.test(expression[pos + 1]))) {
            let value = '';
            if (oneChar === '-') {
                value += '-';
                pos++;
            }
            while (pos < expression.length && /[\d.]/.test(expression[pos])) {
                value += expression[pos];
                pos++;
            }
            tokens.push({ type: TOKEN_TYPES.LITERAL, value: parseFloat(value), valueType: 'number' });
            continue;
        }

        // Identifiers and keywords
        if (/[a-zA-Z_]/.test(oneChar)) {
            let value = '';
            while (pos < expression.length && /[a-zA-Z0-9_.]/.test(expression[pos])) {
                value += expression[pos];
                pos++;
            }

            // Check for keywords
            if (value === 'and') {
                tokens.push({ type: TOKEN_TYPES.AND });
            } else if (value === 'or') {
                tokens.push({ type: TOKEN_TYPES.OR });
            } else if (value === 'not') {
                tokens.push({ type: TOKEN_TYPES.NOT });
            } else if (value === 'in') {
                tokens.push({ type: TOKEN_TYPES.IN });
            } else if (value === 'true') {
                tokens.push({ type: TOKEN_TYPES.LITERAL, value: true, valueType: 'boolean' });
            } else if (value === 'false') {
                tokens.push({ type: TOKEN_TYPES.LITERAL, value: false, valueType: 'boolean' });
            } else {
                tokens.push({ type: TOKEN_TYPES.IDENTIFIER, value });
            }
            continue;
        }

        // Unknown character - skip it
        pos++;
    }

    return tokens;
}

/**
 * Parse tokens into an AST
 */
function parse(tokens) {
    let pos = 0;

    function peek() {
        return tokens[pos];
    }

    function consume() {
        return tokens[pos++];
    }

    function parseOr() {
        let left = parseAnd();

        while (peek()?.type === TOKEN_TYPES.OR) {
            consume(); // consume 'or'
            const right = parseAnd();
            left = { type: 'logical', operator: 'or', left, right };
        }

        return left;
    }

    function parseAnd() {
        let left = parseNot();

        while (peek()?.type === TOKEN_TYPES.AND) {
            consume(); // consume 'and'
            const right = parseNot();
            left = { type: 'logical', operator: 'and', left, right };
        }

        return left;
    }

    function parseNot() {
        if (peek()?.type === TOKEN_TYPES.NOT) {
            consume(); // consume 'not'
            const operand = parseNot();
            return { type: 'unary', operator: 'not', operand };
        }
        return parseComparison();
    }

    function parseComparison() {
        const left = parsePrimary();

        const token = peek();
        if (token?.type === TOKEN_TYPES.OPERATOR) {
            consume();
            const right = parsePrimary();
            return { type: 'comparison', operator: token.value, left, right };
        }

        if (token?.type === TOKEN_TYPES.IN) {
            consume();
            const right = parseArray();
            return { type: 'membership', operator: 'in', left, right };
        }

        return left;
    }

    function parseArray() {
        const items = [];

        if (peek()?.type !== TOKEN_TYPES.LBRACKET) {
            throw new Error('Expected [');
        }
        consume(); // consume '['

        while (peek()?.type !== TOKEN_TYPES.RBRACKET && pos < tokens.length) {
            const item = parsePrimary();
            items.push(item);

            if (peek()?.type === TOKEN_TYPES.COMMA) {
                consume();
            }
        }

        if (peek()?.type === TOKEN_TYPES.RBRACKET) {
            consume(); // consume ']'
        }

        return { type: 'array', items };
    }

    function parsePrimary() {
        const token = peek();

        if (!token) {
            throw new Error('Unexpected end of expression');
        }

        if (token.type === TOKEN_TYPES.LPAREN) {
            consume(); // consume '('
            const expr = parseOr();
            if (peek()?.type === TOKEN_TYPES.RPAREN) {
                consume(); // consume ')'
            }
            return expr;
        }

        if (token.type === TOKEN_TYPES.LITERAL) {
            consume();
            return { type: 'literal', value: token.value };
        }

        if (token.type === TOKEN_TYPES.IDENTIFIER) {
            consume();
            return { type: 'reference', path: token.value };
        }

        if (token.type === TOKEN_TYPES.LBRACKET) {
            return parseArray();
        }

        throw new Error(`Unexpected token: ${token.type}`);
    }

    return parseOr();
}

/**
 * Get a nested value from an object using a dot-notation path
 */
function getNestedValue(obj, path) {
    const parts = path.split('.');
    let value = obj;

    for (const part of parts) {
        if (value === null || value === undefined) {
            return undefined;
        }
        value = value[part];
    }

    return value;
}

/**
 * Evaluate an AST node against a context
 */
function evaluate(node, context) {
    if (!node) return false;

    switch (node.type) {
        case 'literal':
            return node.value;

        case 'reference':
            return getNestedValue(context, node.path);

        case 'array':
            return node.items.map(item => evaluate(item, context));

        case 'comparison': {
            const left = evaluate(node.left, context);
            const right = evaluate(node.right, context);

            switch (node.operator) {
                case '==': return left == right; // intentional loose equality
                case '!=': return left != right;
                case '>': return left > right;
                case '<': return left < right;
                case '>=': return left >= right;
                case '<=': return left <= right;
                default: return false;
            }
        }

        case 'membership': {
            const left = evaluate(node.left, context);
            const right = evaluate(node.right, context);

            if (!Array.isArray(right)) return false;

            // Check if left value exists in right array
            // Also support checking if any element from left array is in right array
            if (Array.isArray(left)) {
                return left.some(item => right.includes(item));
            }
            return right.includes(left);
        }

        case 'logical': {
            const left = evaluate(node.left, context);

            if (node.operator === 'and') {
                if (!left) return false;
                return !!evaluate(node.right, context);
            }

            if (node.operator === 'or') {
                if (left) return true;
                return !!evaluate(node.right, context);
            }

            return false;
        }

        case 'unary': {
            if (node.operator === 'not') {
                return !evaluate(node.operand, context);
            }
            return false;
        }

        default:
            return false;
    }
}

/**
 * Evaluate an expression string against a context object
 * 
 * @param {string} expression - The expression to evaluate
 * @param {object} context - The context object (e.g., { answers: { q1: 'yes' } })
 * @returns {boolean} - The result of the evaluation
 */
export function evaluateExpression(expression, context = {}) {
    if (!expression || typeof expression !== 'string') {
        return true; // No condition means always show
    }

    try {
        const tokens = tokenize(expression);
        const ast = parse(tokens);
        return !!evaluate(ast, context);
    } catch (error) {
        console.warn('Expression evaluation error:', error.message, 'for:', expression);
        return false; // On error, hide the element
    }
}

export default evaluateExpression;
