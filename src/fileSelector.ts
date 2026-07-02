import * as vscode from 'vscode';
import * as path from 'path';
import { executeClean, runDryRun } from './ccpRunner';
import { promptCCPOptions } from './ccpOptions';
import { showConfirmationModal } from './confirmationModal';

/**
 * "Clean Multiple Files" command handler.
 * User enters a glob pattern, a dry-run shows a confirmation modal,
 * then the files are cleaned in a single Python process.
 */
function isProcessableFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    const supportedExts = new Set([
        '.py', '.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx',
        '.html', '.htm', '.css', '.scss', '.c', '.cpp', '.h',
        '.hpp', '.cc', '.cxx', '.java', '.go', '.swift', '.kt',
        '.kts', '.rs'
    ]);
    return supportedExts.has(ext);
}

/**
 * "Clean Multiple Files" command handler.
 * Presents a searchable QuickPick list with checkboxes for workspace files.
 */
export async function selectAndProcessFiles(
    historyProvider?: any,
    context?: vscode.ExtensionContext,
    onSuccess?: (result: import('./ccpRunner').CCPResult) => void
): Promise<void> {
    if (!context) {
        vscode.window.showErrorMessage('Extension context not available.');
        return;
    }

    // 1. Scan workspace for all files
    const uris = await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'Scanning workspace for code files…',
            cancellable: false
        },
        async () => {
            return vscode.workspace.findFiles(
                '**/*',
                '{**/node_modules/**,**/.git/**,**/dist/**,**/out/**,**/build/**,**/.next/**,**/.ccp-backups/**,**/.svelte-kit/**,**/vendor/**,**/.venv/**,**/venv/**}'
            );
        }
    );

    // 2. Filter processable files
    const processableFiles = uris
        .map(u => u.fsPath)
        .filter(fp => isProcessableFile(fp));

    if (processableFiles.length === 0) {
        vscode.window.showWarningMessage('No supported code files found in the current workspace.');
        return;
    }

    // 3. Map to QuickPickItem
    const items = processableFiles.map(fp => {
        const relativePath = vscode.workspace.asRelativePath(fp);
        return {
            label: path.basename(fp),
            description: relativePath,
            picked: false,
            fsPath: fp
        };
    });

    // 4. Show Quick Pick dialog with dynamic selection sorting
    const selectedItems = await new Promise<any[]>((resolve) => {
        const quickPick = vscode.window.createQuickPick<any>();
        quickPick.items = items;
        quickPick.canSelectMany = true;
        quickPick.placeholder = 'Search and select files to clean comments from';
        quickPick.title = 'Select Files to Clean';
        quickPick.ignoreFocusOut = true;

        const cancelButton: vscode.QuickInputButton = {
            iconPath: new vscode.ThemeIcon('close'),
            tooltip: 'Cancel'
        };

        quickPick.buttons = [cancelButton];

        quickPick.onDidTriggerButton(button => {
            if (button === cancelButton) {
                resolve([]);
                quickPick.dispose();
            }
        });

        let isUpdating = false;

        const updateSort = () => {
            if (isUpdating) { return; }
            isUpdating = true;

            // Run in setTimeout to let VS Code complete selection and filter state updates natively
            setTimeout(() => {
                const selectedPaths = new Set(quickPick.selectedItems.map(item => item.fsPath));
                
                // Sort items: selected ones on top, maintaining relative order
                const sortedItems = [...items].sort((a, b) => {
                    const aSelected = selectedPaths.has(a.fsPath);
                    const bSelected = selectedPaths.has(b.fsPath);
                    if (aSelected && !bSelected) { return -1; }
                    if (!aSelected && bSelected) { return 1; }
                    return 0;
                });

                // Prevent infinite loop by checking if order actually changed
                const currentPaths = quickPick.items.map(i => i.fsPath);
                const sortedPaths = sortedItems.map(i => i.fsPath);
                if (JSON.stringify(currentPaths) !== JSON.stringify(sortedPaths)) {
                    const active = quickPick.activeItems;
                    quickPick.items = sortedItems;
                    quickPick.selectedItems = sortedItems.filter(item => selectedPaths.has(item.fsPath));
                    
                    if (active.length > 0) {
                        const activeFsPath = active[0].fsPath;
                        const newActive = sortedItems.find(item => item.fsPath === activeFsPath);
                        if (newActive) {
                            quickPick.activeItems = [newActive];
                        }
                    }
                }
                isUpdating = false;
            }, 50);
        };

        quickPick.onDidChangeSelection(selected => {
            // Do not re-sort while user is searching to prevent losing visible focus and deselecting
            if (quickPick.value !== '') {
                return;
            }
            updateSort();
        });

        quickPick.onDidChangeValue(value => {
            // When search query is cleared, float all selected items back to the top
            if (value === '') {
                updateSort();
            }
        });

        quickPick.onDidAccept(() => {
            resolve([...quickPick.selectedItems]);
            quickPick.dispose();
        });

        quickPick.onDidHide(() => {
            resolve([]);
            quickPick.dispose();
        });

        quickPick.show();
    });

    if (!selectedItems || selectedItems.length === 0) {
        return;
    }

    const options = await promptCCPOptions(context);
    if (!options) { return; }

    const filePaths = selectedItems.map(item => item.fsPath);
    const label = filePaths.length === 1 
        ? `File: ${path.basename(filePaths[0])}` 
        : `${filePaths.length} selected files`;

    await processWithConfirmation(filePaths, label, options, context, historyProvider, onSuccess);
}

/**
 * "Clean Folder" context-menu command handler.
 * Right-click on folder → dry-run → confirmation modal → clean.
 */
export async function cleanFolder(
    folderUri: vscode.Uri,
    context: vscode.ExtensionContext,
    historyProvider?: any,
    onSuccess?: (result: import('./ccpRunner').CCPResult) => void
): Promise<void> {
    const options = await promptCCPOptions(context);
    if (!options) { return; }

    await processWithConfirmation(
        [folderUri.fsPath],
        `Folder: ${folderUri.fsPath}`,
        options,
        context,
        historyProvider,
        onSuccess
    );
}

/**
 * "Clean Entire Workspace" command handler.
 * Scans all workspace folders → dry-run → confirmation modal → clean.
 */
export async function cleanWorkspace(
    context: vscode.ExtensionContext,
    historyProvider?: any,
    onSuccess?: (result: import('./ccpRunner').CCPResult) => void
): Promise<void> {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
        vscode.window.showErrorMessage('No active workspace folders found.');
        return;
    }

    const options = await promptCCPOptions(context);
    if (!options) { return; }

    const targets = folders.map(f => f.uri.fsPath);
    await processWithConfirmation(
        targets,
        `Workspace: ${folders.map(f => f.name).join(', ')}`,
        options,
        context,
        historyProvider,
        onSuccess
    );
}


/**
 * Core pipeline: dry-run → modal → clean
 */
async function processWithConfirmation(
    targets: string[],
    label: string,
    options: import('./ccpRunner').CCPOptions,
    context: vscode.ExtensionContext,
    historyProvider?: any,
    onSuccess?: (result: import('./ccpRunner').CCPResult) => void
): Promise<void> {
    // 1. Dry-run to get stats without touching files
    let dryResult;
    try {
        dryResult = await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: 'Analysing files…',
                cancellable: false,
            },
            () => runDryRun(targets, options)
        );
    } catch (err) {
        vscode.window.showErrorMessage(`Analysis failed: ${err}`);
        return;
    }

    // 2. Show confirmation modal
    const choice = await showConfirmationModal(dryResult, label, options.createBackup, context.extensionUri);
    if (choice === 'cancel') { return; }

    // 3. Determine backup dir if needed
    const backupDir = options.createBackup
        ? getBackupDir(targets[0])
        : undefined;
    const cleanOptions = {
        ...options,
        createBackup: options.createBackup,
    };

    // 4. Clean
    let cleanResult;
    try {
        cleanResult = await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: `Cleaning ${dryResult.totals.filesScanned} files…`,
                cancellable: false,
            },
            () => executeClean(targets, cleanOptions, backupDir)
        );
    } catch (err) {
        vscode.window.showErrorMessage(`Cleaning failed: ${err}`);
        return;
    }

    // 5. Update history
    if (historyProvider) {
        for (const f of cleanResult.files) {
            historyProvider.addToHistory(f.path);
        }
    }

    // Invoke success callback to update statistics
    if (onSuccess) {
        onSuccess(cleanResult);
    }

    // 6. Summary message
    const t = cleanResult.totals;
    if (t.commentsFound > 0) {
        vscode.window.showInformationMessage(
            `✅ Cleaned ${t.filesModified} files — removed ${t.commentsFound} comments (${t.linesAffected} lines)`
        );
    } else {
        vscode.window.showInformationMessage(
            `ℹ No comments found in ${t.filesScanned} files.`
        );
    }
}

/**
 * Resolves the workspace-local .ccp-backups path for a given target root.
 */
function getBackupDir(targetPath: string): string {
    const ws = vscode.workspace.workspaceFolders;
    const root = ws ? ws[0].uri.fsPath : path.dirname(targetPath);
    return path.join(root, '.ccp-backups');
}