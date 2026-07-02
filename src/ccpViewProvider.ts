import * as vscode from 'vscode';
import * as path from 'path';

const HISTORY_STORAGE_KEY = 'ccpFileHistory';
const MAX_HISTORY = 200;

export class FilesViewProvider implements vscode.TreeDataProvider<FileItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<FileItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: FileItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: FileItem): Thenable<FileItem[]> {
    if (element) { return Promise.resolve([]); }

    const cleanCurrentItem = new FileItem(
      'Clean Current File',
      vscode.TreeItemCollapsibleState.None,
      { command: 'ccp.cleanComments', title: 'Clean Current File' },
      undefined, true
    );
    cleanCurrentItem.iconPath = new vscode.ThemeIcon('trash');

    const cleanMultipleItem = new FileItem(
      'Clean Multiple Files',
      vscode.TreeItemCollapsibleState.None,
      { command: 'ccp.cleanMultipleFiles', title: 'Clean Multiple Files (Pattern)' },
      undefined, true
    );
    cleanMultipleItem.iconPath = new vscode.ThemeIcon('files');

    return Promise.resolve([cleanCurrentItem, cleanMultipleItem]);
  }
}

export class HistoryViewProvider implements vscode.TreeDataProvider<FileItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<FileItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private history: string[] = [];
  private _languageFilter: string | undefined;
  private _context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this._context = context;
    this.history = context.globalState.get<string[]>(HISTORY_STORAGE_KEY, []);
  }

  private _persist(): void {
    this._context.globalState.update(HISTORY_STORAGE_KEY, this.history.slice(0, MAX_HISTORY));
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  addToHistory(filePath: string): void {
    // Move to front if already present
    const idx = this.history.indexOf(filePath);
    if (idx !== -1) { this.history.splice(idx, 1); }
    this.history.unshift(filePath);
    if (this.history.length > MAX_HISTORY) {
      this.history = this.history.slice(0, MAX_HISTORY);
    }
    this._persist();
    this.refresh();
  }

  removeFromHistory(filePath: string): void {
    const index = this.history.indexOf(filePath);
    if (index !== -1) {
      this.history.splice(index, 1);
      this._persist();
      this.refresh();
    }
  }

  setLanguageFilter(language: string | undefined): void {
    this._languageFilter = language;
    this.refresh();
  }

  clearHistory(): void {
    this.history = [];
    this._persist();
    this.refresh();
  }

  getTreeItem(element: FileItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: FileItem): Thenable<FileItem[]> {
    if (element) { return Promise.resolve([]); }

    if (this.history.length === 0) {
      return Promise.resolve([
        new FileItem('No files cleaned yet', vscode.TreeItemCollapsibleState.None)
      ]);
    }

    const items: FileItem[] = [];

    const filterItem = new FileItem(
      'Filter by Language',
      vscode.TreeItemCollapsibleState.None,
      { command: 'ccp.setLanguageFilter', title: 'Filter by Language' },
      undefined, true
    );
    filterItem.iconPath = new vscode.ThemeIcon('filter');
    filterItem.contextValue = 'buttonItem';
    filterItem.tooltip = 'Filter history by programming language';
    filterItem.description = this._languageFilter ? `(${this._languageFilter})` : '';
    items.push(filterItem);

    const filteredHistory = this._languageFilter
      ? this.history.filter(file => {
          const ext = path.extname(file).toLowerCase();
          return identifyLanguage(ext) === this._languageFilter;
        })
      : this.history;

    filteredHistory.forEach(file => {
      const filename = path.basename(file);
      const item = new FileItem(
        filename,
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'vscode.open',
          title: 'Open File',
          arguments: [vscode.Uri.file(file)]
        },
        file
      );
      item.contextValue = 'historyItem';
      item.tooltip = file;
      item.description = path.dirname(file);
      items.push(item);
    });

    if (filteredHistory.length === 0 && this.history.length > 0) {
      items.push(new FileItem(
        `No ${this._languageFilter} files in history`,
        vscode.TreeItemCollapsibleState.None
      ));
    }

    return Promise.resolve(items);
  }
}

class FileItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command,
    public filePath?: string,
    public readonly isButton: boolean = false
  ) {
    super(label, collapsibleState);
    this.tooltip = filePath || label;

    if (isButton) {
      this.description = '';
      this.tooltip = command?.title || label;
    } else {
      this.description = filePath ? path.dirname(filePath) : '';
    }

    if (filePath) {
      this.iconPath = new vscode.ThemeIcon('file-code');
      this.contextValue = 'historyItem';
    }
  }
}

function identifyLanguage(extension: string): string {
  if (extension.startsWith('.')) { extension = extension.substring(1); }

  const extensionMap: Record<string, string> = {
    'js': 'javascript', 'jsx': 'javascript', 'mjs': 'javascript', 'cjs': 'javascript',
    'ts': 'typescript', 'tsx': 'typescript', 'mts': 'typescript', 'cts': 'typescript',
    'py': 'python',
    'html': 'html', 'htm': 'html',
    'css': 'css', 'scss': 'scss', 'sass': 'scss',
    'c': 'c', 'h': 'c',
    'cpp': 'cpp', 'cc': 'cpp', 'cxx': 'cpp', 'hpp': 'cpp',
    'java': 'java',
    'rb': 'ruby',
    'go': 'go',
    'php': 'php',
    'sql': 'sql',
    'swift': 'swift',
    'rs': 'rust',
    'kt': 'kotlin', 'kts': 'kotlin',
    'sh': 'bash', 'bash': 'bash', 'zsh': 'bash',
    'ps1': 'powershell', 'psm1': 'powershell',
    'lua': 'lua',
    'pl': 'perl', 'pm': 'perl',
    'yaml': 'yaml', 'yml': 'yaml',
    'hs': 'haskell',
    'dart': 'dart',
    'm': 'matlab',
    'r': 'r',
    'cs': 'csharp',
    'tf': 'hcl', 'hcl': 'hcl',
    'toml': 'toml',
    'graphql': 'graphql', 'gql': 'graphql',
    'vue': 'vue',
    'svelte': 'svelte',
    'mdx': 'mdx',
  };

  return extensionMap[extension.toLowerCase()] || 'plaintext';
}