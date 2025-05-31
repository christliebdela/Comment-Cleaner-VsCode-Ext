import * as cp from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';

export function runCcpScript(filePath: string, noBackup: boolean, force: boolean): Promise<string> {
    return new Promise((resolve, reject) => {
        // Get path to the Python script, relative to extension directory
        const pythonScriptPath = path.join(__dirname, 'python', 'ccp.py');
        
        // Build command with proper arguments
        const args = [
            pythonScriptPath,
            filePath,
            noBackup ? '--no-backup' : '',
            force ? '--force' : '',
        ].filter(Boolean).map(arg => `"${arg}"`).join(' ');
        
        // Use Python to run the script
        const command = `python ${args}`;
        
        vscode.window.showInformationMessage(`Running: ${command}`);
        
        // Execute the command
        cp.exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${stderr || error.message}`);
            } else {
                resolve(stdout);
            }
        });
    });
}

export async function executeCcp(filePath: string, noBackup: boolean, force: boolean): Promise<any> {
    try {
        const output = await runCcpScript(filePath, noBackup, force);
        console.log("Python script output:", output);
        
        // Always use parseCleanResults now, no dry run option
        const results = parseCleanResults(output, filePath);
        return results;
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to run CCP: ${error}`);
        throw error;
    }
}

// Make sure this function exists and works correctly
function parseCleanResults(output: string, filePath: string): any {
    const results: any = {
        fileName: path.basename(filePath),
        filePath: filePath,
        commentCount: 0,
        linesRemoved: 0,
        sizeReduction: 0,
        sizePercentage: 0
        // 'dryRun' field removed
    };
    
    // Match patterns with more flexible spacing
    const commentMatch = output.match(/Removed\s+approximately\s+(\d+)\s+comments\s+\((\d+)\s+lines\)/i);
    const sizeMatch = output.match(/File\s+size\s+reduced\s+by\s+(\d+)\s+bytes\s+\(([0-9.]+)%\)/i);
    
    if (commentMatch) {
        results.commentCount = parseInt(commentMatch[1]);
        results.linesRemoved = parseInt(commentMatch[2]);
    }
    
    if (sizeMatch) {
        results.sizeReduction = parseInt(sizeMatch[1]);
        results.sizePercentage = parseFloat(sizeMatch[2]);
    }
    
    return results;
}