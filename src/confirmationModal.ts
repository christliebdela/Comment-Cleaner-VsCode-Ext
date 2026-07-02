import * as vscode from 'vscode';
import * as path from 'path';
import { CCPResult } from './ccpRunner';

export type ConfirmationChoice = 'cancel' | 'clean';

function toUnicodeBold(str: string): string {
    const boldMap: { [key: string]: string } = {
        'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺',
        'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
        'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠',
        'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝘃', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
        '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
    };
    return str.split('').map(c => boldMap[c] || c).join('');
}

function formatLabel(label: string): string {
    const colonIdx = label.indexOf(':');
    if (colonIdx === -1) {
        return toUnicodeBold(label);
    }
    const prefix = label.substring(0, colonIdx + 1);
    const value = label.substring(colonIdx + 1);
    return `${prefix} ${toUnicodeBold(value.trim())}`;
}

function fmtBytes(bytes: number): string {
    if (bytes < 0) { return '0 B'; }
    if (bytes < 1024) { return `${bytes} B`; }
    if (bytes < 1024 * 1024) { return `${(bytes / 1024).toFixed(1)} KB`; }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Shows a native modal warning dialog with dry-run stats.
 */
export async function showConfirmationModal(
    dryRunResult: CCPResult,
    targetLabel: string,
    createBackup: boolean,
    _extensionUri?: vscode.Uri
): Promise<ConfirmationChoice> {
    const { totals, files } = dryRunResult;

    if (totals.commentsFound === 0) {
        await vscode.window.showInformationMessage(
            `Comment Cleaner Pro\n\nNo comments found in:\n${formatLabel(targetLabel)}`,
            { modal: true }
        );
        return 'cancel';
    }

    const affectedFiles = files.filter(f => f.commentsFound > 0);

    const messageLines = [
        `Ready to clean: ${formatLabel(targetLabel)}`,
        ``,
        `Summary of changes:`,
        `- Files to modify: ${affectedFiles.length} (of ${totals.filesScanned} scanned)`,
        `- Comments to remove: ~${totals.commentsFound} blocks`,
        `- Lines to remove: ${totals.linesAffected} lines`,
        `- Estimated size reduction: ${fmtBytes(totals.bytesReduced)}`
    ];

    if (createBackup) {
        messageLines.push(
            ``,
            `Backups will be created inside the '.ccp-backups/' workspace directory.`
        );
    }

    messageLines.push(
        ``,
        `This operation will modify these files. Proceed?`
    );

    const message = messageLines.join('\n');

    const result = await vscode.window.showWarningMessage(
        message,
        { modal: true },
        'Proceed'
    );

    if (result === 'Proceed') {
        return 'clean';
    }

    return 'cancel';
}

