import * as vscode from 'vscode';

export interface CCPStatistics {
    filesProcessed: number;
    totalComments: number;
    totalLines: number;
    totalSizeReduction: number;
    averageReductionPercent: number;
    lastUpdated: Date;
}

export class StatisticsManager {
    private static instance: StatisticsManager;
    private stats: CCPStatistics;
    private readonly storageKey = 'ccp-statistics';
    
    private constructor(private context: vscode.ExtensionContext) {
        this.stats = this.loadStats();
    }
    
    public static getInstance(context: vscode.ExtensionContext): StatisticsManager {
        if (!StatisticsManager.instance) {
            StatisticsManager.instance = new StatisticsManager(context);
        }
        return StatisticsManager.instance;
    }
    
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
    
    private saveStats(): void {
        this.context.globalState.update(this.storageKey, this.stats);
    }
    
    public getCurrentStats(): CCPStatistics {
        return { ...this.stats };
    }
    
    public updateStats(fileResults: any[]): void {
        if (!fileResults || fileResults.length === 0) {
            console.log("No file results to update stats with");
            return;
        }
        
        // Enhanced debugging
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
        
        this.stats.filesProcessed += fileResults.length;
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
                ((this.stats.averageReductionPercent * (this.stats.filesProcessed - fileResults.length)) + 
                weightedPercentage) / this.stats.filesProcessed;
        }
        
        console.log("Updated stats:", this.stats);
        
        this.stats.lastUpdated = new Date();
        this.saveStats();
    }
    
    public resetStats(): void {
        this.stats = {
            filesProcessed: 0,
            totalComments: 0,
            totalLines: 0,
            totalSizeReduction: 0,
            averageReductionPercent: 0,
            lastUpdated: new Date()
        };
        this.saveStats();
    }
}