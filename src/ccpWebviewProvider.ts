import * as vscode from 'vscode';

export class ButtonsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'ccpButtons';

  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri]
    };
    
    const stylesUri = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'ccpStyles.css')
    );
    
    webviewView.webview.html = this.getHtmlContent(stylesUri.toString());
    
    webviewView.webview.onDidReceiveMessage(message => {
      switch (message.command) {
        case 'cleanCurrentFile':
          vscode.commands.executeCommand('ccp.cleanComments');
          break;
        case 'cleanMultipleFiles':
          vscode.commands.executeCommand('ccp.cleanMultipleFiles');
          break;
        case 'dryRun':
          vscode.commands.executeCommand('ccp.dryRun');
          break;
        case 'filterByLanguage':
          vscode.commands.executeCommand('ccp.setLanguageFilter');
          break;
      }
    });
  }

  private getHtmlContent(stylesUri: string): string {
    return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" type="text/css" href="${stylesUri}">
        <style>
          body {
            padding: 0 12px;
          }
          .action-button {
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border-radius: 3px;
            padding: 8px 10px;
            margin: 6px 0;
            border: none;
            width: 100%;
            text-align: center;
            cursor: pointer;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            font-size: 12px; /* REDUCED from 13px */
            font-weight: normal;
          }
          
          .action-button:hover {
            background-color: var(--vscode-button-hoverBackground);
          }
          
          .button-icon {
            margin-right: 8px;
            width: 16px;
            height: 16px;
            background-size: contain;
            display: inline-block;
            vertical-align: text-bottom;
          }
          
          .trash-icon {
            background: url("data:image/svg+xml;charset=utf-8,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg' fill='white'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M10 3h3v1h-1v9l-1 1H4l-1-1V4H2V3h3V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zM9 2H6v1h3V2zM4 13h7V4H4v9zm2-8H5v7h1V5zm1 0h1v7H7V5zm2 0h1v7H9V5z'/%3E%3C/svg%3E") no-repeat;
          }
          
          .files-icon {
            /* Fixed icon for multiple files */
            background: url("data:image/svg+xml;charset=utf-8,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg' fill='white'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M13.71 4.29l-3-3L10 1H4L3 2v12l1 1h9l1-1V5l-.29-.71zM13 14H4V2h5v3h4v9zm-7-7h5v1H6V7zm0 2h5v1H6V9zm0 2h5v1H6v-1zm0 2h3v1H6v-1z'/%3E%3C/svg%3E") no-repeat;
          }
          
          .analysis-icon {
            /* Icon for analysis/dry run */
            background: url("data:image/svg+xml;charset=utf-8,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg' fill='white'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M2 2h12l1 1v10l-1 1H2l-1-1V3l1-1zm0 11h12V3H2v10zm3-8h1v6H5V5zm3 2h1v4H8V7zm3-1h1v5h-1V6z'/%3E%3C/svg%3E") no-repeat;
          }
        </style>
      </head>
      <body>
        <button class="action-button" id="cleanCurrentFile">
          <span class="button-icon trash-icon"></span>
          Clean Current File
        </button>
        
        <button class="action-button" id="cleanMultipleFiles">
          <span class="button-icon files-icon"></span>
          Clean Multiple Files
        </button>
        
        <button class="action-button" id="dryRun">
          <span class="button-icon analysis-icon"></span>
          Dry Run (Analyze Only)
        </button>
        
        <script>
          const vscode = acquireVsCodeApi();
          
          document.getElementById('cleanCurrentFile').addEventListener('click', () => {
            vscode.postMessage({ command: 'cleanCurrentFile' });
          });
          
          document.getElementById('cleanMultipleFiles').addEventListener('click', () => {
            vscode.postMessage({ command: 'cleanMultipleFiles' });
          });
          
          document.getElementById('dryRun').addEventListener('click', () => {
            vscode.postMessage({ command: 'dryRun' });
          });
        </script>
      </body>
    </html>`;
  }
}