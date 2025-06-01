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
import logging
import argparse
import concurrent.futures
import json
import tokenize
from abc import ABC, abstractmethod
from typing import Dict, List, Tuple, Optional, Any, Set, Pattern
from io import BytesIO

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(message)s'
)
logger = logging.getLogger(__name__)


class CommentPattern:
    """Represents a comment pattern for a specific language."""
    
    def __init__(self, pattern: str, is_block: bool = False, is_doc: bool = False,
                 needs_string_protection: bool = False, description: str = ""):
        self.pattern = pattern
        self.is_block = is_block  # Block vs line comment
        self.is_doc = is_doc  # Documentation comment
        self.needs_string_protection = needs_string_protection  # Whether this pattern needs protection from string contexts
        self.description = description


# Centralized pattern registry
COMMENT_PATTERNS = {
    'python': {
        'line': CommentPattern(r'#.*$', description="Python line comment"),
        'docstring_double': CommentPattern(r'"""[\s\S]*?"""', is_block=True, is_doc=True, 
                                         needs_string_protection=True, 
                                         description="Python triple double-quote docstring"),
        'docstring_single': CommentPattern(r"'''[\s\S]*?'''", is_block=True, is_doc=True, 
                                         needs_string_protection=True,
                                         description="Python triple single-quote docstring"),
    },
    'javascript': {
        'line': CommentPattern(r'//.*$', description="JavaScript line comment"),
        'block': CommentPattern(r'/\*[\s\S]*?\*/', is_block=True, description="JavaScript block comment"),
        'doc': CommentPattern(r'/\*\*[\s\S]*?\*/', is_block=True, is_doc=True, 
                            description="JavaScript doc comment"),
    },
    'typescript': {
        'line': CommentPattern(r'//.*$', description="TypeScript line comment"),
        'block': CommentPattern(r'/\*[\s\S]*?\*/', is_block=True, description="TypeScript block comment"),
        'doc': CommentPattern(r'/\*\*[\s\S]*?\*/', is_block=True, is_doc=True, 
                            description="TypeScript doc comment"),
    },
    'html': {
        'block': CommentPattern(r'<!--[\s\S]*?-->', is_block=True, description="HTML comment"),
        'block_dotall': CommentPattern(r'(?s)<!--.*?-->', is_block=True, 
                                     description="HTML comment with dotall flag"),
    },
    'c': {
        'line': CommentPattern(r'//.*$', description="C line comment"),
        'block': CommentPattern(r'/\*[\s\S]*?\*/', is_block=True, description="C block comment"),
    },
    'cpp': {
        'line': CommentPattern(r'//.*$', description="C++ line comment"),
        'block': CommentPattern(r'/\*[\s\S]*?\*/', is_block=True, description="C++ block comment"),
    },
    'css': {
        'block': CommentPattern(r'/\*[\s\S]*?\*/', is_block=True, description="CSS comment"),
    },
    'sql': {
        'line': CommentPattern(r'--.*$', description="SQL line comment"),
        'block': CommentPattern(r'/\*[\s\S]*?\*/', is_block=True, description="SQL block comment"),
    },
    'bash': {
        'line': CommentPattern(r'#.*$', description="Bash line comment"),
    },
    'powershell': {
        'line': CommentPattern(r'#.*$', description="PowerShell line comment"),
        'block': CommentPattern(r'<#[\s\S]*?#>', is_block=True, description="PowerShell block comment"),
    },
    'lua': {
        'line': CommentPattern(r'--.*$', description="Lua line comment"),
        'block': CommentPattern(r'--\[\[[\s\S]*?]]', is_block=True, description="Lua block comment"),
    },
    'haskell': {
        'line': CommentPattern(r'--.*$', description="Haskell line comment"),
        'block': CommentPattern(r'\{-[\s\S]*?-\}', is_block=True, description="Haskell block comment"),
    },
    'ruby': {
        'line': CommentPattern(r'#.*$', description="Ruby line comment"),
        'block': CommentPattern(r'=begin[\s\S]*?=end', is_block=True, description="Ruby block comment"),
    },
    'perl': {
        'line': CommentPattern(r'#.*$', description="Perl line comment"),
        'block': CommentPattern(r'=begin[\s\S]*?=cut', is_block=True, description="Perl block comment"),
    },
    'matlab': {
        'line': CommentPattern(r'%.*$', description="MATLAB line comment"),
        'block': CommentPattern(r'%\{[\s\S]*?%\}', is_block=True, description="MATLAB block comment"),
    },
    'csharp': {
        'line': CommentPattern(r'//.*$', description="C# line comment"),
        'block': CommentPattern(r'/\*[\s\S]*?\*/', is_block=True, description="C# block comment"),
        'doc': CommentPattern(r'///.*$', is_doc=True, description="C# XML documentation comment"),
    }
}


class CommentHandler(ABC):
    """Base abstract class for language-specific comment handlers."""
    
    def __init__(self, language_key: str):
        self.language_key = language_key
        self.patterns = COMMENT_PATTERNS.get(language_key, {})
    
    @abstractmethod
    def remove_comments(self, content: str, keep_doc_comments: bool = False) -> str:
        """Remove comments from the content."""
        pass

    def get_patterns(self, include_doc_comments: bool = True) -> List[CommentPattern]:
        """Get applicable patterns based on settings."""
        if include_doc_comments:
            return list(self.patterns.values())
        else:
            return [p for p in self.patterns.values() if not p.is_doc]


class PythonCommentHandler(CommentHandler):
    """Handler for Python comments using the tokenize module."""
    
    def __init__(self):
        super().__init__('python')
    
    def remove_comments(self, content: str, keep_doc_comments: bool = False) -> str:
        # Handle docstrings first if needed
        if not keep_doc_comments:
            # Use regex for docstrings as tokenize doesn't separate docstrings from strings
            for pattern_name in ['docstring_double', 'docstring_single']:
                if pattern_name in self.patterns:
                    pattern = self.patterns[pattern_name].pattern
                    content = re.sub(pattern, '', content)
        
        # Use tokenize for line comments - much more reliable
        result = []
        try:
            # tokenize requires bytes input
            source_bytes = content.encode('utf-8')
            
            # Create tokens from the source
            tokens = list(tokenize.tokenize(BytesIO(source_bytes).readline))
            
            # Reconstruct content without comments
            last_token_end = (1, 0)  # Start at line 1, column 0
            
            for token in tokens:
                token_type = token.type
                token_string = token.string
                token_start = token.start
                token_end = token.end
                
                # Keep all non-comment tokens
                if token_type != tokenize.COMMENT:
                    # Add whitespace/newlines between tokens
                    if token_start[0] > last_token_end[0]:
                        # Add newlines if needed
                        result.append('\n' * (token_start[0] - last_token_end[0]))
                        last_token_end = (token_start[0], 0)
                    elif token_start[1] > last_token_end[1]:
                        # Add spaces if needed
                        result.append(' ' * (token_start[1] - last_token_end[1]))
                    
                    # Add the token itself
                    result.append(token_string)
                    last_token_end = token_end
            
            return ''.join(result)
        except Exception as e:
            logger.warning(f"Tokenizer failed: {e}. Falling back to regex-based parsing.")
            # Fall back to regex-based approach
            content = re.sub(r'#.*$', '', content, flags=re.MULTILINE)
            return content


class HtmlCommentHandler(CommentHandler):
    """Handler for HTML comments."""
    
    def __init__(self):
        super().__init__('html')
    
    def remove_comments(self, content: str, keep_doc_comments: bool = False) -> str:
        for pattern_name in ['block', 'block_dotall']:
            if pattern_name in self.patterns:
                pattern = self.patterns[pattern_name].pattern
                content = re.sub(pattern, '', content)
        
        return content


class CStyleCommentHandler(CommentHandler):
    """Handler for C-style comments (C, C++, JavaScript, Java, etc.)."""
    
    def __init__(self, language_key: str = 'javascript'):
        super().__init__(language_key)
    
    def remove_comments(self, content: str, keep_doc_comments: bool = False) -> str:
        # Handle string literals to prevent removing comments inside strings
        chunks = []
        in_string = False
        string_char = None
        i = 0
        
        while i < len(content):
            # Check for line comments
            if content[i:i+2] == '//' and not in_string and 'line' in self.patterns:
                # Found line comment
                line_end = content.find('\n', i)
                if line_end == -1:
                    i = len(content)  # End of content
                else:
                    i = line_end  # Move to next line
                
            # Check for block comments
            elif content[i:i+2] == '/*' and not in_string:
                # Found block comment
                if content[i:i+3] == '/**' and keep_doc_comments and 'doc' in self.patterns:
                    # Preserve doc comment
                    chunks.append(content[i:i+3])
                    i += 3
                else:
                    # Skip block comment
                    end = content.find('*/', i + 2)
                    if end == -1:
                        i = len(content)  # Unterminated comment
                    else:
                        i = end + 2  # Skip comment and closing tag
        
            # String handling
            elif content[i] in ['"', "'"] and (i == 0 or content[i-1] != '\\'):
                # String handling
                if not in_string:
                    # Start of string
                    in_string = True
                    string_char = content[i]
                    chunks.append(content[i])
                    i += 1
                elif content[i] == string_char:
                    # End of string with matching quote
                    in_string = False
                    chunks.append(content[i])
                    i += 1
                else:
                    # Different quote character inside a string
                    chunks.append(content[i])
                    i += 1
            else:
                # Regular code or string content
                chunks.append(content[i])
                i += 1
    
        return ''.join(chunks)


class SqlCommentHandler(CommentHandler):
    """Handler for SQL comments."""
    
    def __init__(self):
        super().__init__('sql')
    
    def remove_comments(self, content: str, keep_doc_comments: bool = False) -> str:
        # Remove block comments
        if 'block' in self.patterns:
            content = re.sub(self.patterns['block'].pattern, '', content)
        
        # Handle line comments
        result = []
        for line in content.split('\n'):
            if '--' in line and 'line' in self.patterns:
                line = line.split('--')[0]
            result.append(line)
            
        return '\n'.join(result)


class HashCommentHandler(CommentHandler):
    """Handler for languages that use # for line comments."""
    
    def __init__(self, language_key: str = 'bash', preserve_shebang: bool = False):
        super().__init__(language_key)
        self.preserve_shebang = preserve_shebang
    
    def remove_comments(self, content: str, keep_doc_comments: bool = False) -> str:
        result = []
        
        for line in content.split('\n'):
            if '#' in line:
                # Optionally preserve shebang lines
                if self.preserve_shebang and line.strip().startswith('#!'):
                    result.append(line)
                else:
                    line = line.split('#')[0]
                    result.append(line)
            else:
                result.append(line)
                
        return '\n'.join(result)


class LuaCommentHandler(CommentHandler):
    """Handler for Lua comments."""
    
    def __init__(self):
        super().__init__('lua')
    
    def remove_comments(self, content: str, keep_doc_comments: bool = False) -> str:
        # Remove block comments
        if 'block' in self.patterns:
            content = re.sub(self.patterns['block'].pattern, '', content)
        
        # Handle line comments
        result = []
        for line in content.split('\n'):
            if '--' in line and 'line' in self.patterns:
                line = line.split('--')[0]
            result.append(line)
            
        return '\n'.join(result)


class HaskellCommentHandler(CommentHandler):
    """Handler for Haskell comments."""
    
    def __init__(self):
        super().__init__('haskell')
    
    def remove_comments(self, content: str, keep_doc_comments: bool = False) -> str:
        # Remove block comments
        if 'block' in self.patterns:
            content = re.sub(self.patterns['block'].pattern, '', content)
        
        # Handle line comments
        result = []
        for line in content.split('\n'):
            if '--' in line and 'line' in self.patterns:
                line = line.split('--')[0]
            result.append(line)
            
        return '\n'.join(result)


class MatlabCommentHandler(CommentHandler):
    """Handler for MATLAB comments."""
    
    def __init__(self):
        super().__init__('matlab')
    
    def remove_comments(self, content: str, keep_doc_comments: bool = False) -> str:
        # Remove block comments
        if 'block' in self.patterns:
            content = re.sub(self.patterns['block'].pattern, '', content)
        
        # Handle line comments
        result = []
        for line in content.split('\n'):
            if '%' in line and 'line' in self.patterns:
                line = line.split('%')[0]
            result.append(line)
            
        return '\n'.join(result)


class PowerShellCommentHandler(CommentHandler):
    """Handler for PowerShell comments."""
    
    def __init__(self):
        super().__init__('powershell')
    
    def remove_comments(self, content: str, keep_doc_comments: bool = False) -> str:
        # Remove block comments
        if 'block' in self.patterns:
            content = re.sub(self.patterns['block'].pattern, '', content)
        
        # Handle line comments
        result = []
        for line in content.split('\n'):
            if '#' in line and 'line' in self.patterns:
                line = line.split('#')[0]
            result.append(line)
            
        return '\n'.join(result)


class RubyCommentHandler(CommentHandler):
    """Handler for Ruby comments."""
    
    def __init__(self):
        super().__init__('ruby')
    
    def remove_comments(self, content: str, keep_doc_comments: bool = False) -> str:
        # Remove block comments
        if 'block' in self.patterns:
            content = re.sub(self.patterns['block'].pattern, '', content)
        
        # Handle line comments (preserve shebang)
        result = []
        for line in content.split('\n'):
            if '#' in line and 'line' in self.patterns:
                # Preserve shebang lines (both #! and # ! formats)
                stripped = line.strip()
                if not (stripped.startswith('#!') or stripped.startswith('# !')):
                    line = line.split('#')[0]
                # else keep the line with the shebang
            result.append(line)
            
        return '\n'.join(result)


class PerlCommentHandler(CommentHandler):
    """Handler for Perl comments."""
    
    def __init__(self):
        super().__init__('perl')
    
    def remove_comments(self, content: str, keep_doc_comments: bool = False) -> str:
        # Remove block comments
        if 'block' in self.patterns:
            content = re.sub(self.patterns['block'].pattern, '', content)
        
        # Handle line comments (preserving shebangs)
        result = []
        for line in content.split('\n'):
            if '#' in line and 'line' in self.patterns:
                if line.strip().startswith('#!'):
                    result.append(line)
                else:
                    line = line.split('#')[0]
                    result.append(line)
            else:
                result.append(line)
                
        return '\n'.join(result)


class PhpCommentHandler(CommentHandler):
    """Handler for PHP comments."""
    
    def __init__(self):
        super().__init__('php')
    
    def remove_comments(self, content: str, keep_doc_comments: bool = False) -> str:
        # Remove block comments
        content = re.sub(r'/\*[\s\S]*?\*/', '', content)
        
        result = []
        for line in content.split('\n'):
            # First handle // comments
            if '//' in line:
                line = line.split('//')[0]
            
            # Then handle # comments
            if '#' in line:
                line = line.split('#')[0]
                
            result.append(line)
            
        return '\n'.join(result)


class CSharpCommentHandler(CommentHandler):
    """Handler for C# comments."""
    
    def __init__(self):
        super().__init__('csharp')
    
    def remove_comments(self, content: str, keep_doc_comments: bool = False) -> str:
        # Remove block comments
        if 'block' in self.patterns:
            content = re.sub(self.patterns['block'].pattern, '', content)
        
        # Remove XML documentation comments (///)
        if not keep_doc_comments and 'doc' in self.patterns:
            content = re.sub(self.patterns['doc'].pattern, '', content, flags=re.MULTILINE)
        
        # Handle line comments
        result = []
        for line in content.split('\n'):
            if '//' in line and 'line' in self.patterns:
                line = line.split('//')[0]
            result.append(line)
            
        return '\n'.join(result)


class CommentRemover:
    """Main class to orchestrate comment removal across different languages."""
    
    def __init__(self):
        """Initialize with handlers for each supported language."""
        self._handlers = {
            'python': PythonCommentHandler(),
            'html': HtmlCommentHandler(),
            'javascript': CStyleCommentHandler('javascript'),
            'typescript': CStyleCommentHandler('typescript'),
            'c': CStyleCommentHandler('c'),
            'cpp': CStyleCommentHandler('cpp'),
            'java': CStyleCommentHandler('java'),
            'css': CStyleCommentHandler('css'),
            'go': CStyleCommentHandler('go'),
            'swift': CStyleCommentHandler('swift'),
            'rust': CStyleCommentHandler('rust'),
            'kotlin': CStyleCommentHandler('kotlin'),
            'dart': CStyleCommentHandler('dart'),
            'bash': HashCommentHandler('bash', preserve_shebang=True),
            'yaml': HashCommentHandler('yaml'),
            'r': HashCommentHandler('r'),
            'powershell': PowerShellCommentHandler(),
            'lua': LuaCommentHandler(),
            'perl': PerlCommentHandler(),
            'ruby': RubyCommentHandler(),
            'php': PhpCommentHandler(),
            'sql': SqlCommentHandler(),
            'haskell': HaskellCommentHandler(),
            'matlab': MatlabCommentHandler(),
            'csharp': CSharpCommentHandler(),
        }
        
        # Map file extensions to language types
        self._extension_map = {
            '.py': 'python',
            '.html': 'html', '.htm': 'html',
            '.css': 'css',
            '.js': 'javascript',
            '.jsx': 'javascript',
            '.ts': 'typescript',
            '.tsx': 'typescript',
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
    
    def identify_language(self, file_path: str) -> str:
        """Determine language type based on file extension."""
        ext = os.path.splitext(file_path)[1].lower()
        return self._extension_map.get(ext, 'unknown')
    
    def count_comments(self, content: str) -> int:
        """Count comments (approximate) in the content."""
        count = 0
        patterns = [
            r'//.*$',                # JavaScript/C/C++/Java line comments 
            r'/\*[\s\S]*?\*/',       # Block comments
            r'#.*$',                 # Python/Perl/Ruby/Shell comments
            r'--.*$',                # SQL/Lua comments
            r'%.*$',                 # MATLAB comments
            r'"""[\s\S]*?"""',       # Python docstrings (double quotes)
            r"'''[\s\S]*?'''",       # Python docstrings (single quotes)
            r'<!--[\s\S]*?-->',      # HTML/XML comments - standard pattern
            r'(?s)<!--.*?-->',       # HTML comments with dotall flag for multi-line
            r'<#[\s\S]*?#>',         # PowerShell comments
            r'\{-[\s\S]*?-\}',       # Haskell comments
            r'=begin[\s\S]*?=end',   # Ruby block comments
            r'=begin[\s\S]*?=cut'    # Perl block comments
        ]
        
        # Run each pattern and see if it matches
        for pattern in patterns:
            matches = re.findall(pattern, content, re.MULTILINE)
            count += len(matches)
            if matches and len(matches) > 0:
                logger.info(f"Found {len(matches)} comments with pattern '{pattern}'")
                if len(matches) > 0 and logger.level <= logging.INFO:
                    # Log the first match to help debugging (truncated for readability)
                    first_match = matches[0][:50] + "..." if len(matches[0]) > 50 else matches[0]
                    logger.info(f"  Example: {first_match}")
                
        return count
    
    def remove_comments(self, content: str, language: str, 
                        preserve_todo: bool = False, 
                        preserve_patterns: Optional[List[str]] = None,
                        keep_doc_comments: bool = False) -> str:
        """Remove comments from code based on language syntax rules."""
        if language == 'unknown' or language not in self._handlers:
            return content
            
        # Get the appropriate handler for this language
        handler = self._handlers[language]
        
        # Process the content
        cleaned = handler.remove_comments(content, keep_doc_comments)
        
        # Clean up the result by removing trailing whitespace and excessive newlines
        cleaned = '\n'.join(line.rstrip() for line in cleaned.split('\n'))
        cleaned = re.sub(r'\n\s*\n\s*\n', '\n\n', cleaned)
        
        return cleaned
    
    def process_file(self, file_path: str, backup: bool = True, 
                    force: bool = False, preserve_todo: bool = False,
                    preserve_patterns: Optional[List[str]] = None,
                    keep_doc_comments: bool = False) -> Tuple[bool, Optional[Dict[str, Any]]]:
        """
        Process a file to remove comments while handling backups and errors.
        
        Args:
            file_path: Path to file to process
            backup: Whether to create backup files
            force: Whether to process unknown file types
            preserve_todo: Whether to preserve TODO and FIXME comments
            preserve_patterns: List of regex patterns for comments to preserve
            keep_doc_comments: Whether to preserve documentation comments
            
        Returns:
            Tuple of (success, stats_dict)
        """
        language = self.identify_language(file_path)
        
        # Skip unknown file types unless forced
        if language == 'unknown' and not force:
            logger.info(f"Skipping {file_path}: Unknown file type. Use --force to process anyway.")
            return (False, None)
        
        logger.info(f"Processing: {file_path} (detected as {language})")

        # Create backup if requested
        backup_path = None
        if backup:
            backup_path = file_path + '.bak'
            shutil.copy2(file_path, backup_path)
            logger.info(f"  Backup created: {backup_path}")

        try:
            # Statistics tracking
            original_size = os.path.getsize(file_path)
            
            # Read file content
            with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                content = f.read()
            
            # Count original lines
            original_lines = content.count('\n') + 1
            
            # Count comments (approximate)
            comment_count = self.count_comments(content)
            
            # Process content to remove comments
            cleaned = self.remove_comments(
                content, language, preserve_todo, preserve_patterns, keep_doc_comments
            )
            
            # Count cleaned lines
            cleaned_lines = cleaned.count('\n') + 1
            lines_removed = original_lines - cleaned_lines
            
            # Write cleaned content back to file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(cleaned)
            
            # Calculate statistics
            new_size = os.path.getsize(file_path)
            size_reduction = original_size - new_size
            percentage = (size_reduction / original_size) * 100 if original_size > 0 else 0
            
            logger.info(f"  Removed approximately {comment_count} comments ({lines_removed} lines)")
            logger.info(f"  File size reduced by {size_reduction} bytes ({percentage:.1f}%)")
            
            return True, {
                'commentCount': comment_count,
                'linesRemoved': lines_removed,
                'sizeReduction': size_reduction,
                'sizePercentage': percentage
            }
        except UnicodeDecodeError as e:
            logger.error(f"  Error: Unable to decode {file_path}. File may use unsupported encoding: {e}")
            return (False, None)
        except PermissionError:
            logger.error(f"  Error: Permission denied for {file_path}. Check file permissions.")
            return (False, None)
        except Exception as e:
            logger.error(f"  Error processing {file_path}: {e}")
            # Restore from backup if available
            if backup and backup_path:
                try:
                    shutil.copy2(backup_path, file_path)
                    logger.info(f"  Restored from backup due to error")
                except Exception as restore_error:
                    logger.error(f"  Failed to restore from backup: {restore_error}")
            return (False, None)


class BatchProcessor:
    """Handles batch processing of multiple files with progress tracking."""
    
    def __init__(self, remover: CommentRemover, max_workers: int = 4):
        self.remover = remover
        self.max_workers = max_workers
    
    def process_files(self, files: List[str], backup: bool = True, force: bool = False,
                    preserve_todo: bool = False, preserve_patterns: Optional[List[str]] = None,
                    keep_doc_comments: bool = False) -> Tuple[int, List[Dict[str, Any]]]:
        """
        Process multiple files in parallel.
        
        Args:
            files: List of file paths to process
            backup: Whether to create backup files
            force: Whether to process unknown file types
            preserve_todo: Whether to preserve TODO and FIXME comments
            preserve_patterns: List of regex patterns for comments to preserve
            keep_doc_comments: Whether to preserve documentation comments
            
        Returns:
            Tuple of (success_count, results_list)
        """
        if not files:
            return (0, [])
            
        success_count = 0
        results = []
        
        total_files = len(files)
        logger.info(f"Processing {total_files} files with {self.max_workers} threads")
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            # Submit all files for processing
            future_to_file = {
                executor.submit(
                    self.remover.process_file, 
                    file_path, 
                    backup, 
                    force,
                    preserve_todo,
                    preserve_patterns,
                    keep_doc_comments
                ): file_path for file_path in files
            }
            
            # Process as they complete
            processed = 0
            
            for future in concurrent.futures.as_completed(future_to_file):
                file_path = future_to_file[future]
                processed += 1
                
                try:
                    success, stats = future.result()
                    if success:
                        success_count += 1
                        results.append(stats)
                    
                    # Show progress
                    logger.info(f"Progress: {processed}/{total_files} files ({(processed/total_files)*100:.1f}%)")
                    
                except Exception as e:
                    logger.error(f"Error processing {file_path}: {e}")
        
        # Show summary statistics
        if results:
            total_comments = sum(r['commentCount'] for r in results)
            total_lines = sum(r['linesRemoved'] for r in results)
            total_reduction = sum(r['sizeReduction'] for r in results)
            logger.info(f"\nSummary:")
            logger.info(f"- Removed approximately {total_comments} comments")
            logger.info(f"- Removed {total_lines} lines of comments")
            logger.info(f"- Reduced file sizes by {total_reduction} bytes")
        
        logger.info(f"Done! Successfully processed {success_count} of {len(files)} files.")
        
        return (success_count, results)


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Remove comments from code files.')
    parser.add_argument('file_pattern', help='File pattern to match (e.g., *.py, src/*.js)')
    parser.add_argument('--no-backup', action='store_true', help='Skip creating backup files')
    parser.add_argument('--force', action='store_true', help='Process unknown file types')
    parser.add_argument('--recursive', action='store_true', help='Process files recursively')
    parser.add_argument('--preserve-todo', action='store_true', help='Preserve TODO and FIXME comments')
    parser.add_argument('--preserve-patterns', type=str, help='JSON array of regex patterns to preserve')
    parser.add_argument('--keep-doc-comments', action='store_true', 
                   help='Preserve documentation comments')
    parser.add_argument('--threads', type=int, default=4, 
                      help='Number of threads for parallel processing')
    parser.add_argument('--quiet', action='store_true', help='Reduce output verbosity')
    
    return parser.parse_args()


def main():
    """Main entry point."""
    # Parse command line arguments
    args = parse_args()
    
    # Set up logging level
    if args.quiet:
        logger.setLevel(logging.WARNING)
    
    # Convert preserve_patterns from JSON string if provided
    preserve_patterns = None
    if args.preserve_patterns:
        try:
            preserve_patterns = json.loads(args.preserve_patterns)
        except json.JSONDecodeError:
            logger.error("Failed to parse preserve patterns JSON. Using no patterns.")
    
    # Handle recursive directory traversal
    if args.recursive and '**' not in args.file_pattern:
        file_pattern = os.path.join('**', args.file_pattern)
    else:
        file_pattern = args.file_pattern
    
    # Find matching files
    files = glob.glob(file_pattern, recursive=args.recursive)
    
    if not files:
        logger.warning(f"No files found matching pattern: {args.file_pattern}")
        return
    
    logger.info(f"Found {len(files)} files matching {args.file_pattern}")
    
    # Create instances
    remover = CommentRemover()
    processor = BatchProcessor(remover, max_workers=args.threads)
    
    # Process files
    processor.process_files(
        files, 
        backup=not args.no_backup, 
        force=args.force,
        preserve_todo=args.preserve_todo,
        preserve_patterns=preserve_patterns,
        keep_doc_comments=args.keep_doc_comments
    )


if __name__ == "__main__":
    main()