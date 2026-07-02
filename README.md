# Comment Cleaner Pro

<p align="left">
  <a href="https://marketplace.visualstudio.com/items?itemName=ChristliebDela.comment-cleaner-pro"><img src="https://vsmarketplacebadges.dev/version/ChristliebDela.comment-cleaner-pro.svg?style=flat-square&color=000000&labelColor=222222&logo=visual-studio-code" alt="VS Marketplace Version"></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=ChristliebDela.comment-cleaner-pro"><img src="https://vsmarketplacebadges.dev/downloads/ChristliebDela.comment-cleaner-pro.svg?style=flat-square&color=000000&labelColor=222222" alt="VS Marketplace Downloads"></a>
  <a href="https://open-vsx.org/extension/ChristliebDela/comment-cleaner-pro"><img src="https://img.shields.io/open-vsx/v/ChristliebDela/comment-cleaner-pro?style=flat-square&color=000000&labelColor=222222" alt="Open VSX Version"></a>
  <a href="https://open-vsx.org/extension/ChristliebDela/comment-cleaner-pro"><img src="https://img.shields.io/open-vsx/dt/ChristliebDela/comment-cleaner-pro?style=flat-square&color=000000&labelColor=222222" alt="Open VSX Downloads"></a>
  <a href="https://github.com/christliebdela/Comment-Cleaner-VsCode-Ext/issues"><img src="https://img.shields.io/github/issues/christliebdela/Comment-Cleaner-VsCode-Ext?style=flat-square&color=000000&labelColor=222222" alt="Issues"></a>
  <a href="https://github.com/christliebdela/Comment-Cleaner-VsCode-Ext/pulls"><img src="https://img.shields.io/github/issues-pr/christliebdela/Comment-Cleaner-VsCode-Ext?style=flat-square&color=000000&labelColor=222222" alt="Pull Requests"></a>
  <a href="https://github.com/christliebdela/Comment-Cleaner-VsCode-Ext/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-GPL%20v3-000000?style=flat-square&labelColor=222222&logo=gnu" alt="License"></a>
</p>

## Video Demo

<p 
  <em>Coming Soon</em>
</p>

## Overview

Comment Cleaner Pro is a powerful extension for removing comments from source code files. Built for VS Code, Antigravity, VSCodium, and other compatible IDEs, it helps you streamline your code by efficiently removing all types of comments (line, block, and documentation) across 33 supported programming languages while preserving the core functionality of your code.

## Features

- ✅ **Removes all comment types** (line, block, documentation, TODO/FIXME, and AI-generated) while preserving code functionality
- ✅ **Dry-run Confirmation Modal** to review exact stats (affected files, comments, lines, bytes) before cleaning folders or batches
- ✅ **Persistent History** preserves your cleaned files list across workspace sessions
- ✅ **Workspace-Local Backups** safely stored in `.ccp-backups/` under the workspace root
- ✅ **.ccpignore Support** to skip files matching custom rules or defaults (like `node_modules`, `.git`)
- ✅ **High-Performance Python Core** runs batch operations in a single invocation with parallel worker threads
- ✅ **Detailed statistics** track comments, line reduction, and size impact
- ✅ **Undo/Redo support** to easily revert or restore changes

## Key Features

### Comprehensive Language Support
- **30+ Programming Languages** - Supports all major languages including Python, JavaScript/JSX, TypeScript/TSX, Vue SFC, Svelte, HTML, CSS, SCSS, C/C++, Java, Ruby, Go, PHP, SQL, Swift, Rust, Kotlin, Dockerfile, TOML, GraphQL, HCL/Terraform, MDX, and more
- **Intelligent Comment Detection** - Accurately identifies and removes all comment types specific to each language (including JSX/HTML comments in Vue, Svelte, MDX, and script/style block comments)

### Flexible Processing Options
- **Single File Processing** - Clean comments from the current active editor file
- **Batch Processing** - Search and select multiple files visually using a checkbox Quick Pick checklist
- **Automatic Backups** - Create safety backups inside the `.ccp-backups/` directory before processing
- **Customizable Options** - Adjust TODO, documentation, and unknown file processing preferences in a unified dialog
- **Undo/Redo Support** - Fully supports standard VS Code Undo/Redo operations in the active editor

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

## Currently Supports

| Category | Languages |
| :--- | :--- |
| **Web Development** | <img src="https://img.shields.io/badge/-JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript"> <img src="https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"> <img src="https://img.shields.io/badge/-Vue-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white" alt="Vue"> <img src="https://img.shields.io/badge/-Svelte-FF3E00?style=flat-square&logo=svelte&logoColor=white" alt="Svelte"> <img src="https://img.shields.io/badge/-HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5"> <img src="https://img.shields.io/badge/-CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3"> <img src="https://img.shields.io/badge/-SCSS-CC6699?style=flat-square&logo=sass&logoColor=white" alt="SCSS"> <img src="https://img.shields.io/badge/-PHP-777BB4?style=flat-square&logo=php&logoColor=white" alt="PHP"> |
| **Systems & General** | <img src="https://img.shields.io/badge/-C-A8B9CC?style=flat-square&logo=c&logoColor=black" alt="C"> <img src="https://img.shields.io/badge/-C++-00599C?style=flat-square&logo=cplusplus&logoColor=white" alt="C++"> <img src="https://img.shields.io/badge/-Rust-000000?style=flat-square&logo=rust&logoColor=white" alt="Rust"> <img src="https://img.shields.io/badge/-Go-00ADD8?style=flat-square&logo=go&logoColor=white" alt="Go"> <img src="https://img.shields.io/badge/-Java-007396?style=flat-square&logo=java&logoColor=white" alt="Java"> <img src="https://img.shields.io/badge/-C%23-239120?style=flat-square&logo=csharp&logoColor=white" alt="C#"> <img src="https://img.shields.io/badge/-Kotlin-7F52FF?style=flat-square&logo=kotlin&logoColor=white" alt="Kotlin"> <img src="https://img.shields.io/badge/-Swift-FA7343?style=flat-square&logo=swift&logoColor=white" alt="Swift"> <img src="https://img.shields.io/badge/-Dart-0175C2?style=flat-square&logo=dart&logoColor=white" alt="Dart"> <img src="https://img.shields.io/badge/-Haskell-5D4F85?style=flat-square&logo=haskell&logoColor=white" alt="Haskell"> |
| **DevOps & Configs** | <img src="https://img.shields.io/badge/-Dockerfile-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Dockerfile"> <img src="https://img.shields.io/badge/-Terraform%20%2F%20HCL-844FBA?style=flat-square&logo=terraform&logoColor=white" alt="Terraform"> <img src="https://img.shields.io/badge/-YAML-CB171E?style=flat-square&logo=yaml&logoColor=white" alt="YAML"> <img src="https://img.shields.io/badge/-TOML-9C3835?style=flat-square&logo=toml&logoColor=white" alt="TOML"> |
| **Scripting** | <img src="https://img.shields.io/badge/-Python-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python"> <img src="https://img.shields.io/badge/-Ruby-CC342D?style=flat-square&logo=ruby&logoColor=white" alt="Ruby"> <img src="https://img.shields.io/badge/-Perl-39457E?style=flat-square&logo=perl&logoColor=white" alt="Perl"> <img src="https://img.shields.io/badge/-Bash-4EAA25?style=flat-square&logo=gnu-bash&logoColor=white" alt="Bash"> <img src="https://img.shields.io/badge/-Lua-2C2D72?style=flat-square&logo=lua&logoColor=white" alt="Lua"> <img src="https://img.shields.io/badge/-PowerShell-5391FE?style=flat-square&logo=powershell&logoColor=white" alt="PowerShell"> |
| **Data & Queries** | <img src="https://img.shields.io/badge/-SQL-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="SQL"> <img src="https://img.shields.io/badge/-GraphQL-E10098?style=flat-square&logo=graphql&logoColor=white" alt="GraphQL"> <img src="https://img.shields.io/badge/-R-276DC3?style=flat-square&logo=r&logoColor=white" alt="R"> <img src="https://img.shields.io/badge/-MATLAB-0076A8?style=flat-square&logo=mathworks&logoColor=white" alt="MATLAB"> <img src="https://img.shields.io/badge/-MDX-090909?style=flat-square&logo=mdx&logoColor=white" alt="MDX"> |

<p align="left"><i>Support for other languages is continuously expanding!</i></p>

## Installation

Comment Cleaner Pro is published on both the **official VS Code Marketplace** and the **Open VSX Registry**, making it fully compatible with VS Code, Antigravity, VSCodium, Gitpod, Eclipse Theia, and any other IDE supporting VS Code extensions.

1. Open your IDE's Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`)
2. Search for `"Comment Cleaner Pro"`
3. Click **Install**

**Requirements:**
- VS Code compatible IDE (v1.50.0 or higher)
- Python 3.6 or higher (available in system PATH)

## Usage Guide

### Method 1: Context Menus (Right-Click)

- **Clean Current File**: Right-click anywhere inside an active editor file (or right-click the file in the Explorer tree) and choose **`CCP - Clean Current File`**.
- **Clean Folder**: Right-click any folder inside the Explorer tree and select **`CCP - Clean Folder`** to process all matching files under that directory.
- **Clean Entire Workspace**: Right-click your workspace root directory in the Explorer tree and select **`CCP - Clean Entire Workspace`**.

### Method 2: Command Palette

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type `"Comment Cleaner Pro"` or `"CCP"`
3. Select any of the cleaning actions:
   - **`Comment Cleaner Pro: Clean Current File`**
   - **`Comment Cleaner Pro: Clean Multiple Files`**
   - **`Comment Cleaner Pro: Clean Entire Workspace`**
4. Configure options in the checklist dropdown and press `Enter` to run.

### Method 3: Activity Bar Integration
1. Click the Comment Cleaner Pro icon in the Activity Bar to open the Side Bar
2. Choose "Clean Current File", "Clean Multiple Files", or "Clean Workspace"
3. View your recently cleaned files in the "Cleaned Files" history section
4. Revert or restore changes using VS Code's standard Undo/Redo commands (`Ctrl+Z` / `Ctrl+Y`)

### Batch Processing Options
When cleaning multiple files:
1. Search and select files using the multi-select checklist dialog
2. Check/uncheck files in the list; selected items will float to the top
3. Press `Enter` to confirm file selection
4. Configure your cleaning options in the Quick Pick checkbox dialog
5. Review the changes in the Proceed / Cancel warning modal

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
Yes. You can use standard editor undo/redo operations (`Ctrl+Z` / `Ctrl+Y` or `Cmd+Z` / `Cmd+Y`) directly in your active editor tabs, or restore files from the `.ccp-backups/` backup directory if you enabled backups during execution.

### Does it work with all programming languages?
It supports 30+ major languages. For unlisted languages, you can try the "process unknown files" configuration option, but results may vary.

### Does it work with embedded code like JavaScript in HTML files?
Yes, for Single File Components (SFC) like **Vue (`.vue`)** and **Svelte (`.svelte`)**. The engine uses a block-aware parser to clean HTML comments in `<template>`, JavaScript/TypeScript comments in `<script>`, and CSS/SCSS comments in `<style>`.

For standard **HTML files (`.html`, `.htm`)**, only HTML comments (`<!-- -->`) are stripped in this version, and embedded `<script>` or `<style>` blocks are not parsed. Full support for raw HTML embedded tags is planned for a future release.

## Privacy & Security

Comment Cleaner Pro:

- Processes all files locally on your machine
- Does not send any code or data externally
- Requires no authentication or online services
- Has minimal extension permissions

## Project Information

<div align="left">
  <table>
    <tr>
      <td align="left">
        <a href="https://github.com/christliebdela/Comment-Cleaner-VsCode-Ext/blob/main/CHANGELOG.md">
          <img src="https://img.shields.io/badge/View-Changelog-blue?style=for-the-badge&logo=github" alt="View Changelog" />
          <br/>
          <b>Release History</b>
        </a>
      </td>
      <td align="left">
        <a href="https://github.com/christliebdela/Comment-Cleaner-VsCode-Ext/blob/main/CONTRIBUTING.md">
          <img src="https://img.shields.io/badge/Become_a-Contributor-orange?style=for-the-badge&logo=github" alt="Become a Contributor" />
          <br/>
          <b>Contributing</b>
        </a>
      </td>
      <td align="left">
        <a href="https://github.com/christliebdela/Comment-Cleaner-VsCode-Ext/blob/main/LICENSE">
          <img src="https://img.shields.io/badge/License-GPL%20v3-000000?style=flat-square&labelColor=222222&logo=gnu" alt="License">
          <br/>
          <b>License</b>
        </a>
      </td>
    </tr>
  </table>
</div>

This project is licensed under the **GNU General Public License v3.0** - a copyleft license that ensures derivative works remain open source.

Key points:
- You are free to use, modify, and distribute this software
- If you distribute modified versions, you must:
  - Make your changes open source under GPL v3
  - Clearly mark what changes you've made
  - Keep all copyright notices intact
  - Include the original license

This ensures that Comment Cleaner Pro and all derivatives remain open source, benefiting the entire community. See the [LICENSE](LICENSE) file for full details.

## Author

<div align="left">
  <a href="https://github.com/christliebdela">
    <img src="https://img.shields.io/badge/Created_by-Christlieb_Dela-222222?style=for-the-badge&logo=github" alt="Created by Christlieb Dela" />
  </a>
  <p>Thank you for using Comment Cleaner Pro!</p>
</div>


