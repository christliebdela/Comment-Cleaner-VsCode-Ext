import * as vscode from 'vscode';

export class ButtonsViewProvider implements vscode.WebviewViewProvider {

  public static readonly viewType = 'ccpButtons';

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly context: vscode.ExtensionContext
  ) {}

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
        case 'cleanWorkspace':
          vscode.commands.executeCommand('ccp.cleanWorkspace');
          break;
        case 'cleanMultipleFiles':
          vscode.commands.executeCommand('ccp.cleanMultipleFiles');
          break;
        case 'undo':
          if (vscode.window.activeTextEditor) {
            await vscode.window.showTextDocument(vscode.window.activeTextEditor.document);
            vscode.commands.executeCommand('undo').then(() => {
              vscode.window.setStatusBarMessage('Undo completed', 3000);
            }, (error) => {
              vscode.window.showErrorMessage(`Cannot undo: ${error || 'Nothing to undo'}`);
            });
          } else {
            vscode.window.showInformationMessage('No active editor to perform undo');
          }
          break;
        case 'redo':
          if (vscode.window.activeTextEditor) {
            await vscode.window.showTextDocument(vscode.window.activeTextEditor.document);
            vscode.commands.executeCommand('redo').then(() => {
              vscode.window.setStatusBarMessage('Redo completed', 3000);
            }, (error) => {
              vscode.window.showErrorMessage(`Cannot redo: ${error || 'Nothing to redo'}`);
            });
          } else {
            vscode.window.showInformationMessage('No active editor to perform redo');
          }
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
            padding: 10px;
            color: var(--vscode-foreground);
            overflow-y: visible;
            height: auto;
          }
          
          ::-webkit-scrollbar {
            width: 6px; 
            height: 6px;
          }
          
          ::-webkit-scrollbar-thumb {
            background-color: transparent;
            border-radius: 3px;
            transition: background-color 0.3s;
          }
          
          *:hover > ::-webkit-scrollbar-thumb,
          *:hover::-webkit-scrollbar-thumb {
            background-color: var(--vscode-scrollbarSlider-background);
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background-color: var(--vscode-scrollbarSlider-hoverBackground);
          }
          
          .actions-container {
            display: flex;
            flex-direction: column;
            height: auto;
            overflow-y: visible;
          }

          .actions-panel {
            background-color: var(--vscode-editor-background);
            border-radius: 4px;
            padding: 10px;
            margin-bottom: 10px;
            border: 1px solid var(--vscode-panel-border);
          }

          .action-button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            width: 100%;
            margin: 6px 0;
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
          }

          .file-icon {
            background: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z'/%3E%3Cpolyline points='14 2 14 8 20 8'/%3E%3Cline x1='16' y1='13' x2='8' y2='13'/%3E%3Cline x1='16' y1='17' x2='8' y2='17'/%3E%3Cline x1='10' y1='9' x2='8' y2='9'/%3E%3C/svg%3E") no-repeat center;
          }

          .files-icon {
            background: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 12h6m-6-4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V13a2 2 0 0 1-2 2z'/%3E%3Cpath d='M5 8H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1'/%3E%3C/svg%3E") no-repeat center;
          }

          .workspace-icon {
            background: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z'/%3E%3C/svg%3E") no-repeat center;
          }

          .undo-icon {
            background: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath stroke='none' d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M9 14l-4 -4l4 -4' /%3E%3Cpath d='M5 10h11a4 4 0 1 1 0 8h-1' /%3E%3C/svg%3E") no-repeat center;
          }

          .redo-icon {
            background: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath stroke='none' d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M15 14l4 -4l-4 -4' /%3E%3Cpath d='M19 10h-11a4 4 0 1 0 0 8h1' /%3E%3C/svg%3E") no-repeat center;
          }

          .button-group {
            display: flex;
            gap: 8px;
          }

          .button-group .action-button {
            flex: 1;
            margin: 0;
          }

          .section-label {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 6px;
            margin-top: 6px;
            user-select: none;
            font-weight: 600;
          }

          .stats-container {
            display: flex;
            flex-direction: column;
            height: auto;
            overflow-x: auto;
            overflow-y: auto; 
            white-space: nowrap;
          }

        </style>
      </head>
      <body>
        <div class="actions-container">
          <div class="section-label">CLEAN CODE</div>
          <div class="actions-panel">
            <button class="action-button" id="cleanCurrentFile">
              <span class="button-icon file-icon"></span>
              Clean Current File
            </button>

            <button class="action-button" id="cleanMultipleFiles">
              <span class="button-icon files-icon"></span>
              Clean Multiple Files
            </button>

            <button class="action-button" id="cleanWorkspace">
              <span class="button-icon workspace-icon"></span>
              Clean Workspace
            </button>

            <!--
            <div class="button-group" style="margin-top: 8px">
              <button class="action-button" id="undoButton">
                <span class="button-icon undo-icon"></span>
                Undo
              </button>

              <button class="action-button" id="redoButton">
                <span class="button-icon redo-icon"></span>
                Redo
              </button>
            </div>
            -->
          </div>

        <script>
          const vscode = acquireVsCodeApi();

          // Button click handlers
          document.getElementById('cleanCurrentFile').addEventListener('click', () => {
            vscode.postMessage({ command: 'cleanCurrentFile' });
          });

          document.getElementById('cleanWorkspace').addEventListener('click', () => {
            vscode.postMessage({ command: 'cleanWorkspace' });
          });

          document.getElementById('cleanMultipleFiles').addEventListener('click', () => {
            vscode.postMessage({ command: 'cleanMultipleFiles' });
          });

          /*
          document.getElementById('undoButton').addEventListener('click', () => {
            vscode.postMessage({ command: 'undo' });
          });

          document.getElementById('redoButton').addEventListener('click', () => {
            vscode.postMessage({ command: 'redo' });
          });
          */
        </script>
      </body>
    </html>`;
  }
}