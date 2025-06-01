// Single line comment in Java

package com.example;

import java.util.ArrayList;
import java.util.List;

// TODO: Add proper error handling
// FIXME: Fix performance issues

/*
 * Multi-line Java comment
 * that spans multiple lines
 */

/**
 * Documentation comment for class
 * This demonstrates a Javadoc comment
 * @author Comment Cleaner Pro
 */
public class User {
    private String name; // User's name
    private String email; // User's email
    private int age; // User's age
    
    /**
     * Constructor with documentation
     * @param name User's name
     * @param email User's email
     * @param age User's age
     */
    public User(String name, String email, int age) {
        this.name = name; // Set name
        this.email = email; // Set email
        this.age = age; // Set age
    }
    
    // TODO: Add validation method
    
    /**
     * Returns user information
     * @return Formatted user information
     */
    public String getInfo() {
        return "Name: " + name + ", Email: " + email + ", Age: " + age; // Return formatted info
    }
    
    /* FIXME: This method might not be efficient
     * for large lists
     */
    public void printDetails() {
        System.out.println(getInfo()); // Print user info
    }
    
    // Main method with comments
    public static void main(String[] args) {
        // Create a new user
        User user = new User("John", "john@example.com", 30);
        
        // Print user information
        user.printDetails();
        
        /* Comment with code-like content:
         * List<String> items = new ArrayList<>();
         * items.add("Item 1");
         * items.add("Item 2");
         */
    }
}

// Comment at end of file