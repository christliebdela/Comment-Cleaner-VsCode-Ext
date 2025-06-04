import * as vscode from 'vscode';

/**
 * Interface for storing comment cleaning statistics
 */
export interface CCPStatistics {
    /** Total number of files processed */
    filesProcessed: number;
    /** Total comments removed across all files */
    totalComments: number;
    /** Total lines removed across all files */
    totalLines: number;
    /** Total bytes saved across all operations */
    totalSizeReduction: number;
    /** Average percentage of file size reduced */
    averageReductionPercent: number;
    /** Timestamp of last statistics update */
    lastUpdated: Date;
}

/**
 * Manages statistics tracking for the Comment Cleaner Pro extension
 * Uses singleton pattern to provide a central statistics repository
 */
export class StatisticsManager {
    private static instance: StatisticsManager;
    private stats: CCPStatistics;
    private context: vscode.ExtensionContext;
    private storageKey: string = 'ccpStatistics';
    private processedFiles: Set<string> = new Set(); // Track unique files

    /**
     * Creates a statistics manager instance
     * @param context - Extension context for persistent storage
     */
    private constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.stats = this.loadStats();
        
        // Load previously processed files from storage
        const savedFiles = this.context.globalState.get<string[]>('ccpProcessedFiles', []);
        this.processedFiles = new Set(savedFiles);
    }
    
    /**
     * Gets the singleton instance of the statistics manager
     * @param context - Extension context for persistent storage
     * @returns The statistics manager instance
     */
    public static getInstance(context: vscode.ExtensionContext): StatisticsManager {
        if (!StatisticsManager.instance) {
            StatisticsManager.instance = new StatisticsManager(context);
        }
        return StatisticsManager.instance;
    }
    
    /**
     * Loads statistics from persistent storage
     * @returns Statistics object from storage or defaults if none exist
     */
    private loadStats(): CCPStatistics {
        const defaultStats: CCPStatistics = {
            filesProcessed: 0,
            totalComments: 0,
            totalLines: 0,
            totalSizeReduction: 0,
            averageReductionPercent: 0,
            lastUpdated: new Date()
        };
        
        const savedStats = this.context.globalState.get<CCPStatistics>(this.storageKey);
        return savedStats || defaultStats;
    }
    
    /**
     * Saves current statistics to persistent storage
     */
    private saveStats(): void {
        this.context.globalState.update(this.storageKey, this.stats);
    }
    
    /**
     * Returns a copy of the current statistics
     * @returns Copy of the current statistics object
     */
    public getCurrentStats(): CCPStatistics {
        return { ...this.stats };
    }
    
    /**
     * Updates statistics with results from processed files
     * @param fileResults - Array of file processing results
     */
    public updateStats(fileResults: any[]): void {
        if (!fileResults || fileResults.length === 0) {
            console.log("No file results to update stats with");
            return;
        }
        
        console.log("Updating stats with:", JSON.stringify(fileResults, null, 2));
        
        // Check for missing properties
        fileResults.forEach((file, index) => {
            if (file.commentCount === undefined) console.log(`Warning: file[${index}].commentCount is undefined`);
            if (file.linesRemoved === undefined) console.log(`Warning: file[${index}].linesRemoved is undefined`);
            if (file.sizeReduction === undefined) console.log(`Warning: file[${index}].sizeReduction is undefined`);
        });
        
        const totalComments = fileResults.reduce((sum, file) => sum + (file.commentCount || 0), 0);
        const totalLines = fileResults.reduce((sum, file) => sum + (file.linesRemoved || 0), 0);
        const totalSize = fileResults.reduce((sum, file) => sum + (file.sizeReduction || 0), 0);
        
        console.log(`Stats summary: ${totalComments} comments, ${totalLines} lines, ${totalSize} bytes`);
        
        // Count only new unique files
        let newFilesCount = 0;
        fileResults.forEach(file => {
            if (file.filePath && !this.processedFiles.has(file.filePath)) {
                this.processedFiles.add(file.filePath);
                newFilesCount++;
            }
        });
        
        // Update processed files in storage
        this.context.globalState.update('ccpProcessedFiles', 
            Array.from(this.processedFiles));
        
        // Increment files processed count only for new unique files
        this.stats.filesProcessed += newFilesCount;
        
        // Always update other statistics
        this.stats.totalComments += totalComments;
        this.stats.totalLines += totalLines;
        this.stats.totalSizeReduction += totalSize;
        
        // Calculate weighted average reduction percentage
        if (totalSize > 0) {
            const weightedPercentage = fileResults.reduce((sum, file) => {
                if (file.sizePercentage > 0) {
                    return sum + (file.sizeReduction * file.sizePercentage);
                }
                return sum;
            }, 0) / totalSize;
            
            this.stats.averageReductionPercent = 
                ((this.stats.averageReductionPercent * (this.stats.filesProcessed - newFilesCount)) + 
                weightedPercentage) / this.stats.filesProcessed;
        }
        
        console.log("Updated stats:", this.stats);
        
        this.stats.lastUpdated = new Date();
        this.saveStats();
    }
    
    /**
     * Resets all statistics to default values
     */
    public resetStats(): void {
        this.stats = {
            filesProcessed: 0,
            totalComments: 0,
            totalLines: 0,
            totalSizeReduction: 0,
            averageReductionPercent: 0,
            lastUpdated: new Date()
        };
        
        // Clear the processed files set as well
        this.processedFiles.clear();
        this.context.globalState.update('ccpProcessedFiles', []);
        
        this.saveStats();
    }
}