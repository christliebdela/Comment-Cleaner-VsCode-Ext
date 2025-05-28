# Comment Cleaner Pro

<p align="center">
  <img src="media/icon.png" width="128" height="128" alt="Comment Cleaner Pro Logo">
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=ChristliebDela.comment-cleaner-pro"><img src="https://img.shields.io/visual-studio-marketplace/v/ChristliebDela.comment-cleaner-pro?style=flat-square&color=000000&labelColor=222222" alt="Version"></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=ChristliebDela.comment-cleaner-pro"><img src="https://img.shields.io/visual-studio-marketplace/d/ChristliebDela.comment-cleaner-pro?style=flat-square&color=000000&labelColor=222222" alt="Downloads"></a>
  <a href="https://github.com/christliebdela/Comment-Cleaner-VsCode-Ext/blob/main/LICENSE"><img src="https://img.shields.io/github/license/christliebdela/Comment-Cleaner-VsCode-Ext?style=flat-square&color=000000&labelColor=222222" alt="License"></a>
  <a href="https://github.com/christliebdela/Comment-Cleaner-VsCode-Ext/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/christliebdela/Comment-Cleaner-VsCode-Ext/ci.yml?branch=main&style=flat-square&color=000000&labelColor=222222" alt="CI"></a>
  <a href="https://github.com/christliebdela/Comment-Cleaner-VsCode-Ext/issues"><img src="https://img.shields.io/github/issues/christliebdela/Comment-Cleaner-VsCode-Ext?style=flat-square&color=000000&labelColor=222222" alt="Issues"></a>
  <a href="https://github.com/christliebdela/Comment-Cleaner-VsCode-Ext/pulls"><img src="https://img.shields.io/github/issues-pr/christliebdela/Comment-Cleaner-VsCode-Ext?style=flat-square&color=000000&labelColor=222222" alt="Pull Requests"></a>
</p>

## Version 0.1.2

Comment Cleaner Pro is a powerful VS Code extension for removing comments from source code files. It helps you streamline your code by efficiently removing all types of comments (line, block, and documentation) across 20+ programming languages while preserving the core functionality of your code.

## Key Features

### Comprehensive Language Support
- **20+ Programming Languages** - Supports all major languages including Python, JavaScript, TypeScript, HTML, CSS, C/C++, Java, Ruby, Go, PHP, SQL, Swift, Rust, Kotlin, and more
- **Intelligent Comment Detection** - Accurately identifies and removes all comment types specific to each language
- **Preservation of Code Structure** - Maintains code indentation and formatting while removing comments

### Flexible Processing Options
- **Single File Processing** - Clean comments from the current file with a single click
- **Batch Processing** - Process multiple files simultaneously using glob patterns
- **Automatic Backups** - Create safety backups before removing comments
- **Customizable Rules** - Configure how unknown file types and special comments are handled

### Seamless Integration
- **Context Menu Integration** - Right-click access in the editor
- **Command Palette Support** - Quick access through VS Code's command palette
- **Status Bar Feedback** - Real-time processing status indicators
- **History Tracking** - Keep track of recently processed files

![Comment Cleaner Pro in action](media/demo.gif)

## Supported Languages

| Language Group | Supported Languages |
|---------------|---------------------|
| **Web Development** | JavaScript, TypeScript, HTML, CSS, PHP |
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

### Batch Processing Options
When cleaning multiple files:
1. Enter a glob pattern to match files (e.g., `*.js`, `src/**/*.py`)
2. Choose whether to create backups
3. Decide if unknown file types should be processed
4. Monitor progress in the notification area

## Technical Details

Comment Cleaner Pro uses a sophisticated regex-based parsing system to identify and remove comments while preserving code structure. The extension:

- Handles nested comment structures
- Preserves important comments like license headers when configured
- Detects and properly processes character escapes in strings
- Maintains code indentation and whitespace

## Performance Considerations

- **Large Files**: Processing is optimized but may take longer with extremely large files
- **Memory Usage**: Minimal memory footprint even when processing multiple files
- **Workspace Impact**: Non-destructive operation with backup options

## FAQ

**Q: Does Comment Cleaner Pro modify my original files?**  
A: Yes, but you can enable backups which create `.bak` files before processing.

**Q: Can I undo the comment removal?**  
A: If you've enabled backups, you can restore from the `.bak` files. Standard undo operations work for single file processing if you haven't saved yet.

**Q: Does it work with all programming languages?**  
A: It supports 20+ major languages. For unlisted languages, you can try the "force" option, but results may vary.

## Privacy & Security

Comment Cleaner Pro:
- Processes all files locally on your machine
- Does not send any code or data externally
- Requires no authentication or online services
- Has minimal extension permissions

## Release Notes

### 0.1.2 (2025-05-28)

- Fixed extension icon not displaying correctly in VS Code Marketplace
- Corrected package configurations for proper asset inclusion
- Updated repository references

### 0.1.1 (2025-05-28)

- Added Filter by Language option for history filtering
- Implemented context menu actions for history items:
  - Compare with backup (diff view)
  - Restore from backup
  - Remove from history
- Added Clear History functionality
- Integrated status bar feedback for cleaning operations
- Enhanced Python processor with:
  - Smart comment detection for documentation vs regular comments
  - Multi-threading for batch operations
  - Progress indicators and statistics
- Added configuration options:
  - Preserve TODO and FIXME comments
  - Custom pattern preservation
  - Documentation comment preservation
- Improved UI with intuitive icons

### 0.1.0 (2025-05-28)

- Initial release with support for 20+ languages
- Single file and batch processing capabilities
- Context menu and command palette integration
- Backup creation options
- Activity bar integration with file history

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](https://github.com/christliebdela/Comment-Cleaner-Pro/blob/main/CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Created and maintained by [Christlieb Dela](https://github.com/christliebdela).

---

<p align="center"><em>Clean code is readable code.</em></p>