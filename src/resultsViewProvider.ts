import * as vscode from 'vscode';

export class ResultsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'ccpResults';
  private _view?: vscode.WebviewView;
  
  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this._view = webviewView;
    
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri]
    };
    
    webviewView.webview.html = this._getInitialHtml();
  }

  // Display dry run results
  showResults(fileResults: any[]): void {
    if (!this._view) {
        return;
    }
    
    // Make the results panel visible
    this._view.show(true);
    
    // Create a summary of all results
    const totalComments = fileResults.reduce((sum, file) => sum + file.commentCount, 0);
    const totalLines = fileResults.reduce((sum, file) => sum + file.linesRemoved, 0);
    const totalSize = fileResults.reduce((sum, file) => sum + file.sizeReduction, 0);
    
    let html = `
        <h3>Analysis Results</h3>
        
        <div class="stats-grid">
            <div class="stat-label">Comments Found:</div>
            <div class="stat-value">${totalComments.toLocaleString()}</div>
            
            <div class="stat-label">Lines of Comments:</div>
            <div class="stat-value">${totalLines.toLocaleString()}</div>
            
            <div class="stat-label">Size Reduction:</div>
            <div class="stat-value">${formatBytes(totalSize)}</div>
        </div>
        
        <h4>Files Analyzed</h4>
    `;
    
    // Add details for each file
    fileResults.forEach(file => {
        html += `
            <div class="file-result">
                <div class="file-name">${file.fileName}</div>
                <div class="stats-grid">
                    <div class="stat-label">Comments:</div>
                    <div class="stat-value">${file.commentCount}</div>
                    
                    <div class="stat-label">Lines:</div>
                    <div class="stat-value">${file.linesRemoved}</div>
                    
                    <div class="stat-label">Size:</div>
                    <div class="stat-value">${formatBytes(file.sizeReduction)}</div>
                </div>
            </div>
        `;
    });
    
    this._view.webview.html = this._getHtmlContent(html);
  }
  
  private _getInitialHtml(): string {
    return this._getHtmlContent(`
      <div class="empty-state">
        <div class="empty-icon">$(search)</div>
        <p>Run a dry analysis to see results here</p>
      </div>
    `);
  }
  
  private _getHtmlContent(content: string): string {
    const stylesUri = this._view!.webview.asWebviewUri(
        vscode.Uri.joinPath(this.extensionUri, 'media', 'ccpStyles.css')
    );
    
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
                
                h4 {
                    margin-top: 20px;
                    margin-bottom: 10px;
                }
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px 15px;
                    margin-bottom: 20px;
                }
                
                .stat-label {
                    opacity: 0.8;
                    text-align: left;
                }
                
                .stat-value {
                    font-weight: bold;
                    text-align: right;
                }
                
                .file-result {
                    padding: 10px;
                    margin-bottom: 10px;
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 4px;
                }
                
                .file-name {
                    font-weight: bold;
                    margin-bottom: 8px;
                    font-size: 1.1em;
                }
                
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    opacity: 0.5;
                }
                
                .empty-icon {
                    font-size: 2rem;
                    margin-bottom: 1rem;
                }
            </style>
        </head>
        <body>
            ${content}
        </body>
    </html>`;
  }
}

// Helper function to format bytes into human-readable format
function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return bytes + ' bytes';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  } else {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}