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

export async function executeCcp(filePath: string, noBackup: boolean, force: boolean): Promise<void> {
    try {
        const output = await runCcpScript(filePath, noBackup, force);
        // Log the output to the console
        console.log(output);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to run CCP: ${error}`);
        throw error;
    }
}