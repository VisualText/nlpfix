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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisualText = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const dirfuncs_1 = require("./dirfuncs");
const analyzer_1 = require("./analyzer");
class VisualText {
    ;
    constructor() {
        this.LOG_SUFFIX = '_log';
        this.TEST_SUFFIX = '_test';
        this.EXTENSION_NAME = 'dehilster.nlp';
        this.NLP_EXE = 'nlp.exe';
        this.ICU1_WIN = 'icudt74.dll';
        this.ICU2_WIN = 'icuuc74.dll';
        this.NLPENGINE_FILES_ASSET = 'nlpengine.zip';
        this.NLPENGINE_REPO = 'nlp-engine';
        this.VISUALTEXT_FILES_REPO = 'visualtext-files';
        this.ANALYZERS_REPO = 'analyzers';
        this.VISUALTEXT_FILES_ASSET = 'visualtext.zip';
        this.ANALYZERS_ASSET = 'analyzers.zip';
        this.ANALYZER_SEQUENCE_FILE = 'analyzer.seq';
        this.ANALYZER_SEQUENCE_FOLDER = 'spec';
        this.GITHUB_REPOSITORY = 'https://github.com/VisualText/';
        this.GITHUB_RELEASE_LATEST = '/releases/latest/';
        this.GITHUB_RELEASE_LATEST_DOWNLOAD = '/releases/latest/download/';
        this.GITHUB_ENGINE_LATEST_RELEASE = this.GITHUB_REPOSITORY + this.NLPENGINE_REPO + this.GITHUB_RELEASE_LATEST_DOWNLOAD;
        this.GITHUB_ENGINE_LATEST_VERSION = this.GITHUB_REPOSITORY + this.NLPENGINE_REPO + this.GITHUB_RELEASE_LATEST;
        this.GITHUB_VISUALTEXT_FILES_LATEST_VERSION = this.GITHUB_REPOSITORY + this.VISUALTEXT_FILES_REPO + this.GITHUB_RELEASE_LATEST;
        this.GITHUB_ANALYZERS_LATEST_VERSION = this.GITHUB_REPOSITORY + this.ANALYZERS_REPO + this.GITHUB_RELEASE_LATEST;
        this.analyzer = new analyzer_1.Analyzer();
        this.version = '';
        this.engineVersion = '';
        this.exeEngineVersion = '';
        this.repoEngineVersion = '';
        this.vtFilesVersion = '';
        this.repoVTFilesVersion = '';
        this.analyzersVersion = '';
        this.repoAnalyzersVersion = '';
        this.askModify = false;
        this.processID = 0;
        this.stopAll = false;
        this.debug = false;
        this.fastAnswered = false;
        this.autoUpdateFlag = false;
        this.platform = '';
        this.homeDir = '';
        this.username = '';
        this.analyzers = new Array();
        this.analyzerDir = '';
        this.currentAnalyzer = '';
    }
    getCurrentAnalyzer() {
        return this.currentAnalyzer;
    }
    getCurrentAnalyzerName() {
        return this.analyzer.getName();
    }
    hasAnalyzers() {
        return this.analyzers.length ? true : false;
    }
    getAnalyzerDir() {
        return this.analyzerDir;
    }
    getAnalyzers(testForLogs) {
        if (this.analyzerDir.length) {
            this.analyzers = [];
            this.getAnalyzersRecursive(testForLogs, this.analyzerDir);
        }
        return this.analyzers;
    }
    getAnalyzersRecursive(testForLogs, dir) {
        if (dir.length && fs.existsSync(dir)) {
            var anas = [];
            anas = dirfuncs_1.dirfuncs.getDirectories(dir);
            for (let ana of anas) {
                if (this.isAnalyzerDirectory(ana)) {
                    if (!testForLogs || dirfuncs_1.dirfuncs.analyzerHasLogFiles(ana))
                        this.analyzers.push(ana);
                }
                else {
                    this.getAnalyzersRecursive(testForLogs, ana);
                }
            }
        }
    }
    isAnalyzerDirectory(dirPath) {
        var dirs = dirfuncs_1.dirfuncs.getDirectories(dirPath);
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
    hasLogFiles(dirPath) {
        var dirs = dirfuncs_1.dirfuncs.getDirectories(dirPath);
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
            else if (dirname == 'output' && dirfuncs_1.dirfuncs.hasFiles(dir)) {
                output = true;
            }
            else if (dirname == 'logs' && dirfuncs_1.dirfuncs.hasFiles(dir)) {
                logs = true;
            }
        }
        return spec && kb && input && output && logs;
    }
    fileIconFromExt(filepath) {
        let filename = path.basename(filepath);
        let icon = 'file.svg';
        if (filename.endsWith('.tree')) {
            icon = 'tree.svg';
        }
        else if (filename.endsWith('.log')) {
            icon = 'log.svg';
        }
        else if (filename.endsWith('.nlp') || filename.endsWith('.pat')) {
            icon = 'nlp.svg';
        }
        else if (filename.endsWith('.dict')) {
            icon = 'dict.svg';
        }
        else if (filename == 'main.kb') {
            icon = 'kb-main.svg';
        }
        else if (filename.endsWith('.kbb')) {
            icon = 'kbb.svg';
        }
        else if (filename.endsWith('.kb')) {
            icon = 'kb.svg';
        }
        else if (filename.endsWith('.txxt')) {
            icon = 'symbol-keyword.svg';
        }
        else if (filename.endsWith('.dict')) {
            icon = 'dict.svg';
        }
        else if (filename.endsWith('.nlm')) {
            icon = 'mod.svg';
        }
        else if (filename.endsWith('.test')) {
            icon = 'test.svg';
        }
        else if (filename.endsWith('.py')) {
            icon = 'python.svg';
        }
        else {
            icon = 'file.svg';
        }
        return icon;
    }
}
exports.VisualText = VisualText;
