# Change Log

All notable changes to the "Comment Cleaner Pro" extension are documented in this file.

## [1.0.1] - 2025-06-02

Minor Update

### Changed
- **Extension Logo and Banner**: Improved extension logo and banner 
- **Enhanced Documentation**: Restructured features list with visual emphasis
- **Marketplace Presentation**: Improved extension presentation in VS Code Marketplace

### Added
- **VS Code Extension Metadata**: Added proper changelog entry point for VS Code marketplace
- **Language-Specific Documentation**: Organized supported languages into clear categories
- **Improved Visual Styling**: Enhanced badges and visual presentation of documentation


## [1.0.0] - 2025-06-01

### Major Update
- **Complete Language Support**: All 25 supported languages now work flawlessly
- **Fixed Critical C-style Comment Handling**: Corrected line comment removal in Go, Java, Swift, Kotlin, Rust, Dart, and other C-style languages
- **Fixed Context Menu Configuration**: Right-click "Clean Current File" now properly shows all configuration dialogs
- Properly handles all comment types (line, block, documentation) in every supported language
- Enhanced string literal handling to avoid false comment detection
- Intelligent newline preservation to maintain code structure
- Complete user experience with consistent configuration across all entry points

### Changed
- Complete comment handler architecture with improved language-specific processors
- Enhanced detection of multi-line and documentation comments
- Improved option validation to ensure configuration dialogs appear appropriately

## [0.1.7] - 2025-06-31

### Minor Updates
- Added project banner
- Updated project icons

## [0.1.6] - 2025-06-31
### Fixed
- Critical issue: Right-click "Clean Current File" command now properly shows configuration dialog
- "Remove from History" context menu command now correctly removes items
- Fixed UI checkboxes squashing when window gets smaller
- Removed the 10-file history limit - now keeps unlimited history
- Improved circular checkbox rendering with consistent sizing
- Fixed JavaScript console errors when retrieving saved options

### Changed
- Enhanced UI with proper section headings for better organization
- Improved checkbox design with smaller, more consistent circular style
- Added proper clickable area for both checkbox circles and labels
- Better type safety for extension options

### Added
- Complete integration of UI panel configuration settings with commands
- Green check mark indicators for selected options
- Better validation of user inputs and configuration options

## [0.1.5] - 2025-06-30
### Fixed
- Critical statistics tracking issue where only file count was updating
- Improved Python output parsing for reliable statistics collection
- Fixed stderr/stdout handling to properly capture all cleaning data

### Changed
- Removed CI/CD workflow references
- Updated documentation with humorous acknowledegment of the comment paradox
- Enhanced output handling resilience for different Python implementations

## [0.1.4] - 2025-05-30
### Added
- Undo/Redo buttons to the Actions panel for easy reverting and restoring changes
- Enhanced statistics tracking with line count reduction metrics
- Support for JSX and TSX file formats

### Changed
- Complete object-oriented refactoring of the core engine with dedicated language handlers
- Improved UI with standard undo/redo icons matching VS Code's visual language

### Fixed
- Critical issue where // comments weren't properly removed in JavaScript, TypeScript, and C++ files
- "No view is registered with id: ccpFiles" error that prevented files from loading
- Improved string handling to prevent false comment detection in quoted strings
- Enhanced error handling with specific messages for encoding and permission issues

## [0.1.3] - 2025-05-29
### Added
- Language-specific file extension mappings
- Enhanced language filtering in the history view
- Proper icon support for different action items

### Changed
- Improved UI for buttons in the sidebar

### Fixed
- Display issues with history items

## [0.1.2] - 2025-05-28
### Fixed
- Extension icon not displaying correctly in VS Code Marketplace
- Package configurations for proper asset inclusion
- Updated repository references

## [0.1.1] - 2025-05-28
### Added
- Filter by Language option to filter history items
- Context menu actions for history items:
  - Compare with backup (diff view)
  - Restore from backup
  - Remove from history
- Clear History functionality
- Status bar integration with feedback on cleaning operations
- Enhanced Python processor:
  - Smart comment detection (distinguishing between doc vs regular comments)
  - Multi-threading for improved batch operation performance
  - Progress indicators and statistics
- Configuration options:
  - Preserve TODO and FIXME comments
  - Custom pattern preservation
  - Doc comment preservation

### Changed
- UI improvements with icons for better usability

### Fixed
- Dialog dismissal now properly cancels operations
- Improved error handling for backup operations
- Enhanced language detection for history filtering

## [0.1.0] - 2025-05-28
### Added
- Initial release of Comment Cleaner Pro
- Support for 20+ programming languages including:
  - Python, JavaScript, TypeScript, HTML, CSS, C/C++, Java, Ruby, Go, PHP, SQL
  - Swift, Rust, Kotlin, Bash/Shell, PowerShell, Lua, Perl, YAML, Haskell, Dart, MATLAB, R, C#
- Command to clean comments from current file
- Command to clean comments from multiple files using glob patterns
- Context menu integration for quick access
- Options for creating backups before removing comments
- Configurable handling of unknown file types
- Recursive directory processing support