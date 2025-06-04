import * as vscode from 'vscode';
import * as path from 'path';
import { executeCcp } from './ccpRunner';

export class FilesViewProvider implements vscode.TreeDataProvider<FileItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<FileItem | undefined | null | void> = new vscode.EventEmitter<FileItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<FileItem | undefined | null | void> = this._onDidChangeTreeData.event;

  private _languageFilter: string | undefined;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  setLanguageFilter(language: string | undefined) {
    this._languageFilter = language;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: FileItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: FileItem): Thenable<FileItem[]> {
    if (element) {
      return Promise.resolve([]);
    } else {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        return Promise.resolve([]);
      }

      const cleanCurrentItem = new FileItem(
        'Clean Current File',
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'ccp.cleanComments',
          title: 'Clean Current File'
        },
        undefined,
        true
      );
      cleanCurrentItem.iconPath = new vscode.ThemeIcon('trash');

      const cleanMultipleItem = new FileItem(
        'Clean Multiple Files',
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'ccp.cleanMultipleFiles',
          title: 'Clean Multiple Files'
        },
        undefined,
        true
      );
      cleanMultipleItem.iconPath = new vscode.ThemeIcon('files');

      return Promise.resolve([cleanCurrentItem, cleanMultipleItem]);
    }
  }
}

export class HistoryViewProvider implements vscode.TreeDataProvider<FileItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<FileItem | undefined | null | void> = new vscode.EventEmitter<FileItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<FileItem | undefined | null | void> = this._onDidChangeTreeData.event;
  private history: string[] = [];
  private _languageFilter: string | undefined;

  constructor() {
    this.history = [];
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  addToHistory(filePath: string): void {
    if (!this.history.includes(filePath)) {
      this.history.unshift(filePath);
    }
    this.refresh();
  }

  removeFromHistory(filePath: string): void {
    const index = this.history.indexOf(filePath);
    if (index !== -1) {
      this.history.splice(index, 1);
      this.refresh();
    }
  }

  setLanguageFilter(language: string | undefined) {
    this._languageFilter = language;
    this.refresh();
  }

  clearHistory(): void {
    this.history = [];
    this.refresh();
  }

  getTreeItem(element: FileItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: FileItem): Thenable<FileItem[]> {
    if (element) {
      return Promise.resolve([]);
    } else {
      if (this.history.length === 0) {
        return Promise.resolve([
          new FileItem('No files cleaned yet', vscode.TreeItemCollapsibleState.None)
        ]);
      }

      const items: FileItem[] = [];

      const filterItem = new FileItem(
        'Filter by Language',
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'ccp.setLanguageFilter',
          title: 'Filter by Language'
        },
        undefined,
        true
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

      console.log(`Filter: ${this._languageFilter}, Files in history: ${this.history.length}, Files after filter: ${filteredHistory.length}`);
      console.log(`File extensions in history: ${this.history.map(f => path.extname(f)).join(', ')}`);

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
      this.description = "";
      this.tooltip = command?.title || label;
    } else {
      this.description = filePath ? path.dirname(filePath) : '';
    }

    if (label === 'Clean Current File') {
      this.iconPath = new vscode.ThemeIcon('trash');
      this.contextValue = 'buttonItem';
    } else if (label === 'Clean Multiple Files') {
      this.iconPath = new vscode.ThemeIcon('files');
      this.contextValue = 'buttonItem';
    } else if (label === 'Filter by Language') {
      this.iconPath = new vscode.ThemeIcon('filter');
      this.contextValue = 'buttonItem';
    } else if (label === 'Compare with Backup') {
      this.iconPath = new vscode.ThemeIcon('split-horizontal');
      this.contextValue = 'buttonItem';
    } else if (label === 'Restore from Backup') {
      this.iconPath = new vscode.ThemeIcon('history');
      this.contextValue = 'buttonItem';
    } else if (label === 'Remove from History') {
      this.iconPath = new vscode.ThemeIcon('trash');
      this.contextValue = 'buttonItem';
    } else {
      if (filePath) {

        this.iconPath = getFileIcon(filePath);
        this.contextValue = 'historyItem';
      }
    }
  }
}

function identifyLanguage(extension: string): string {

  if (extension.startsWith('.')) {
    extension = extension.substring(1);
  }

  const extensionMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascriptreact',
    'ts': 'typescript',
    'tsx': 'typescriptreact',
    'py': 'python',
    'html': 'html',
    'css': 'css',
    'c': 'c',
    'cpp': 'cpp',
    'cc': 'cpp',
    'cxx': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    'java': 'java',
    'rb': 'ruby',
    'go': 'go',
    'php': 'php',
    'sql': 'sql',
    'swift': 'swift',
    'rs': 'rust',
    'kt': 'kotlin',
    'sh': 'shellscript',
    'bash': 'shellscript',
    'ps1': 'powershell',
    'lua': 'lua',
    'pl': 'perl',
    'pm': 'perl',
    'yaml': 'yaml',
    'yml': 'yaml',
    'hs': 'haskell',
    'dart': 'dart',
    'm': 'matlab',
    'r': 'r',
    'cs': 'csharp'
  };

  return extensionMap[extension.toLowerCase()] || 'plaintext';
}

function getFileIcon(filePath: string): vscode.ThemeIcon {

  return new vscode.ThemeIcon('file-code');
}