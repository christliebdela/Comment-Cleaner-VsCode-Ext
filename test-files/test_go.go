// Single line comment in Go
package main

import (
    "fmt"
    "strings"
)

// TODO: Add error handling
// FIXME: Fix performance issues

/*
 * Multi-line Go comment
 * that spans multiple lines
 */

// User represents a user in the system
type User struct {
    Name  string // User's name
    Email string // User's email
}

// Function with comments
func greet(name string) string {
    return fmt.Sprintf("Hello, %s!", name) // Return greeting
}

// TODO: Add validation function

// Main function with comments
func main() {
    // Create a new user
    user := User{
        Name:  "John", // Set name
        Email: "john@example.com", // Set email
    }
    
    // Print user information
    fmt.Println("User:", user.Name) // Print name
    
    message := greet(user.Name)
    fmt.Println(message) // Print greeting
    
    /* FIXME: This is not efficient
     * for large strings
     */
    fmt.Println(strings.Repeat("-", 20)) // Print separator
}

// Comment with code-like content:
// func unused() {
//     return "This function is commented out"
// }

// Comment at end of file