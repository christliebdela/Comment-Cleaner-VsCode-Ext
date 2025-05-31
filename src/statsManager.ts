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
            return;
        }
        
        const totalComments = fileResults.reduce((sum, file) => sum + file.commentCount, 0);
        const totalLines = fileResults.reduce((sum, file) => sum + file.linesRemoved, 0);
        const totalSize = fileResults.reduce((sum, file) => sum + file.sizeReduction, 0);
        
        // Don't update stats for dry runs
        if (fileResults[0].dryRun) {
            return;
        }
        
        this.stats.filesProcessed += fileResults.length;
        this.stats.totalComments += totalComments;
        this.stats.totalLines += totalLines;
        this.stats.totalSizeReduction += totalSize;
        
        // Calculate weighted average reduction percentage
        const totalOriginalSize = fileResults.reduce((sum, file) => 
            sum + (file.sizeReduction / (file.sizePercentage / 100)), 0);
            
        if (totalOriginalSize > 0) {
            this.stats.averageReductionPercent = 
                ((this.stats.averageReductionPercent * (this.stats.filesProcessed - fileResults.length)) + 
                (totalSize / totalOriginalSize * 100)) / this.stats.filesProcessed;
        }
        
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