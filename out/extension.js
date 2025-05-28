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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const ccpRunner_1 = require("./ccpRunner");
const fileSelector_1 = require("./fileSelector");
const ccpViewProvider_1 = require("./ccpViewProvider");
function activate(context) {
    // Create view providers
    const filesViewProvider = new ccpViewProvider_1.FilesViewProvider();
    const historyViewProvider = new ccpViewProvider_1.HistoryViewProvider();
    // Register tree data providers
    vscode.window.registerTreeDataProvider('ccpFiles', filesViewProvider);
    vscode.window.registerTreeDataProvider('ccpHistory', historyViewProvider);
    // Register command for single file processing
    let cleanCurrentFile = vscode.commands.registerCommand('ccp.cleanComments', () => __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found.');
            return;
        }
        const document = editor.document;
        yield document.save();
        try {
            const backup = yield vscode.window.showQuickPick(['Yes, Create a Backup File', 'Don\'t Create a Backup File'], {
                placeHolder: 'Create a backup before cleaning?',
                ignoreFocusOut: true // Prevents dismissal when clicking outside
            });
            // If the user dismissed the dialog (clicked outside, pressed Escape)
            if (!backup) {
                return; // Cancel the operation
            }
            const noBackup = backup === 'Don\'t Create a Backup File';
            yield (0, ccpRunner_1.executeCcp)(document.fileName, noBackup, false);
            yield vscode.commands.executeCommand('workbench.action.files.revert');
            // Add to history
            historyViewProvider.addToHistory(document.fileName);
            vscode.window.showInformationMessage('Comments removed successfully!');
            updateStatusBar('Comments removed successfully!');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error: ${error}`);
        }
    }));
    // Register command for batch file processing
    let cleanMultipleFiles = vscode.commands.registerCommand('ccp.cleanMultipleFiles', () => __awaiter(this, void 0, void 0, function* () {
        yield (0, fileSelector_1.selectAndProcessFiles)(historyViewProvider);
    }));
    // Add new commands
    let compareWithBackup = vscode.commands.registerCommand('ccp.compareWithBackup', (filePath) => __awaiter(this, void 0, void 0, function* () {
        const backupPath = filePath + '.bak';
        if (yield fileExists(backupPath)) {
            const uri1 = vscode.Uri.file(filePath);
            const uri2 = vscode.Uri.file(backupPath);
            vscode.commands.executeCommand('vscode.diff', uri2, uri1, 'Backup ↔ Current');
        }
        else {
            vscode.window.showWarningMessage('No backup file found.');
        }
    }));
    let restoreFromBackup = vscode.commands.registerCommand('ccp.restoreFromBackup', (filePath) => __awaiter(this, void 0, void 0, function* () {
        const backupPath = filePath + '.bak';
        if (yield fileExists(backupPath)) {
            yield vscode.workspace.fs.copy(vscode.Uri.file(backupPath), vscode.Uri.file(filePath), { overwrite: true });
            vscode.window.showInformationMessage('File restored from backup.');
        }
        else {
            vscode.window.showWarningMessage('No backup file found.');
        }
    }));
    let removeFromHistory = vscode.commands.registerCommand('ccp.removeFromHistory', (filePath) => {
        historyViewProvider.removeFromHistory(filePath);
    });
    let setLanguageFilter = vscode.commands.registerCommand('ccp.setLanguageFilter', () => __awaiter(this, void 0, void 0, function* () {
        const languages = ['javascript', 'typescript', 'python', 'html', 'css', 'c', 'cpp', 'java', 'ruby', 'go',
            'php', 'sql', 'swift', 'rust', 'kotlin', 'bash', 'powershell', 'lua', 'perl',
            'yaml', 'haskell', 'dart', 'matlab', 'r', 'csharp', 'all'];
        const selected = yield vscode.window.showQuickPick(languages, {
            placeHolder: 'Select language to filter by (or "all" to show all)'
        });
        if (selected) {
            historyViewProvider.setLanguageFilter(selected === 'all' ? undefined : selected);
        }
    }));
    let clearHistory = vscode.commands.registerCommand('ccp.clearHistory', () => {
        const response = vscode.window.showInformationMessage('Are you sure you want to clear the history?', 'Yes', 'No');
        response.then(answer => {
            if (answer === 'Yes') {
                historyViewProvider.clearHistory();
                vscode.window.showInformationMessage('History cleared');
            }
        });
    });
    // Status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'ccp.cleanComments';
    statusBarItem.text = "$(comment-discussion) Clean Comments";
    statusBarItem.tooltip = "Clean comments from current file";
    statusBarItem.show();
    context.subscriptions.push(cleanCurrentFile, cleanMultipleFiles, compareWithBackup, restoreFromBackup, removeFromHistory, setLanguageFilter, clearHistory, statusBarItem);
    // Update status bar after cleaning
    function updateStatusBar(message, timeout = 5000) {
        const originalText = statusBarItem.text;
        statusBarItem.text = message;
        setTimeout(() => {
            statusBarItem.text = originalText;
        }, timeout);
    }
}
// Helper function to check if file exists
function fileExists(path) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield vscode.workspace.fs.stat(vscode.Uri.file(path));
            return true;
        }
        catch (_a) {
            return false;
        }
    });
}
function deactivate() { }
