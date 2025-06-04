import * as vscode from 'vscode';

export class ButtonsViewProvider implements vscode.WebviewViewProvider {

  public static readonly viewType = 'ccpButtons';

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly context: vscode.ExtensionContext
  ) {
    console.log('ButtonsViewProvider initialized with context:', this.context.extension.id);
  }

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
          vscode.commands.executeCommand('ccp.cleanComments', message.options);
          break;
        case 'cleanMultipleFiles':
          vscode.commands.executeCommand('ccp.cleanMultipleFiles', message.options);
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
        case 'dryRun':
          vscode.commands.executeCommand('ccp.dryRun');
          break;
        case 'filterByLanguage':
          vscode.commands.executeCommand('ccp.setLanguageFilter');
          break;
        case 'saveOptions':
          console.log('Saving options to global state:', message.options);
          await this.context.globalState.update('ccpOptions', message.options);
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
            overflow-y: hidden;
            height: auto;
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
            padding: 8px 12px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
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

          .trash-icon {
            background: url("data:image/svg+xml;charset=utf-8,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg' fill='white'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M10 3h3v1h-1v9l-1 1H4l-1-1V4H2V3h3V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zM9 2H6v1h3V2zM4 13h7V4H4v9zm2-8H5v7h1V5zm1 0h1v7H7V5zm2 0h1v7H9V5z'/%3E%3C/svg%3E") no-repeat center;
          }

          .files-icon {
            background: url("data:image/svg+xml;charset=utf-8,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg' fill='white'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M13.71 4.29l-3-3L10 1H4L3 2v12l1 1h9l1-1V5l-.29-.71zM13 14H4V2h5v3h4v9zm-7-7h5v1H6V7zm0 2h5v1H6V9zm0 2h5v1H6v-1z'/%3E%3C/svg%3E") no-repeat center;
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

          .actions-container {
            display: flex;
            flex-direction: column;
            height: auto;
          }

          /* Checkbox styles */
          .option-checkbox {
            display: flex;
            align-items: flex-start;
            margin: 6px 0;
            font-size: 12px;
            position: relative;
          }

          .option-checkbox input[type="checkbox"] {
            position: absolute;
            opacity: 0;
            cursor: pointer;
            height: 0;
            width: 0;
          }

          .checkmark {
            position: relative;
            display: inline-block;
            height: 12px;
            width: 12px;
            min-width: 12px;
            flex-shrink: 0;
            background-color: var(--vscode-editor-background);
            border: 1.5px solid var(--vscode-editor-foreground);
            border-radius: 50%;
            margin-right: 8px;
            margin-top: 2px;
            transition: all 0.2s ease;
            cursor: pointer;
          }

          .option-checkbox:hover input ~ .checkmark {
            background-color: var(--vscode-editor-selectionHighlightBackground);
          }

          .option-checkbox input:checked ~ .checkmark {
            background-color: #2ea043;
            border-color: #2ea043;
          }

          .checkmark:after {
            content: "";
            position: absolute;
            display: none;
          }

          .option-checkbox input:checked ~ .checkmark:after {
            display: block;
          }

          .option-checkbox .checkmark:after {
            left: 3.5px;
            top: 0.5px;
            width: 3px;
            height: 6px;
            border: solid white;
            border-width: 0 1.5px 1.5px 0;
            transform: rotate(45deg);
          }

          .option-checkbox label {
            cursor: pointer;
            user-select: none;
            line-height: 1.4;
            padding-left: 24px;
            margin-left: -24px;
          }
        </style>
      </head>
      <body>
        <div class="actions-container">
          <div class="section-label">CLEAN CODE</div>
          <div class="actions-panel">
            <button class="action-button" id="cleanCurrentFile">
              <span class="button-icon trash-icon"></span>
              Clean Current File
            </button>

            <button class="action-button" id="cleanMultipleFiles">
              <span class="button-icon files-icon"></span>
              Clean Multiple Files
            </button>

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
          </div>

          <div class="section-label">CONFIGURATIONS</div>
          <div class="actions-panel">
            <div class="option-checkbox">
              <input type="checkbox" id="createBackup" checked />
              <span class="checkmark"></span>
              <label for="createBackup">Create backup files</label>
            </div>

            <div class="option-checkbox">
              <input type="checkbox" id="preserveTodo" />
              <span class="checkmark"></span>
              <label for="preserveTodo">Preserve TODO & FIXME</label>
            </div>

            <div class="option-checkbox">
              <input type="checkbox" id="keepDocComments" />
              <span class="checkmark"></span>
              <label for="keepDocComments">Keep documentation</label>
            </div>

            <div class="option-checkbox">
              <input type="checkbox" id="forceProcess" />
              <span class="checkmark"></span>
              <label for="forceProcess">Process unknown types</label>
            </div>
          </div>
        </div>

        <script>
          const vscode = acquireVsCodeApi();

          // Load saved options from state
          const savedOptions = vscode.getState()?.options || {
            createBackup: true,
            preserveTodo: false,
            keepDocComments: false,
            forceProcess: false
          };

          // Initialize checkbox states
          document.getElementById('createBackup').checked = savedOptions.createBackup;
          document.getElementById('preserveTodo').checked = savedOptions.preserveTodo;
          document.getElementById('keepDocComments').checked = savedOptions.keepDocComments;
          document.getElementById('forceProcess').checked = savedOptions.forceProcess;

          // Update state when checkboxes change
          document.querySelectorAll('.option-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
              const options = {
                createBackup: document.getElementById('createBackup').checked,
                preserveTodo: document.getElementById('preserveTodo').checked,
                keepDocComments: document.getElementById('keepDocComments').checked,
                forceProcess: document.getElementById('forceProcess').checked
              };

              vscode.setState({ options });
              vscode.postMessage({
                command: 'saveOptions',
                options
              });
            });
          });

          // Checkbox circle click handler
          document.querySelectorAll('.checkmark').forEach(circle => {
            circle.addEventListener('click', () => {
              const checkbox = circle.previousElementSibling;
              checkbox.checked = !checkbox.checked;

              const event = new Event('change');
              checkbox.dispatchEvent(event);
            });
          });

          // Button click handlers
          document.getElementById('cleanCurrentFile').addEventListener('click', () => {
            const options = {
              createBackup: document.getElementById('createBackup').checked,
              preserveTodo: document.getElementById('preserveTodo').checked,
              keepDocComments: document.getElementById('keepDocComments').checked,
              forceProcess: document.getElementById('forceProcess').checked
            };

            vscode.postMessage({
              command: 'cleanCurrentFile',
              options
            });
          });

          document.getElementById('cleanMultipleFiles').addEventListener('click', () => {
            const options = {
              createBackup: document.getElementById('createBackup').checked,
              preserveTodo: document.getElementById('preserveTodo').checked,
              keepDocComments: document.getElementById('keepDocComments').checked,
              forceProcess: document.getElementById('forceProcess').checked
            };

            vscode.postMessage({
              command: 'cleanMultipleFiles',
              options
            });
          });

          document.getElementById('undoButton').addEventListener('click', () => {
            vscode.postMessage({ command: 'undo' });
          });

          document.getElementById('redoButton').addEventListener('click', () => {
            vscode.postMessage({ command: 'redo' });
          });

          // Set the view height to match content height to avoid scrolling
          window.addEventListener('load', () => {
            const contentHeight = document.querySelector('.actions-container').scrollHeight;
            vscode.postMessage({
              command: 'setHeight',
              height: contentHeight
            });
          });
        </script>
      </body>
    </html>`;
  }
}