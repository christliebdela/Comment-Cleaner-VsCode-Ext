import * as vscode from 'vscode';
import * as path from 'path';
import { executeCcp } from './ccpRunner';
import { selectAndProcessFiles, cleanFolder, cleanWorkspace } from './fileSelector';
import { FilesViewProvider, HistoryViewProvider } from './ccpViewProvider';
import { ButtonsViewProvider } from './ccpWebviewProvider';
import { StatisticsManager } from './statsManager';
import { StatisticsViewProvider } from './statsViewProvider';

import { CCPOptions } from './ccpRunner';
import { promptCCPOptions, getSavedOptions } from './ccpOptions';

export function activate(context: vscode.ExtensionContext) {

    if (!context.globalState.get('ccpOptions')) {
        context.globalState.update('ccpOptions', {
            createBackup: true,
            preserveTodo: false,
            keepDocComments: false,
            forceProcess: false
        });
    }

    const statsManager = StatisticsManager.getInstance(context);

    const historyViewProvider = new HistoryViewProvider(context);
    const buttonsProvider = new ButtonsViewProvider(context.extensionUri, context);
    const statsViewProvider = new StatisticsViewProvider(context.extensionUri, statsManager);

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

    vscode.commands.executeCommand('setContext', 'ccpHasResults', false);

    let cleanCurrentFile = vscode.commands.registerCommand('ccp.cleanComments', async (options) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found.');
            return;
        }

        const document = editor.document;
        await document.save();

        try {
            if (!options) {
                options = await promptCCPOptions(context);
                if (!options) { return; }
            }

            const noBackup = options?.createBackup === false;
            const preserveTodo = options?.preserveTodo === true;
            const keepDocComments = options?.keepDocComments === true;
            const forceProcess = options?.forceProcess === true;

            const config = vscode.workspace.getConfiguration('commentCleanerPro');
            const preservePatterns = config.get('preservePatterns', []);

            const result = await executeCcp(
                document.fileName,
                noBackup,
                forceProcess,
                preserveTodo,
                preservePatterns,
                keepDocComments
            );

            if (result) {
                statsManager.updateStats([result]);
                statsViewProvider.updateView();

                if (result.commentCount > 0) {
                    vscode.window.showInformationMessage(
                        `✅ Removed ${result.commentCount} comments (${result.linesRemoved} lines)`
                    );
                    updateStatusBar('Comments removed!');
                } else {
                    vscode.window.showInformationMessage('ℹ No comments found in file.');
                    updateStatusBar('No comments found.');
                }
            } else {
                vscode.window.showErrorMessage('Failed to process file.');
                updateStatusBar('Failed to process file.');
            }

            await vscode.commands.executeCommand('workbench.action.files.revert');
            historyViewProvider.addToHistory(document.fileName);
        } catch (error) {
            vscode.window.showErrorMessage(`Error: ${error}`);
        }
    });

    let cleanMultipleFiles = vscode.commands.registerCommand('ccp.cleanMultipleFiles', async () => {
        await selectAndProcessFiles(historyViewProvider, context, (result) => {
            statsManager.updateStats(result.files);
            statsViewProvider.updateView();
        });
    });

    let cleanFolderCmd = vscode.commands.registerCommand('ccp.cleanFolder', async (folderUri?: vscode.Uri) => {
        if (!folderUri) {
            vscode.window.showWarningMessage('Right-click a folder in the Explorer to use this command.');
            return;
        }
        await cleanFolder(folderUri, context, historyViewProvider, (result) => {
            statsManager.updateStats(result.files);
            statsViewProvider.updateView();
        });
    });

    let cleanWorkspaceCmd = vscode.commands.registerCommand('ccp.cleanWorkspace', async () => {
        await cleanWorkspace(context, historyViewProvider, (result) => {
            statsManager.updateStats(result.files);
            statsViewProvider.updateView();
        });
    });

    let compareWithBackup = vscode.commands.registerCommand('ccp.compareWithBackup', async (filePath) => {
        const backupPath = await findBackupPath(filePath);
        if (backupPath) {
            const uri1 = vscode.Uri.file(filePath);
            const uri2 = vscode.Uri.file(backupPath);
            vscode.commands.executeCommand('vscode.diff', uri2, uri1, 'Backup ↔ Current');
        } else {
            vscode.window.showWarningMessage('No backup file found.');
        }
    });

    let restoreFromBackup = vscode.commands.registerCommand('ccp.restoreFromBackup', async (filePath) => {
        const backupPath = await findBackupPath(filePath);
        if (backupPath) {
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

    async function findBackupPath(targetFilePath: string): Promise<string | undefined> {
        const ws = vscode.workspace.workspaceFolders;
        if (ws) {
            const root = ws[0].uri.fsPath;
            const relPath = path.relative(root, targetFilePath);
            const backupPath = path.join(root, '.ccp-backups', relPath + '.bak');
            if (await fileExists(backupPath)) {
                return backupPath;
            }
        }
        const legacyPath = targetFilePath + '.bak';
        if (await fileExists(legacyPath)) {
            return legacyPath;
        }
        return undefined;
    }

    let removeFromHistory = vscode.commands.registerCommand('ccp.removeFromHistory', (item) => {
        if (item && item.filePath) {
            historyViewProvider.removeFromHistory(item.filePath);
        } else if (typeof item === 'string') {
            historyViewProvider.removeFromHistory(item);
        }
    });

    let setLanguageFilter = vscode.commands.registerCommand('ccp.setLanguageFilter', async () => {
        const languages = [
            'javascript', 'typescript', 'python', 'html', 'css', 'scss',
            'c', 'cpp', 'java', 'ruby', 'go', 'php', 'sql', 'swift',
            'rust', 'kotlin', 'dart', 'csharp', 'bash', 'powershell',
            'lua', 'perl', 'yaml', 'haskell', 'matlab', 'r',
            'vue', 'svelte', 'hcl', 'toml', 'graphql', 'mdx', 'all'
        ];

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
            { modal: true },
            'Yes', 'No'
        );

        if (answer === 'Yes') {
            historyViewProvider.clearHistory();
            vscode.window.showInformationMessage('History cleared');
        }
    });

    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'ccp.cleanComments';
    statusBarItem.text = "$(trash) Clean Comments";
    statusBarItem.tooltip = "Clean comments from current file";
    statusBarItem.show();

    let focusActionsView = vscode.commands.registerCommand('ccp.focusActionsView', async () => {
        await vscode.commands.executeCommand('workbench.view.extension.comment-cleaner-pro');
        await vscode.commands.executeCommand('ccpButtons.focus');
    });

    context.subscriptions.push(
        cleanCurrentFile,
        cleanMultipleFiles,
        cleanFolderCmd,
        cleanWorkspaceCmd,
        compareWithBackup,
        restoreFromBackup,
        removeFromHistory,
        setLanguageFilter,
        clearHistory,
        focusActionsView,
        statusBarItem
    );

    function updateStatusBar(message: string, timeout: number = 5000) {
        const originalText = statusBarItem.text;
        statusBarItem.text = message;
        setTimeout(() => {
            statusBarItem.text = originalText;
        }, timeout);
    }
}

async function fileExists(path: string): Promise<boolean> {
    try {
        await vscode.workspace.fs.stat(vscode.Uri.file(path));
        return true;
    } catch {
        return false;
    }
}

export function deactivate() {}