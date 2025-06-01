// Single line comment in C
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// TODO: Add error handling module
// FIXME: Fix memory leaks in array functions

/* 
 * Multi-line C comment
 * with formatting
 */

/**
 * Calculates the factorial of a number
 * @param n The number to calculate factorial for
 * @return The factorial value
 */
int factorial(int n) {
    // Base case
    if (n <= 1) return 1; // Return 1 for 0 or 1
    
    /* Recursive case:
     * multiply n by factorial of n-1
     */
    return n * factorial(n-1); // Recursive call
}

// Structure definition with comments
struct Person {
    char name[50];  // Person's name - max 50 chars
    int age;        // Person's age in years
    float height;   // Height in meters
};

/*
 * Function to create and initialize a Person structure
 * Returns pointer to the newly created Person
 */
struct Person* createPerson(const char* name, int age, float height) {
    // Allocate memory for the person
    struct Person* newPerson = (struct Person*)malloc(sizeof(struct Person));
    
    // Check for allocation failure
    if (newPerson == NULL) return NULL; // FIXME: Add proper error handling
    
    // Initialize the fields
    strncpy(newPerson->name, name, 49);
    newPerson->name[49] = '\0'; /* Ensure null termination */
    newPerson->age = age;
    newPerson->height = height;
    
    return newPerson;
}

/* Main function with comments */
int main() {
    printf("Factorial of 5: %d\n", factorial(5)); // Calculate factorial
    
    // Create a person structure
    struct Person* john = createPerson("John Doe", 30, 1.75);
    
    // Print person details
    if (john != NULL) {
        printf("Person: %s, Age: %d, Height: %.2f m\n",
               john->name, john->age, john->height);
        
        // Free allocated memory
        free(john); /* Avoid memory leak */
    }
    
    /* Comment with code-like content:
     * for (int i = 0; i < 10; i++) {
     *     printf("Counter: %d\n", i);
     * }
     */
    
    return 0; // Return success code
}

// Comment at end of file