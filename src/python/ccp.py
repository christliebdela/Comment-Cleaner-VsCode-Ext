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
from abc import ABC, abstractmethod
from typing import Dict, List, Tuple, Optional, Any, Set, Pattern


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(message)s'
)
logger = logging.getLogger(__name__)


class CommentHandler(ABC):
    """Base abstract class for language-specific comment handlers."""
    
    @abstractmethod
    def remove_comments(self, content: str, keep_doc_comments: bool = False) -> str:
        """Remove comments from the content."""
        pass
    
    def should_preserve(self, comment_text: str, preserve_todo: bool = False, 
                       preserve_patterns: Optional[List[str]] = None) -> bool:
        """Check if a comment should be preserved based on patterns."""
        if preserve_todo and re.search(r'(TODO|FIXME)', comment_text, re.IGNORECASE):
            return True
            
        if preserve_patterns:
            for pattern in preserve_patterns:
                if re.search(pattern, comment_text):
                    return True
                    
        return False


class PythonCommentHandler(CommentHandler):
    """Handler for Python comments."""
    
    def remove_comments(self, content: str, keep_doc_comments: bool = False) -> str:
        # Handle docstrings if not keeping doc comments
        if not keep_doc_comments:
            content = re.sub(r'"""[\s\S]*?"""', '', content)
            content = re.sub(r"'''[\s\S]*?'''", '', content)
        
        # Handle line comments
        result = []
        for line in content.split('\n'):
            if '#' in line:
                line = line.split('#')[0]
            result.append(line)
            
        return '\n'.join(result)


class HtmlCommentHandler(CommentHandler):
    """Handler for HTML comments."""
    
    def remove_comments(self, content: str, keep_doc_comments: bool = False) -> str:
        # Remove <!-- --> style comments
        content = re.sub(r'<!--[\s\S]*?-->', '', content)
        return content


class CStyleCommentHandler(CommentHandler):
    """Handler for C-style comments (C, C++, JavaScript, Java, etc.)."""
    
    def __init__(self, has_line_comments: bool = True):
        self.has_line_comments = has_line_comments
    
    def remove_comments(self, content: str, keep_doc_comments: bool = False) -> str:
        # Remove doc comments if not keeping them
        if not keep_doc_comments:
            content = re.sub(r'/\*\*[\s\S]*?\*/', '', content)
        
        # Remove /* */ block comments
        content = re.sub(r'/\*[\s\S]*?\*/', '', content)
        
        # Handle line comments if supported
        if self.has_line_comments:
            result = []
            for line in content.split('\n'):
                if '//' in line:
                    line = line.split('//')[0]
                result.append(line)
            return '\n'.join(result)
        
        return content


class SqlCommentHandler(CommentHandler):
    """Handler for SQL comments."""
    
    def remove_comments(self, content: str, keep_doc_comments: bool = False) -> str:
        # Remove /* */ block comments
        content = re.sub(r'/\*[\s\S]*?\*/', '', content)
        
        # Handle -- line comments
        result = []
        for line in content.split('\n'):
            if '--' in line:
                line = line.split('--')[0]
            result.append(line)
            
        return '\n'.join(result)


class HashCommentHandler(CommentHandler):
    """Handler for languages that use # for line comments."""
    
    def __init__(self, preserve_shebang: bool = False):
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
    
    def remove_comments(self, content: str, keep_doc_comments: bool = False) -> str:
        # Remove --[[ ]] block comments
        content = re.sub(r'--\[\[[\s\S]*?]]', '', content)
        
        # Handle -- line comments
        result = []
        for line in content.split('\n'):
            if '--' in line:
                line = line.split('--')[0]
            result.append(line)
            
        return '\n'.join(result)


class HaskellCommentHandler(CommentHandler):
    """Handler for Haskell comments."""
    
    def remove_comments(self, content: str, keep_doc_comments: bool = False) -> str:
        # Remove {- -} block comments
        content = re.sub(r'\{-[\s\S]*?-\}', '', content)
        
        # Handle -- line comments
        result = []
        for line in content.split('\n'):
            if '--' in line:
                line = line.split('--')[0]
            result.append(line)
            
        return '\n'.join(result)


class MatlabCommentHandler(CommentHandler):
    """Handler for MATLAB comments."""
    
    def remove_comments(self, content: str, keep_doc_comments: bool = False) -> str:
        # Remove %{ %} block comments
        content = re.sub(r'%\{[\s\S]*?%\}', '', content)
        
        # Handle % line comments
        result = []
        for line in content.split('\n'):
            if '%' in line:
                line = line.split('%')[0]
            result.append(line)
            
        return '\n'.join(result)


class PowerShellCommentHandler(CommentHandler):
    """Handler for PowerShell comments."""
    
    def remove_comments(self, content: str, keep_doc_comments: bool = False) -> str:
        # Remove <# #> block comments
        content = re.sub(r'<#[\s\S]*?#>', '', content)
        
        # Handle # line comments
        result = []
        for line in content.split('\n'):
            if '#' in line:
                line = line.split('#')[0]
            result.append(line)
            
        return '\n'.join(result)


class RubyCommentHandler(CommentHandler):
    """Handler for Ruby comments."""
    
    def remove_comments(self, content: str, keep_doc_comments: bool = False) -> str:
        # Remove =begin ... =end block comments
        content = re.sub(r'=begin[\s\S]*?=end', '', content)
        
        # Handle # line comments (preserve shebang)
        result = []
        for line in content.split('\n'):
            if '#' in line:
                # Preserve shebang lines (both #! and # ! formats)
                stripped = line.strip()
                if not (stripped.startswith('#!') or stripped.startswith('# !')):
                    line = line.split('#')[0]
                else:
                    # Keep shebang line
                    pass
            result.append(line)
            
        return '\n'.join(result)


class PerlCommentHandler(CommentHandler):
    """Handler for Perl comments."""
    
    def remove_comments(self, content: str, keep_doc_comments: bool = False) -> str:
        # Remove =begin ... =cut block comments
        content = re.sub(r'=begin[\s\S]*?=cut', '', content)
        
        # Handle # line comments (preserving shebangs)
        result = []
        for line in content.split('\n'):
            if '#' in line:
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
    
    def remove_comments(self, content: str, keep_doc_comments: bool = False) -> str:
        # Remove /* */ block comments
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
    
    def remove_comments(self, content: str, keep_doc_comments: bool = False) -> str:
        # Remove /* */ block comments
        content = re.sub(r'/\*[\s\S]*?\*/', '', content)
        
        # Remove XML documentation comments (///)
        if not keep_doc_comments:
            content = re.sub(r'///.*$', '', content, flags=re.MULTILINE)
        
        # Handle // line comments
        result = []
        for line in content.split('\n'):
            if '//' in line:
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
            'javascript': CStyleCommentHandler(),
            'typescript': CStyleCommentHandler(),
            'c': CStyleCommentHandler(),
            'cpp': CStyleCommentHandler(),
            'java': CStyleCommentHandler(),
            'css': CStyleCommentHandler(),
            'go': CStyleCommentHandler(),
            'swift': CStyleCommentHandler(),
            'rust': CStyleCommentHandler(),
            'kotlin': CStyleCommentHandler(),
            'dart': CStyleCommentHandler(),
            'bash': HashCommentHandler(preserve_shebang=True),
            'yaml': HashCommentHandler(),
            'r': HashCommentHandler(),
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
    
    def identify_language(self, file_path: str) -> str:
        """Determine language type based on file extension."""
        ext = os.path.splitext(file_path)[1].lower()
        return self._extension_map.get(ext, 'unknown')
    
    def count_comments(self, content: str) -> int:
        """Count comments (approximate) in the content."""
        count = 0
        for pattern in [r'//.*$', r'/\*[\s\S]*?\*/', r'#.*$', r'--.*$', r'%.*$', r'"""[\s\S]*?"""', r"'''[\s\S]*?'''"]:
            count += len(re.findall(pattern, content, re.MULTILINE))
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
                keep_doc_comments: bool = False, dry_run: bool = False) -> Tuple[bool, Optional[Dict[str, Any]]]:
    """
    Process a file to remove comments while handling backups and errors.
    
    Args:
        file_path: Path to file to process
        backup: Whether to create backup files
        force: Whether to process unknown file types
        preserve_todo: Whether to preserve TODO and FIXME comments
        preserve_patterns: List of regex patterns for comments to preserve
        keep_doc_comments: Whether to preserve documentation comments
        dry_run: If True, analyze but don't modify files
        
    Returns:
        Tuple of (success, stats_dict)
    """
    language = self.identify_language(file_path)
    
    # Skip unknown file types unless forced
    if language == 'unknown' and not force:
        logger.info(f"Skipping {file_path}: Unknown file type. Use --force to process anyway.")
        return (False, None)
    
    logger.info(f"{'Analyzing' if dry_run else 'Processing'}: {file_path} (detected as {language})")

    # Create backup if requested and not in dry run mode
    backup_path = None
    if backup and not dry_run:
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
        
        if not dry_run:
            # Write cleaned content back to file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(cleaned)
        
        # Calculate statistics
        # For dry run, calculate the theoretical new size
        new_size = len(cleaned.encode('utf-8')) if dry_run else os.path.getsize(file_path)
        size_reduction = original_size - new_size
        percentage = (size_reduction / original_size) * 100 if original_size > 0 else 0
        
        mode_prefix = "[DRY RUN] Would have " if dry_run else ""
        logger.info(f"  {mode_prefix}Removed approximately {comment_count} comments ({lines_removed} lines)")
        logger.info(f"  {mode_prefix}File size reduced by {size_reduction} bytes ({percentage:.1f}%)")
        
        return True, {
            'commentCount': comment_count,
            'linesRemoved': lines_removed,
            'sizeReduction': size_reduction,
            'sizePercentage': percentage,
            'dryRun': dry_run
        }
    except Exception as e:
        logger.error(f"  Error {'analyzing' if dry_run else 'processing'} {file_path}: {e}")
        # Restore from backup if available and not in dry run
        if backup and backup_path and not dry_run:
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
             keep_doc_comments: bool = False, dry_run: bool = False) -> Tuple[int, List[Dict[str, Any]]]:
    """
    Process multiple files in parallel.
    
    Args:
        files: List of file paths to process
        backup: Whether to create backup files
        force: Whether to process unknown file types
        preserve_todo: Whether to preserve TODO and FIXME comments
        preserve_patterns: List of regex patterns for comments to preserve
        keep_doc_comments: Whether to preserve documentation comments
        dry_run: If True, analyze but don't modify files
        
    Returns:
        Tuple of (success_count, results_list)
    """
    if not files:
        return (0, [])
        
    success_count = 0
    results = []
    
    total_files = len(files)
    logger.info(f"{'Analyzing' if dry_run else 'Processing'} {total_files} files with {self.max_workers} threads")
    
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
                keep_doc_comments,
                dry_run
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
                logger.error(f"Error {'analyzing' if dry_run else 'processing'} {file_path}: {e}")
    
    # Show summary statistics
    if results:
        total_comments = sum(r['commentCount'] for r in results)
        total_lines = sum(r['linesRemoved'] for r in results)
        total_reduction = sum(r['sizeReduction'] for r in results)
        mode_prefix = "[DRY RUN] Would have " if dry_run else ""
        logger.info(f"\nSummary:")
        logger.info(f"- {mode_prefix}Removed approximately {total_comments} comments")
        logger.info(f"- {mode_prefix}Removed {total_lines} lines of comments")
        logger.info(f"- {mode_prefix}Reduced file sizes by {total_reduction} bytes")
    
    logger.info(f"Done! Successfully {'analyzed' if dry_run else 'processed'} {success_count} of {len(files)} files.")
    
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
    parser.add_argument('--dry-run', action='store_true', help='Analyze files without modifying them')
    
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
        keep_doc_comments=args.keep_doc_comments,
        dry_run=args.dry_run
    )

if __name__ == "__main__":
    main()