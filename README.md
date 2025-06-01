# Comment Cleaner Pro

<p align="left">
  <img src="media/comment-cleaner-pro.jpg" width="auto" height="374.38" alt="Comment Cleaner Pro Logo">
</p>

<p align="left">
  <a href="https://marketplace.visualstudio.com/items?itemName=ChristliebDela.comment-cleaner-pro"><img src="https://img.shields.io/visual-studio-marketplace/v/ChristliebDela.comment-cleaner-pro?style=flat-square&color=000000&labelColor=222222" alt="Version"></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=ChristliebDela.comment-cleaner-pro"><img src="https://img.shields.io/visual-studio-marketplace/d/ChristliebDela.comment-cleaner-pro?style=flat-square&color=000000&labelColor=222222" alt="Downloads"></a>
  <a href="https://github.com/christliebdela/Comment-Cleaner-VsCode-Ext/issues"><img src="https://img.shields.io/github/issues/christliebdela/Comment-Cleaner-VsCode-Ext?style=flat-square&color=000000&labelColor=222222" alt="Issues"></a>
  <a href="https://github.com/christliebdela/Comment-Cleaner-VsCode-Ext/pulls"><img src="https://img.shields.io/github/issues-pr/christliebdela/Comment-Cleaner-VsCode-Ext?style=flat-square&color=000000&labelColor=222222" alt="Pull Requests"></a>
  <a href="https://github.com/christliebdela/Comment-Cleaner-VsCode-Ext/blob/main/LICENSE"><img src="https://img.shields.io/github/license/christliebdela/Comment-Cleaner-VsCode-Ext?style=flat-square&color=000000&labelColor=222222" alt="License"></a>
</p>

## Current Release

v0.1.6 - Enhanced configuration dialogs and UI improvements

## Overview

Comment Cleaner Pro is a powerful VS Code extension for removing comments from source code files. It helps you streamline your code by efficiently removing all types of comments (line, block, and documentation) across 20+ programming languages while preserving the core functionality of your code.

## The Ironic Truth

> "Yes, this comment remover has comments in its source code. It's like a barber with fabulous hair." 

We believe in documenting our code to help contributors, even while building a tool that removes comments. Our extension removes comments from _production code_, not development code. We're like dentists who eat candy but still brush their teeth! 😉

You could say our source code lives by the motto: _"Do as I say, not as I'm coded."_

## Key Features

### Comprehensive Language Support
- **20+ Programming Languages** - Supports all major languages including Python, JavaScript (including JSX), TypeScript (including TSX), HTML, CSS, C/C++, Java, Ruby, Go, PHP, SQL, Swift, Rust, Kotlin, and more
- **Intelligent Comment Detection** - Accurately identifies and removes all comment types specific to each language
- **Preservation of Code Structure** - Maintains code indentation and formatting while removing comments

### Flexible Processing Options
- **Single File Processing** - Clean comments from the current file with a single click
- **Batch Processing** - Process multiple files simultaneously using glob patterns
- **Automatic Backups** - Create safety backups before removing comments
- **Customizable Rules** - Configure how unknown file types and special comments are handled
- **Configuration Persistence** - Settings in the UI panel now properly apply to all operations
- **Clear Configuration Dialogs** - Intuitive options when using context menu commands
- **Undo/Redo Support** - Easily revert or reapply changes with dedicated undo/redo buttons

### Enhanced User Experience
- **Modern UI Controls** - Circular checkboxes with green indicators for selected options
- **Unlimited History** - Track all cleaned files without arbitrary limits
- **Individual File Management** - Remove specific files from history as needed
- **Responsive Design** - UI elements maintain their shape and clarity at all window sizes

### Detailed Statistics
- **Comment Count** - Track the number of comments removed per file
- **Line Reduction** - See exactly how many lines were removed
- **File Size Impact** - Measure the size reduction achieved
- **Accurate Tracking** - Now with improved accuracy in statistics tracking

![Comment Cleaner Pro in action](media/demo.gif)

## Supported Languages

| Language Group | Supported Languages |
|---------------|---------------------|
| **Web Development** | JavaScript (including JSX), TypeScript (including TSX), HTML, CSS, PHP |
| **Systems Programming** | C, C++, Rust, Go |
| **Enterprise** | Java, C#, Kotlin |
| **Scripting** | Python, Ruby, Perl, Bash, PowerShell, Lua |
| **Data & Analysis** | SQL, YAML, R, MATLAB |
| **Mobile Development** | Swift, Dart |
| **Functional** | Haskell |

## Installation

1. Open VS Code
2. Go to Extensions view (Ctrl+Shift+X)
3. Search for "Comment Cleaner Pro"
4. Click Install

**Requirements:**
- Visual Studio Code 1.50.0 or higher
- Python 3.6 or higher

## Usage Guide

### Method 1: Clean Current File
1. Open a source code file in the editor
2. Right-click anywhere in the editor
3. Select "Comment Cleaner Pro: Clean Current File"
4. Choose whether to create a backup
5. The editor will refresh automatically with comments removed

### Method 2: Command Palette
1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type "Comment Cleaner Pro" 
3. Select "Comment Cleaner Pro: Clean Current File" or "Comment Cleaner Pro: Clean Multiple Files"
4. Follow the prompts to configure options

### Method 3: Activity Bar Integration
1. Click the Comment Cleaner Pro icon in the Activity Bar
2. Choose "Clean Current File" or "Clean Multiple Files"
3. View your recently cleaned files in the "Cleaned Files" section
4. Use Undo/Redo buttons to revert or restore changes as needed

### Batch Processing Options
When cleaning multiple files:
1. Enter a glob pattern to match files (e.g., `*.js`, `src/**/*.py`)
2. Choose whether to create backups
3. Decide if unknown file types should be processed
4. Monitor progress in the notification area

## Command-Line Usage

The extension includes a standalone Python script that can be used directly:

```bash
# Basic usage
python path/to/ccp.py "*.js"

# Process files recursively
python path/to/ccp.py "src/**/*.py" --recursive

# Preserve documentation comments
python path/to/ccp.py "*.java" --keep-doc-comments

# Preserve TODO comments
python path/to/ccp.py "*.cpp" --preserve-todo

# Don't create backups
python path/to/ccp.py "*.html" --no-backup

# Force processing of unknown file types
python path/to/ccp.py "*.custom" --force
```

## Technical Details

Comment Cleaner Pro uses a sophisticated object-oriented architecture with dedicated language handlers to identify and remove comments while preserving code structure. The extension:

- Handles nested comment structures
- Preserves important comments like license headers when configured
- Detects and properly processes character escapes in strings
- Maintains code indentation and whitespace
- Provides accurate line count reduction statistics

## Performance Considerations

- For very large files (10MB+), expect processing to take a few seconds
- Batch processing uses multi-threading for better performance
- Uses memory-efficient processing techniques for large files

## FAQ

### Does Comment Cleaner Pro modify my original files?
Yes, but you can enable backups which create .bak files before processing.

### Can I undo the comment removal?
Yes, you can use the dedicated Undo button in the sidebar, use standard VS Code undo operations, or restore from the .bak backup files if you enabled backups.

### Does it work with all programming languages?
It supports 20+ major languages. For unlisted languages, you can try the "force" option, but results may vary.

## Privacy & Security

Comment Cleaner Pro:

- Processes all files locally on your machine
- Does not send any code or data externally
- Requires no authentication or online services
- Has minimal extension permissions

## Release History

See the [CHANGELOG](https://github.com/christliebdela/Comment-Cleaner-VsCode-Ext/blob/main/CHANGELOG.md) for details about each release.

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author


Created and maintained by <a href="https://github.com/christliebdela">Christlieb Dela</a>.

<!-- Yes, this is a comment in a comment remover's README. The irony isn't lost on us! -->
