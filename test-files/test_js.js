

// TODO: This comment should be preserved when preserve_todo is enabled
// FIXME: This comment should also be preserved with preserve_todo enabled

/**
 * This is a documentation comment that should be preserved
 * when keep_doc_comments is enabled
 * @param {string} name - The name parameter
 * @returns {string} A greeting message
 */
function greet(name) {

    let greeting = "Hello";

    /* TODO: This block comment with TODO
     * should be preserved when preserve_todo is on
     */

    /* FIXME: Block comment with FIXME
     * should also be preserved
     */

    return `${greeting}, ${name}!`;
}

/**
 * Another documentation comment
 * @class
 */
class Example {
    /**
     * Constructor documentation
     */
    constructor() {
        // TODO: Implement validation
        this.value = 42;
    }

    /**
     * Method documentation
     * @returns {number} The calculated value
     */
    calculate() {
        // FIXME: This algorithm needs optimization
        return this.value * 2;
    }
}

const str = "This is a string with // comment markers";
const str2 = 'Also a string with /* block comment */ markers';
const template = `Template string with // comments and /* block comments */`;

// TODO: Test that this comment remains

/*
 * Multi-line comment
 * FIXME: With a FIXME that should be preserved
 * when preserve_todo is enabled
 */

export { greet, Example };

