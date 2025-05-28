"""
Comment Cleaner Pro (CCP)

A utility for removing comments from source code files across multiple programming languages.
Useful for preparing code for deployment, reducing file sizes, or cleaning up code.
"""

import os
import re
import sys
import glob
import shutil
import argparse


def identify_language(file_path):
    """Determine language type based on file extension."""
    ext = os.path.splitext(file_path)[1].lower()
    
    # Map file extensions to language types
    extension_map = {
        '.py': 'python',
        '.html': 'html', '.htm': 'html',
        '.css': 'css',
        '.js': 'javascript',
        '.ts': 'typescript',
        '.c': 'c', '.h': 'c',
        '.cpp': 'cpp', '.hpp': 'cpp', '.cc': 'cpp', '.cxx': 'cpp',
        '.java': 'java',
        '.rb': 'ruby',
        '.go': 'go',
        '.php': 'php',
        '.sql': 'sql',    
        '.swift': 'swift',
        '.rs': 'rust',
        '.kt': 'kotlin',
        '.sh': 'bash', '.bash': 'bash',
        '.ps1': 'powershell',
        '.lua': 'lua',
        '.pl': 'perl', '.pm': 'perl',
        '.yaml': 'yaml', '.yml': 'yaml',
        '.hs': 'haskell',
        '.dart': 'dart',
        '.m': 'matlab',
        '.r': 'r', '.R': 'r',
        '.cs': 'csharp'
    }
    
    return extension_map.get(ext, 'unknown')


def remove_comments(content, language):
    """
    Remove comments from code based on language syntax rules.
    
    Args:
        content (str): Source code content
        language (str): Programming language identifier
        
    Returns:
        str: Code with comments removed
    """
    # Python comment handling
    if language == 'python':
        # Remove multi-line comments (triple quotes)
        content = re.sub(r'"""[\s\S]*?"""', '', content)
        content = re.sub(r"'''[\s\S]*?'''", '', content)
        
        # Handle line comments
        result = []
        for line in content.split('\n'):
            if '#' in line:
                line = line.split('#')[0]
            result.append(line)
    
    # HTML comment handling
    elif language == 'html':
        # Remove <!-- --> style comments
        content = re.sub(r'<!--[\s\S]*?-->', '', content)
        result = content.split('\n')
    
    # C-style languages comment handling (C, C++, Java, JS, CSS)
    elif language in ['css', 'javascript', 'typescript', 'c', 'cpp', 'java']:
        # Remove /* */ block comments
        content = re.sub(r'/\*[\s\S]*?\*/', '', content)
        
        result = []
        for line in content.split('\n'):
            # Handle line comments with // for appropriate languages
            if language in ['javascript', 'typescript', 'css', 'java', 'c', 'cpp']:
                if '//' in line:
                    line = line.split('//')[0]
            result.append(line)
    
    # Go comment handling
    if language == 'go':
        # Remove /* ... */ block comments
        content = re.sub(r'/\*[\s\S]*?\*/', '', content)
        result = []
        for line in content.split('\n'):
            # Remove // line comments
            if '//' in line:
                line = line.split('//')[0]
            result.append(line)
    
    # Ruby comment handling
    elif language == 'ruby':
        # Remove =begin ... =end block comments
        content = re.sub(r'=begin[\s\S]*?=end', '', content)
        
        result = []
        for line in content.split('\n'):
            if '#' in line:
                # Preserve shebang lines (both #! and # ! formats)
                stripped = line.strip()
                if not (stripped.startswith('#!') or stripped.startswith('# !')):
                    line = line.split('#')[0]
            result.append(line)
    
    # PHP comment handling
    elif language == 'php':
        # Remove /* */ block comments
        content = re.sub(r'/\*[\s\S]*?\*/', '', content)
        
        result = []
        for line in content.split('\n'):
            # First handle // comments
            if '//' in line:
                line = line.split('//')[0]
            
            # Then handle # comments (PHP also uses # for single-line comments)
            if '#' in line:
                line = line.split('#')[0]
                
            result.append(line)
    
    # SQL comment handling
    elif language == 'sql':
        # Remove /* */ block comments
        content = re.sub(r'/\*[\s\S]*?\*/', '', content)
        
        result = []
        for line in content.split('\n'):
            # Handle -- line comments (SQL style)
            if '--' in line:
                line = line.split('--')[0]
            result.append(line)
    
    # Swift comment handling
    elif language == 'swift':
        # Remove /* */ block comments
        content = re.sub(r'/\*[\s\S]*?\*/', '', content)
        
        result = []
        for line in content.split('\n'):
            # Handle // line comments
            if '//' in line:
                line = line.split('//')[0]
            result.append(line)
    
    # Rust comment handling
    elif language == 'rust':
        # Remove /* */ block comments
        content = re.sub(r'/\*[\s\S]*?\*/', '', content)
        
        result = []
        for line in content.split('\n'):
            # Handle // line comments
            if '//' in line:
                line = line.split('//')[0]
            result.append(line)
    
    # Kotlin comment handling
    elif language == 'kotlin':
        # Remove /* */ block comments
        content = re.sub(r'/\*[\s\S]*?\*/', '', content)
        
        result = []
        for line in content.split('\n'):
            # Handle // line comments
            if '//' in line:
                line = line.split('//')[0]
            result.append(line)
    
    # Bash comment handling
    elif language == 'bash':
        result = []
        for line in content.split('\n'):
            if '#' in line:
                # Preserve shebang
                if line.strip().startswith('#!'):
                    result.append(line)
                else:
                    line = line.split('#')[0]
                    result.append(line)
            else:
                result.append(line)
    
    # PowerShell comment handling
    elif language == 'powershell':
        # Remove <# #> block comments
        content = re.sub(r'<#[\s\S]*?#>', '', content)
        
        result = []
        for line in content.split('\n'):
            # Handle # line comments
            if '#' in line:
                line = line.split('#')[0]
            result.append(line)
    
    # Lua comment handling
    elif language == 'lua':
        # Remove --[[ ]] block comments
        content = re.sub(r'--\[\[[\s\S]*?]]', '', content)
        
        result = []
        for line in content.split('\n'):
            # Handle -- line comments
            if '--' in line:
                line = line.split('--')[0]
            result.append(line)
    
    # Perl comment handling
    elif language == 'perl':
        # Remove =begin ... =cut block comments
        content = re.sub(r'=begin[\s\S]*?=cut', '', content)
        
        result = []
        for line in content.split('\n'):
            # Handle # line comments (preserving shebangs)
            if '#' in line:
                if line.strip().startswith('#!'):
                    result.append(line)
                else:
                    line = line.split('#')[0]
                    result.append(line)
            else:
                result.append(line)
    
    # YAML comment handling
    elif language == 'yaml':
        result = []
        for line in content.split('\n'):
            if '#' in line:
                line = line.split('#')[0]
            result.append(line)
    
    # Haskell comment handling
    elif language == 'haskell':
        # Remove {- -} block comments
        content = re.sub(r'\{-[\s\S]*?-\}', '', content)
        
        result = []
        for line in content.split('\n'):
            # Handle -- line comments
            if '--' in line:
                line = line.split('--')[0]
            result.append(line)
    
    # Dart comment handling
    elif language == 'dart':
        # Remove /* */ block comments
        content = re.sub(r'/\*[\s\S]*?\*/', '', content)
        
        result = []
        for line in content.split('\n'):
            # Handle // line comments
            if '//' in line:
                line = line.split('//')[0]
            result.append(line)
    
    # MATLAB comment handling
    elif language == 'matlab':
        # Remove %{ %} block comments
        content = re.sub(r'%\{[\s\S]*?%\}', '', content)
        
        result = []
        for line in content.split('\n'):
            # Handle % line comments
            if '%' in line:
                line = line.split('%')[0]
            result.append(line)
    
    # R comment handling
    elif language == 'r':
        result = []
        for line in content.split('\n'):
            if '#' in line:
                line = line.split('#')[0]
            result.append(line)
    
    # C# comment handling
    elif language == 'csharp':
        # Remove /* */ block comments
        content = re.sub(r'/\*[\s\S]*?\*/', '', content)
        
        # Remove XML documentation comments (///)
        content = re.sub(r'///.*$', '', content, flags=re.MULTILINE)
        
        result = []
        for line in content.split('\n'):
            # Handle // line comments
            if '//' in line:
                line = line.split('//')[0]
            result.append(line)
    
    # Unknown language handling
    else:
        return content
    
    # Clean up the result by removing trailing whitespace and excessive newlines
    cleaned = '\n'.join(line.rstrip() for line in result)
    cleaned = re.sub(r'\n\s*\n\s*\n', '\n\n', cleaned)
    
    return cleaned


def process_file(file_path, backup=True, force=False):
    """
    Process a file to remove comments while handling backups and errors.
    
    Args:
        file_path (str): Path to file to process
        backup (bool): Whether to create backup files
        force (bool): Whether to process unknown file types
        
    Returns:
        bool: True if processing succeeded, False otherwise
    """
    language = identify_language(file_path)
    
    # Skip unknown file types unless forced
    if language == 'unknown' and not force:
        print(f"Skipping {file_path}: Unknown file type. Use --force to process anyway.")
        return False
    
    print(f"Processing: {file_path} (detected as {language})")

    # Create backup if requested
    if backup:
        backup_path = file_path + '.bak'
        shutil.copy2(file_path, backup_path)
        print(f"  Backup created: {backup_path}")

    try:
        # Read file content
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Process content to remove comments
        cleaned = remove_comments(content, language)

        # Write cleaned content back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(cleaned)

        print(f"  Removed comments successfully")
        return True
    except Exception as e:
        print(f"  Error processing {file_path}: {e}")
        # Restore from backup if available
        if backup:
            shutil.copy2(backup_path, file_path)
            print(f"  Restored from backup due to error")
        return False


def main():
    """Parse command line arguments and process matching files."""
    # Set up command line argument parser
    parser = argparse.ArgumentParser(description='Remove comments from code files.')
    parser.add_argument('file_pattern', help='File pattern to match (e.g., *.py, src/*.js)')
    parser.add_argument('--no-backup', action='store_true', help='Skip creating backup files')
    parser.add_argument('--force', action='store_true', help='Process unknown file types')
    parser.add_argument('--recursive', action='store_true', help='Process files recursively')
    
    args = parser.parse_args()
    
    # Handle recursive directory traversal
    if args.recursive and '**' not in args.file_pattern:
        file_pattern = os.path.join('**', args.file_pattern)
    else:
        file_pattern = args.file_pattern
    
    # Find matching files
    files = glob.glob(file_pattern, recursive=args.recursive)

    if not files:
        print(f"No files found matching pattern: {args.file_pattern}")
        return

    print(f"Found {len(files)} files matching {args.file_pattern}")
    success_count = 0
    
    # Process each matching file
    for file_path in files:
        if process_file(file_path, backup=not args.no_backup, force=args.force):
            success_count += 1

    print(f"Done! Successfully processed {success_count} of {len(files)} files.")


if __name__ == "__main__":
    main()
