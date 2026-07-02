import * as vscode from 'vscode';
import { CCPOptions } from './ccpRunner';

/**
 * Unified options prompt — single source of truth for all commands.
 * Shows checkboxes in a single VS Code dialog, pre-populating with saved settings.
 */
export async function promptCCPOptions(
    context: vscode.ExtensionContext
): Promise<CCPOptions | undefined> {
    const saved = context.globalState.get<CCPOptions>('ccpOptions') ?? {
        createBackup: true,
        preserveTodo: false,
        keepDocComments: false,
        forceProcess: false,
    };

    interface OptionItem extends vscode.QuickPickItem {
        id: keyof CCPOptions;
    }

    const items: OptionItem[] = [
        {
            id: 'createBackup',
            label: 'Create backup files',
            picked: saved.createBackup,
            description: 'Saves a copy (.bak) of the files before cleaning'
        },
        {
            id: 'preserveTodo',
            label: 'Preserve TODO & FIXME comments',
            picked: saved.preserveTodo,
            description: 'Prevents removal of lines containing TODO/FIXME'
        },
        {
            id: 'keepDocComments',
            label: 'Keep documentation comments',
            picked: saved.keepDocComments,
            description: 'Retains JSDoc, PyDoc, XML docs, etc.'
        },
        {
            id: 'forceProcess',
            label: 'Process unknown file types',
            picked: saved.forceProcess,
            description: 'Forces processing on unrecognized extensions'
        }
    ];

    const selection = await vscode.window.showQuickPick(items, {
        canPickMany: true,
        placeHolder: 'Select cleaning options (Press Enter to confirm)',
        ignoreFocusOut: true
    });

    if (!selection) {
        return undefined; // user cancelled
    }

    const selectedIds = new Set(selection.map(item => item.id));

    const options: CCPOptions = {
        createBackup:    selectedIds.has('createBackup'),
        preserveTodo:    selectedIds.has('preserveTodo'),
        keepDocComments: selectedIds.has('keepDocComments'),
        forceProcess:    selectedIds.has('forceProcess'),
    };

    await context.globalState.update('ccpOptions', options);
    return options;
}

/**
 * Get saved options without prompting.
 */
export function getSavedOptions(context: vscode.ExtensionContext): CCPOptions {
    return context.globalState.get<CCPOptions>('ccpOptions') ?? {
        createBackup:    true,
        preserveTodo:    false,
        keepDocComments: false,
        forceProcess:    false,
    };
}

