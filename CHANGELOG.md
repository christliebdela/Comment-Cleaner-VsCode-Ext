# Change Log

All notable changes to the "Comment Cleaner Pro" extension are documented in this file.

## [0.1.5] - 2025-06-01
### Fixed
- Critical statistics tracking issue where only file count was updating
- Improved Python output parsing for reliable statistics collection
- Fixed stderr/stdout handling to properly capture all cleaning data

### Changed
- Removed CI/CD workflow references
- Updated documentation with humorous acknowledegment of the comment paradox
- Enhanced output handling resilience for different Python implementations

## [0.1.4] - 2025-05-31
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