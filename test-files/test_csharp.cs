// Single line comment in C#
using System;
using System.Collections.Generic;

/* Multi-line
   C# comment */
namespace TestApp
{
    /// <summary>
    /// XML Documentation comment
    /// These are used for IntelliSense and documentation generation
    /// </summary>
    public class Program
    {
        // Method comment
        public static void Main(string[] args)
        {
            Console.WriteLine("Hello, C#!"); // End of line comment
            
            /*
             * Block comment with asterisks
             * that should be removed
             */
            int x = 42; // Variable with comment
            
            // Create a list of numbers
            var numbers = new List<int> { 1, 2, 3 };
            
            /// This XML doc comment on a non-member should also be removed
            foreach (var num in numbers)
            {
                Console.WriteLine(num);
            }
        }
    }
}