import * as cp from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';

export function runCcpScript(filePath: string, noBackup: boolean, force: boolean, dryRun: boolean = false): Promise<string> {
    return new Promise((resolve, reject) => {
        // Get path to the Python script, relative to extension directory
        const pythonScriptPath = path.join(__dirname, 'python', 'ccp.py');
        
        // Build command with proper arguments
        const args = [
            pythonScriptPath,
            filePath,
            noBackup ? '--no-backup' : '',
            force ? '--force' : '',
            dryRun ? '--dry-run' : '',
        ].filter(Boolean).map(arg => `"${arg}"`).join(' ');
        
        // Use Python to run the script
        const command = `python ${args}`;
        
        vscode.window.showInformationMessage(`${dryRun ? 'Analyzing' : 'Running'}: ${command}`);
        
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

export async function executeCcp(filePath: string, noBackup: boolean, force: boolean, dryRun: boolean = false): Promise<any> {
    try {
        const output = await runCcpScript(filePath, noBackup, force, dryRun);
        console.log("Python script output:", output);
        
        // Parse results for both dry runs and regular cleaning operations
        const results = dryRun ? parseDryRunResults(output, filePath) : parseCleanResults(output, filePath);
        
        // Return the results for both operations
        return results;
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to run CCP: ${error}`);
        throw error;
    }
}

// Parse the output from the Python script to extract statistics
function parseDryRunResults(output: string, filePath: string): any {
    const results: any = {
        fileName: path.basename(filePath),
        filePath: filePath,
        commentCount: 0,
        linesRemoved: 0,
        sizeReduction: 0,
        sizePercentage: 0,
        dryRun: true  // Important: Mark as dry run
    };
    
    // Updated patterns to match actual Python output
    const commentMatch = output.match(/\[DRY\s+RUN\]\s+Would\s+have\s+Removed\s+(\d+)\s+comments\s+\((\d+)\s+lines\)/i);
    const sizeMatch = output.match(/\[DRY\s+RUN\]\s+Would\s+have\s+File\s+size\s+reduced\s+by\s+(\d+)\s+bytes\s+\(([0-9.]+)%\)/i);
    
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

// Make sure this function exists and works correctly
function parseCleanResults(output: string, filePath: string): any {
    const results: any = {
        fileName: path.basename(filePath),
        filePath: filePath,
        commentCount: 0,
        linesRemoved: 0,
        sizeReduction: 0,
        sizePercentage: 0,
        dryRun: false
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