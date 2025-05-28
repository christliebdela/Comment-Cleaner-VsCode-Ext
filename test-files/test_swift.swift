// Single line comment in Swift
import Foundation

/* Multi-line
   Swift comment */
class Person {
    var name: String // Person's name
    var age: Int     // Person's age
    
    /**
     * Documentation comment
     * that should also be removed
     */
    init(name: String, age: Int) {
        self.name = name // Initialize name
        self.age = age   // Initialize age
    }
    
    /*
     * Formatted block comment
     * that should be removed
     */
    func greet() -> String {
        return "Hello, I'm \(name)" // Return greeting
    }
}

// Create a new person
let person = Person(name: "John", age: 30)