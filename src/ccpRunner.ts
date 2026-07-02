import * as cp from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';

export interface CCPOptions {
    createBackup: boolean;
    preserveTodo: boolean;
    keepDocComments: boolean;
    forceProcess: boolean;
}

export interface CCPFileResult {
    path: string;
    language: string;
    commentsFound: number;
    linesAffected: number;
    sizeBytes: number;
    sizePercent: number;
    modified: boolean;
    // Legacy keys for backward compat
    filePath: string;
    fileName: string;
    commentCount: number;
    linesRemoved: number;
    sizeReduction: number;
    sizePercentage: number;
}

export interface CCPResult {
    files: CCPFileResult[];
    totals: {
        filesScanned: number;
        filesModified: number;
        commentsFound: number;
        linesAffected: number;
        bytesReduced: number;
    };
}

const PYTHON_SCRIPT = path.join(__dirname, 'python', 'ccp.py');

function buildArgs(
    targets: string[],
    options: CCPOptions,
    extra: string[] = []
): string[] {
    const fs = require('fs');
    if (!fs.existsSync(PYTHON_SCRIPT)) {
        throw new Error(`Python script not found: ${PYTHON_SCRIPT}`);
    }

    const config = vscode.workspace.getConfiguration('commentCleanerPro');
    const preservePatterns: string[] = config.get('preservePatterns', []);

    const args: string[] = [PYTHON_SCRIPT, ...targets, '--json', '--quiet'];

    if (!options.createBackup) { args.push('--no-backup'); }
    if (options.forceProcess)  { args.push('--force'); }
    if (options.preserveTodo)  { args.push('--preserve-todo'); }
    if (options.keepDocComments) { args.push('--keep-doc-comments'); }
    if (preservePatterns.length > 0) {
        args.push('--preserve-patterns', JSON.stringify(preservePatterns));
    }

    return [...args, ...extra];
}

function spawnPython(args: string[]): Promise<CCPResult> {
    return new Promise((resolve, reject) => {
        const proc = cp.spawn('python', args);
        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
        proc.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });

        proc.on('close', (code: number) => {
            if (code !== 0) {
                reject(new Error(`CCP failed (exit ${code}): ${stderr.trim()}`));
                return;
            }
            try {
                const result: CCPResult = JSON.parse(stdout.trim());
                resolve(result);
            } catch {
                reject(new Error(`CCP produced invalid JSON output: ${stdout.slice(0, 200)}`));
            }
        });

        proc.on('error', (err: Error) => {
            reject(new Error(`Failed to launch Python: ${err.message}`));
        });
    });
}

/**
 * Clean a single file. Returns the file result or null on failure.
 */
export async function executeCcp(
    filePath: string,
    noBackup: boolean,
    force: boolean,
    preserveTodo: boolean = false,
    preservePatterns: string[] = [],
    keepDocComments: boolean = false
): Promise<CCPFileResult | null> {
    const options: CCPOptions = {
        createBackup: !noBackup,
        preserveTodo,
        keepDocComments,
        forceProcess: force,
    };

    try {
        const args = buildArgs([filePath], options);
        const ws = vscode.workspace.workspaceFolders;
        if (ws && !noBackup) {
            const backupDir = path.join(ws[0].uri.fsPath, '.ccp-backups');
            args.push('--backup-dir', backupDir);
        }
        const result = await spawnPython(args);
        return result.files[0] ?? null;
    } catch (error) {
        vscode.window.showErrorMessage(`CCP error: ${error}`);
        return null;
    }
}

/**
 * Clean multiple files or a directory in a single Python invocation.
 * Returns the full structured result.
 */
export async function executeClean(
    targets: string[],
    options: CCPOptions,
    backupDir?: string
): Promise<CCPResult> {
    const args = buildArgs(targets, options);
    if (backupDir) {
        args.push('--backup-dir', backupDir);
    }
    return spawnPython(args);
}

/**
 * Dry-run a directory or list of files.
 * Returns stats WITHOUT modifying any files.
 */
export async function runDryRun(
    targets: string[],
    options: CCPOptions
): Promise<CCPResult> {
    const args = buildArgs(targets, options, ['--dry-run']);
    return spawnPython(args);
}