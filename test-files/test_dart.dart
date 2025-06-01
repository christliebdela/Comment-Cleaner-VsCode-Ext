// Dart Test File for Comment Cleaner Pro

// Single line comment in Dart

// TODO: Add internationalization support
// FIXME: Fix responsive layout issues on small screens

/* 
 * Multi-line Dart comment
 * that spans multiple lines
 * with indentation
 */

// Import statements
import 'dart:math';           // For mathematical operations
import 'dart:convert';        // For data conversion

/// Class documentation comment
/// Represents a person with properties and methods
class Person {
  String name;  // Person's name
  int age;      // Person's age
  
  /// Constructor with documentation
  /// Creates a new person with the specified name and age
  Person(this.name, this.age); // Constructor
  
  /// Returns a greeting message
  String getGreeting() {
    return 'Hello, my name is $name and I am $age years old'; // String interpolation
  }
  
  /* FIXME: This method doesn't handle edge cases
   * when age is negative or extremely large
   */
  bool isAdult() {
    return age >= 18; // Return true if 18 or older
  }
  
  /// Returns a string representation of this person
  @override
  String toString() {
    return 'Person($name, $age)'; // Object representation
  }
}

// Extension on the Person class
extension PersonExtension on Person {
  // Returns the birth year based on current year and age
  int getBirthYear() {
    final currentYear = DateTime.now().year; // Get current year
    return currentYear - age; // Calculate birth year
  }
}

/// A utility function with documentation
/// Calculates the factorial of a number
int factorial(int n) {
  // Base case
  if (n <= 1) return 1; // Return 1 for 0 or 1
  
  /* Recursive case:
   * multiply n by factorial of n-1
   */
  return n * factorial(n - 1); // Recursive call
}

// Generic class with type parameter
class Box<T> {
  T value; // Stored value
  
  Box(this.value); // Constructor
  
  // Method to get the value
  T getValue() => value;
  
  // Method to set the value
  void setValue(T newValue) {
    value = newValue; // Update value
  }
}

// Asynchronous function example
Future<String> fetchData() async {
  // Simulate network delay
  await Future.delayed(Duration(seconds: 2)); // Wait for 2 seconds
  
  return 'Data loaded successfully'; // Return result
}

// Main function
void main() async {
  // Create a person
  var person = Person('Jane Doe', 30);
  print(person.getGreeting()); // Print greeting
  
  // Check if adult
  if (person.isAdult()) {
    print('${person.name} is an adult'); // String interpolation in print
  } else {
    print('${person.name} is not an adult');
  }
  
  // TODO: Add error handling for future computations
  
  // Use the Box class
  var intBox = Box<int>(42); // Create box with integer
  print('Value in box: ${intBox.getValue()}');
  
  // Calculate factorial
  print('Factorial of 5 is ${factorial(5)}');
  
  // Comment with Dart code:
  /* 
  void unusedFunction() {
    for (int i = 0; i < 10; i++) {
      print('Counter: $i');
    }
  }
  */
  
  // Await the async function
  var result = await fetchData();
  print(result); // Print the result
  
  // FIXME: This doesn't properly handle edge cases
  var birthYear = person.getBirthYear();
  print('Birth year: $birthYear');
}

// Comment at end of file