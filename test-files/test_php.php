<?php
// Single line comment in PHP

# Alternative style single line comment

/**
 * This is a PHP documentation comment block
 * @package TestPackage
 * @author Comment Cleaner Pro
 */

/*
 * Multi-line PHP comment
 * that spans multiple lines
 */

// TODO: Add proper error handling
// FIXME: Fix database connection issues

// Class definition with comments
class User {
    private $name; // User's name
    private $email; // User's email
    
    /**
     * Constructor documentation
     * @param string $name User name
     * @param string $email User email
     */
    public function __construct($name, $email) {
        $this->name = $name; # Set name
        $this->email = $email; # Set email
    }
    
    // Method with comments
    public function getInfo() {
        return "Name: {$this->name}, Email: {$this->email}"; // Return formatted info
    }
    
    /* TODO: Add validation method
     * for email format
     */
}

// Create a new user object
$user = new User("John", "john@example.com");

/* Comment with code-like content:
if ($debug) {
    echo "This is debug code";
}
*/

# FIXME: Add proper error handling

// PHP closing tag - often omitted in modern PHP
?>