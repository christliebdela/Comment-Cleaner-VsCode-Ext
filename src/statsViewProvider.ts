import * as vscode from 'vscode';
import { StatisticsManager, CCPStatistics } from './statsManager';

export class StatisticsViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'ccpStatistics';
    private _view?: vscode.WebviewView;
    
    constructor(
        private readonly extensionUri: vscode.Uri,
        private readonly statsManager: StatisticsManager
    ) {}
    
    resolveWebviewView(webviewView: vscode.WebviewView): void {
        this._view = webviewView;
        
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri]
        };
        
        // Add this message handler
        webviewView.webview.onDidReceiveMessage(message => {
            if (message.command === 'resetStats') {
                this.statsManager.resetStats();
                this.updateView();
                vscode.window.showInformationMessage('Statistics have been reset');
            }
        });
        
        this.updateView();
    }
    
    public updateView(): void {
        if (!this._view) {
            return;
        }
        
        const stats = this.statsManager.getCurrentStats();
        this._view.webview.html = this._getHtmlContent(stats);
    }
    
    private _getHtmlContent(stats: CCPStatistics): string {
        const stylesUri = this._view!.webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'media', 'ccpStyles.css')
        );
        
        // Format date
        const lastUpdated = stats.lastUpdated ? 
            new Date(stats.lastUpdated).toLocaleString() : 'Never';
        
        // Format size reduction
        const formattedSize = this.formatBytes(stats.totalSizeReduction);
        
        return `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" type="text/css" href="${stylesUri}">
            <style>
              body {
                padding: 10px;
              }
              
              h3 {
                margin-top: 0;
                border-bottom: 1px solid var(--vscode-panel-border);
                padding-bottom: 5px;
                margin-bottom: 15px;
              }
              
              .stats-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px 15px;
                margin-bottom: 20px;
              }
              
              .stat-label {
                opacity: 0.8;
              }
              
              .stat-value {
                font-weight: bold;
                text-align: right;
              }
              
              .reset-button {
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                padding: 6px 12px;
                border-radius: 3px;
                cursor: pointer;
                width: 100%;
                margin-top: 10px;
              }
              
              .reset-button:hover {
                background-color: var(--vscode-button-hoverBackground);
              }
              
              .last-updated {
                font-size: 0.85em;
                opacity: 0.8;
                margin-top: 15px;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <h3>All-Time Statistics</h3>
            
            <div class="stats-grid">
              <div class="stat-label">Files Processed:</div>
              <div class="stat-value">${stats.filesProcessed.toLocaleString()}</div>
              
              <div class="stat-label">Comments Removed:</div>
              <div class="stat-value">${stats.totalComments.toLocaleString()}</div>
              
              <div class="stat-label">Lines Removed:</div>
              <div class="stat-value">${stats.totalLines.toLocaleString()}</div>
              
              <div class="stat-label">Size Reduction:</div>
              <div class="stat-value">${formattedSize}</div>
              
              <div class="stat-label">Avg Reduction:</div>
              <div class="stat-value">${stats.averageReductionPercent.toFixed(1)}%</div>
            </div>
            
            <button class="reset-button" id="resetStats">Reset Statistics</button>
            
            <div class="last-updated">
              Last updated: ${lastUpdated}
            </div>
            
            <script>
              const vscode = acquireVsCodeApi();
              
              document.getElementById('resetStats').addEventListener('click', () => {
                vscode.postMessage({ command: 'resetStats' });
              });
            </script>
          </body>
        </html>`;
    }
    
    private formatBytes(bytes: number): string {
        if (bytes < 1024) {
            return bytes + ' bytes';
        } else if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(1) + ' KB';
        } else if (bytes < 1024 * 1024 * 1024) {
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        } else {
            return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
        }
    }
}