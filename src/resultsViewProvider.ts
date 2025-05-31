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
      <div class="results-summary">
        <div class="stat-block">
          <div class="stat-value">${totalComments}</div>
          <div class="stat-label">Comments Found</div>
        </div>
        <div class="stat-block">
          <div class="stat-value">${totalLines}</div>
          <div class="stat-label">Lines of Comments</div>
        </div>
        <div class="stat-block">
          <div class="stat-value">${formatBytes(totalSize)}</div>
          <div class="stat-label">Size Reduction</div>
        </div>
      </div>
      <div class="results-details">
        <h4>Files Analyzed</h4>
    `;
    
    // Add details for each file
    fileResults.forEach(file => {
      html += `
        <div class="file-result">
          <div class="file-name">${file.fileName}</div>
          <div class="file-stats">
            <span>${file.commentCount} comments</span>
            <span>${file.linesRemoved} lines</span>
            <span>${formatBytes(file.sizeReduction)}</span>
          </div>
        </div>
      `;
    });
    
    html += `</div>`;
    
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
          .results-summary {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1rem;
            flex-wrap: wrap;
          }
          
          .stat-block {
            background-color: var(--vscode-editor-background);
            border-radius: 4px;
            padding: 10px;
            flex: 1;
            margin: 0 4px;
            text-align: center;
            min-width: 80px;
          }
          
          .stat-value {
            font-size: 1.5rem;
            font-weight: bold;
          }
          
          .stat-label {
            font-size: 0.8rem;
            opacity: 0.8;
          }
          
          .file-result {
            padding: 6px 0;
            border-bottom: 1px solid var(--vscode-panel-border);
          }
          
          .file-name {
            font-weight: bold;
            margin-bottom: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .file-stats {
            display: flex;
            justify-content: space-between;
            font-size: 0.85rem;
            opacity: 0.8;
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