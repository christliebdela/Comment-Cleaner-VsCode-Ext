import * as vscode from 'vscode';
import { executeCcp } from './ccpRunner';
import { selectAndProcessFiles } from './fileSelector';
import { FilesViewProvider, HistoryViewProvider } from './ccpViewProvider';
import { ButtonsViewProvider } from './ccpWebviewProvider';
import { StatisticsManager } from './statsManager';
import { StatisticsViewProvider } from './statsViewProvider';
import * as path from 'path';
import * as os from 'os';

interface CCPOptions {
    createBackup: boolean;
    preserveTodo: boolean;
    keepDocComments: boolean;
    forceProcess: boolean;
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension activated with context:', context.extension.id);
    
    // Initialize default options if they don't exist
    if (!context.globalState.get('ccpOptions')) {
        context.globalState.update('ccpOptions', {
            createBackup: true,
            preserveTodo: false,
            keepDocComments: false,
            forceProcess: false
        });
    }
    
    // Create the statistics manager
    const statsManager = StatisticsManager.getInstance(context);
    
    // Create view providers
    const historyViewProvider = new HistoryViewProvider();
    const buttonsProvider = new ButtonsViewProvider(context.extensionUri, context);
    const statsViewProvider = new StatisticsViewProvider(context.extensionUri, statsManager);
    
    // Register tree data providers
    vscode.window.registerTreeDataProvider('ccpHistory', historyViewProvider);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            ButtonsViewProvider.viewType, 
            buttonsProvider
        )
    );
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            StatisticsViewProvider.viewType, 
            statsViewProvider
        )
    );
    
    // Set context to hide results view initially
    vscode.commands.executeCommand('setContext', 'ccpHasResults', false);
    
    // Register command for single file processing
    let cleanCurrentFile = vscode.commands.registerCommand('ccp.cleanComments', async (options) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found.');
            return;
        }

        const document = editor.document;
        await document.save();
        
        try {
            let noBackup, forceProcess, preserveTodo, keepDocComments;
            
            // Replace the condition at line ~77 with this improved check
            if (options && typeof options === 'object' && 
                Object.keys(options).length > 0 &&
                (options.createBackup !== undefined || 
                 options.forceProcess !== undefined || 
                 options.preserveTodo !== undefined || 
                 options.keepDocComments !== undefined)) {
                // Only use options if they actually contain configuration values
                console.log('Using provided options:', options);
                noBackup = !options.createBackup;
                forceProcess = options.forceProcess;
                preserveTodo = options.preserveTodo;
                keepDocComments = options.keepDocComments;
            } else {
                // Add debug logging
                console.log('Showing dialog for configuration');
                
                // Create backup?
                const backup = await vscode.window.showQuickPick(
                    ['Yes, Create a Backup File', 'Don\'t Create a Backup File'], {
                        placeHolder: 'Create a backup before cleaning?',
                        ignoreFocusOut: true
                    }
                );
                
                if (!backup) {
                    console.log('User cancelled backup dialog');
                    return; // User cancelled
                }
                noBackup = backup === 'Don\'t Create a Backup File';
                
                // Preserve TODO/FIXME?
                const todo = await vscode.window.showQuickPick(
                    ['Yes, Preserve TODO & FIXME Comments', 'No, Remove All Comments'], {
                        placeHolder: 'Preserve TODO and FIXME comments?',
                        ignoreFocusOut: true
                    }
                );
                
                if (!todo) return; // User cancelled  
                preserveTodo = todo === 'Yes, Preserve TODO & FIXME Comments';
                
                // Keep doc comments?
                const docs = await vscode.window.showQuickPick(
                    ['Yes, Keep Documentation Comments', 'No, Remove All Comments'], {
                        placeHolder: 'Keep documentation comments?',
                        ignoreFocusOut: true
                    }
                );
                
                if (!docs) return; // User cancelled
                keepDocComments = docs === 'Yes, Keep Documentation Comments';
                
                // Force processing?
                const force = await vscode.window.showQuickPick(
                    ['Yes, Force Processing of Unknown Types', 'No, Skip Unknown Types'], {
                        placeHolder: 'Force processing of unknown file types?',
                        ignoreFocusOut: true
                    }
                );
                
                if (!force) return; // User cancelled
                forceProcess = force === 'Yes, Force Processing of Unknown Types';
            }
            
            // Get any custom preserve patterns from settings
            const config = vscode.workspace.getConfiguration('commentCleanerPro');
            const preservePatterns = config.get('preservePatterns', []);
            
            // Run the processor with the determined settings
            const result = await executeCcp(document.fileName, noBackup, forceProcess, 
                                           preserveTodo, preservePatterns, keepDocComments);
            
            // Update statistics if results were returned
            if (result) {
                statsManager.updateStats([result]);
                statsViewProvider.updateView();
            }
            
            await vscode.commands.executeCommand('workbench.action.files.revert');
            
            // Add to history
            historyViewProvider.addToHistory(document.fileName);
            
            vscode.window.showInformationMessage('Comments removed successfully!');
            updateStatusBar('Comments removed successfully!');
        } catch (error) {
            vscode.window.showErrorMessage(`Error: ${error}`);
        }
    });

    // Register command for batch file processing
    let cleanMultipleFiles = vscode.commands.registerCommand('ccp.cleanMultipleFiles', async () => {
        await selectAndProcessFiles(historyViewProvider, context);
    });

    // Add new commands
    let compareWithBackup = vscode.commands.registerCommand('ccp.compareWithBackup', async (filePath) => {
        const backupPath = filePath + '.bak';
        if (await fileExists(backupPath)) {
            const uri1 = vscode.Uri.file(filePath);
            const uri2 = vscode.Uri.file(backupPath);
            vscode.commands.executeCommand('vscode.diff', uri2, uri1, 'Backup ↔ Current');
        } else {
            vscode.window.showWarningMessage('No backup file found.');
        }
    });

    let restoreFromBackup = vscode.commands.registerCommand('ccp.restoreFromBackup', async (filePath) => {
        const backupPath = filePath + '.bak';
        if (await fileExists(backupPath)) {
            await vscode.workspace.fs.copy(
                vscode.Uri.file(backupPath),
                vscode.Uri.file(filePath),
                { overwrite: true }
            );
            vscode.window.showInformationMessage('File restored from backup.');
        } else {
            vscode.window.showWarningMessage('No backup file found.');
        }
    });

    let removeFromHistory = vscode.commands.registerCommand('ccp.removeFromHistory', (item) => {
        // The item is the entire TreeItem, not just the filePath
        if (item && item.filePath) {
            historyViewProvider.removeFromHistory(item.filePath);
        } else if (typeof item === 'string') {
            // For backward compatibility
            historyViewProvider.removeFromHistory(item);
        }
    });

    let setLanguageFilter = vscode.commands.registerCommand('ccp.setLanguageFilter', async () => {
        const languages = ['javascript', 'typescript', 'python', 'html', 'css', 'c', 'cpp', 'java', 'ruby', 'go', 
                          'php', 'sql', 'swift', 'rust', 'kotlin', 'bash', 'powershell', 'lua', 'perl', 
                          'yaml', 'haskell', 'dart', 'matlab', 'r', 'csharp', 'all'];
        
        const selected = await vscode.window.showQuickPick(languages, {
            placeHolder: 'Select language to filter by (or "all" to show all)'
        });
        
        if (selected) {
            historyViewProvider.setLanguageFilter(selected === 'all' ? undefined : selected);
        }
    });

    let clearHistory = vscode.commands.registerCommand('ccp.clearHistory', async () => {
        const answer = await vscode.window.showInformationMessage(
            'Are you sure you want to clear the history?', 
            { modal: true },  // Make it a modal dialog for better UX
            'Yes', 'No'
        );
        
        if (answer === 'Yes') {
            // Make sure this method exists and is being called properly
            historyViewProvider.clearHistory();
            vscode.window.showInformationMessage('History cleared');
        }
    });

    // Status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'ccp.cleanComments';
    statusBarItem.text = "$(comment-discussion) Clean Comments";
    statusBarItem.tooltip = "Clean comments from current file";
    statusBarItem.show();

    context.subscriptions.push(cleanCurrentFile, cleanMultipleFiles, compareWithBackup, 
        restoreFromBackup, removeFromHistory, setLanguageFilter, clearHistory, 
        statusBarItem);

    // Update status bar after cleaning
    function updateStatusBar(message: string, timeout: number = 5000) {
        const originalText = statusBarItem.text;
        statusBarItem.text = message;
        setTimeout(() => {
            statusBarItem.text = originalText;
        }, timeout);
    }
}

// Helper function to check if file exists
async function fileExists(path: string): Promise<boolean> {
    try {
        await vscode.workspace.fs.stat(vscode.Uri.file(path));
        return true;
    } catch {
        return false;
    }
}

export function deactivate() {}