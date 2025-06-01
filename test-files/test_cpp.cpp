// Single line comment in C++

#include <iostream>
#include <string>

// TODO: Add proper error handling
// FIXME: Fix performance issues

/*
 * Multi-line C++ comment
 * that spans multiple lines
 */

/**
 * Documentation comment for class
 * This demonstrates a documentation-style comment in C++
 */
class User {
private:
    std::string name; // User's name
    std::string email; // User's email
    int age; // User's age

public:
    // Constructor with comments
    User(const std::string& name, const std::string& email, int age) 
        : name(name), // Initialize name
          email(email), // Initialize email
          age(age) // Initialize age
    {
        // Constructor body
    }
    
    // TODO: Add validation method
    
    // Method with comments
    std::string getInfo() const {
        // Return formatted user information
        return "Name: " + name + ", Email: " + email; // Concatenate strings
    }
    
    /* FIXME: This method might not be efficient
     * for complex operations
     */
    void printDetails() const {
        std::cout << getInfo() << std::endl; // Print user info
    }
};

// Main function with comments
int main() {
    // Create a new user
    User user("John", "john@example.com", 30);
    
    // Print user information
    user.printDetails(); // Call method
    
    /* Comment with code-like content:
     * if (debug) {
     *     std::cout << "Debug mode enabled" << std::endl;
     * }
     */
    
    return 0; // Return success
}

// Comment at end of file