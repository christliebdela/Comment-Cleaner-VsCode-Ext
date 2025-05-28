import * as vscode from 'vscode';
import { executeCcp } from './ccpRunner';

export async function selectAndProcessFiles(historyProvider?: any): Promise<void> {
    // Get pattern from user
    const pattern = await vscode.window.showInputBox({
        placeHolder: 'File pattern (e.g., *.js, src/**/*.py)',
        prompt: 'Enter a glob pattern to match files'
    });
    
    if (!pattern) {
        return;
    }
    
    // Find files matching the pattern
    const files = await vscode.workspace.findFiles(pattern);
    
    if (files.length === 0) {
        vscode.window.showWarningMessage(`No files found matching pattern: ${pattern}`);
        return;
    }
    
    // Ask about backup creation
    const backup = await vscode.window.showQuickPick(['Yes', 'No'], {
        placeHolder: 'Create backup files?'
    });
    
    const noBackup = backup === 'No';
    
    // Ask about force processing for unknown file types
    const force = await vscode.window.showQuickPick(['Yes', 'No'], {
        placeHolder: 'Force processing of unknown file types?'
    });
    
    const forceProcess = force === 'Yes';
    
    // Process each file
    const progress = await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Removing comments from ${files.length} files`,
        cancellable: true
    }, async (progress, token) => {
        let processed = 0;
        
        for (const file of files) {
            if (token.isCancellationRequested) {
                break;
            }
            
            try {
                await executeCcp(file.fsPath, noBackup, forceProcess);
                // Add to history if provider exists
                if (historyProvider) {
                    historyProvider.addToHistory(file.fsPath);
                }
                processed++;
                progress.report({ 
                    increment: 100 / files.length,
                    message: `${processed}/${files.length} files processed`
                });
            } catch (error) {
                console.error(`Error processing ${file.fsPath}:`, error);
            }
        }
        
        return processed;
    });
    
    vscode.window.showInformationMessage(`Successfully processed ${progress} of ${files.length} files`);
}