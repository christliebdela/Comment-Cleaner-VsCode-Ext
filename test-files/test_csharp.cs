// Single line comment in C#
using System;
using System.Collections.Generic;
using System.Linq;

// TODO: Add proper error handling
// FIXME: Fix performance issues with large collections

/* 
 * Multi-line C# comment
 * that spans multiple lines
 * with formatting
 */

/// <summary>
/// XML Documentation comment for Person class
/// This is a documentation comment that should be preserved
/// when keep_doc_comments is enabled
/// </summary>
/// <remarks>
/// Documentation comments in C# start with triple slashes
/// </remarks>
public class Person
{
    private string name; // Person's name
    private int age;     // Person's age
    
    /// <summary>
    /// Creates a new Person with the specified name and age
    /// </summary>
    /// <param name="name">The person's name</param>
    /// <param name="age">The person's age</param>
    public Person(string name, int age)
    {
        this.name = name; // Set name property
        this.age = age;   // Set age property
        
        /* FIXME: Need validation for age
         * to make sure it's a reasonable value
         */
    }
    
    // Property with inline comment
    public string Name => name; // Returns name
    
    // TODO: Add birthday handling method
    
    /// <summary>
    /// Determines if the person is an adult
    /// </summary>
    /// <returns>True if person is 18 or older</returns>
    public bool IsAdult()
    {
        return age >= 18; // Return true if 18 or older
    }
    
    /*
     * Method to get the user's description
     * as a formatted string
     */
    public string GetDescription()
    {
        // Format person information
        return $"Person: {name}, Age: {age}"; // String interpolation
    }
}

namespace TestApp
{
    /// <summary>
    /// Main program class
    /// </summary>
    public class Program
    {
        // Main method with comments
        public static void Main(string[] args)
        {
            Console.WriteLine("Hello C#!"); // Print greeting message
            
            // Create a new person
            var person = new Person("John Doe", 30);
            
            /*
             * Block comment with asterisks
             * that should be removed
             */
            Console.WriteLine(person.GetDescription()); // Print person description
            
            // Check if person is an adult
            if (person.IsAdult())
            {
                Console.WriteLine($"{person.Name} is an adult");
            }
            
            // Create a list of numbers
            var numbers = new List<int> { 1, 2, 3, 4, 5 };
            
            /// This XML doc comment on a non-member should also be removed
            /// when keep_doc_comments is disabled
            foreach (var num in numbers)
            {
                // Print each number
                Console.WriteLine($"Number: {num}");
            }
            
            /* Comment with code-like content:
             * for (int i = 0; i < 10; i++)
             * {
             *     Console.WriteLine($"Counter: {i}");
             * }
             */
        }
    }
}

// Comment at end of file