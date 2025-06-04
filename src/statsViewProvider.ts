import * as vscode from 'vscode';
import { StatisticsManager, CCPStatistics } from './statsManager';

/**
 * Provider for statistics webview display in the sidebar
 */
export class StatisticsViewProvider implements vscode.WebviewViewProvider {
    /** Identifier for the statistics webview */
    public static readonly viewType = 'ccpStatistics';
    private _view?: vscode.WebviewView;
    
    /**
     * Creates a new statistics view provider
     * @param extensionUri - URI of the extension directory
     * @param statsManager - Statistics manager instance
     */
    constructor(
        private readonly extensionUri: vscode.Uri,
        private readonly statsManager: StatisticsManager
    ) {}
    
    /**
     * Resolves the webview view when requested by VS Code
     * @param webviewView - The webview view to populate
     */
    resolveWebviewView(webviewView: vscode.WebviewView): void {
        this._view = webviewView;
        
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri]
        };
        
        webviewView.webview.onDidReceiveMessage(message => {
            if (message.command === 'resetStats') {
                this.statsManager.resetStats();
                this.updateView();
                vscode.window.showInformationMessage('Statistics have been reset');
            }
        });
        
        this.updateView();
    }
    
    /**
     * Updates the webview content with current statistics
     */
    public updateView(): void {
        if (!this._view) {
            return;
        }
        
        const stats = this.statsManager.getCurrentStats();
        this._view.webview.html = this._getHtmlContent(stats);
    }
    
    /**
     * Generates HTML content for the statistics webview
     * @param stats - Current statistics to display
     * @returns HTML content string
     */
    private _getHtmlContent(stats: CCPStatistics): string {
        const stylesUri = this._view!.webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'media', 'ccpStyles.css')
        );
        
        const lastUpdated = stats.lastUpdated ? 
            new Date(stats.lastUpdated).toLocaleString() : 'Never';
        
        const formattedSize = this.formatBytes(stats.totalSizeReduction);
        
        // Get efficiency percentage and color
        const efficiencyPercent = stats.averageReductionPercent;
        const efficiencyColor = efficiencyPercent > 60 ? '#2ea043' : 
                               (efficiencyPercent > 30 ? '#d29922' : '#f85149');
        
        return `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" type="text/css" href="${stylesUri}">
            <style>
              body {
                padding: 10px;
                color: var(--vscode-foreground);
                overflow-y: hidden;
                height: auto;
              }
              
              .stats-header {
                font-size: 13px;
                font-weight: 600;
                margin-bottom: 12px;
                color: var(--vscode-foreground);
                border-bottom: 1px solid var(--vscode-panel-border);
                padding-bottom: 5px;
                user-select: none;
              }
              
              .stats-panel {
                background-color: var(--vscode-editor-background);
                border-radius: 4px;
                padding: 12px;
                margin-bottom: 12px;
                border: 1px solid var(--vscode-panel-border);
                min-width: 200px;
              }
              
              .stats-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 4px 0;
                font-size: 12px;
              }
              
              .stats-label {
                color: var(--vscode-descriptionForeground);
              }
              
              .stats-value {
                font-weight: 600;
                color: var(--vscode-foreground);
              }
              
              .progress-bar {
                height: 4px;
                background-color: ${efficiencyColor};
                width: 100%;
                margin: 8px 0 12px 0;
                border-radius: 2px;
              }
              
              .reset-button {
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                padding: 6px 12px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
                display: block;
                width: 100%;
                min-width: 200px;
              }
              
              .reset-button:hover {
                background-color: var(--vscode-button-hoverBackground);
              }
              
              .last-updated {
                font-size: 11px;
                color: var(--vscode-descriptionForeground);
                margin-top: 10px;
                text-align: center;
              }
              
              .stats-container {
                display: flex;
                flex-direction: column;
                height: auto;
                overflow-x: auto;
                overflow-y: hidden;
                white-space: nowrap;
              }
            </style>
          </head>
          <body>
            <div class="stats-container">
              <h3 class="stats-header">Usage Statistics</h3>
              
              <div class="stats-panel">
                <div class="stats-item">
                  <span class="stats-label">Files Processed</span>
                  <span class="stats-value">${stats.filesProcessed.toLocaleString()}</span>
                </div>
                
                <div class="stats-item">
                  <span class="stats-label">Comments Removed</span>
                  <span class="stats-value">${stats.totalComments.toLocaleString()}</span>
                </div>
                
                <div class="stats-item">
                  <span class="stats-label">Lines Reduced</span>
                  <span class="stats-value">${stats.totalLines.toLocaleString()}</span>
                </div>
                
                <div class="stats-item">
                  <span class="stats-label">Size Reduction</span>
                  <span class="stats-value">${formattedSize}</span>
                </div>
                
                <div class="stats-item">
                  <span class="stats-label">Efficiency</span>
                  <span class="stats-value" style="color: ${efficiencyColor};">${efficiencyPercent.toFixed(1)}%</span>
                </div>
                
                <div class="progress-bar"></div>
              </div>
              
              <button class="reset-button" id="resetStats">Reset Statistics</button>
              
              <div class="last-updated">
                Last updated: ${lastUpdated}
              </div>
            </div>
            
            <script>
              const vscode = acquireVsCodeApi();
              
              document.getElementById('resetStats').addEventListener('click', () => {
                vscode.postMessage({ command: 'resetStats' });
              });
              
              // Set the view height to match content height to avoid scrolling
              window.addEventListener('load', () => {
                const contentHeight = document.querySelector('.stats-container').scrollHeight;
                vscode.postMessage({ 
                  command: 'setHeight',
                  height: contentHeight
                });
              });
            </script>
          </body>
        </html>`;
    }
    
    /**
     * Formats a byte value into a human-readable size string
     * @param bytes - Number of bytes to format
     * @returns Formatted size string with appropriate unit
     */
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