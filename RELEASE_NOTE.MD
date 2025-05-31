Comment Cleaner Pro - v0.1.4 Release Notes
Major Enhancement: Core Engine Rebuild & New Features 🚀
We're excited to announce version 0.1.4 of Comment Cleaner Pro, featuring a complete architectural overhaul of the core comment removal engine and new productivity features.

Key Improvements
🔍 New Dry Run Mode
Analyze files without modifying them to preview exactly what would be removed. Available through the UI with a dedicated sidebar button and via command palette ("Dry Run" option).

📊 Enhanced Statistics Tracking
Now tracks and displays accurate line count reduction alongside comment removal statistics.

🔄 Complete Object-Oriented Refactoring
The Python backend has been completely rewritten using a robust class hierarchy, making the code more maintainable and extensible.

🐛 Fixed Comment Removal in JavaScript, TypeScript and C++
Fixed critical issue where  line comments were not properly removed in JavaScript, TypeScript, and C++ files due to language handler conflicts.

🧰 Enhanced Language Support
Each programming language now has a dedicated handler class, providing more accurate and reliable comment detection and removal.

⚙️ Improved Error Handling and Recovery
Better error catching, reporting, and automatic recovery from failed operations.

🚦 Better Thread Management
Enhanced parallel processing for more efficient batch operations.

Technical Notes
Full backward compatibility with existing extension functionality
No changes required to extension settings or workflow
Seamless integration with VS Code's existing interface
Fixed "No view is registered with id: ccpFiles" error that prevented files from loading
New CLI flag --dry-run for script-based analysis without modification
Installation
Simply update to the latest version through VS Code's extension manager or download from the marketplace.