import * as vscode from 'vscode';
import { executeCcp } from './ccpRunner';

interface CCPOptions {
    createBackup: boolean;
    preserveTodo: boolean;
    keepDocComments: boolean;
    forceProcess: boolean;
}

export async function selectAndProcessFiles(historyProvider?: any, context?: vscode.ExtensionContext): Promise<void> {

    const pattern = await vscode.window.showInputBox({
        placeHolder: 'File pattern (e.g., *.js, src/**/*.py)',
        prompt: 'Enter a glob pattern to match files for processing'
    });

    if (!pattern) {
        return;
    }

    const files = await vscode.workspace.findFiles(pattern);

    if (files.length === 0) {
        vscode.window.showWarningMessage(`No files found matching pattern: ${pattern}`);
        return;
    }

    let noBackup = false;
    let forceProcess = false;
    let preserveTodo = false;
    let keepDocComments = false;

    const backup = await vscode.window.showQuickPick(['Yes', 'No'], {
        placeHolder: 'Create backup files?'
    });

    if (!backup) return;
    noBackup = backup === 'No';

    const force = await vscode.window.showQuickPick(['Yes', 'No'], {
        placeHolder: 'Force processing of unknown file types?'
    });

    if (!force) return;
    forceProcess = force === 'Yes';

    const todo = await vscode.window.showQuickPick(['Yes', 'No'], {
        placeHolder: 'Preserve TODO and FIXME comments?'
    });

    if (!todo) return;
    preserveTodo = todo === 'Yes';

    const docs = await vscode.window.showQuickPick(['Yes', 'No'], {
        placeHolder: 'Preserve documentation comments?'
    });

    if (!docs) return;
    keepDocComments = docs === 'Yes';

    await processFilesWithSettings(
        files, historyProvider, noBackup, forceProcess, preserveTodo, keepDocComments
    );
}

async function processFilesWithSettings(
    files: vscode.Uri[],
    historyProvider: any,
    noBackup: boolean,
    forceProcess: boolean,
    preserveTodo: boolean,
    keepDocComments: boolean
): Promise<void> {
    const config = vscode.workspace.getConfiguration('commentCleanerPro');
    const preservePatterns = config.get('preservePatterns', []);
    
    // Define results outside the withProgress callback
    const allResults: any[] = [];
    
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
                const result = await executeCcp(
                    file.fsPath,
                    noBackup,
                    forceProcess,
                    preserveTodo,
                    preservePatterns,
                    keepDocComments
                );

                allResults.push(result); // Store in our outer scope array

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

    // Calculate total comments removed using our allResults array
    const totalComments = allResults.reduce((sum: number, result: any) => sum + (result?.commentCount || 0), 0);

    // Show success message
    if (totalComments > 0) {
        vscode.window.showInformationMessage(
            `Successfully processed ${progress} files and removed ${totalComments} comments`
        );
    } else {
        vscode.window.showInformationMessage(
            `Processed ${progress} files but no comments were found`
        );
    }
}