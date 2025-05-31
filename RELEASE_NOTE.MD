# Comment Cleaner Pro - v0.1.4 Release Notes
## Major Enhancement: Core Engine Rebuild & New Features 🚀

We're excited to announce version 0.1.4 of Comment Cleaner Pro, featuring a complete architectural overhaul of the core comment removal engine and new productivity features.

### Key Improvements

#### 🔍 New Dry Run Mode
Analyze files without modifying them to preview exactly what would be removed. Available through the UI with a dedicated sidebar button and via command palette ("Dry Run" option).

#### 📊 Enhanced Statistics Tracking
Now tracks and displays accurate line count reduction alongside comment removal statistics.

#### 🔄 Complete Object-Oriented Refactoring
The Python backend has been completely rewritten using a robust class hierarchy with dedicated language handlers, making the code more maintainable and extensible.

#### 🌐 Added Support for JSX and TSX Files
Enhanced support for modern JavaScript and TypeScript frameworks with proper handling of JSX and TSX file formats.

#### 🐛 Fixed Comment Removal in JavaScript, TypeScript and C++
Fixed critical issue where `//` line comments were not properly removed in JavaScript, TypeScript, and C++ files due to language handler conflicts.

#### 🧰 Enhanced Language Support
Each programming language now has a dedicated handler class, providing more accurate and reliable comment detection and removal.

#### 🔒 Improved String Handling
Better detection of comment characters inside string literals to prevent accidental removal of code.

#### ⚙️ Improved Error Handling and Recovery
Better error catching, reporting, and automatic recovery from failed operations. Now provides specific error messages for encoding issues and permission problems.

#### 🚦 Better Thread Management
Enhanced parallel processing for more efficient batch operations.

### Technical Notes
- Full backward compatibility with existing extension functionality
- No changes required to extension settings or workflow
- Seamless integration with VS Code's existing interface
- Fixed "No view is registered with id: ccpFiles" error that prevented files from loading
- New CLI flag `--dry-run` for script-based analysis without modification
- New main entry point guard in the Python script for better CLI handling

### Installation
Simply update to the latest version through VS Code's extension manager or download from the marketplace.

---

The Comment Cleaner Pro Team would like to thank all users for their feedback and support, which has been instrumental in guiding our development efforts. We remain committed to providing the most efficient and reliable comment cleaning experience for developers.