# Single line comment in R

# R doesn't have built-in multi-line comments
# but developers use consecutive
# hash marks like this
# to create comment blocks

# Function with comment
add <- function(a, b) {
  return(a + b) # Return the sum
}

# Data manipulation with comments
data <- c(1, 2, 3, 4, 5) # Create a vector
mean_value <- mean(data) # Calculate the mean
print(mean_value) # Print the result

# Plotting example
plot(1:10, 1:10, main="Simple Plot") # Create a simple plot