#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# This is a simple Python file for testing comment removal

# TODO: Add proper error handling
# FIXME: Fix performance issues

"""
This is a module docstring
that spans multiple lines.
It should be preserved when keep_doc_comments is enabled.
"""

import os
import sys


def example_function():
    """
    This is a function docstring.
    It provides documentation for the function.
    
    Returns:
        str: A simple message
    """
    # Single line comment
    x = 42  # Inline comment
    
    ''' This is another form of multi-line
    string that can be used as a docstring '''
    
    # TODO: Implement proper validation
    
    """This is a string, not a docstring"""
    
    return "Hello, world!"  # Return statement


class ExampleClass:
    """
    This is a class docstring
    with multiple lines
    """
    
    def __init__(self):
        """Constructor docstring"""
        # Initialize properties
        self.value = 100  # FIXME: Use a configuration value
    
    def method(self):
        # This is a method
        """Method docstring"""  # This is positioned strangely but valid
        pass


# Multi-line comment using strings
'''
This is a multi-line comment
using single quotes
'''

"""
This is a multi-line comment
using double quotes
"""

# Comment with code-like syntax
# if True:
#     print("This is commented out code")

x = 10
# End of file comment