import * as vscode from 'vscode';
import { executeCcp } from './ccpRunner';

/**
 * Configuration options for comment cleaning operations
 */
interface CCPOptions {
    createBackup: boolean;
    preserveTodo: boolean;
    keepDocComments: boolean;
    forceProcess: boolean;
}

/**
 * Prompts for configuration options and processes files matching a glob pattern
 * @param historyProvider - History provider to add processed files to
 * @param context - Extension context for state management
 * @returns Promise resolving when processing completes
 */
export async function selectAndProcessFiles(historyProvider?: any, context?: vscode.ExtensionContext): Promise<void> {
    // Get pattern from user
    const pattern = await vscode.window.showInputBox({
        placeHolder: 'File pattern (e.g., *.js, src/**/*.py)',
        prompt: 'Enter a glob pattern to match files for processing'
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
    
    // Configuration options
    let noBackup = false;
    let forceProcess = false;
    let preserveTodo = false;
    let keepDocComments = false;
    
    // Ask about backup creation
    const backup = await vscode.window.showQuickPick(['Yes', 'No'], {
        placeHolder: 'Create backup files?'
    });
    
    if (!backup) return;
    noBackup = backup === 'No';
    
    // Ask about force processing for unknown file types
    const force = await vscode.window.showQuickPick(['Yes', 'No'], {
        placeHolder: 'Force processing of unknown file types?'
    });
    
    if (!force) return;
    forceProcess = force === 'Yes';
    
    // Ask about preserving TODO/FIXME comments
    const todo = await vscode.window.showQuickPick(['Yes', 'No'], {
        placeHolder: 'Preserve TODO and FIXME comments?'
    });
    
    if (!todo) return;
    preserveTodo = todo === 'Yes';
    
    // Ask about preserving documentation comments
    const docs = await vscode.window.showQuickPick(['Yes', 'No'], {
        placeHolder: 'Preserve documentation comments?'
    });
    
    if (!docs) return;
    keepDocComments = docs === 'Yes';
    
    await processFilesWithSettings(
        files, historyProvider, noBackup, forceProcess, preserveTodo, keepDocComments
    );
}

/**
 * Processes multiple files with specified configuration settings
 * @param files - Array of file URIs to process
 * @param historyProvider - History provider to add processed files to
 * @param noBackup - Whether to skip backup creation
 * @param forceProcess - Whether to force processing for unsupported file types
 * @param preserveTodo - Whether to keep TODO and FIXME comments
 * @param keepDocComments - Whether to keep documentation comments
 * @returns Promise resolving when processing completes
 */
async function processFilesWithSettings(
    files: vscode.Uri[], 
    historyProvider: any,
    noBackup: boolean,
    forceProcess: boolean,
    preserveTodo: boolean,
    keepDocComments: boolean
): Promise<void> {
    // Get any custom preserve patterns from settings
    const config = vscode.workspace.getConfiguration('commentCleanerPro');
    const preservePatterns = config.get('preservePatterns', []);
    
    // Process each file with progress notification
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
                await executeCcp(
                    file.fsPath, 
                    noBackup, 
                    forceProcess, 
                    preserveTodo, 
                    preservePatterns, 
                    keepDocComments
                );
                
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
    
    vscode.window.showInformationMessage(
        `Successfully processed ${progress} of ${files.length} files`
    );
}