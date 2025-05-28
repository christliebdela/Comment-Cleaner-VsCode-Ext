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
        'Clean Current File',  // Remove the $(trash) prefix
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'ccp.cleanComments',
          title: 'Clean Current File'
        }
      );
      cleanCurrentItem.iconPath = new vscode.ThemeIcon('trash');

      const cleanMultipleItem = new FileItem(
        'Clean Multiple Files',  // Remove the $(files) prefix
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'ccp.cleanMultipleFiles',
          title: 'Clean Multiple Files'
        }
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

  // Add this property
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
      if (this.history.length > 10) {
        this.history.pop();
      }
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

  // Add this method
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

      // Add the filter option as the first item
      const items: FileItem[] = [];
      
      // Add filter option at top
      const filterItem = new FileItem(
        'Filter by Language',  // Remove the $(filter) prefix
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'ccp.setLanguageFilter',
          title: 'Filter by Language'
        }
      );
      filterItem.iconPath = new vscode.ThemeIcon('filter');
      items.push(filterItem);

      // Filter history items by language if filter is active
      const filteredHistory = this._languageFilter 
        ? this.history.filter(file => {
            const ext = path.extname(file).toLowerCase();
            // Map extension to language and check if it matches filter
            return identifyLanguage(ext) === this._languageFilter;
          })
        : this.history;

      // Add filtered history items
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
        // Add this line:
        item.contextValue = 'historyItem';
        items.push(item);
      });
      
      return Promise.resolve(items);
    }
  }
}

class FileItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command,
    public readonly filePath?: string
  ) {
    super(label, collapsibleState);
    this.tooltip = filePath || label;
    this.description = filePath ? path.dirname(filePath) : '';
    
    // Add appropriate icons based on the action type
    if (label === 'Clean Current File') {
      this.iconPath = new vscode.ThemeIcon('trash');
    } else if (label === 'Clean Multiple Files') {
      this.iconPath = new vscode.ThemeIcon('files');
    } else if (label === 'Filter by Language') {
      this.iconPath = new vscode.ThemeIcon('filter');
    } else if (label === 'Preview Comment Removal') {
      this.iconPath = new vscode.ThemeIcon('eye');
    } else if (label.startsWith('Compare with')) {
      this.iconPath = new vscode.ThemeIcon('split-horizontal');
    } else if (label.startsWith('Restore from')) {
      this.iconPath = new vscode.ThemeIcon('history');
    } else {
      // For file entries in history
      if (filePath) {
        this.iconPath = vscode.ThemeIcon.File;
      }
    }
  }
}

// Helper function to map extensions to languages
function identifyLanguage(extension: string): string {
  const extensionMap: {[key: string]: string} = {
    '.py': 'python',
    '.html': 'html', '.htm': 'html',
    '.css': 'css',
    // Add other mappings as needed
  };
  return extensionMap[extension] || 'unknown';
}