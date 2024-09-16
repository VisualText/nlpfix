"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Analyzer = exports.analyzer = exports.anaSubDir = void 0;
var path = require("path");
var fs = require("fs");
var sequence_1 = require("./sequence");
var server_1 = require("./server");
var dirfuncs_1 = require("./dirfuncs");
var textFile_1 = require("./textFile");
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
var Analyzer = /** @class */ (function () {
    function Analyzer() {
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
    ;
    Analyzer.prototype.hasText = function () {
        return this.currentTextFile.length ? true : false;
    };
    Analyzer.prototype.zeroAnalyzer = function () {
        this.analyzerDir = '';
        this.specDir = '';
        this.inputDir = '';
        this.outputDir = '';
        this.kbDir = '';
        this.currentTextFile = '';
        this.name = "";
        this.passNum = 0;
        this.loaded = false;
    };
    Analyzer.prototype.readDescription = function (filepath) {
        if (!fs.existsSync(filepath))
            return "";
        var lineByLine = require("n-readlines");
        var liner = new lineByLine(filepath);
        var line = "";
        var l = "";
        var count = 0;
        while (line = liner.next()) {
            l = line.toString().trim();
            if (count > 0 && l.length > 5)
                break;
            count++;
        }
        if (liner.next())
            liner.close();
        return l;
    };
    Analyzer.prototype.getCurrentFile = function () {
        return this.currentTextFile;
    };
    Analyzer.prototype.saveCurrentFile = function (currentFile) {
        this.currentTextFile = currentFile;
        this.outputDirectory();
    };
    Analyzer.prototype.saveCurrentPass = function (passFile, passNum) {
        this.currentPassFile = passFile;
        this.passNum = passNum;
    };
    Analyzer.prototype.load = function (analyzerDir) {
        this.setWorkingDir(analyzerDir);
        this.seqFile.init();
    };
    Analyzer.prototype.outputDirectory = function () {
        if (this.currentTextFile.length > 2) {
            this.outputDir = this.currentTextFile + server_1.visualText.LOG_SUFFIX;
        }
        else {
            this.outputDir = path.join(this.analyzerDir, "output");
        }
    };
    Analyzer.prototype.clearOutputDirectory = function () {
        var _this = this;
        if (fs.lstatSync(this.outputDir).isDirectory()) {
            fs.readdir(this.outputDir, function (err, files) {
                if (err)
                    throw err;
                for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                    var file = files_1[_i];
                    fs.unlink(path.join(_this.outputDir, file), function (err) {
                        if (err)
                            throw err;
                    });
                }
            });
        }
    };
    Analyzer.prototype.treeFile = function (name) {
        if (this.logDir.length) {
            var pather = path.join(this.logDir, name);
            pather = pather.concat(".log");
            return pather;
        }
        return '';
    };
    Analyzer.prototype.isLoaded = function () {
        return this.loaded;
    };
    Analyzer.prototype.setCurrentTextFile = function (filePath) {
        this.currentTextFile = filePath;
    };
    Analyzer.prototype.getAnalyzerDirectory = function (subDir) {
        if (subDir === void 0) { subDir = ""; }
        return path.join(this.analyzerDir, subDir);
    };
    Analyzer.prototype.getInputDirectory = function () {
        return this.inputDir;
    };
    Analyzer.prototype.getSpecDirectory = function () {
        return this.specDir;
    };
    Analyzer.prototype.getOutputDirectory = function (filename) {
        if (filename === void 0) { filename = ""; }
        if (filename.length)
            return path.join(server_1.visualText.analyzer.getOutputDirectory(), filename);
        return this.outputDir;
    };
    Analyzer.prototype.getLogDirectory = function () {
        return this.logDir;
    };
    Analyzer.prototype.getKBDirectory = function () {
        return this.kbDir;
    };
    Analyzer.prototype.getTextPath = function () {
        return this.currentTextFile;
    };
    Analyzer.prototype.getPassPath = function () {
        return this.currentPassFile;
    };
    Analyzer.prototype.getTreeFile = function () {
        var textFile = new textFile_1.TextFile();
        return textFile.anaFile(this.passNum, textFile_1.nlpFileType.TREE);
    };
    Analyzer.prototype.getName = function () {
        return this.name;
    };
    Analyzer.prototype.folderHasTests = function (folder) {
        var files = dirfuncs_1.dirfuncs.getFiles(folder);
        for (var _i = 0, files_2 = files; _i < files_2.length; _i++) {
            var testFile = files_2[_i];
            if (testFile.endsWith(server_1.visualText.TEST_SUFFIX))
                return true;
        }
        return false;
    };
    Analyzer.prototype.fileHasTests = function (file) {
        var testFolder = file + server_1.visualText.TEST_SUFFIX;
        if (fs.existsSync(testFolder))
            return true;
        return false;
    };
    Analyzer.prototype.testFolder = function (filepath, outputDirFlag) {
        if (outputDirFlag === void 0) { outputDirFlag = false; }
        var input = server_1.visualText.analyzer.getInputDirectory();
        var relPath = filepath.substring(input.length + 1, filepath.length);
        if (outputDirFlag) {
            relPath = path.dirname(relPath);
            relPath = relPath.substring(0, relPath.length - 4);
        }
        var folderName = relPath + server_1.visualText.TEST_SUFFIX;
        var testDir = path.join(input, folderName);
        return testDir;
    };
    Analyzer.prototype.setWorkingDir = function (directory) {
        this.analyzerDir = directory;
        if (fs.existsSync(directory)) {
            this.name = path.basename(directory);
            this.specDir = this.constructDir(directory, anaSubDir.SPEC);
            ;
            this.inputDir = this.constructDir(directory, anaSubDir.INPUT);
            this.kbDir = this.constructDir(directory, anaSubDir.KB);
            this.logDir = this.constructDir(directory, anaSubDir.LOGS);
            this.loaded = true;
        }
        else
            this.loaded = false;
    };
    Analyzer.prototype.constructDir = function (analyzerDir, dir) {
        return path.join(analyzerDir, this.anaSubDirPath(dir));
    };
    Analyzer.prototype.anaSubDirPath = function (dir) {
        var pathStr = "";
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
    };
    Analyzer.prototype.getAnalyzerConverting = function () {
        return this.getAnalyzerConverting;
    };
    return Analyzer;
}());
exports.Analyzer = Analyzer;
