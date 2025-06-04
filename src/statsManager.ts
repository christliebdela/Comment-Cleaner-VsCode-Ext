import * as vscode from 'vscode';

export interface CCPStatistics {

    filesProcessed: number;

    totalComments: number;

    totalLines: number;

    totalSizeReduction: number;

    averageReductionPercent: number;

    lastUpdated: Date;

    fileStats: Map<string, FileSpecificStats>;
}

export interface FileSpecificStats {

    commentCount: number;

    linesRemoved: number;

    sizeReduction: number;

    sizePercentage: number;

    lastUpdated: Date;

    filePath: string;
}

export class StatisticsManager {
    private static instance: StatisticsManager;
    private stats: CCPStatistics;
    private context: vscode.ExtensionContext;
    private storageKey: string = 'ccpStatistics';
    private processedFiles: Set<string> = new Set();

    private constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.stats = this.loadStats();

        const savedFiles = this.context.globalState.get<string[]>('ccpProcessedFiles', []);
        this.processedFiles = new Set(savedFiles);
    }

    private loadStats(): CCPStatistics {
        const savedStats = this.context.globalState.get<any>(this.storageKey);

        if (savedStats) {

            const fileStats = new Map<string, FileSpecificStats>();
            if (savedStats.fileStats) {
                Object.keys(savedStats.fileStats).forEach(filePath => {
                    fileStats.set(filePath, {
                        ...savedStats.fileStats[filePath],
                        lastUpdated: new Date(savedStats.fileStats[filePath].lastUpdated)
                    });
                });
            }

            return {
                filesProcessed: savedStats.filesProcessed || 0,
                totalComments: savedStats.totalComments || 0,
                totalLines: savedStats.totalLines || 0,
                totalSizeReduction: savedStats.totalSizeReduction || 0,
                averageReductionPercent: savedStats.averageReductionPercent || 0,
                lastUpdated: savedStats.lastUpdated ? new Date(savedStats.lastUpdated) : new Date(),
                fileStats: fileStats
            };
        }

        return {
            filesProcessed: 0,
            totalComments: 0,
            totalLines: 0,
            totalSizeReduction: 0,
            averageReductionPercent: 0,
            lastUpdated: new Date(),
            fileStats: new Map<string, FileSpecificStats>()
        };
    }

    private saveStats(): void {

        const fileStatsObj: { [key: string]: FileSpecificStats } = {};
        this.stats.fileStats.forEach((value, key) => {
            fileStatsObj[key] = value;
        });

        const statsToSave = {
            ...this.stats,
            fileStats: fileStatsObj
        };

        this.context.globalState.update(this.storageKey, statsToSave);
    }

    public static getInstance(context: vscode.ExtensionContext): StatisticsManager {
        if (!StatisticsManager.instance) {
            StatisticsManager.instance = new StatisticsManager(context);
        }
        return StatisticsManager.instance;
    }

    public getCurrentStats(): CCPStatistics {
        return { ...this.stats };
    }

    public getFileStats(filePath: string): FileSpecificStats | undefined {
        return this.stats.fileStats.get(filePath);
    }

    public updateStats(fileResults: any[]): void {
        if (!fileResults || fileResults.length === 0) {
            console.log("No file results to update stats with");
            return;
        }

        console.log("Updating stats with:", JSON.stringify(fileResults, null, 2));

        fileResults.forEach((file, index) => {
            if (file.commentCount === undefined) console.log(`Warning: file[${index}].commentCount is undefined`);
            if (file.linesRemoved === undefined) console.log(`Warning: file[${index}].linesRemoved is undefined`);
            if (file.sizeReduction === undefined) console.log(`Warning: file[${index}].sizeReduction is undefined`);
        });

        const totalComments = fileResults.reduce((sum, file) => sum + (file.commentCount || 0), 0);
        const totalLines = fileResults.reduce((sum, file) => sum + (file.linesRemoved || 0), 0);
        const totalSize = fileResults.reduce((sum, file) => sum + (file.sizeReduction || 0), 0);

        console.log(`Stats summary: ${totalComments} comments, ${totalLines} lines, ${totalSize} bytes`);

        let newFilesCount = 0;

        fileResults.forEach(file => {
            if (file.filePath) {

                this.stats.fileStats.set(file.filePath, {
                    commentCount: file.commentCount || 0,
                    linesRemoved: file.linesRemoved || 0,
                    sizeReduction: file.sizeReduction || 0,
                    sizePercentage: file.sizePercentage || 0,
                    lastUpdated: new Date(),
                    filePath: file.filePath
                });

                if (!this.processedFiles.has(file.filePath)) {
                    this.processedFiles.add(file.filePath);
                    newFilesCount++;
                }
            }
        });

        this.context.globalState.update('ccpProcessedFiles',
            Array.from(this.processedFiles));

        this.stats.filesProcessed += newFilesCount;

        this.stats.totalComments += totalComments;
        this.stats.totalLines += totalLines;
        this.stats.totalSizeReduction += totalSize;

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

    public resetStats(): void {
        this.stats = {
            filesProcessed: 0,
            totalComments: 0,
            totalLines: 0,
            totalSizeReduction: 0,
            averageReductionPercent: 0,
            lastUpdated: new Date(),
            fileStats: new Map<string, FileSpecificStats>()
        };

        this.processedFiles.clear();
        this.context.globalState.update('ccpProcessedFiles', []);

        this.saveStats();
    }
}