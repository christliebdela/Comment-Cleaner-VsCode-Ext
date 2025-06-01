// Single line comment in Kotlin
package com.example.test

// Import statements with comments
import kotlin.math.* // For math operations
import java.time.LocalDate // For date handling

// TODO: Add proper exception handling
// FIXME: Fix date formatting issues

/* 
 * Multi-line Kotlin comment
 * that spans multiple lines
 * with formatting
 */

/**
 * Documentation comment for class
 * This is a KDoc comment that should be preserved
 * when keep_doc_comments is enabled
 * 
 * @property name Person's name
 * @property age Person's age
 */
class Person(
    val name: String, // Person's name
    val age: Int      // Person's age
) {
    /**
     * Determines if the person is an adult
     * @return true if the person is 18 or older
     */
    fun isAdult(): Boolean {
        return age >= 18 // Return true if 18 or older
    }
    
    // TODO: Add birthday handling method
    
    /* Method to get formatted description
     * of the person including name and age
     */
    fun getDescription(): String {
        // Create description string
        return "Person: $name, Age: $age" // String template
    }
    
    /**
     * Extension function to calculate birth year
     * @return estimated birth year
     */
    fun getBirthYear(): Int {
        val currentYear = LocalDate.now().year // Get current year
        return currentYear - age // Calculate birth year
        
        /* FIXME: This doesn't account for 
         * birth month and day
         */
    }
}

// Top-level function with comments
fun calculateSquare(number: Int): Int {
    return number * number // Return the square
}

/* Data class example with comments */
data class Point(
    val x: Int, // X coordinate
    val y: Int  // Y coordinate
) {
    // Function to calculate distance from origin
    fun distanceFromOrigin(): Double {
        // Use Pythagorean theorem
        return sqrt((x * x + y * y).toDouble()) // Calculate distance
    }
}

// Comment with code-like content
/*
fun unusedFunction() {
    for (i in 1..10) {
        println("Counter: $i")
    }
}
*/

/**
 * Main function with comments
 */
fun main() {
    println("Hello, Kotlin!") // Print greeting
    
    // Create a person
    val person = Person("Jane Doe", 25)
    
    /*
     * Block comment with asterisks
     * that should be removed
     */
    println(person.getDescription()) // Print description
    
    // Check if person is an adult
    if (person.isAdult()) {
        println("${person.name} is an adult") // Adult status
    } else {
        println("${person.name} is not an adult") // Minor status
    }
    
    // Calculate and print square
    val number = 5
    println("Square of $number is ${calculateSquare(number)}")
    
    // Create a point and calculate distance
    val point = Point(3, 4)
    println("Distance from origin: ${point.distanceFromOrigin()}")
    
    // TODO: Add more examples
    
    // FIXME: This needs better formatting
    val birthYear = person.getBirthYear()
    println("Estimated birth year: $birthYear")
}

// Comment at end of file