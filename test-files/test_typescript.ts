// Single line comment in TypeScript
import { Component } from '@angular/core';

/* Multi-line
   TypeScript comment */
interface User {
    id: number;
    name: string; // End of line comment
    email: string; // Required field
    age?: number; // Optional field
}

/**
 * TypeDoc comment 
 * that should also be removed
 */
class Example {
    private value: number = 42; // Property with comment

    /*
     * Block comment with asterisks
     * that should be removed
     */
    constructor() { 
        console.log("Hello TypeScript!"); // End of line comment
    }
}

// Type annotations are a key TypeScript feature
const users: User[] = [];

/**
 * Interface definition with documentation
 * @interface
 */
interface User {
  id: number;
  name: string;
  email: string; // Required field
  age?: number; // Optional field
}

/**
 * Generic function with documentation comments
 * @template T Type parameter
 * @param {T} value - The value to process
 * @returns {T} The processed value 
 */
function process<T>(value: T): T {
  // Process the value
  /* Multi-line
   * comment block
   */
  return value; // Return the value unchanged
}

// Class definition with comments
class UserManager {
  private users: User[] = []; // User array

  /**
   * Add a user to the manager
   * @param user The user to add
   */
  addUser(user: User): void {
    /* FIXME: Add validation before adding user */
    this.users.push(user);
  }

  // TODO: Implement user removal

  /* Block comment with TypeScript-specific syntax
   * function example(): void {
   *   const x: number = 42;
   * }
   */
}

// Type definition with comments
type ResponseStatus = 
  | 'success' // The operation succeeded
  | 'error'   // The operation failed
  | 'pending'; // The operation is in progress

// Comment at end of file