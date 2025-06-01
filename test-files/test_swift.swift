// Single line comment in Swift
import Foundation

// MARK: - Global constants

let PI = 3.14159 // Mathematical constant
let APP_NAME = "TestApp" // Application name

// TODO: Add internationalization support
// FIXME: Fix date formatting issues on iOS 16

/* Multi-line Swift comment
   spanning multiple lines
   with indentation */

/**
 * Documentation comment for Person class
 * Represents a basic person with properties
 */
class Person {
    var name: String // Person's name
    var age: Int     // Person's age
    
    // MARK: - Initialization
    
    /**
     Initializes a new Person
     - Parameters:
        - name: The person's name
        - age: The person's age
     */
    init(name: String, age: Int) {
        self.name = name // Set name property
        self.age = age   // Set age property
    }
    
    // MARK: - Public methods
    
    /// Returns a greeting string for the person
    /// - Returns: Personalized greeting
    func greet() -> String {
        return "Hello, I'm \(name) and I'm \(age) years old" // String interpolation
    }
    
    /*
     * Function to check if person is an adult
     * based on age property
     */
    func isAdult() -> Bool {
        return age >= 18 // Return true if 18 or older
    }
}

// Extension with comments
extension Person {
    // Computed property with inline comment
    var description: String {
        return "\(name), \(age)" // Format: "Name, Age"
    }
    
    /* FIXME: This isn't correctly formatting ages
     * for people over 100 years old
     */
    func ageDescription() -> String {
        if age < 18 {
            return "Minor" // Under 18
        } else if age < 65 {
            return "Adult" // 18-64
        } else {
            return "Senior" // 65+
        }
    }
}

// Main program flow
let person = Person(name: "John", age: 30)
print(person.greet()) // Print greeting

// Comment with Swift code inside:
/*
if let name = optionalName {
    print("Name: \(name)")
} else {
    print("No name provided")
}
*/

// TODO: Implement error handling wrapper

// Comment at end of file