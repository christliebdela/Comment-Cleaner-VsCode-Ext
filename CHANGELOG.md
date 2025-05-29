# Change Log

All notable changes to the "Comment Cleaner Pro" extension will be documented in this file.

## [0.1.3] - 2025-05-29
- Added language-specific file extension mappings
- Enhanced language filtering in the history view
- Added proper icon support for different action items
- Improved UI for buttons in the sidebar
- Fixed display issues with history items

## [0.1.2] - 2025-05-28

### Fixed
- Fixed extension icon not displaying correctly in VS Code Marketplace
- Corrected package configurations for proper asset inclusion
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