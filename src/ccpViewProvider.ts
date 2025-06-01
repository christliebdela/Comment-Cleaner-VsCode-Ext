import * as vscode from 'vscode';
import * as path from 'path';
import { executeCcp } from './ccpRunner';

/**
 * Tree view provider for file operations in the sidebar
 * Provides actions for cleaning individual and multiple files
 */
export class FilesViewProvider implements vscode.TreeDataProvider<FileItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<FileItem | undefined | null | void> = new vscode.EventEmitter<FileItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<FileItem | undefined | null | void> = this._onDidChangeTreeData.event;

  private _languageFilter: string | undefined;

  /**
   * Refreshes the tree view
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * Sets a language filter for the tree view
   * @param language - Language identifier to filter by, or undefined to clear filter
   */
  setLanguageFilter(language: string | undefined) {
    this._languageFilter = language;
    this._onDidChangeTreeData.fire();
  }

  /**
   * Returns the tree item for a given element
   * @param element - The item to display
   * @returns The tree item for display
   */
  getTreeItem(element: FileItem): vscode.TreeItem {
    return element;
  }

  /**
   * Gets child items for a tree element
   * @param element - Parent element, or undefined for root
   * @returns Promise resolving with child items
   */
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

/**
 * Tree view provider for processed file history
 * Maintains a list of previously cleaned files and provides filtering capabilities
 */
export class HistoryViewProvider implements vscode.TreeDataProvider<FileItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<FileItem | undefined | null | void> = new vscode.EventEmitter<FileItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<FileItem | undefined | null | void> = this._onDidChangeTreeData.event;
  private history: string[] = [];
  private _languageFilter: string | undefined;

  constructor() {
    this.history = [];
  }

  /**
   * Refreshes the history view
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * Adds a file to the history
   * @param filePath - Path of file to add to history
   */
  addToHistory(filePath: string): void {
    if (!this.history.includes(filePath)) {
      this.history.unshift(filePath);
    }
    this.refresh();
  }

  /**
   * Removes a file from the history
   * @param filePath - Path of file to remove from history
   */
  removeFromHistory(filePath: string): void {
    const index = this.history.indexOf(filePath);
    if (index !== -1) {
      this.history.splice(index, 1);
      this.refresh();
    }
  }

  /**
   * Sets a language filter for the history view
   * @param language - Language identifier to filter by, or undefined to clear filter
   */
  setLanguageFilter(language: string | undefined) {
    this._languageFilter = language;
    this.refresh();
  }

  /**
   * Clears the entire history
   */
  clearHistory(): void {
    this.history = [];
    this.refresh();
  }

  /**
   * Returns the tree item for a given element
   * @param element - The item to display
   * @returns The tree item for display
   */
  getTreeItem(element: FileItem): vscode.TreeItem {
    return element;
  }

  /**
   * Gets child items for a tree element
   * @param element - Parent element, or undefined for root
   * @returns Promise resolving with child items
   */
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
      filterItem.description = '';
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
        items.push(item);
      });
      
      return Promise.resolve(items);
    }
  }
}

/**
 * Tree item representing a file or action in the sidepanel views
 */
class FileItem extends vscode.TreeItem {
  /**
   * Creates a new file item
   * @param label - Display name of the item
   * @param collapsibleState - Whether item can be expanded
   * @param command - Command to execute when item is clicked
   * @param filePath - Path to the file (for history items)
   * @param isButton - Whether this item represents an action button
   */
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command,
    public readonly filePath?: string,
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
        this.iconPath = vscode.ThemeIcon.File;
        this.contextValue = 'historyItem';
      }
    }
  }
}

/**
 * Maps file extensions to programming language identifiers
 * @param extension - File extension including dot (e.g. ".js")
 * @returns Language identifier string
 */
function identifyLanguage(extension: string): string {
  const extensionMap: {[key: string]: string} = {
    '.py': 'python',
    '.html': 'html', '.htm': 'html',
    '.css': 'css',
    // Add other mappings as needed
  };
  return extensionMap[extension] || 'unknown';
}