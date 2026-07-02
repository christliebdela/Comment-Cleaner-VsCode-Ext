"""
Comment Cleaner Pro (CCP) v2.0

v2.0 changes:
- Eliminated handler duplication via shared base class methods
- Fixed string context blindness in hash/dash handlers
- Fixed PHP handler string corruption bug
- Fixed template literal nesting bug in JS/TS
- Fixed Python encoding declaration stripping (no longer strips it)
- Reliable comment counting via diff-based approach
- New languages: SCSS, Vue SFC, Svelte, Dockerfile, TOML, HCL, GraphQL, MDX
- --dry-run mode (analyse without modifying)
- --json mode (structured JSON to stdout, logs to stderr)
- Directory scanning with .ccpignore support
- Accepts multiple files/directories in one invocation
"""

import os
import re
import sys
import glob
import json
import shutil
import logging
import argparse
import fnmatch
import concurrent.futures
import tokenize
import difflib
from abc import ABC, abstractmethod
from typing import Dict, List, Tuple, Optional, Any
from io import BytesIO

logging.basicConfig(level=logging.INFO, format='%(message)s', stream=sys.stderr)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Comment pattern registry
# ---------------------------------------------------------------------------

class CommentPattern:
    def __init__(self, pattern: str, is_block: bool = False, is_doc: bool = False,
                 description: str = ""):
        self.pattern = pattern
        self.is_block = is_block
        self.is_doc = is_doc
        self.description = description


COMMENT_PATTERNS: Dict[str, Dict[str, CommentPattern]] = {
    'python': {
        'line': CommentPattern(r'#.*$'),
        'docstring_double': CommentPattern(r'"""[\s\S]*?"""', is_block=True, is_doc=True),
        'docstring_single': CommentPattern(r"'''[\s\S]*?'''", is_block=True, is_doc=True),
    },
    'javascript': {
        'line': CommentPattern(r'//.*$'),
        'block': CommentPattern(r'/\*[\s\S]*?\*/', is_block=True),
        'doc': CommentPattern(r'/\*\*[\s\S]*?\*/', is_block=True, is_doc=True),
    },
    'typescript': {
        'line': CommentPattern(r'//.*$'),
        'block': CommentPattern(r'/\*[\s\S]*?\*/', is_block=True),
        'doc': CommentPattern(r'/\*\*[\s\S]*?\*/', is_block=True, is_doc=True),
    },
    'html': {'block': CommentPattern(r'<!--[\s\S]*?-->', is_block=True)},
    'css': {'block': CommentPattern(r'/\*[\s\S]*?\*/', is_block=True)},
    'scss': {
        'line': CommentPattern(r'//.*$'),
        'block': CommentPattern(r'/\*[\s\S]*?\*/', is_block=True),
    },
    'c': {
        'line': CommentPattern(r'//.*$'),
        'block': CommentPattern(r'/\*[\s\S]*?\*/', is_block=True),
    },
    'cpp': {
        'line': CommentPattern(r'//.*$'),
        'block': CommentPattern(r'/\*[\s\S]*?\*/', is_block=True),
    },
    'java': {
        'line': CommentPattern(r'//.*$'),
        'block': CommentPattern(r'/\*[\s\S]*?\*/', is_block=True),
        'doc': CommentPattern(r'/\*\*[\s\S]*?\*/', is_block=True, is_doc=True),
    },
    'go': {
        'line': CommentPattern(r'//.*$'),
        'block': CommentPattern(r'/\*[\s\S]*?\*/', is_block=True),
    },
    'swift': {
        'line': CommentPattern(r'//.*$'),
        'block': CommentPattern(r'/\*[\s\S]*?\*/', is_block=True),
        'doc': CommentPattern(r'/\*\*[\s\S]*?\*/', is_block=True, is_doc=True),
    },
    'kotlin': {
        'line': CommentPattern(r'//.*$'),
        'block': CommentPattern(r'/\*[\s\S]*?\*/', is_block=True),
        'doc': CommentPattern(r'/\*\*[\s\S]*?\*/', is_block=True, is_doc=True),
    },
    'rust': {
        'line': CommentPattern(r'//.*$'),
        'block': CommentPattern(r'/\*[\s\S]*?\*/', is_block=True),
        'doc': CommentPattern(r'///.*$', is_doc=True),
    },
    'dart': {
        'line': CommentPattern(r'//.*$'),
        'block': CommentPattern(r'/\*[\s\S]*?\*/', is_block=True),
        'doc': CommentPattern(r'///.*$', is_doc=True),
    },
    'csharp': {
        'line': CommentPattern(r'//.*$'),
        'block': CommentPattern(r'/\*[\s\S]*?\*/', is_block=True),
        'doc': CommentPattern(r'///.*$', is_doc=True),
    },
    'php': {
        'line': CommentPattern(r'//.*$'),
        'hash': CommentPattern(r'#.*$'),
        'block': CommentPattern(r'/\*[\s\S]*?\*/', is_block=True),
        'doc': CommentPattern(r'/\*\*[\s\S]*?\*/', is_block=True, is_doc=True),
    },
    'sql': {
        'line': CommentPattern(r'--.*$'),
        'block': CommentPattern(r'/\*[\s\S]*?\*/', is_block=True),
    },
    'lua': {
        'line': CommentPattern(r'--.*$'),
        'block': CommentPattern(r'--\[\[[\s\S]*?]]', is_block=True),
    },
    'haskell': {
        'line': CommentPattern(r'--.*$'),
        'block': CommentPattern(r'\{-[\s\S]*?-\}', is_block=True),
    },
    'bash': {'line': CommentPattern(r'#.*$')},
    'yaml': {'line': CommentPattern(r'#.*$')},
    'r': {'line': CommentPattern(r'#.*$')},
    'ruby': {
        'line': CommentPattern(r'#.*$'),
        'block': CommentPattern(r'^=begin[\s\S]*?^=end', is_block=True),
    },
    'perl': {
        'line': CommentPattern(r'#.*$'),
        'block': CommentPattern(r'^=begin[\s\S]*?^=cut', is_block=True),
    },
    'powershell': {
        'line': CommentPattern(r'#.*$'),
        'block': CommentPattern(r'<#[\s\S]*?#>', is_block=True),
    },
    'matlab': {
        'line': CommentPattern(r'%.*$'),
        'block': CommentPattern(r'%\{[\s\S]*?%\}', is_block=True),
    },
    'dockerfile': {'line': CommentPattern(r'#.*$')},
    'toml': {'line': CommentPattern(r'#.*$')},
    'graphql': {'line': CommentPattern(r'#.*$')},
    'hcl': {
        'line': CommentPattern(r'#.*$'),
        'line2': CommentPattern(r'//.*$'),
        'block': CommentPattern(r'/\*[\s\S]*?\*/', is_block=True),
    },
    'vue': {},
    'svelte': {},
    'mdx': {
        'jsx': CommentPattern(r'\{/\*[\s\S]*?\*/\}', is_block=True),
        'html': CommentPattern(r'<!--[\s\S]*?-->', is_block=True),
    },
}


# ---------------------------------------------------------------------------
# Base handler — shared string-aware helpers
# ---------------------------------------------------------------------------

class CommentHandler(ABC):
    """Abstract base with shared helpers so subclasses stay thin."""

    def __init__(self, language_key: str):
        self.language_key = language_key
        self.patterns = COMMENT_PATTERNS.get(language_key, {})

    @abstractmethod
    def remove_comments(self, content: str, keep_doc_comments: bool = False,
                        preserve_todo: bool = False,
                        preserve_patterns: Optional[List[str]] = None) -> str:
        pass

    def should_preserve_comment(self, comment: str, preserve_todo: bool = False,
                                preserve_patterns: Optional[List[str]] = None) -> bool:
        if preserve_todo and re.search(r'\b(TODO|FIXME)\b', comment, re.IGNORECASE):
            return True
        if preserve_patterns:
            for pattern in preserve_patterns:
                try:
                    if re.search(pattern, comment):
                        return True
                except re.error:
                    logger.warning(f"Invalid regex pattern: {pattern}")
        return False

    def _find_comment_start(self, line: str, token: str) -> int:
        """Return index of `token` outside string literals, or -1."""
        in_string = False
        string_char = None
        i = 0
        token_len = len(token)
        while i < len(line):
            char = line[i]
            if in_string:
                if char == '\\' and i + 1 < len(line):
                    i += 2
                    continue
                if char == string_char:
                    in_string = False
            else:
                if char in ('"', "'"):
                    in_string = True
                    string_char = char
                elif line[i:i + token_len] == token:
                    return i
            i += 1
        return -1

    def _remove_line_comments(self, content: str, token: str,
                               preserve_todo: bool = False,
                               preserve_patterns: Optional[List[str]] = None,
                               preserve_shebang: bool = False) -> str:
        """Remove line comments by `token`, respecting string context."""
        result = []
        for line in content.split('\n'):
            if token not in line:
                result.append(line)
                continue
            if preserve_shebang and line.lstrip().startswith('#!'):
                result.append(line)
                continue
            pos = self._find_comment_start(line, token)
            if pos == -1:
                result.append(line)
                continue
            code_part = line[:pos]
            comment_part = line[pos:]
            if self.should_preserve_comment(comment_part, preserve_todo, preserve_patterns):
                result.append(line)
            else:
                result.append(code_part)
        return '\n'.join(result)

    def _remove_block_comments(self, content: str, pattern: str,
                                preserve_todo: bool = False,
                                preserve_patterns: Optional[List[str]] = None,
                                flags: int = re.MULTILINE) -> str:
        """Remove block comments (reverse-span to preserve positions)."""
        matches = list(re.finditer(pattern, content, flags))
        for match in reversed(matches):
            comment = match.group(0)
            if not self.should_preserve_comment(comment, preserve_todo, preserve_patterns):
                start, end = match.span()
                content = content[:start] + content[end:]
        return content


# ---------------------------------------------------------------------------
# Python handler
# ---------------------------------------------------------------------------

class PythonCommentHandler(CommentHandler):
    """Tokenize to locate comments/docstrings, then slice-replace string in reverse order to preserve original formatting."""

    def __init__(self):
        super().__init__('python')

    def remove_comments(self, content: str, keep_doc_comments: bool = False,
                        preserve_todo: bool = False,
                        preserve_patterns: Optional[List[str]] = None) -> str:
        try:
            source_bytes = content.encode('utf-8')
            tokens = list(tokenize.tokenize(BytesIO(source_bytes).readline))
            
            # State machine for docstrings
            allow_docstring = True
            expecting_colon = False
            
            # Spans to replace/remove: (start_idx, end_idx, replacement_str)
            spans_to_replace = []
            
            # Map of character indices for each line start
            lines = content.splitlines(keepends=True)
            line_starts = [0]
            current = 0
            for l in lines:
                current += len(l)
                line_starts.append(current)
                
            def get_char_idx(line: int, col: int) -> int:
                if line - 1 < len(line_starts):
                    return line_starts[line - 1] + col
                return line_starts[-1]

            for tok in tokens:
                if tok.type == tokenize.COMMENT:
                    if tok.start[0] == 1 and tok.string.startswith('#!'):
                        continue
                    if self.should_preserve_comment(tok.string, preserve_todo, preserve_patterns):
                        continue
                    
                    start_idx = get_char_idx(tok.start[0], tok.start[1])
                    end_idx = get_char_idx(tok.end[0], tok.end[1])
                    spans_to_replace.append((start_idx, end_idx, ""))
                    continue

                if tok.type == tokenize.ENCODING:
                    continue

                is_colon_for_block = False
                if tok.type == tokenize.NAME and tok.string in ('class', 'def'):
                    expecting_colon = True

                if tok.type == tokenize.OP and tok.string == ':':
                    if expecting_colon:
                        allow_docstring = True
                        expecting_colon = False
                        is_colon_for_block = True

                if tok.type == tokenize.STRING:
                    if allow_docstring:
                        allow_docstring = False
                        if keep_doc_comments or self.should_preserve_comment(tok.string, preserve_todo, preserve_patterns):
                            pass
                        else:
                            # Replace docstring with same number of newlines to keep line numbering intact
                            start_idx = get_char_idx(tok.start[0], tok.start[1])
                            end_idx = get_char_idx(tok.end[0], tok.end[1])
                            newlines_count = tok.end[0] - tok.start[0]
                            spans_to_replace.append((start_idx, end_idx, "\n" * newlines_count))
                    else:
                        allow_docstring = False
                elif tok.type not in (tokenize.NL, tokenize.NEWLINE, tokenize.INDENT, tokenize.DEDENT) and not is_colon_for_block:
                    allow_docstring = False
            
            # Sort replacements in reverse order to apply from end to start without index shifting
            spans_to_replace.sort(key=lambda x: x[0], reverse=True)
            
            modified_content = content
            for start_idx, end_idx, replacement in spans_to_replace:
                modified_content = modified_content[:start_idx] + replacement + modified_content[end_idx:]
                
            return modified_content

        except Exception as e:
            logger.warning(f"Tokenizer failed ({e}). Using regex fallback.")
            return self._remove_line_comments(
                content, '#', preserve_todo, preserve_patterns, preserve_shebang=True
            )


# ---------------------------------------------------------------------------
# HTML handler
# ---------------------------------------------------------------------------

class HtmlCommentHandler(CommentHandler):
    def __init__(self, language_key: str = 'html'):
        super().__init__(language_key)

    def remove_comments(self, content: str, keep_doc_comments: bool = False,
                        preserve_todo: bool = False,
                        preserve_patterns: Optional[List[str]] = None) -> str:
        return self._remove_block_comments(
            content, self.patterns['block'].pattern, preserve_todo, preserve_patterns
        )


# ---------------------------------------------------------------------------
# C-style handler — full string + template literal awareness
# ---------------------------------------------------------------------------

class CStyleCommentHandler(CommentHandler):
    """
    Character-by-character parser for C-style languages.
    Template literal fix: tracks ${} brace depth to avoid false comment detection
    inside nested expressions like `Hello ${/* comment */ name}`.
    """

    def __init__(self, language_key: str = 'javascript'):
        super().__init__(language_key)
        self._has_template_literals = language_key in ('javascript', 'typescript')
        self._has_line_comments = 'line' in self.patterns

    def remove_comments(self, content: str, keep_doc_comments: bool = False,
                        preserve_todo: bool = False,
                        preserve_patterns: Optional[List[str]] = None) -> str:
        chunks: List[str] = []
        i = 0
        length = len(content)

        while i < length:

            # Template literals — track ${} depth for correct nesting
            if self._has_template_literals and content[i] == '`':
                start = i
                i += 1
                brace_depth = 0
                while i < length:
                    c = content[i]
                    if c == '\\' and i + 1 < length:
                        i += 2
                        continue
                    if c == '$' and i + 1 < length and content[i + 1] == '{':
                        brace_depth += 1
                        i += 2
                        continue
                    if c == '}' and brace_depth > 0:
                        brace_depth -= 1
                        i += 1
                        continue
                    if c == '`' and brace_depth == 0:
                        i += 1
                        break
                    i += 1
                chunks.append(content[start:i])
                continue

            # String literals
            if content[i] in ('"', "'"):
                string_char = content[i]
                start = i
                i += 1
                while i < length:
                    if content[i] == '\\' and i + 1 < length:
                        i += 2
                        continue
                    if content[i] == string_char:
                        i += 1
                        break
                    i += 1
                chunks.append(content[start:i])
                continue

            # Line comment //
            if self._has_line_comments and content[i:i + 2] == '//':
                line_end = content.find('\n', i)
                if line_end == -1:
                    comment = content[i:]
                    if self.should_preserve_comment(comment, preserve_todo, preserve_patterns):
                        chunks.append(comment)
                    break
                comment = content[i:line_end]
                if self.should_preserve_comment(comment, preserve_todo, preserve_patterns):
                    chunks.append(comment)
                chunks.append('\n')
                i = line_end + 1
                continue

            # Block comment /* ... */
            if content[i:i + 2] == '/*':
                is_doc = content[i:i + 3] == '/**'
                end = content.find('*/', i + 2)
                if end == -1:
                    comment = content[i:]
                    if (is_doc and keep_doc_comments) or \
                       self.should_preserve_comment(comment, preserve_todo, preserve_patterns):
                        chunks.append(comment)
                    break
                comment = content[i:end + 2]
                if is_doc and keep_doc_comments:
                    chunks.append(comment)
                elif self.should_preserve_comment(comment, preserve_todo, preserve_patterns):
                    chunks.append(comment)
                else:
                    newlines = comment.count('\n')
                    if newlines:
                        chunks.append('\n' * newlines)
                i = end + 2
                continue

            chunks.append(content[i])
            i += 1

        return ''.join(chunks)


# ---------------------------------------------------------------------------
# PHP handler — char-by-char, fixes string corruption on URLs like https://
# ---------------------------------------------------------------------------

class PhpCommentHandler(CommentHandler):
    """PHP: //, #, /* */ with full string context awareness."""

    def __init__(self):
        super().__init__('php')

    def remove_comments(self, content: str, keep_doc_comments: bool = False,
                        preserve_todo: bool = False,
                        preserve_patterns: Optional[List[str]] = None) -> str:
        chunks: List[str] = []
        i = 0
        length = len(content)

        while i < length:
            # String literals
            if content[i] in ('"', "'"):
                string_char = content[i]
                start = i
                i += 1
                while i < length:
                    if content[i] == '\\' and i + 1 < length:
                        i += 2
                        continue
                    if content[i] == string_char:
                        i += 1
                        break
                    i += 1
                chunks.append(content[start:i])
                continue

            # // line comment
            if content[i:i + 2] == '//':
                line_end = content.find('\n', i)
                comment = content[i:] if line_end == -1 else content[i:line_end]
                if self.should_preserve_comment(comment, preserve_todo, preserve_patterns):
                    chunks.append(comment)
                if line_end == -1:
                    break
                chunks.append('\n')
                i = line_end + 1
                continue

            # # comment — but NOT PHP 8 attributes: #[Attribute]
            if content[i] == '#' and not (i + 1 < length and content[i + 1] == '['):
                line_end = content.find('\n', i)
                comment = content[i:] if line_end == -1 else content[i:line_end]
                if self.should_preserve_comment(comment, preserve_todo, preserve_patterns):
                    chunks.append(comment)
                if line_end == -1:
                    break
                chunks.append('\n')
                i = line_end + 1
                continue

            # /* */ block comment
            if content[i:i + 2] == '/*':
                is_doc = content[i:i + 3] == '/**'
                end = content.find('*/', i + 2)
                if end == -1:
                    comment = content[i:]
                    if (is_doc and keep_doc_comments) or \
                       self.should_preserve_comment(comment, preserve_todo, preserve_patterns):
                        chunks.append(comment)
                    break
                comment = content[i:end + 2]
                if is_doc and keep_doc_comments:
                    chunks.append(comment)
                elif self.should_preserve_comment(comment, preserve_todo, preserve_patterns):
                    chunks.append(comment)
                else:
                    newlines = comment.count('\n')
                    if newlines:
                        chunks.append('\n' * newlines)
                i = end + 2
                continue

            chunks.append(content[i])
            i += 1

        return ''.join(chunks)


# ---------------------------------------------------------------------------
# Thin handlers — each backed by shared base methods
# (Reduced from ~60 lines each to ~8 lines each)
# ---------------------------------------------------------------------------

class HashCommentHandler(CommentHandler):
    """# line comments. Used by Bash, YAML, R, Dockerfile, TOML, GraphQL."""
    def __init__(self, language_key: str = 'bash', preserve_shebang: bool = False):
        super().__init__(language_key)
        self.preserve_shebang = preserve_shebang

    def remove_comments(self, content: str, keep_doc_comments: bool = False,
                        preserve_todo: bool = False,
                        preserve_patterns: Optional[List[str]] = None) -> str:
        return self._remove_line_comments(
            content, '#', preserve_todo, preserve_patterns,
            preserve_shebang=self.preserve_shebang
        )


class LuaCommentHandler(CommentHandler):
    def __init__(self): super().__init__('lua')

    def remove_comments(self, content: str, keep_doc_comments: bool = False,
                        preserve_todo: bool = False,
                        preserve_patterns: Optional[List[str]] = None) -> str:
        content = self._remove_block_comments(
            content, self.patterns['block'].pattern, preserve_todo, preserve_patterns
        )
        return self._remove_line_comments(content, '--', preserve_todo, preserve_patterns)


class HaskellCommentHandler(CommentHandler):
    def __init__(self): super().__init__('haskell')

    def remove_comments(self, content: str, keep_doc_comments: bool = False,
                        preserve_todo: bool = False,
                        preserve_patterns: Optional[List[str]] = None) -> str:
        content = self._remove_block_comments(
            content, self.patterns['block'].pattern, preserve_todo, preserve_patterns
        )
        return self._remove_line_comments(content, '--', preserve_todo, preserve_patterns)


class SqlCommentHandler(CommentHandler):
    def __init__(self): super().__init__('sql')

    def remove_comments(self, content: str, keep_doc_comments: bool = False,
                        preserve_todo: bool = False,
                        preserve_patterns: Optional[List[str]] = None) -> str:
        content = self._remove_block_comments(
            content, self.patterns['block'].pattern, preserve_todo, preserve_patterns
        )
        return self._remove_line_comments(content, '--', preserve_todo, preserve_patterns)


class MatlabCommentHandler(CommentHandler):
    def __init__(self): super().__init__('matlab')

    def remove_comments(self, content: str, keep_doc_comments: bool = False,
                        preserve_todo: bool = False,
                        preserve_patterns: Optional[List[str]] = None) -> str:
        content = self._remove_block_comments(
            content, self.patterns['block'].pattern, preserve_todo, preserve_patterns
        )
        return self._remove_line_comments(content, '%', preserve_todo, preserve_patterns)


class PowerShellCommentHandler(CommentHandler):
    def __init__(self): super().__init__('powershell')

    def remove_comments(self, content: str, keep_doc_comments: bool = False,
                        preserve_todo: bool = False,
                        preserve_patterns: Optional[List[str]] = None) -> str:
        content = self._remove_block_comments(
            content, self.patterns['block'].pattern, preserve_todo, preserve_patterns
        )
        return self._remove_line_comments(content, '#', preserve_todo, preserve_patterns)


class RubyCommentHandler(CommentHandler):
    def __init__(self): super().__init__('ruby')

    def remove_comments(self, content: str, keep_doc_comments: bool = False,
                        preserve_todo: bool = False,
                        preserve_patterns: Optional[List[str]] = None) -> str:
        content = self._remove_block_comments(
            content, self.patterns['block'].pattern, preserve_todo, preserve_patterns
        )
        return self._remove_line_comments(
            content, '#', preserve_todo, preserve_patterns, preserve_shebang=True
        )


class PerlCommentHandler(CommentHandler):
    def __init__(self): super().__init__('perl')

    def remove_comments(self, content: str, keep_doc_comments: bool = False,
                        preserve_todo: bool = False,
                        preserve_patterns: Optional[List[str]] = None) -> str:
        content = self._remove_block_comments(
            content, self.patterns['block'].pattern, preserve_todo, preserve_patterns
        )
        return self._remove_line_comments(
            content, '#', preserve_todo, preserve_patterns, preserve_shebang=True
        )


class CSharpCommentHandler(CommentHandler):
    def __init__(self): super().__init__('csharp')

    def remove_comments(self, content: str, keep_doc_comments: bool = False,
                        preserve_todo: bool = False,
                        preserve_patterns: Optional[List[str]] = None) -> str:
        content = self._remove_block_comments(
            content, self.patterns['block'].pattern, preserve_todo, preserve_patterns
        )
        if not keep_doc_comments:
            result = []
            for line in content.split('\n'):
                if line.lstrip().startswith('///'):
                    if self.should_preserve_comment(line, preserve_todo, preserve_patterns):
                        result.append(line)
                else:
                    result.append(line)
            content = '\n'.join(result)
        result = []
        for line in content.split('\n'):
            if '//' in line and not line.lstrip().startswith('///'):
                pos = self._find_comment_start(line, '//')
                if pos != -1:
                    code_part = line[:pos]
                    comment_part = line[pos:]
                    result.append(
                        line if self.should_preserve_comment(
                            comment_part, preserve_todo, preserve_patterns
                        ) else code_part
                    )
                else:
                    result.append(line)
            else:
                result.append(line)
        return '\n'.join(result)


class HclCommentHandler(CommentHandler):
    def __init__(self): super().__init__('hcl')

    def remove_comments(self, content: str, keep_doc_comments: bool = False,
                        preserve_todo: bool = False,
                        preserve_patterns: Optional[List[str]] = None) -> str:
        content = self._remove_block_comments(
            content, self.patterns['block'].pattern, preserve_todo, preserve_patterns
        )
        content = self._remove_line_comments(content, '//', preserve_todo, preserve_patterns)
        return self._remove_line_comments(content, '#', preserve_todo, preserve_patterns)


# ---------------------------------------------------------------------------
# Vue SFC / Svelte handler
# ---------------------------------------------------------------------------

class VueSvelteCommentHandler(CommentHandler):
    """
    Handles Vue SFCs (.vue) and Svelte components (.svelte).
    Splits on <template>, <script>, <style> blocks and applies the correct
    sub-handler per block. Falls back to plain HTML on parse failure.
    """

    _BLOCK_RE = re.compile(r'(<(template|script|style)(\s[^>]*)?>)', re.IGNORECASE)

    def __init__(self, language_key: str = 'vue'):
        super().__init__(language_key)
        self._html = HtmlCommentHandler()
        self._js   = CStyleCommentHandler('javascript')
        self._ts   = CStyleCommentHandler('typescript')
        self._css  = CStyleCommentHandler('css')
        self._scss = CStyleCommentHandler('scss')

    def remove_comments(self, content: str, keep_doc_comments: bool = False,
                        preserve_todo: bool = False,
                        preserve_patterns: Optional[List[str]] = None) -> str:
        try:
            return self._process_sfc(content, keep_doc_comments, preserve_todo, preserve_patterns)
        except Exception as e:
            logger.warning(f"SFC block detection failed ({e}). Treating as HTML.")
            return self._html.remove_comments(
                content, keep_doc_comments, preserve_todo, preserve_patterns
            )

    def _process_sfc(self, content: str, keep_doc_comments: bool,
                     preserve_todo: bool,
                     preserve_patterns: Optional[List[str]]) -> str:
        result: List[str] = []
        pos = 0
        for open_match in self._BLOCK_RE.finditer(content):
            tag_name = open_match.group(2).lower()
            open_start = open_match.start()
            open_end = open_match.end()
            if open_start > pos:
                result.append(content[pos:open_start])
            close_tag = f'</{tag_name}>'
            close_pos = content.find(close_tag, open_end)
            if close_pos == -1:
                result.append(content[open_start:])
                pos = len(content)
                break
            block_content = content[open_end:close_pos]
            lang_m = re.search(r'lang=["\'](\w+)["\']', open_match.group(0), re.IGNORECASE)
            lang = lang_m.group(1).lower() if lang_m else None
            if tag_name == 'template':
                handler = self._html
            elif tag_name == 'script':
                handler = self._ts if lang == 'ts' else self._js
            elif tag_name == 'style':
                handler = self._scss if lang in ('scss', 'sass') else self._css
            else:
                handler = self._html
            processed = handler.remove_comments(
                block_content, keep_doc_comments, preserve_todo, preserve_patterns
            )
            result.append(open_match.group(0))
            result.append(processed)
            result.append(close_tag)
            pos = close_pos + len(close_tag)
        if pos < len(content):
            result.append(content[pos:])
        return ''.join(result)


# ---------------------------------------------------------------------------
# MDX handler
# ---------------------------------------------------------------------------

class MdxCommentHandler(CommentHandler):
    """
    Removes {/* JSX comments */} and <!-- HTML comments -->,
    but skips content inside fenced code blocks (``` or ~~~).
    """

    _FENCE_RE = re.compile(r'(^```[\s\S]*?^```|^~~~[\s\S]*?^~~~)', re.MULTILINE)

    def __init__(self):
        super().__init__('mdx')

    def remove_comments(self, content: str, keep_doc_comments: bool = False,
                        preserve_todo: bool = False,
                        preserve_patterns: Optional[List[str]] = None) -> str:
        segments = self._FENCE_RE.split(content)
        result: List[str] = []
        for idx, segment in enumerate(segments):
            if idx % 2 == 1:
                result.append(segment)  # code block — preserve unchanged
            else:
                seg = self._remove_block_comments(
                    segment, self.patterns['jsx'].pattern, preserve_todo, preserve_patterns
                )
                seg = self._remove_block_comments(
                    seg, self.patterns['html'].pattern, preserve_todo, preserve_patterns
                )
                result.append(seg)
        return ''.join(result)


# ---------------------------------------------------------------------------
# CommentRemover — orchestrates language detection + handler dispatch
# ---------------------------------------------------------------------------

class CommentRemover:
    """Detects language from file extension and delegates to the correct handler."""

    def __init__(self):
        self._handlers: Dict[str, CommentHandler] = {
            'python':     PythonCommentHandler(),
            'html':       HtmlCommentHandler(),
            'javascript': CStyleCommentHandler('javascript'),
            'typescript': CStyleCommentHandler('typescript'),
            'c':          CStyleCommentHandler('c'),
            'cpp':        CStyleCommentHandler('cpp'),
            'java':       CStyleCommentHandler('java'),
            'css':        CStyleCommentHandler('css'),
            'scss':       CStyleCommentHandler('scss'),
            'go':         CStyleCommentHandler('go'),
            'swift':      CStyleCommentHandler('swift'),
            'rust':       CStyleCommentHandler('rust'),
            'kotlin':     CStyleCommentHandler('kotlin'),
            'dart':       CStyleCommentHandler('dart'),
            'bash':       HashCommentHandler('bash', preserve_shebang=True),
            'yaml':       HashCommentHandler('yaml'),
            'r':          HashCommentHandler('r'),
            'dockerfile': HashCommentHandler('dockerfile'),
            'toml':       HashCommentHandler('toml'),
            'graphql':    HashCommentHandler('graphql'),
            'powershell': PowerShellCommentHandler(),
            'lua':        LuaCommentHandler(),
            'perl':       PerlCommentHandler(),
            'ruby':       RubyCommentHandler(),
            'php':        PhpCommentHandler(),
            'sql':        SqlCommentHandler(),
            'haskell':    HaskellCommentHandler(),
            'matlab':     MatlabCommentHandler(),
            'csharp':     CSharpCommentHandler(),
            'hcl':        HclCommentHandler(),
            'vue':        VueSvelteCommentHandler('vue'),
            'svelte':     VueSvelteCommentHandler('svelte'),
            'mdx':        MdxCommentHandler(),
        }

        self._extension_map: Dict[str, str] = {
            '.py': 'python',
            '.html': 'html', '.htm': 'html',
            '.css': 'css',
            '.scss': 'scss', '.sass': 'scss',
            '.js': 'javascript', '.jsx': 'javascript',
            '.mjs': 'javascript', '.cjs': 'javascript',
            '.ts': 'typescript', '.tsx': 'typescript',
            '.mts': 'typescript', '.cts': 'typescript',
            '.c': 'c', '.h': 'c',
            '.cpp': 'cpp', '.hpp': 'cpp', '.cc': 'cpp', '.cxx': 'cpp',
            '.java': 'java',
            '.rb': 'ruby',
            '.go': 'go',
            '.php': 'php',
            '.sql': 'sql',
            '.swift': 'swift',
            '.rs': 'rust',
            '.kt': 'kotlin', '.kts': 'kotlin',
            '.sh': 'bash', '.bash': 'bash', '.zsh': 'bash',
            '.ps1': 'powershell', '.psm1': 'powershell',
            '.lua': 'lua',
            '.pl': 'perl', '.pm': 'perl',
            '.yaml': 'yaml', '.yml': 'yaml',
            '.hs': 'haskell',
            '.dart': 'dart',
            '.m': 'matlab',
            '.r': 'r', '.R': 'r',
            '.cs': 'csharp',
            '.tf': 'hcl', '.hcl': 'hcl',
            '.toml': 'toml',
            '.graphql': 'graphql', '.gql': 'graphql',
            '.vue': 'vue',
            '.svelte': 'svelte',
            '.mdx': 'mdx',
        }

        self._filename_map: Dict[str, str] = {
            'dockerfile': 'dockerfile',
            'dockerfile.prod': 'dockerfile',
            'dockerfile.dev': 'dockerfile',
            'dockerfile.test': 'dockerfile',
        }

    def identify_language(self, file_path: str) -> str:
        ext = os.path.splitext(file_path)[1]
        if ext:
            return self._extension_map.get(ext.lower(), 'unknown')
        return self._filename_map.get(os.path.basename(file_path).lower(), 'unknown')

    def remove_comments(self, content: str, language: str,
                        preserve_todo: bool = False,
                        preserve_patterns: Optional[List[str]] = None,
                        keep_doc_comments: bool = False) -> str:
        if language == 'unknown' or language not in self._handlers:
            return content
        handler = self._handlers[language]
        cleaned = handler.remove_comments(
            content,
            keep_doc_comments=keep_doc_comments,
            preserve_todo=preserve_todo,
            preserve_patterns=preserve_patterns,
        )
        cleaned = '\n'.join(line.rstrip() for line in cleaned.split('\n'))
        cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
        return cleaned

    def _count_removed_blocks(self, original: str, cleaned: str) -> int:
        """
        Count comment blocks removed by line-level diff.
        A 'block' is a contiguous run of removed or replaced lines.
        """
        orig_lines = original.splitlines()
        clean_lines = cleaned.splitlines()
        matcher = difflib.SequenceMatcher(None, orig_lines, clean_lines)
        return sum(1 for tag, _, _, _, _ in matcher.get_opcodes() if tag in ('delete', 'replace'))

    def process_file(self, file_path: str, backup: bool = True,
                     force: bool = False, preserve_todo: bool = False,
                     preserve_patterns: Optional[List[str]] = None,
                     keep_doc_comments: bool = False,
                     dry_run: bool = False,
                     backup_base_dir: Optional[str] = None
                     ) -> Tuple[bool, Optional[Dict[str, Any]]]:
        """
        Process a single file to remove comments.

        Args:
            dry_run:         Analyse without modifying the file.
            backup_base_dir: Root for backups. None = alongside source (legacy).
        """
        language = self.identify_language(file_path)
        if language == 'unknown' and not force:
            logger.info(f"Skipping {file_path}: unknown type.")
            return (False, None)

        prefix = "[DRY RUN] " if dry_run else ""
        logger.info(f"{prefix}Processing: {file_path} ({language})")
        original_size = os.path.getsize(file_path)

        encodings = ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252']
        content: Optional[str] = None
        used_encoding = 'utf-8'
        for enc in encodings:
            try:
                with open(file_path, 'r', encoding=enc) as f:
                    content = f.read()
                used_encoding = enc
                break
            except UnicodeDecodeError:
                continue

        if content is None:
            logger.error(f"  Cannot decode {file_path}.")
            return (False, None)

        try:
            cleaned = self.remove_comments(
                content, language, preserve_todo, preserve_patterns, keep_doc_comments
            )
            lines_removed = max(0, content.count('\n') - cleaned.count('\n'))
            comments_removed = self._count_removed_blocks(content, cleaned)
            cleaned_bytes = len(cleaned.encode(used_encoding, errors='replace'))
            size_reduction = original_size - cleaned_bytes
            percentage = (size_reduction / original_size * 100) if original_size > 0 else 0.0

            if not dry_run:
                if backup:
                    if backup_base_dir:
                        workspace_root = os.path.dirname(backup_base_dir)
                        rel_path = os.path.relpath(file_path, workspace_root)
                        if rel_path.startswith('..'):
                            rel_path = os.path.basename(file_path)
                        backup_path = os.path.join(backup_base_dir, rel_path + '.bak')
                        os.makedirs(os.path.dirname(backup_path), exist_ok=True)
                    else:
                        backup_path = file_path + '.bak'
                    shutil.copy2(file_path, backup_path)
                    logger.info(f"  Backup: {backup_path}")
                with open(file_path, 'w', encoding=used_encoding) as f:
                    f.write(cleaned)

            action_word = "Would remove" if dry_run else "Removed"
            logger.info(
                f"  {action_word} ~{comments_removed} comments "
                f"({lines_removed} lines, {size_reduction} bytes, {percentage:.1f}%)"
            )

            return True, {
                # v2.0 structured keys (used by new TS bridge)
                'path':          file_path,
                'language':      language,
                'commentsFound': comments_removed,
                'linesAffected': lines_removed,
                'sizeBytes':     size_reduction,
                'sizePercent':   round(percentage, 2),
                'modified':      not dry_run,
                # Legacy keys — backward compat with existing TS parser
                'filePath':      file_path,
                'fileName':      os.path.basename(file_path),
                'commentCount':  comments_removed,
                'linesRemoved':  lines_removed,
                'sizeReduction': size_reduction,
                'sizePercentage': round(percentage, 2),
            }

        except PermissionError:
            logger.error(f"  Permission denied: {file_path}")
            return (False, None)
        except Exception as e:
            logger.error(f"  Error processing {file_path}: {e}")
            return (False, None)


# ---------------------------------------------------------------------------
# Batch Processor
# ---------------------------------------------------------------------------

class BatchProcessor:
    """Batch-processes multiple files in parallel."""

    def __init__(self, remover: CommentRemover, max_workers: int = 4):
        self.remover = remover
        self.max_workers = max_workers

    def process_files(self, files: List[str], backup: bool = True, force: bool = False,
                      preserve_todo: bool = False,
                      preserve_patterns: Optional[List[str]] = None,
                      keep_doc_comments: bool = False,
                      dry_run: bool = False,
                      backup_base_dir: Optional[str] = None
                      ) -> Tuple[int, List[Dict[str, Any]]]:
        if not files:
            return (0, [])
        total = len(files)
        success_count = 0
        results: List[Dict[str, Any]] = []
        processed = 0
        prefix = "[DRY RUN] " if dry_run else ""
        logger.info(f"{prefix}Processing {total} files with {self.max_workers} threads...")

        with concurrent.futures.ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            future_map = {
                executor.submit(
                    self.remover.process_file,
                    fp, backup, force, preserve_todo, preserve_patterns,
                    keep_doc_comments, dry_run, backup_base_dir
                ): fp
                for fp in files
            }
            for future in concurrent.futures.as_completed(future_map):
                fp = future_map[future]
                processed += 1
                try:
                    success, stats = future.result()
                    if success:
                        success_count += 1
                        if stats:
                            results.append(stats)
                except Exception as e:
                    logger.error(f"  Error with {fp}: {e}")
                logger.info(f"  Progress: {processed}/{total}")

        return success_count, results


# ---------------------------------------------------------------------------
# .ccpignore support
# ---------------------------------------------------------------------------

DEFAULT_IGNORES = frozenset({
    'node_modules', '.git', 'dist', 'out', 'build', 'coverage',
    '.next', '.nuxt', 'vendor', '__pycache__', '.venv', 'venv',
    '.mypy_cache', '.pytest_cache', '.tox', 'target', '.cargo',
    '.ccp-backups', '.svelte-kit', '.turbo',
})


def load_ignore_patterns(root_dir: str) -> List[str]:
    """Load .ccpignore patterns + defaults."""
    patterns = list(DEFAULT_IGNORES)
    ignore_file = os.path.join(root_dir, '.ccpignore')
    if os.path.isfile(ignore_file):
        with open(ignore_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    patterns.append(line)
    return patterns


def should_ignore(path: str, ignore_patterns: List[str], root_dir: str) -> bool:
    basename = os.path.basename(path).lower()
    # 1. Ignore configuration files, lockfiles, declaration files, and env files
    if (basename.endswith('.d.ts') or
        basename.startswith('.env') or
        '.config.' in basename or
        basename in {
            'package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
            'tsconfig.json', 'jsconfig.json', 'bower.json', 'composer.json',
            'gulpfile.js', 'gruntfile.js'
        }):
        return True

    # 2. Check directory segments and fnmatch patterns
    rel = os.path.relpath(path, root_dir)
    parts = rel.replace('\\', '/').split('/')
    for part in parts:
        if part in ignore_patterns:
            return True
        for pattern in ignore_patterns:
            if fnmatch.fnmatch(part, pattern):
                return True
    return False



def discover_files(directory: str, remover: CommentRemover,
                   ignore_patterns: List[str], force: bool = False) -> List[str]:
    """Recursively discover all processable files under a directory."""
    result: List[str] = []
    for root, dirs, files in os.walk(directory, topdown=True):
        dirs[:] = [
            d for d in dirs
            if not should_ignore(os.path.join(root, d), ignore_patterns, directory)
        ]
        for filename in files:
            fp = os.path.join(root, filename)
            if should_ignore(fp, ignore_patterns, directory):
                continue
            lang = remover.identify_language(fp)
            if lang != 'unknown' or force:
                result.append(fp)
    return result


# ---------------------------------------------------------------------------
# Argument parsing
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description='Comment Cleaner Pro v2.0 — remove comments from source files.'
    )
    parser.add_argument(
        'targets', nargs='+',
        help='File paths, directory paths to scan, or glob patterns'
    )
    parser.add_argument('--no-backup', action='store_true',
                        help='Skip creating backup files')
    parser.add_argument('--backup-dir', type=str, default=None,
                        help='Store backups here (default: alongside source files)')
    parser.add_argument('--force', action='store_true',
                        help='Process unknown file types')
    parser.add_argument('--preserve-todo', action='store_true',
                        help='Preserve TODO and FIXME comments')
    parser.add_argument('--preserve-patterns', type=str, default=None,
                        help='JSON array of regex patterns to preserve')
    parser.add_argument('--keep-doc-comments', action='store_true',
                        help='Preserve documentation comments')
    parser.add_argument('--dry-run', action='store_true',
                        help='Analyse files without modifying them')
    parser.add_argument('--json', action='store_true',
                        help='Emit structured JSON to stdout (logs go to stderr)')
    parser.add_argument('--threads', type=int, default=4,
                        help='Parallel worker threads (default: 4)')
    parser.add_argument('--quiet', action='store_true',
                        help='Suppress informational log output')
    return parser.parse_args()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    args = parse_args()
    if args.quiet:
        logger.setLevel(logging.WARNING)

    preserve_patterns: Optional[List[str]] = None
    if args.preserve_patterns:
        try:
            preserve_patterns = json.loads(args.preserve_patterns)
        except json.JSONDecodeError:
            logger.error("Failed to parse --preserve-patterns as JSON. Ignoring.")

    remover = CommentRemover()
    files: List[str] = []
    root_dir: Optional[str] = None

    for target in args.targets:
        target = os.path.normpath(target)
        if os.path.isdir(target):
            if root_dir is None:
                root_dir = target
            ignore_patterns = load_ignore_patterns(target)
            discovered = discover_files(target, remover, ignore_patterns, args.force)
            files.extend(discovered)
            logger.info(f"Discovered {len(discovered)} files in {target}")
        elif os.path.isfile(target):
            files.append(target)
        else:
            # Glob pattern — escape brackets when no wildcard chars present
            has_wildcards = any(c in target for c in ('*', '?'))
            pattern = target if has_wildcards else glob.escape(target)
            matched = glob.glob(pattern, recursive=True)
            if matched:
                files.extend(matched)
            else:
                logger.warning(f"No files matched: {target}")

    if not files:
        logger.warning("No files found to process.")
        print(json.dumps({
            "files": [],
            "totals": {
                "filesScanned": 0, "filesModified": 0,
                "commentsFound": 0, "linesAffected": 0, "bytesReduced": 0
            }
        }))
        return

    # Deduplicate while preserving order
    seen: set = set()
    unique: List[str] = []
    for f in files:
        key = os.path.abspath(f)
        if key not in seen:
            seen.add(key)
            unique.append(f)
    files = unique
    logger.info(f"Total: {len(files)} files")

    processor = BatchProcessor(remover, max_workers=args.threads)
    success_count, results = processor.process_files(
        files,
        backup=not args.no_backup,
        force=args.force,
        preserve_todo=args.preserve_todo,
        preserve_patterns=preserve_patterns,
        keep_doc_comments=args.keep_doc_comments,
        dry_run=args.dry_run,
        backup_base_dir=args.backup_dir,
    )

    totals = {
        "filesScanned":  len(files),
        "filesModified": success_count if not args.dry_run else 0,
        "commentsFound": sum(r.get('commentsFound', 0) for r in results),
        "linesAffected": sum(r.get('linesAffected', 0) for r in results),
        "bytesReduced":  sum(r.get('sizeBytes', 0) for r in results),
    }
    output = {"files": results, "totals": totals}

    if args.json:
        print(json.dumps(output))
    else:
        action = "Would remove" if args.dry_run else "Removed"
        logger.info(
            f"\nSummary: {success_count}/{len(files)} files | "
            f"{action} ~{totals['commentsFound']} comments | "
            f"{totals['linesAffected']} lines | {totals['bytesReduced']} bytes"
        )
        # Always emit JSON to stdout for the TS bridge even in non-json mode
        print(json.dumps(output))


if __name__ == "__main__":
    main()