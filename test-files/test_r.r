# R Test File for Comment Cleaner Pro

# R doesn't have built-in multi-line comments
# so developers typically use consecutive
# hash marks like this to create
# comment blocks

# TODO: Implement data normalization function
# FIXME: Fix column name handling in read_csv

# Load necessary libraries
library(dplyr)    # For data manipulation
library(ggplot2)  # For visualization
library(tidyr)    # For data tidying

# Function with comments
calculate_mean <- function(data, column) {
  # Check if the column exists
  if (!column %in% names(data)) {
    stop("Column not found in dataset") # Error message
  }
  
  # Calculate the mean, removing NA values
  mean_value <- mean(data[[column]], na.rm = TRUE) # Use na.rm to ignore NA values
  
  return(mean_value) # Return the calculated mean
}

# Creating test data
set.seed(123)  # Set random seed for reproducibility
test_data <- data.frame(
  id = 1:100,                           # ID column
  value1 = rnorm(100, mean = 10, sd = 2), # Normal distribution
  value2 = runif(100, min = 0, max = 100)  # Uniform distribution
)

# Data manipulation with pipe operator
result <- test_data %>%
  filter(value1 > 8) %>%    # Filter rows where value1 > 8
  mutate(                    # Create new columns
    squared = value1^2,      # Square of value1
    category = ifelse(value2 > 50, "High", "Low") # Categorize value2
  ) %>%
  group_by(category) %>%     # Group by category
  summarise(                 # Calculate summary statistics
    mean_val1 = mean(value1),  # Mean of value1
    mean_val2 = mean(value2)   # Mean of value2
  )

# TODO: Add proper error handling for missing data

# Create a basic plot
# This plots value1 against value2 with category as color
ggplot(test_data, aes(x = value1, y = value2, color = ifelse(value2 > 50, "High", "Low"))) +
  geom_point() +  # Add scatter plot points
  labs(
    title = "Scatter Plot of Values",  # Plot title
    x = "Value 1",                     # x-axis label
    y = "Value 2",                     # y-axis label
    color = "Category"                 # Legend title
  ) +
  theme_minimal()  # Use minimal theme

# FIXME: The color scale needs better contrast

# Function to check normality
check_normality <- function(x) {
  # Shapiro-Wilk test
  test_result <- shapiro.test(x)
  
  # Return normality assessment
  if (test_result$p.value > 0.05) {
    return("Data appears to be normally distributed")
  } else {
    return("Data does not appear to be normally distributed")
  }
}

# Comment with R code:
# custom_function <- function() {
#   results <- lapply(1:10, function(i) {
#     return(i * 2)
#   })
#   return(unlist(results))
# }

# Print calculation result
cat("Mean of value1:", calculate_mean(test_data, "value1"), "\n")

# Comment at end of file