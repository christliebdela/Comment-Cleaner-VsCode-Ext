import * as vscode from 'vscode';
import { executeCcp } from './ccpRunner';
import { selectAndProcessFiles } from './fileSelector';
import { FilesViewProvider, HistoryViewProvider } from './ccpViewProvider';
import { ButtonsViewProvider } from './ccpWebviewProvider';
import { ResultsViewProvider } from './resultsViewProvider';
import { StatisticsManager } from './statsManager';
import { StatisticsViewProvider } from './statsViewProvider';
import * as path from 'path';
import * as os from 'os';

export function activate(context: vscode.ExtensionContext) {
    // Create the statistics manager
    const statsManager = StatisticsManager.getInstance(context);
    
    // Create view providers
    const filesViewProvider = new FilesViewProvider();
    const historyViewProvider = new HistoryViewProvider();
    const buttonsProvider = new ButtonsViewProvider(context.extensionUri);
    const resultsProvider = new ResultsViewProvider(context.extensionUri);
    const statsViewProvider = new StatisticsViewProvider(context.extensionUri, statsManager);
    
    // Register tree data providers
    vscode.window.registerTreeDataProvider('ccpFiles', filesViewProvider);
    vscode.window.registerTreeDataProvider('ccpHistory', historyViewProvider);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            ButtonsViewProvider.viewType, 
            buttonsProvider
        )
    );
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            ResultsViewProvider.viewType, 
            resultsProvider
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
    let cleanCurrentFile = vscode.commands.registerCommand('ccp.cleanComments', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found.');
            return;
        }

        const document = editor.document;
        await document.save();
        
        try {
            const backup = await vscode.window.showQuickPick(
                ['Yes, Create a Backup File', 'Don\'t Create a Backup File'], {
                    placeHolder: 'Create a backup before cleaning?',
                    ignoreFocusOut: true // Prevents dismissal when clicking outside
                }
            );
            
            // If the user dismissed the dialog (clicked outside, pressed Escape)
            if (!backup) {
                return; // Cancel the operation
            }
            
            const noBackup = backup === 'Don\'t Create a Backup File';
            
            const result = await executeCcp(document.fileName, noBackup, false);
            
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
        await selectAndProcessFiles(historyViewProvider);
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

    let removeFromHistory = vscode.commands.registerCommand('ccp.removeFromHistory', (filePath) => {
        historyViewProvider.removeFromHistory(filePath);
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

    // Register command for dry run on single file
    let dryRunCurrentFile = vscode.commands.registerCommand('ccp.dryRun', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found.');
            return;
        }

        const document = editor.document;
        await document.save();
        
        try {
            const results = await executeCcp(document.fileName, true, false, true);
            
            // Show results in the sidebar
            vscode.commands.executeCommand('setContext', 'ccpHasResults', true);
            resultsProvider.showResults([results]);
            
            vscode.window.showInformationMessage('Dry run completed! Analysis results are displayed in the sidebar.');
            updateStatusBar('Dry run completed successfully!');
        } catch (error) {
            vscode.window.showErrorMessage(`Error during dry run: ${error}`);
        }
    });

    // Register command for dry run on multiple files
    let dryRunMultipleFiles = vscode.commands.registerCommand('ccp.dryRunMultiple', async () => {
        // Use the selectAndProcessFiles function with a dryRun parameter
        await selectAndProcessFiles(historyViewProvider, true); // true for dryRun
    });

    // Status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'ccp.cleanComments';
    statusBarItem.text = "$(comment-discussion) Clean Comments";
    statusBarItem.tooltip = "Clean comments from current file";
    statusBarItem.show();

    context.subscriptions.push(cleanCurrentFile, cleanMultipleFiles, compareWithBackup, 
        restoreFromBackup, removeFromHistory, setLanguageFilter, clearHistory, 
        dryRunCurrentFile, dryRunMultipleFiles, statusBarItem);

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