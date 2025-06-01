import * as vscode from 'vscode';

/**
 * Webview provider for the sidebar buttons panel
 * Provides the UI for comment cleaning operations and configuration
 */
export class ButtonsViewProvider implements vscode.WebviewViewProvider {
  /** Identifier for the webview */
  public static readonly viewType = 'ccpButtons';
  
  /**
   * Creates a new buttons view provider
   * @param extensionUri - URI of the extension directory
   * @param context - Extension context for state management
   */
  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly context: vscode.ExtensionContext
  ) {
    console.log('ButtonsViewProvider initialized with context:', this.context.extension.id);
  }

  /**
   * Resolves the webview content
   * @param webviewView - The webview to populate
   */
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

  /**
   * Generates the HTML content for the webview
   * @param stylesUri - URI for the stylesheet
   * @returns HTML content as string
   */
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
            font-size: 12px;
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
          
          .options-container {
            margin-top: 12px;
            border-top: 1px solid var(--vscode-panel-border);
            padding-top: 8px;
          }
          
          .section-header {
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 8px;
            color: var(--vscode-foreground);
            user-select: none;
          }
          
          .option-checkbox {
            display: flex;
            align-items: flex-start;
            margin: 8px 0;
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
        
        <div class="options-container">
          <h3 class="section-header">Configurations</h3>
          
          <div class="option-checkbox">
            <input type="checkbox" id="createBackup" checked />
            <span class="checkmark"></span>
            <label for="createBackup">Create backup files</label>
          </div>
          
          <div class="option-checkbox">
            <input type="checkbox" id="preserveTodo" />
            <span class="checkmark"></span>
            <label for="preserveTodo">Preserve TODO & FIXME comments</label>
          </div>
          
          <div class="option-checkbox">
            <input type="checkbox" id="keepDocComments" />
            <span class="checkmark"></span>
            <label for="keepDocComments">Keep documentation comments</label>
          </div>
          
          <div class="option-checkbox">
            <input type="checkbox" id="forceProcess" />
            <span class="checkmark"></span>
            <label for="forceProcess">Force processing of unknown types</label>
          </div>
        </div>
        
        <script>
          const vscode = acquireVsCodeApi();
          
          const state = vscode.getState() || {
            createBackup: true,
            preserveTodo: false,
            keepDocComments: false,
            forceProcess: false
          };
          
          document.getElementById('createBackup').checked = state.createBackup;
          document.getElementById('preserveTodo').checked = state.preserveTodo;
          document.getElementById('keepDocComments').checked = state.keepDocComments;
          document.getElementById('forceProcess').checked = state.forceProcess;
          
          document.querySelectorAll('.option-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
              state[checkbox.id] = checkbox.checked;
              vscode.setState(state);
              
              vscode.postMessage({ 
                command: 'saveOptions',
                options: {
                  createBackup: document.getElementById('createBackup').checked,
                  preserveTodo: document.getElementById('preserveTodo').checked,
                  keepDocComments: document.getElementById('keepDocComments').checked,
                  forceProcess: document.getElementById('forceProcess').checked
                }
              });
            });
          });
          
          document.getElementById('cleanCurrentFile').addEventListener('click', () => {
            vscode.postMessage({ 
              command: 'cleanCurrentFile',
              options: {
                createBackup: document.getElementById('createBackup').checked,
                preserveTodo: document.getElementById('preserveTodo').checked,
                keepDocComments: document.getElementById('keepDocComments').checked,
                forceProcess: document.getElementById('forceProcess').checked
              }
            });
          });
          
          document.getElementById('cleanMultipleFiles').addEventListener('click', () => {
            vscode.postMessage({ 
              command: 'cleanMultipleFiles',
              options: {
                createBackup: document.getElementById('createBackup').checked,
                preserveTodo: document.getElementById('preserveTodo').checked,
                keepDocComments: document.getElementById('keepDocComments').checked,
                forceProcess: document.getElementById('forceProcess').checked
              }
            });
          });
          
          document.getElementById('undoButton').addEventListener('click', () => {
            vscode.postMessage({ command: 'undo' });
          });
          
          document.getElementById('redoButton').addEventListener('click', () => {
            vscode.postMessage({ command: 'redo' });
          });
          
          document.querySelectorAll('.checkmark').forEach(circle => {
            circle.addEventListener('click', () => {
              const checkbox = circle.previousElementSibling;
              checkbox.checked = !checkbox.checked;
              
              const event = new Event('change');
              checkbox.dispatchEvent(event);
            });
          });
        </script>
      </body>
    </html>`;
  }
}