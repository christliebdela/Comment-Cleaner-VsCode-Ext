// Single line comment in TypeScript
import { Component } from '@angular/core';

/* Multi-line
   TypeScript comment */
interface User {
    id: number;
    name: string; // End of line comment
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