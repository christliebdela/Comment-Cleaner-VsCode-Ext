import * as vscode from 'vscode';
import { executeCcp } from './ccpRunner';
import { selectAndProcessFiles } from './fileSelector';
import { FilesViewProvider, HistoryViewProvider } from './ccpViewProvider';

export function activate(context: vscode.ExtensionContext) {
    // Create view providers
    const filesViewProvider = new FilesViewProvider();
    const historyViewProvider = new HistoryViewProvider();
    
    // Register tree data providers
    vscode.window.registerTreeDataProvider('ccpFiles', filesViewProvider);
    vscode.window.registerTreeDataProvider('ccpHistory', historyViewProvider);
    
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
            const backup = await vscode.window.showQuickPick(['Yes', 'No'], {
                placeHolder: 'Create backup file?'
            });
            
            await executeCcp(document.fileName, backup === 'No', false);
            await vscode.commands.executeCommand('workbench.action.files.revert');
            
            // Add to history
            historyViewProvider.addToHistory(document.fileName);
            
            vscode.window.showInformationMessage('Comments removed successfully!');
        } catch (error) {
            vscode.window.showErrorMessage(`Error: ${error}`);
        }
    });

    // Register command for batch file processing
    let cleanMultipleFiles = vscode.commands.registerCommand('ccp.cleanMultipleFiles', async () => {
        await selectAndProcessFiles(historyViewProvider);
    });

    context.subscriptions.push(cleanCurrentFile, cleanMultipleFiles);
}

export function deactivate() {}