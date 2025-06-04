import * as vscode from 'vscode';
import { StatisticsManager, CCPStatistics, FileSpecificStats } from './statsManager';
import * as path from 'path';

/**
 * Provider for statistics webview display in the sidebar
 */
export class StatisticsViewProvider implements vscode.WebviewViewProvider {
    /** Identifier for the statistics webview */
    public static readonly viewType = 'ccpStatistics';
    private _view?: vscode.WebviewView;
    private _viewMode: 'global' | 'file' = 'global';
    private _currentFilePath?: string;
    private _disposables: vscode.Disposable[] = [];
    
    /**
     * Creates a new statistics view provider
     * @param extensionUri - URI of the extension directory
     * @param statsManager - Statistics manager instance
     */
    constructor(
        private readonly extensionUri: vscode.Uri,
        private readonly statsManager: StatisticsManager
    ) {
        // Set up editor change detection
        this._disposables.push(
            vscode.window.onDidChangeActiveTextEditor(this._onActiveEditorChanged, this)
        );
        
        // Load user preference
        this._viewMode = vscode.workspace.getConfiguration('commentCleanerPro')
            .get('statisticsViewMode', 'global') as 'global' | 'file';
            
        // Set initial current file
        if (vscode.window.activeTextEditor) {
            this._currentFilePath = vscode.window.activeTextEditor.document.uri.fsPath;
        }
    }
    
    /**
     * Handles active editor changes
     * @param editor The newly active editor
     */
    private _onActiveEditorChanged(editor?: vscode.TextEditor): void {
        if (editor) {
            this._currentFilePath = editor.document.uri.fsPath;
            
            // Update view if in file mode
            if (this._view && this._viewMode === 'file') {
                this.updateView();
            }
        } else {
            this._currentFilePath = undefined;
        }
    }
    
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
            switch (message.command) {
                case 'resetStats':
                    this.statsManager.resetStats();
                    this.updateView();
                    vscode.window.showInformationMessage('Statistics have been reset');
                    break;
                    
                case 'toggleViewMode':
                    this._viewMode = message.mode;
                    // Save user preference
                    vscode.workspace.getConfiguration('commentCleanerPro')
                        .update('statisticsViewMode', this._viewMode, vscode.ConfigurationTarget.Global);
                    this.updateView();
                    break;
                    
                case 'setHeight':
                    // Handle height adjustment if needed
                    break;
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
        
        if (this._viewMode === 'file' && this._currentFilePath) {
            // Show file-specific stats
            const fileStats = this.statsManager.getFileStats(this._currentFilePath);
            this._view.webview.html = this._getFileStatsHtml(fileStats);
        } else {
            // Show global stats
            const stats = this.statsManager.getCurrentStats();
            this._view.webview.html = this._getGlobalStatsHtml(stats);
        }
    }

    /**
     * Gets a user-friendly display path for a file
     * @param filePath Full file path
     * @returns Shortened path for display
     */
    private _getDisplayPath(filePath: string): string {
        const fileName = path.basename(filePath);
        const folderName = path.basename(path.dirname(filePath));
        return `${folderName}/${fileName}`;
    }
    
    /**
     * Generates HTML content for global statistics view
     * @param stats - Current statistics to display
     * @returns HTML content string
     */
    private _getGlobalStatsHtml(stats: CCPStatistics): string {
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
              
              .toggle-container {
                display: flex;
                justify-content: space-between;
                margin-bottom: 16px;
                gap: 8px; /* Space between buttons */
              }
              
              .toggle-button {
                flex: 1; /* Make buttons take equal space */
                background-color: var(--vscode-button-secondaryBackground);
                color: var(--vscode-button-secondaryForeground);
                border: none;
                padding: 6px 8px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 11px;
                text-align: center;
                min-width: 0; /* Allow shrinking below content size if needed */
                white-space: nowrap;
              }
              
              .toggle-button.active {
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
              }
              
              .toggle-button:hover {
                background-color: var(--vscode-button-hoverBackground);
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
              <div class="toggle-container">
                <button class="toggle-button${this._viewMode === 'global' ? ' active' : ''}" id="globalToggle">All Files</button>
                <button class="toggle-button${this._viewMode === 'file' ? ' active' : ''}" id="fileToggle">Current File</button>
              </div>
            
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
              
              document.getElementById('globalToggle').addEventListener('click', () => {
                vscode.postMessage({ command: 'toggleViewMode', mode: 'global' });
              });
              
              document.getElementById('fileToggle').addEventListener('click', () => {
                vscode.postMessage({ command: 'toggleViewMode', mode: 'file' });
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
     * Generates HTML content for file-specific statistics view
     * @param fileStats - Statistics for the current file
     * @returns HTML content string
     */
    private _getFileStatsHtml(fileStats?: FileSpecificStats): string {
        const stylesUri = this._view!.webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'media', 'ccpStyles.css')
        );
        
        // If no stats available for current file
        if (!fileStats) {
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
                  
                  .toggle-container {
                    display: flex;
                    justify-content: space-between;  /* Changed from center */
                    margin-bottom: 16px;
                    gap: 8px;  /* Added gap property */
                  }
                  
                  .toggle-button {
                    flex: 1;  /* Make buttons take equal space */
                    background-color: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                    border: none;
                    padding: 6px 8px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 11px;
                    text-align: center;
                    min-width: 0;  /* Allow shrinking below content size if needed */
                    white-space: nowrap;
                  }
                  
                  .toggle-button.active {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                  }
                  
                  .toggle-button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                  }
                  
                  .file-header {
                    font-size: 12px;
                    color: var(--vscode-descriptionForeground);
                    text-align: center;
                    margin-bottom: 16px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  }
                  
                  .no-stats {
                    text-align: center;
                    color: var(--vscode-descriptionForeground);
                    font-style: italic;
                    margin: 20px 0;
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
                  <div class="toggle-container">
                    <button class="toggle-button" id="globalToggle">All Files</button>
                    <button class="toggle-button active" id="fileToggle">Current File</button>
                  </div>
                  
                  <div class="file-header">
                    ${this._currentFilePath ? this._getDisplayPath(this._currentFilePath) : 'No file selected'}
                  </div>
                  
                  <div class="no-stats">
                    No statistics available for this file.
                    <br><br>
                    Use "Clean Current File" to process this file.
                  </div>
                </div>
                
                <script>
                  const vscode = acquireVsCodeApi();
                  
                  document.getElementById('globalToggle').addEventListener('click', () => {
                    vscode.postMessage({ command: 'toggleViewMode', mode: 'global' });
                  });
                  
                  document.getElementById('fileToggle').addEventListener('click', () => {
                    vscode.postMessage({ command: 'toggleViewMode', mode: 'file' });
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
        
        // If stats are available for the current file
        const lastUpdated = fileStats.lastUpdated ? 
            new Date(fileStats.lastUpdated).toLocaleString() : 'Never';
        
        const formattedSize = this.formatBytes(fileStats.sizeReduction);
        
        // Get efficiency percentage and color
        const efficiencyPercent = fileStats.sizePercentage;
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
              
              .toggle-container {
                display: flex;
                justify-content: space-between;  /* Changed from center */
                margin-bottom: 16px;
                gap: 8px;  /* Added gap property */
              }
              
              .toggle-button {
                flex: 1;  /* Make buttons take equal space */
                background-color: var(--vscode-button-secondaryBackground);
                color: var(--vscode-button-secondaryForeground);
                border: none;
                padding: 6px 8px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 11px;
                text-align: center;
                min-width: 0;  /* Allow shrinking below content size if needed */
                white-space: nowrap;
                margin: 0 4px;  /* Add margin for spacing */
              }
              
              .toggle-button.active {
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
              }
              
              .toggle-button:hover {
                background-color: var(--vscode-button-hoverBackground);
              }
              
              .file-header {
                font-size: 12px;
                color: var(--vscode-descriptionForeground);
                text-align: center;
                margin-bottom: 16px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
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
              <div class="toggle-container">
                <button class="toggle-button" id="globalToggle">All Files</button>
                <button class="toggle-button active" id="fileToggle">Current File</button>
              </div>
              
              <div class="file-header">
                ${this._getDisplayPath(fileStats.filePath)}
              </div>
              
              <div class="stats-panel">
                <div class="stats-item">
                  <span class="stats-label">Comments Removed</span>
                  <span class="stats-value">${fileStats.commentCount.toLocaleString()}</span>
                </div>
                
                <div class="stats-item">
                  <span class="stats-label">Lines Reduced</span>
                  <span class="stats-value">${fileStats.linesRemoved.toLocaleString()}</span>
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
              
              <div class="last-updated">
                Last processed: ${lastUpdated}
              </div>
            </div>
            
            <script>
              const vscode = acquireVsCodeApi();
              
              document.getElementById('globalToggle').addEventListener('click', () => {
                vscode.postMessage({ command: 'toggleViewMode', mode: 'global' });
              });
              
              document.getElementById('fileToggle').addEventListener('click', () => {
                vscode.postMessage({ command: 'toggleViewMode', mode: 'file' });
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
    
    /**
     * Cleanup resources when view is disposed
     */
    public dispose(): void {
        this._disposables.forEach(d => d.dispose());
        this._disposables = [];
    }
}