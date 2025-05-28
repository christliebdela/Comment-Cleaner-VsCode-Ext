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
exports.runCcpScript = runCcpScript;
exports.executeCcp = executeCcp;
const cp = __importStar(require("child_process"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
function runCcpScript(filePath, noBackup, force) {
    return new Promise((resolve, reject) => {
        // Get path to the Python script, relative to extension directory
        const pythonScriptPath = path.join(__dirname, 'python', 'ccp.py');
        // Build command with proper arguments
        const args = [
            pythonScriptPath,
            filePath,
            noBackup ? '--no-backup' : '',
            force ? '--force' : '',
        ].filter(Boolean).map(arg => `"${arg}"`).join(' ');
        // Use Python to run the script
        const command = `python ${args}`;
        vscode.window.showInformationMessage(`Running: ${command}`);
        // Execute the command
        cp.exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${stderr || error.message}`);
            }
            else {
                resolve(stdout);
            }
        });
    });
}
function executeCcp(filePath, noBackup, force) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const output = yield runCcpScript(filePath, noBackup, force);
            // Log the output to the console
            console.log(output);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to run CCP: ${error}`);
            throw error;
        }
    });
}
