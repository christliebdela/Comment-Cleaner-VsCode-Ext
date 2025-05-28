import * as vscode from 'vscode';
import * as path from 'path';
import { executeCcp } from './ccpRunner';

export class FilesViewProvider implements vscode.TreeDataProvider<FileItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<FileItem | undefined | null | void> = new vscode.EventEmitter<FileItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<FileItem | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(): void {
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
        }
      );

      const cleanMultipleItem = new FileItem(
        'Clean Multiple Files',
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'ccp.cleanMultipleFiles',
          title: 'Clean Multiple Files'
        }
      );

      return Promise.resolve([cleanCurrentItem, cleanMultipleItem]);
    }
  }
}

export class HistoryViewProvider implements vscode.TreeDataProvider<FileItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<FileItem | undefined | null | void> = new vscode.EventEmitter<FileItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<FileItem | undefined | null | void> = this._onDidChangeTreeData.event;
  private history: string[] = [];

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

      return Promise.resolve(
        this.history.map(file => {
          const filename = path.basename(file);
          return new FileItem(
            filename,
            vscode.TreeItemCollapsibleState.None,
            {
              command: 'vscode.open',
              title: 'Open File',
              arguments: [vscode.Uri.file(file)]
            },
            file
          );
        })
      );
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
  }
}