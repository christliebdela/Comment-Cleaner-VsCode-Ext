#!/usr/bin/perl
# filepath: c:\Users\Christlieb Dela\Desktop\.codes\Comment-Cleaner-VsCode-Ext\test-files\test_perl.pl
# Perl Test File for Comment Cleaner Pro

# Single line comment in Perl

# TODO: Add error handling for database connections
# FIXME: Fix UTF-8 string handling

use strict;      # Enable strict mode
use warnings;    # Enable warnings
use Data::Dumper; # For debugging

=begin
Multi-line Perl comment block
that spans multiple lines
This is called a POD (Plain Old Documentation) block
=cut

# Constants
my $MAX_ATTEMPTS = 3;    # Maximum retry attempts
my $TIMEOUT = 30;        # Timeout in seconds
my $DEBUG = 1;           # Enable debugging output

# Subroutine with comments
sub calculate_average {
    my @numbers = @_; # Get arguments
    
    # Check if we have any numbers
    if (!@numbers) {
        warn "No numbers provided"; # Warning message
        return 0; # Default return value
    }
    
    my $sum = 0; # Initialize sum
    
    # Calculate sum of all numbers
    foreach my $number (@numbers) {
        $sum += $number; # Add to sum
    }
    
    # Calculate and return average
    my $average = $sum / scalar(@numbers); # Division by array size
    
    return $average; # Return the result
}

# Hash definition with comments
my %config = (
    'username' => 'admin',       # Admin username
    'password' => 'secret123',   # FIXME: Don't hardcode passwords!
    'server'   => 'localhost',   # Server address
    'port'     => 8080,          # Server port
    'database' => 'testdb',      # Database name
    'options'  => {
        'timeout'    => $TIMEOUT,       # Connection timeout
        'retries'    => $MAX_ATTEMPTS,  # Number of retry attempts
        'debug_mode' => $DEBUG          # Enable debug mode
    }
);

# Object-oriented example with comments
package Person;

sub new {
    my $class = shift;
    my $self = {
        name => shift, # Person's name
        age  => shift, # Person's age
    };
    return bless($self, $class); # Return blessed reference
}

sub get_name {
    my $self = shift;
    return $self->{name}; # Return name
}

sub get_age {
    my $self = shift;
    return $self->{age}; # Return age
}

sub is_adult {
    my $self = shift;
    return $self->{age} >= 18; # Return true if 18 or older
}

package main; # Back to main package

# Create a person object
my $person = Person->new("John Doe", 30);

# Print person details
print "Name: ", $person->get_name(), "\n"; # Print name
print "Age: ", $person->get_age(), "\n";   # Print age

# Conditional logic with comments
if ($person->is_adult()) {
    print $person->get_name(), " is an adult\n"; # Adult message
} else {
    print $person->get_name(), " is a minor\n";  # Minor message
}

# TODO: Add input validation function

# Regular expression example
my $text = "Hello, world!";
if ($text =~ /Hello/) { # Match pattern
    print "Greeting found\n"; # Success message
}

=begin comment
This is another multi-line comment
showing how to document sections of code
or provide implementation notes
=cut

# Comment containing code
# sub unused_function {
#     my ($param1, $param2) = @_;
#     return $param1 * $param2;
# }

# FIXME: This might not work on all Perl versions
my $perl_version = sprintf("%vd", $^V);
print "Perl version: $perl_version\n";

# Comment at end of file