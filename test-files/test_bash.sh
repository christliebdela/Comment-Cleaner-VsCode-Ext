#!/usr/bin/env bash
# Single line comment in Bash

# TODO: Add proper error handling
# FIXME: Fix performance issues

# Function with comments
function greet() {
    local name=$1  # Local variable for name
    echo "Hello, $name!"  # Print greeting
}

# Variable assignments with comments
name="World"  # Default name
count=42  # Some counter

# TODO: Add input validation

# If statement with comments
if [ "$name" = "World" ]; then
    echo "Hello, World!"  # Default greeting
else
    echo "Hello, $name!"  # Custom greeting
fi

# Loop with comments
for i in {1..5}; do
    # Print each number
    echo "Number: $i"
done

# Comment with code-like content:
# for file in $(ls); do
#     echo "$file"
# done

# FIXME: This doesn't work on all systems
echo "Current directory: $(pwd)"

# Comment at end of file