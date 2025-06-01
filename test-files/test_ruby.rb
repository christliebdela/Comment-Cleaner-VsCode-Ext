#!/usr/bin/env ruby
# Single line comment in Ruby

# TODO: Add proper error handling
# FIXME: Fix performance issues

=begin
This is a multi-line Ruby comment block
that spans multiple lines.
It should be removed when processing.
=end

# Class definition with comments
class Person
  attr_accessor :name, :age  # Create getter and setter methods
  
  # Constructor with comments
  def initialize(name, age)
    @name = name  # Instance variable for name
    @age = age    # Instance variable for age
  end
  
  # TODO: Add validation method
  
  # Method with comments
  def greeting
    # Return a greeting string
    "Hello, I'm #{@name} and I'm #{@age} years old."  # String interpolation
  end
end

# Create a new person instance
person = Person.new("John", 30)

=begin
Example of using the Person class:
p = Person.new("Alice", 25)
puts p.greeting
=end

# FIXME: Add proper error handling for age validation

# Comment at end of file