"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectAndProcessFiles = selectAndProcessFiles;
const vscode = __importStar(require("vscode"));
const ccpRunner_1 = require("./ccpRunner");
function selectAndProcessFiles(historyProvider) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get pattern from user
        const pattern = yield vscode.window.showInputBox({
            placeHolder: 'File pattern (e.g., *.js, src/**/*.py)',
            prompt: 'Enter a glob pattern to match files'
        });
        if (!pattern) {
            return;
        }
        // Find files matching the pattern
        const files = yield vscode.workspace.findFiles(pattern);
        if (files.length === 0) {
            vscode.window.showWarningMessage(`No files found matching pattern: ${pattern}`);
            return;
        }
        // Ask about backup creation
        const backup = yield vscode.window.showQuickPick(['Yes', 'No'], {
            placeHolder: 'Create backup files?'
        });
        const noBackup = backup === 'No';
        // Ask about force processing for unknown file types
        const force = yield vscode.window.showQuickPick(['Yes', 'No'], {
            placeHolder: 'Force processing of unknown file types?'
        });
        const forceProcess = force === 'Yes';
        // Process each file
        const progress = yield vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Removing comments from ${files.length} files`,
            cancellable: true
        }, (progress, token) => __awaiter(this, void 0, void 0, function* () {
            let processed = 0;
            for (const file of files) {
                if (token.isCancellationRequested) {
                    break;
                }
                try {
                    yield (0, ccpRunner_1.executeCcp)(file.fsPath, noBackup, forceProcess);
                    // Add to history if provider exists
                    if (historyProvider) {
                        historyProvider.addToHistory(file.fsPath);
                    }
                    processed++;
                    progress.report({
                        increment: 100 / files.length,
                        message: `${processed}/${files.length} files processed`
                    });
                }
                catch (error) {
                    console.error(`Error processing ${file.fsPath}:`, error);
                }
            }
            return processed;
        }));
        vscode.window.showInformationMessage(`Successfully processed ${progress} of ${files.length} files`);
    });
}
