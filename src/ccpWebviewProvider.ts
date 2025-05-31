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
    
    webviewView.webview.onDidReceiveMessage(async message => {
      switch (message.command) {
        case 'cleanCurrentFile':
          vscode.commands.executeCommand('ccp.cleanComments');
          break;
        case 'cleanMultipleFiles':
          vscode.commands.executeCommand('ccp.cleanMultipleFiles');
          break;
        case 'undo':
          // Make sure the active editor has focus before attempting undo
          if (vscode.window.activeTextEditor) {
            await vscode.window.showTextDocument(vscode.window.activeTextEditor.document);
            vscode.commands.executeCommand('undo').then(() => {
              // Show feedback in status bar
              vscode.window.setStatusBarMessage('Undo completed', 3000);
            }, (error) => {
              vscode.window.showErrorMessage(`Cannot undo: ${error || 'Nothing to undo'}`);
            });
          } else {
            vscode.window.showInformationMessage('No active editor to perform undo');
          }
          break;
        case 'redo':
          // Make sure the active editor has focus before attempting redo
          if (vscode.window.activeTextEditor) {
            await vscode.window.showTextDocument(vscode.window.activeTextEditor.document);
            vscode.commands.executeCommand('redo').then(() => {
              // Show feedback in status bar
              vscode.window.setStatusBarMessage('Redo completed', 3000);
            }, (error) => {
              vscode.window.showErrorMessage(`Cannot redo: ${error || 'Nothing to redo'}`);
            });
          } else {
            vscode.window.showInformationMessage('No active editor to perform redo');
          }
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
            background: url("data:image/svg+xml;charset=utf-8,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg' fill='white'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M13.71 4.29l-3-3L10 1H4L3 2v12l1 1h9l1-1V5l-.29-.71zM13 14H4V2h5v3h4v9zm-7-7h5v1H6V7zm0 2h5v1H6V9zm0 2h5v1H6v-1zm0 2h3v1H6v-1z'/%3E%3C/svg%3E") no-repeat;
          }
          
          .undo-icon {
            background: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath stroke='none' d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M9 14l-4 -4l4 -4' /%3E%3Cpath d='M5 10h11a4 4 0 1 1 0 8h-1' /%3E%3C/svg%3E") no-repeat;
            background-size: contain;
          }
          
          .redo-icon {
            background: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath stroke='none' d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M15 14l4 -4l-4 -4' /%3E%3Cpath d='M19 10h-11a4 4 0 1 0 0 8h1' /%3E%3C/svg%3E") no-repeat;
            background-size: contain;
          }
          
          .button-group {
            display: flex;
            gap: 6px;
            margin: 6px 0;
          }
          
          .button-group .action-button {
            margin: 0;
            flex: 1;
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
        
        <div class="button-group">
          <button class="action-button" id="undoButton" title="Undo (Ctrl+Z)">
            <span class="button-icon undo-icon"></span>
            Undo
          </button>
          
          <button class="action-button" id="redoButton" title="Redo (Ctrl+Y or Ctrl+Shift+Z)">
            <span class="button-icon redo-icon"></span>
            Redo
          </button>
        </div>
        
        <script>
          const vscode = acquireVsCodeApi();
          
          document.getElementById('cleanCurrentFile').addEventListener('click', () => {
            vscode.postMessage({ command: 'cleanCurrentFile' });
          });
          
          document.getElementById('cleanMultipleFiles').addEventListener('click', () => {
            vscode.postMessage({ command: 'cleanMultipleFiles' });
          });
          
          document.getElementById('undoButton').addEventListener('click', () => {
            vscode.postMessage({ command: 'undo' });
          });
          
          document.getElementById('redoButton').addEventListener('click', () => {
            vscode.postMessage({ command: 'redo' });
          });
        </script>
      </body>
    </html>`;
  }
}