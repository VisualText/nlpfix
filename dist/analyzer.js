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
exports.Analyzer = exports.analyzer = exports.anaSubDir = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const sequence_1 = require("./sequence");
const server_1 = require("./server");
const dirfuncs_1 = require("./dirfuncs");
const textFile_1 = require("./textFile");
const treeFile_1 = require("./treeFile");
var anaSubDir;
(function (anaSubDir) {
    anaSubDir[anaSubDir["UNKNOWN"] = 0] = "UNKNOWN";
    anaSubDir[anaSubDir["INPUT"] = 1] = "INPUT";
    anaSubDir[anaSubDir["KB"] = 2] = "KB";
    anaSubDir[anaSubDir["LOGS"] = 3] = "LOGS";
    anaSubDir[anaSubDir["OUTPUT"] = 4] = "OUTPUT";
    anaSubDir[anaSubDir["SPEC"] = 5] = "SPEC";
})(anaSubDir || (exports.anaSubDir = anaSubDir = {}));
;
class Analyzer {
    constructor() {
        this.seqFile = new sequence_1.SequenceFile();
        this.analyzerDir = '';
        this.specDir = '';
        this.inputDir = '';
        this.outputDir = '';
        this.kbDir = '';
        this.logDir = '';
        this.currentTextFile = '';
        this.currentPassFile = '';
        this.passNum = 0;
        this.loaded = false;
        this.hasLogs = false;
        this.timerCounter = 0;
        this.timerID = 0;
        this.name = "";
    }
    hasText() {
        return this.currentTextFile.length ? true : false;
    }
    zeroAnalyzer() {
        this.analyzerDir = '';
        this.specDir = '';
        this.inputDir = '';
        this.outputDir = '';
        this.kbDir = '';
        this.currentTextFile = '';
        this.name = "";
        this.passNum = 0;
        this.loaded = false;
    }
    readDescription(filepath) {
        if (!fs.existsSync(filepath))
            return "";
        const lineByLine = require("n-readlines");
        const liner = new lineByLine(filepath);
        let line = "";
        let l = "";
        let count = 0;
        while (line = liner.next()) {
            l = line.toString().trim();
            if (count > 0 && l.length > 5)
                break;
            count++;
        }
        if (liner.next())
            liner.close();
        return l;
    }
    genHightlightFile(fileType = treeFile_1.genFileType.TXXT) {
        return this.seqFile.genHighlightFile(fileType);
    }
    setPassNum(num) {
        this.seqFile.setPassNum(num);
    }
    getPassNum() {
        return this.passNum;
    }
    getCurrentFile() {
        return this.currentTextFile;
    }
    saveCurrentFile(currentFile) {
        this.currentTextFile = currentFile;
        this.outputDirectory();
    }
    saveCurrentPass(passFile, passNum) {
        this.currentPassFile = passFile;
        this.passNum = passNum;
    }
    load(analyzerDir) {
        this.setWorkingDir(analyzerDir);
        this.seqFile.init();
    }
    outputDirectory(filename = "") {
        let folder = filename;
        if (filename.length) {
            folder = path.join(filename + server_1.visualText.LOG_SUFFIX);
        }
        else if (this.currentTextFile.length) {
            folder = path.join(this.currentTextFile + server_1.visualText.LOG_SUFFIX);
        }
        else {
            folder = "output";
        }
        return path.join(this.analyzerDir, folder);
    }
    clearOutputDirectory() {
        if (fs.lstatSync(this.outputDir).isDirectory()) {
            fs.readdir(this.outputDir, (err, files) => {
                if (err)
                    throw err;
                for (const file of files) {
                    fs.unlink(path.join(this.outputDir, file), err => {
                        if (err)
                            throw err;
                    });
                }
            });
        }
    }
    treeFile(name) {
        if (this.logDir.length) {
            var pather = path.join(this.logDir, name);
            pather = pather.concat(".log");
            return pather;
        }
        return '';
    }
    isLoaded() {
        return this.loaded;
    }
    setCurrentTextFile(filePath) {
        this.currentTextFile = filePath;
    }
    getAnalyzerDirectory(subDir = "") {
        return path.join(this.analyzerDir, subDir);
    }
    getInputDirectory() {
        return this.inputDir;
    }
    getSpecDirectory() {
        return this.specDir;
    }
    getOutputDirectory(filename = "") {
        if (filename.length)
            return path.join(server_1.visualText.analyzer.getOutputDirectory(), filename);
        return this.outputDir;
    }
    getLogDirectory() {
        return this.logDir;
    }
    getKBDirectory() {
        return this.kbDir;
    }
    getTextPath() {
        return this.currentTextFile;
    }
    getPassPath() {
        return this.currentPassFile;
    }
    getTreeFile() {
        const textFile = new textFile_1.TextFile();
        return textFile.anaFile(this.passNum, textFile_1.nlpFileType.TREE);
    }
    getName() {
        return this.name;
    }
    folderHasTests(folder) {
        var files = dirfuncs_1.dirfuncs.getFiles(folder);
        for (let testFile of files) {
            if (testFile.endsWith(server_1.visualText.TEST_SUFFIX))
                return true;
        }
        return false;
    }
    fileHasTests(file) {
        var testFolder = file + server_1.visualText.TEST_SUFFIX;
        if (fs.existsSync(testFolder))
            return true;
        return false;
    }
    testFolder(filepath, outputDirFlag = false) {
        var input = server_1.visualText.analyzer.getInputDirectory();
        var relPath = filepath.substring(input.length + 1, filepath.length);
        if (outputDirFlag) {
            relPath = path.dirname(relPath);
            relPath = relPath.substring(0, relPath.length - 4);
        }
        var folderName = relPath + server_1.visualText.TEST_SUFFIX;
        var testDir = path.join(input, folderName);
        return testDir;
    }
    setWorkingDir(directory) {
        this.analyzerDir = directory;
        if (fs.existsSync(directory)) {
            this.name = path.basename(directory);
            this.specDir = this.constructDir(directory, anaSubDir.SPEC);
            this.inputDir = this.constructDir(directory, anaSubDir.INPUT);
            this.kbDir = this.constructDir(directory, anaSubDir.KB);
            this.logDir = this.constructDir(directory, anaSubDir.LOGS);
            this.loaded = true;
        }
        else
            this.loaded = false;
    }
    constructDir(analyzerDir, dir) {
        return path.join(analyzerDir, this.anaSubDirPath(dir));
    }
    anaSubDirPath(dir) {
        let pathStr = "";
        switch (dir) {
            case anaSubDir.INPUT:
                pathStr = "input";
                break;
            case anaSubDir.KB:
                pathStr = path.join("kb", "user");
                break;
            case anaSubDir.SPEC:
                pathStr = server_1.visualText.ANALYZER_SEQUENCE_FOLDER;
                break;
            case anaSubDir.LOGS:
                pathStr = "logs";
                break;
            case anaSubDir.OUTPUT:
                pathStr = "output";
                break;
        }
        return pathStr;
    }
    getAnalyzerConverting() {
        return this.getAnalyzerConverting;
    }
}
exports.Analyzer = Analyzer;
