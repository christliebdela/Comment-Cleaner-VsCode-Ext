import * as cp from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';

export function runCcpScript(
    filePath: string,
    noBackup: boolean,
    force: boolean,
    preserveTodo: boolean = false,
    preservePatterns: any[] = [],
    keepDocComments: boolean = false
): Promise<string> {
    return new Promise((resolve, reject) => {
        const pythonScriptPath = path.join(__dirname, 'python', 'ccp.py');

        const fs = require('fs');
        if (!fs.existsSync(pythonScriptPath)) {
            reject(`Python script not found: ${pythonScriptPath}`);
            return;
        }

        const pythonArgs = [
            pythonScriptPath,
            filePath,
        ];

        if (noBackup) {
            pythonArgs.push('--no-backup');
        }

        if (force) {
            pythonArgs.push('--force');
        }

        if (preserveTodo) {
            pythonArgs.push('--preserve-todo');
        }

        if (keepDocComments) {
            pythonArgs.push('--keep-doc-comments');
        }

        if (preservePatterns && preservePatterns.length > 0) {
            pythonArgs.push('--preserve-patterns', JSON.stringify(preservePatterns));
        }

        console.log(`Executing: python ${pythonArgs.join(' ')}`);
        vscode.window.showInformationMessage(`Running: python with ${pythonScriptPath}`);

        const pythonProcess = cp.spawn('python', pythonArgs);

        let stdout = '';
        let stderr = '';

        pythonProcess.stdout.on('data', (data) => {
            stdout += data.toString();
            console.log(`Python stdout: ${data}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            stderr += data.toString();
            console.log(`Python stderr: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            console.log(`Python process exited with code ${code}`);

            if (code !== 0) {
                reject(`Python script failed with code ${code}: ${stderr}`);
            } else {
                if (!stdout.trim() && !stderr.trim()) {
                    console.log("Warning: Python script produced no output");
                }
                resolve(stdout + '\n' + stderr);
            }
        });

        pythonProcess.on('error', (err) => {
            reject(`Failed to execute Python: ${err.message}`);
        });
    });
}

export async function executeCcp(
    filePath: string,
    noBackup: boolean,
    force: boolean,
    preserveTodo: boolean = false,
    preservePatterns: any[] = [],
    keepDocComments: boolean = false
): Promise<any> {
    try {
        const output = await runCcpScript(
            filePath,
            noBackup,
            force,
            preserveTodo,
            preservePatterns,
            keepDocComments
        );
        console.log("Python script output:", output);

        const results = parseCleanResults(output, filePath);
        return results;
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to run CCP: ${error}`);
        throw error;
    }
}

function parseCleanResults(output: string, filePath: string): any {
    const results: any = {
        fileName: path.basename(filePath),
        filePath: filePath,
        commentCount: 0,
        linesRemoved: 0,
        sizeReduction: 0,
        sizePercentage: 0
    };

    console.log("Raw Python output to parse:", output);

    const commentMatch = output.match(/Removed\s+approximately\s+(\d+)\s+comments?\s*\((\d+)\s+lines?\)/i) ||
                       output.match(/Removed.*?(\d+).*?comment.*?\((\d+).*?line/i);

    const sizeMatch = output.match(/File\s+size\s+reduced\s+by\s+(\d+)\s+bytes\s+\(([0-9.]+)%\)/i) ||
                    output.match(/reduced.*?by\s+(\d+)\s+bytes.*?\(([0-9.]+)%\)/i);

    if (commentMatch) {
        results.commentCount = parseInt(commentMatch[1]);
        results.linesRemoved = parseInt(commentMatch[2]);
        console.log("Matched comments:", results.commentCount, "lines:", results.linesRemoved);
    } else {
        console.log("Failed to match comment pattern in output");
    }

    if (sizeMatch) {
        results.sizeReduction = parseInt(sizeMatch[1]);
        results.sizePercentage = parseFloat(sizeMatch[2]);
        console.log("Matched size:", results.sizeReduction, "percentage:", results.sizePercentage);
    } else {
        console.log("Failed to match size pattern in output");
    }

    return results;
}