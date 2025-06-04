import * as vscode from 'vscode';

/**
 * Webview provider for the sidebar configurations panel
 * Provides the UI for configuring comment cleaning operations
 */
export class ConfigurationsViewProvider implements vscode.WebviewViewProvider {
  /** Identifier for the webview */
  public static readonly viewType = 'ccpConfigurations';
  
  /**
   * Creates a new configurations view provider
   * @param extensionUri - URI of the extension directory
   * @param context - Extension context for state management
   */
  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly context: vscode.ExtensionContext
  ) {
    console.log('ConfigurationsViewProvider initialized with context:', this.context.extension.id);
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
      if (message.command === 'saveOptions') {
        console.log('Saving options to global state:', message.options);
        await this.context.globalState.update('ccpOptions', message.options);
      } else if (message.command === 'showTooltip') {
        // Use VS Code's native tooltip through hover provider
        vscode.window.showInformationMessage(message.text, { modal: false });
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
        <h3 class="section-header">Configuration Options</h3>
        
        <div class="option-checkbox">
          <input type="checkbox" id="createBackup" checked />
          <span class="checkmark"></span>
          <label for="createBackup" data-tooltip="Creates a backup (.bak) file before modifying the original">Create backup files</label>
        </div>
        
        <div class="option-checkbox">
          <input type="checkbox" id="preserveTodo" />
          <span class="checkmark"></span>
          <label for="preserveTodo" data-tooltip="Keeps comments containing TODO or FIXME keywords">Preserve TODO & FIXME comments</label>
        </div>
        
        <div class="option-checkbox">
          <input type="checkbox" id="keepDocComments" />
          <span class="checkmark"></span>
          <label for="keepDocComments" data-tooltip="Preserves documentation comments like JSDoc, XML comments, docstrings">Keep documentation comments</label>
        </div>
        
        <div class="option-checkbox">
          <input type="checkbox" id="forceProcess" />
          <span class="checkmark"></span>
          <label for="forceProcess" data-tooltip="Process files even when their language isn't explicitly supported">Force processing of unknown types</label>
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
          
          // Set up native VS Code tooltips
          document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.addEventListener('mouseover', (event) => {
              const tooltip = element.getAttribute('data-tooltip');
              if (tooltip) {
                vscode.postMessage({
                  command: 'showTooltip',
                  text: tooltip,
                  x: event.clientX,
                  y: event.clientY
                });
              }
            });
            
            element.addEventListener('mouseout', () => {
              vscode.postMessage({
                command: 'hideTooltip'
              });
            });
          });
          
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