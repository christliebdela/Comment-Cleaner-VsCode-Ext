# Comment Cleaner Pro

<p align="left">
  <img src="media/ccp-banner.png" width="auto" height="auto" alt="Comment Cleaner Pro Logo">
</p>

<p align="left">
  <a href="https://marketplace.visualstudio.com/items?itemName=ChristliebDela.comment-cleaner-pro"><img src="https://img.shields.io/visual-studio-marketplace/v/ChristliebDela.comment-cleaner-pro?style=flat-square&color=000000&labelColor=222222" alt="Version"></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=ChristliebDela.comment-cleaner-pro"><img src="https://img.shields.io/visual-studio-marketplace/d/ChristliebDela.comment-cleaner-pro?style=flat-square&color=000000&labelColor=222222" alt="Downloads"></a>
  <a href="https://github.com/christliebdela/Comment-Cleaner-VsCode-Ext/issues"><img src="https://img.shields.io/github/issues/christliebdela/Comment-Cleaner-VsCode-Ext?style=flat-square&color=000000&labelColor=222222" alt="Issues"></a>
  <a href="https://github.com/christliebdela/Comment-Cleaner-VsCode-Ext/pulls"><img src="https://img.shields.io/github/issues-pr/christliebdela/Comment-Cleaner-VsCode-Ext?style=flat-square&color=000000&labelColor=222222" alt="Pull Requests"></a>
  <a href="https://github.com/christliebdela/Comment-Cleaner-VsCode-Ext/blob/main/LICENSE"><img src="https://img.shields.io/github/license/christliebdela/Comment-Cleaner-VsCode-Ext?style=flat-square&color=000000&labelColor=222222" alt="License"></a>
</p>

## Current Release

v1.0.0 - Major Update: All 25 languages fully supported with fixed configuration dialogs

This release resolves two critical issues:
- Complete language support for proper comment removal in all supported languages
- Fixed configuration dialogs ensuring consistent behavior across all entry points

## Overview

Comment Cleaner Pro is a powerful VS Code extension for removing comments from source code files. It helps you streamline your code by efficiently removing all types of comments (line, block, and documentation) across 25+ programming languages while preserving the core functionality of your code.

## Features

- ✅ **Removes AI-generated comments** from supported file types
- ✅ **Preserves meaningful comments** for better readability
- ✅ **One-click cleanup** with an easy-to-use command
- ✅ **Supports multiple programming languages**
- ✅ **Automatic backups** create safety files before removing comments
- ✅ **Detailed statistics** track the number of comments and lines removed
- ✅ **Undo/Redo support** to easily revert or restore changes
- ✅ **Configuration consistency** across all entry points

## Currently Supports

**Web Development:**  
![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![HTML5](https://img.shields.io/badge/-HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/-CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![PHP](https://img.shields.io/badge/-PHP-777BB4?style=flat-square&logo=php&logoColor=white)

**Systems Programming:**  
![C](https://img.shields.io/badge/-C-A8B9CC?style=flat-square&logo=c&logoColor=black)
![C++](https://img.shields.io/badge/-C++-00599C?style=flat-square&logo=cplusplus&logoColor=white)
![Rust](https://img.shields.io/badge/-Rust-000000?style=flat-square&logo=rust&logoColor=white)
![Go](https://img.shields.io/badge/-Go-00ADD8?style=flat-square&logo=go&logoColor=white)

**Enterprise:**  
![Java](https://img.shields.io/badge/-Java-007396?style=flat-square&logo=java&logoColor=white)
![C#](https://img.shields.io/badge/-C%23-239120?style=flat-square&logo=csharp&logoColor=white)
![Kotlin](https://img.shields.io/badge/-Kotlin-7F52FF?style=flat-square&logo=kotlin&logoColor=white)

**Scripting:**  
![Python](https://img.shields.io/badge/-Python-3776AB?style=flat-square&logo=python&logoColor=white)
![Ruby](https://img.shields.io/badge/-Ruby-CC342D?style=flat-square&logo=ruby&logoColor=white)
![Perl](https://img.shields.io/badge/-Perl-39457E?style=flat-square&logo=perl&logoColor=white)
![Bash](https://img.shields.io/badge/-Bash-4EAA25?style=flat-square&logo=gnu-bash&logoColor=white)
![Lua](https://img.shields.io/badge/-Lua-2C2D72?style=flat-square&logo=lua&logoColor=white)
![PowerShell](https://img.shields.io/badge/-PowerShell-5391FE?style=flat-square&logo=powershell&logoColor=white)

**Data & Analysis:**  
![SQL](https://img.shields.io/badge/-SQL-4479A1?style=flat-square&logo=mysql&logoColor=white)
![YAML](https://img.shields.io/badge/-YAML-CB171E?style=flat-square&logo=yaml&logoColor=white)
![R](https://img.shields.io/badge/-R-276DC3?style=flat-square&logo=r&logoColor=white)
![MATLAB](https://img.shields.io/badge/-MATLAB-0076A8?style=flat-square&logo=mathworks&logoColor=white)

**Mobile Development:**  
![Swift](https://img.shields.io/badge/-Swift-FA7343?style=flat-square&logo=swift&logoColor=white)
![Dart](https://img.shields.io/badge/-Dart-0175C2?style=flat-square&logo=dart&logoColor=white)

**Functional:**  
![Haskell](https://img.shields.io/badge/-Haskell-5D4F85?style=flat-square&logo=haskell&logoColor=white)

Support for other languages is coming soon. Stay tuned!

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
4. Configure your cleaning options:
   - Choose whether to create a backup
   - Select if TODO & FIXME comments should be preserved
   - Decide whether to keep documentation comments
   - Determine if unknown file types should be processed
5. The editor will refresh automatically with comments removed according to your settings

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

### Does it work with embedded code like JavaScript in HTML files?
No, the current version only processes comments based on the file extension. JavaScript or CSS comments within HTML files will not be removed. We're actively working on adding support for embedded languages in a future release.

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
