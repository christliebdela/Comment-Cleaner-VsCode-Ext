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

    if (!context.globalState.get('ccpOptions')) {
        context.globalState.update('ccpOptions', {
            createBackup: true,
            preserveTodo: false,
            keepDocComments: false,
            forceProcess: false
        });
    }

    const statsManager = StatisticsManager.getInstance(context);

    const historyViewProvider = new HistoryViewProvider();
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

            const savedOptions = context.globalState.get<CCPOptions>('ccpOptions');
            const noBackup = savedOptions?.createBackup === false;
            const preserveTodo = savedOptions?.preserveTodo === true;
            const keepDocComments = savedOptions?.keepDocComments === true;
            const forceProcess = savedOptions?.forceProcess === true;

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
            }

            await vscode.commands.executeCommand('workbench.action.files.revert');

            historyViewProvider.addToHistory(document.fileName);

            vscode.window.showInformationMessage('Comments removed successfully!');
            updateStatusBar('Comments removed successfully!');
        } catch (error) {
            vscode.window.showErrorMessage(`Error: ${error}`);
        }
    });

    let cleanMultipleFiles = vscode.commands.registerCommand('ccp.cleanMultipleFiles', async () => {
        await selectAndProcessFiles(historyViewProvider, context);
    });

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
        if (item && item.filePath) {
            historyViewProvider.removeFromHistory(item.filePath);
        } else if (typeof item === 'string') {
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

    context.subscriptions.push(
        cleanCurrentFile,
        cleanMultipleFiles,
        compareWithBackup,
        restoreFromBackup,
        removeFromHistory,
        setLanguageFilter,
        clearHistory,
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