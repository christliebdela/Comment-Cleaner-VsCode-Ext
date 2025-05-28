"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoryViewProvider = exports.FilesViewProvider = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
class FilesViewProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    setLanguageFilter(language) {
        this._languageFilter = language;
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element) {
            return Promise.resolve([]);
        }
        else {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                return Promise.resolve([]);
            }
            const cleanCurrentItem = new FileItem('Clean Current File', // Remove the $(trash) prefix
            vscode.TreeItemCollapsibleState.None, {
                command: 'ccp.cleanComments',
                title: 'Clean Current File'
            });
            cleanCurrentItem.iconPath = new vscode.ThemeIcon('trash');
            const cleanMultipleItem = new FileItem('Clean Multiple Files', // Remove the $(files) prefix
            vscode.TreeItemCollapsibleState.None, {
                command: 'ccp.cleanMultipleFiles',
                title: 'Clean Multiple Files'
            });
            cleanMultipleItem.iconPath = new vscode.ThemeIcon('files');
            return Promise.resolve([cleanCurrentItem, cleanMultipleItem]);
        }
    }
}
exports.FilesViewProvider = FilesViewProvider;
class HistoryViewProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.history = [];
        this.history = [];
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    addToHistory(filePath) {
        if (!this.history.includes(filePath)) {
            this.history.unshift(filePath);
            if (this.history.length > 10) {
                this.history.pop();
            }
        }
        this.refresh();
    }
    removeFromHistory(filePath) {
        const index = this.history.indexOf(filePath);
        if (index !== -1) {
            this.history.splice(index, 1);
            this.refresh();
        }
    }
    // Add this method
    setLanguageFilter(language) {
        this._languageFilter = language;
        this.refresh();
    }
    clearHistory() {
        this.history = [];
        this.refresh();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element) {
            return Promise.resolve([]);
        }
        else {
            if (this.history.length === 0) {
                return Promise.resolve([
                    new FileItem('No files cleaned yet', vscode.TreeItemCollapsibleState.None)
                ]);
            }
            // Add the filter option as the first item
            const items = [];
            // Add filter option at top
            const filterItem = new FileItem('Filter by Language', // Remove the $(filter) prefix
            vscode.TreeItemCollapsibleState.None, {
                command: 'ccp.setLanguageFilter',
                title: 'Filter by Language'
            });
            filterItem.iconPath = new vscode.ThemeIcon('filter');
            items.push(filterItem);
            // Filter history items by language if filter is active
            const filteredHistory = this._languageFilter
                ? this.history.filter(file => {
                    const ext = path.extname(file).toLowerCase();
                    // Map extension to language and check if it matches filter
                    return identifyLanguage(ext) === this._languageFilter;
                })
                : this.history;
            // Add filtered history items
            filteredHistory.forEach(file => {
                const filename = path.basename(file);
                const item = new FileItem(filename, vscode.TreeItemCollapsibleState.None, {
                    command: 'vscode.open',
                    title: 'Open File',
                    arguments: [vscode.Uri.file(file)]
                }, file);
                // Add this line:
                item.contextValue = 'historyItem';
                items.push(item);
            });
            return Promise.resolve(items);
        }
    }
}
exports.HistoryViewProvider = HistoryViewProvider;
class FileItem extends vscode.TreeItem {
    constructor(label, collapsibleState, command, filePath) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.command = command;
        this.filePath = filePath;
        this.tooltip = filePath || label;
        this.description = filePath ? path.dirname(filePath) : '';
        // Add appropriate icons based on the action type
        if (label === 'Clean Current File') {
            this.iconPath = new vscode.ThemeIcon('trash');
        }
        else if (label === 'Clean Multiple Files') {
            this.iconPath = new vscode.ThemeIcon('files');
        }
        else if (label === 'Filter by Language') {
            this.iconPath = new vscode.ThemeIcon('filter');
        }
        else if (label === 'Preview Comment Removal') {
            this.iconPath = new vscode.ThemeIcon('eye');
        }
        else if (label.startsWith('Compare with')) {
            this.iconPath = new vscode.ThemeIcon('split-horizontal');
        }
        else if (label.startsWith('Restore from')) {
            this.iconPath = new vscode.ThemeIcon('history');
        }
        else {
            // For file entries in history
            if (filePath) {
                this.iconPath = vscode.ThemeIcon.File;
            }
        }
    }
}
// Helper function to map extensions to languages
function identifyLanguage(extension) {
    const extensionMap = {
        '.py': 'python',
        '.html': 'html', '.htm': 'html',
        '.css': 'css',
        // Add other mappings as needed
    };
    return extensionMap[extension] || 'unknown';
}
