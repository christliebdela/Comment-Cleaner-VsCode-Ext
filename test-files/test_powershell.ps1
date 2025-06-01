# Single line comment in PowerShell

# TODO: Add proper error handling
# FIXME: Fix performance issues

<#
 # Multi-line PowerShell comment block
 # that spans multiple lines
 #>

# Function with comments
function Get-Greeting {
    param(
        [string]$Name # User's name parameter
    )
    
    # Return a greeting with the name
    return "Hello, $Name!" # String with variable
}

# Variable assignments with comments
$userName = "World" # Default name
$count = 42 # Some counter

# TODO: Add input validation

# If statement with comments
if ($userName -eq "World") {
    Write-Output "Hello, World!" # Default greeting
}
else {
    Write-Output "Hello, $userName!" # Custom greeting
}

# Loop with comments
foreach ($i in 1..5) {
    # Write each number
    Write-Output "Number: $i" # Output with variable
}

<#
 # FIXME: This might not work on all PowerShell versions
 # Need to add version check
 #>
Write-Output "Current directory: $($PWD.Path)"

<#
 # Comment with code-like content:
 # Get-ChildItem | ForEach-Object {
 #     Write-Output $_.Name
 # }
 #>

# Comment at end of file