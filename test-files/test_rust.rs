// Single line comment in Rust

// TODO: Add error handling
// FIXME: Fix performance issues

/*
 * Multi-line Rust comment
 * that spans multiple lines
 */

/// Documentation comment for struct
/// This will generate documentation
struct User {
    name: String, // User's name
    email: String, // User's email
    age: u32, // User's age
}

// Implementation block with comments
impl User {
    /// Creates a new user
    /// # Arguments
    /// * `name` - The user's name
    /// * `email` - The user's email
    /// * `age` - The user's age
    fn new(name: &str, email: &str, age: u32) -> User {
        User {
            name: name.to_string(), // Convert to owned String
            email: email.to_string(), // Convert to owned String
            age, // Shorthand for age: age
        }
    }
    
    // TODO: Add validation method
    
    /// Returns user information as a string
    fn info(&self) -> String {
        format!("Name: {}, Email: {}, Age: {}", 
            self.name, self.email, self.age) // Format user info
    }
}

// Main function with comments
fn main() {
    // Create a new user
    let user = User::new("John", "john@example.com", 30);
    
    /* Print user information */
    println!("{}", user.info()); // Print user info
    
    /* FIXME: Add proper error handling
     * for invalid inputs
     */
}

// Comment with code-like content:
// fn unused() -> &'static str {
//     "This function is commented out"
// }

// Comment at end of file