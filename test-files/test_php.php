<?php
// This is a single-line comment using //

# This is a single-line comment using #

/*
 * This is a multi-line comment
 * that should be removed
 */

echo "Hello, PHP!"; // End of line comment

$var = 42; # Another end of line comment

/**
 * PHPDoc-style comment
 * that should also be removed
 */
function testFunction() {
    /* Inline block comment */ echo "Test";
    return true; // Return statement
}
?>