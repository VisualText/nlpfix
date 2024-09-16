import * as path from "path";
import * as fs from "fs";
import { SequenceFile } from "./sequence";
import { visualText } from "./server";
import { dirfuncs } from "./dirfuncs";
import { TextFile, nlpFileType } from "./textFile";
import { genFileType } from "./treeFile";

export enum anaSubDir { UNKNOWN, INPUT, KB, LOGS, OUTPUT, SPEC };

export let analyzer: Analyzer;
export class Analyzer {

    public seqFile = new SequenceFile();
    private analyzerDir: string = '';
    private specDir: string = '';
    private inputDir: string = '';
    private outputDir: string = '';
    private kbDir: string = '';
    private logDir: string = '';
    private currentTextFile: string = '';
    private currentPassFile: string = '';
    private passNum: number = 0;
    private loaded: boolean = false;
    
    public hasLogs: boolean = false;
    public timerCounter: number = 0;
    public timerID: number = 0;
    public name: string = "";

	constructor() {
    }
    
    hasText(): boolean {
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

    public readDescription(filepath: string): string {
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

    genHightlightFile(fileType: genFileType = genFileType.TXXT): string {
        return this.seqFile.genHighlightFile(fileType);
    }

    setPassNum(num: number) {
        this.seqFile.setPassNum(num);
    }

    getPassNum(): number {
        return this.passNum;
    }

    getCurrentFile(): string {
        return this.currentTextFile;
    }

    saveCurrentFile(currentFile: string) {
        this.currentTextFile = currentFile;
        this.outputDirectory();
    }

    saveCurrentPass(passFile: string, passNum: number) {
        this.currentPassFile = passFile;
        this.passNum = passNum;
    }

    load(analyzerDir: string) {
        this.setWorkingDir(analyzerDir);
        this.seqFile.init();
    }

    outputDirectory(filename: string="") {
        let folder = filename;
        if (filename.length) {
            folder = path.join(filename + visualText.LOG_SUFFIX);
        } else if (this.currentTextFile.length) {
            folder = path.join(this.currentTextFile + visualText.LOG_SUFFIX);
        } else {
            folder = "output";
        }
        return path.join(this.analyzerDir,folder);
    }

    clearOutputDirectory() {
        if (fs.lstatSync(this.outputDir).isDirectory()) {
            fs.readdir(this.outputDir, (err, files) => {
                if (err) throw err;
            
                for (const file of files) {
                    fs.unlink(path.join(this.outputDir, file), err => {
                        if (err) throw err;
                    });
                }
            });            
        }
    }

    treeFile(name: string): string {
        if (this.logDir.length) {
            var pather = path.join(this.logDir,name);
            pather = pather.concat(".log");
            return pather;        
        }
        return '';
    }

    isLoaded(): boolean {
        return this.loaded;
    }

    setCurrentTextFile(filePath: string) {
        this.currentTextFile = filePath;
    }

    getAnalyzerDirectory(subDir: string=""): string {
        return path.join(this.analyzerDir,subDir);
    }

    getInputDirectory(): string {
        return this.inputDir;
    }

    getSpecDirectory(): string {
		return this.specDir;
	}

    getOutputDirectory(filename: string=""): string {
        if (filename.length)
            return path.join(visualText.analyzer.getOutputDirectory(),filename);
        return this.outputDir;
    }
    
    getLogDirectory(): string {
        return this.logDir;
    }

    getKBDirectory(): string {
        return this.kbDir;
    }

    getTextPath(): string {
        return this.currentTextFile;
    }

    getPassPath(): string {
        return this.currentPassFile;
    }

    getTreeFile(): string {
        const textFile = new TextFile();
        return textFile.anaFile(this.passNum, nlpFileType.TREE);
    }

    getName(): string {
        return this.name;
    }

    folderHasTests(folder: string): boolean {
        var files = dirfuncs.getFiles(folder);
        for (let testFile of files) {
            if (testFile.endsWith(visualText.TEST_SUFFIX))
                return true;
        }
        return false;
    }

    fileHasTests(file: string): boolean {
        var testFolder = file + visualText.TEST_SUFFIX;
        if (fs.existsSync(testFolder))
            return true;
        return false;
    }

	testFolder(filepath: string, outputDirFlag: boolean=false): string {
        var input = visualText.analyzer.getInputDirectory();
		var relPath = filepath.substring(input.length+1,filepath.length);
        if (outputDirFlag) {
            relPath = path.dirname(relPath);
            relPath = relPath.substring(0,relPath.length-4);
        }
        var folderName = relPath + visualText.TEST_SUFFIX;
		var testDir = path.join(input, folderName);
		return testDir;
	}

	setWorkingDir(directory: string) {
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

    constructDir(analyzerDir: string, dir: anaSubDir ): string {
        return path.join(analyzerDir,this.anaSubDirPath(dir));
    }

    anaSubDirPath(dir: anaSubDir ): string {
        let pathStr = "";
        switch (dir) {
            case anaSubDir.INPUT:
                pathStr = "input";
                break;
            case anaSubDir.KB:
                pathStr = path.join("kb", "user");
                break;
            case anaSubDir.SPEC:
                pathStr = visualText.ANALYZER_SEQUENCE_FOLDER;
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