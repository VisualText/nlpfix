import * as path from 'path';
import * as fs from 'fs';
import { dirfuncs } from './dirfuncs';
import { Analyzer } from './analyzer';

export class VisualText {
    public readonly LOG_SUFFIX = '_log';
    public readonly TEST_SUFFIX = '_test';
    public readonly EXTENSION_NAME = 'dehilster.nlp';
    public readonly NLP_EXE = 'nlp.exe';
    public readonly ICU1_WIN = 'icudt74.dll';
    public readonly ICU2_WIN = 'icuuc74.dll';
    public readonly NLPENGINE_FILES_ASSET = 'nlpengine.zip';
    public readonly NLPENGINE_REPO = 'nlp-engine';
    public readonly VISUALTEXT_FILES_REPO = 'visualtext-files';
    public readonly ANALYZERS_REPO = 'analyzers';
    public readonly VISUALTEXT_FILES_ASSET = 'visualtext.zip';
    public readonly ANALYZERS_ASSET = 'analyzers.zip';
    public readonly ANALYZER_SEQUENCE_FILE = 'analyzer.seq';
    public readonly ANALYZER_SEQUENCE_FOLDER = 'spec';
    public readonly GITHUB_REPOSITORY = 'https://github.com/VisualText/';
    public readonly GITHUB_RELEASE_LATEST = '/releases/latest/';
    public readonly GITHUB_RELEASE_LATEST_DOWNLOAD = '/releases/latest/download/';
    public readonly GITHUB_ENGINE_LATEST_RELEASE = this.GITHUB_REPOSITORY + this.NLPENGINE_REPO + this.GITHUB_RELEASE_LATEST_DOWNLOAD;
    public readonly GITHUB_ENGINE_LATEST_VERSION = this.GITHUB_REPOSITORY + this.NLPENGINE_REPO + this.GITHUB_RELEASE_LATEST;
    public readonly GITHUB_VISUALTEXT_FILES_LATEST_VERSION = this.GITHUB_REPOSITORY + this.VISUALTEXT_FILES_REPO + this.GITHUB_RELEASE_LATEST;
    public readonly GITHUB_ANALYZERS_LATEST_VERSION = this.GITHUB_REPOSITORY + this.ANALYZERS_REPO + this.GITHUB_RELEASE_LATEST;

    public analyzer = new Analyzer();

    public version: string = '';
    public engineVersion: string = '';
    public exeEngineVersion: string = '';
    public repoEngineVersion: string = '';
    public vtFilesVersion: string = '';
    public repoVTFilesVersion: string = ''
    public analyzersVersion: string = '';;
    public repoAnalyzersVersion: string = '';
    public askModify: boolean = false;
    public processID: number = 0;
    public stopAll: boolean = false;
    public debug: boolean = false;
    public fastAnswered: boolean = false;

    private autoUpdateFlag: undefined | boolean = false;
    private platform: string = '';
    private homeDir: string = '';
    private username: string = '';
    private analyzers: string[] = new Array();

    private analyzerDir: string = ''
    private currentAnalyzer: string = '';

	constructor() {
    }

    getCurrentAnalyzer(): string {
        return this.currentAnalyzer;
    }
    
    getCurrentAnalyzerName(): string {
        return this.analyzer.getName();
    }

    hasAnalyzers(): boolean {
        return this.analyzers.length ? true : false;
    }

    getAnalyzerDir(): string {
        return this.analyzerDir;
    }

    getAnalyzers(testForLogs: boolean): string[] {
        if (this.analyzerDir.length) {
            this.analyzers = [];
            this.getAnalyzersRecursive(testForLogs,this.analyzerDir);
        }
        return this.analyzers;
    }
    
    getAnalyzersRecursive(testForLogs: boolean, dir: string) {
        if (dir.length && fs.existsSync(dir)) {
            var anas: string[] = [];
            anas = dirfuncs.getDirectories(dir);
            for (let ana of anas) {
                if (this.isAnalyzerDirectory(ana)) {
                    if (!testForLogs || dirfuncs.analyzerHasLogFiles(ana))
                        this.analyzers.push(ana);
                } else {
                    this.getAnalyzersRecursive(testForLogs,ana);
                }
            }
        }
    }

    isAnalyzerDirectory(dirPath: string): boolean {
        var dirs = dirfuncs.getDirectories(dirPath);
        var spec = false;
        var kb = false;
        var input = false;

        for (let dir of dirs) {
            if (path.basename(dir).localeCompare(this.ANALYZER_SEQUENCE_FOLDER) == 0) {
                spec = true;
            }
            else if (path.basename(dir).localeCompare('kb') == 0) {
                kb = true;
            }
            else if (path.basename(dir).localeCompare('input') == 0) {
                input = true;
            }
        }

        return spec && kb && input;
    }

    hasLogFiles(dirPath: string): boolean {
        var dirs = dirfuncs.getDirectories(dirPath);
        var spec = false;
        var kb = false;
        var input = false;
        var output = false;
        var logs = false;

        for (let dir of dirs) {
            let dirname = path.basename(dir);
            if (dirname.localeCompare(this.ANALYZER_SEQUENCE_FOLDER) == 0) {
                spec = true;
            }
            else if (dirname.localeCompare('kb') == 0) {
                kb = true;
            }
            else if (dirname.localeCompare('input') == 0) {
                input = true;
            }
            else if (dirname == 'output' && dirfuncs.hasFiles(dir)) {
                output = true;
            }
            else if (dirname == 'logs' && dirfuncs.hasFiles(dir)) {
                logs = true;
            }
        }

        return spec && kb && input && output && logs;
    }

    fileIconFromExt(filepath: string): string {
        let filename = path.basename(filepath);

        let icon = 'file.svg';
        if (filename.endsWith('.tree')) {
            icon = 'tree.svg';
        } else if (filename.endsWith('.log')) {
            icon = 'log.svg';
        } else if (filename.endsWith('.nlp') || filename.endsWith('.pat')) {
            icon = 'nlp.svg';
        } else if (filename.endsWith('.dict')) {
            icon = 'dict.svg';
        } else if (filename == 'main.kb') {
            icon = 'kb-main.svg';
        } else if (filename.endsWith('.kbb')) {
            icon = 'kbb.svg';
        } else if (filename.endsWith('.kb')) {
            icon = 'kb.svg';
        } else if (filename.endsWith('.txxt')) {
            icon = 'symbol-keyword.svg';
        } else if (filename.endsWith('.dict')) {
            icon = 'dict.svg';
        } else if (filename.endsWith('.nlm')) {
            icon = 'mod.svg';
        } else if (filename.endsWith('.test')) {
            icon = 'test.svg';
        } else if (filename.endsWith('.py')) {
            icon = 'python.svg';
        } else {
            icon = 'file.svg';
        }

        return icon;
    }
}
