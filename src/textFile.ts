import * as path from 'path';
import * as fs from 'fs';
import { visualText } from "./server";
import { exec } from 'child_process';
import { dirfuncs } from './dirfuncs';

export enum separatorType { SEP_UNKNOWN, SEP_R, SEP_RN, SEP_N }
export enum nlpFileType { UNKNOWN, SEQ, TXT, NLP, TXXT, TREE, LOG, KB, KBB, DICT, NLM }

export class TextFile {
    private filepath: string = '';
    private text: string = '';
    private textNormalized: string = '';
    private sepNormalized = '\n';
    private sepType: separatorType = separatorType.SEP_UNKNOWN;
    private sep: string = '';
    private lines = new Array();
    private linesNormalized = new Array();
    private filetype = nlpFileType.UNKNOWN;
    public basename: string = '';
    private nlpFileExts = new Array('unknown', 'seq', 'txt', 'nlp', 'txxt', 'tree', 'log', 'kb', 'kbb', 'dict', 'nlm');
    private exists: boolean = false;
    private selLines: string[] = [];
    public selStartLine: number = 0;
    public selEndLine: number = 0;

    constructor(filepath: string = '', separateLines: boolean = true, text: string = '') {
        if (text.length)
            this.setText(text, separateLines);
        else if (filepath.length)
            this.setFile(filepath,separateLines);
    }

    appendText(text: string) {
        this.text = this.text.concat(text);
    }

    saveFile() {
        fs.writeFileSync(this.filepath,this.getText(),{flag:'w+'});
    }

    saveFileLines() {
        let text = '';
        for (let line of this.lines) {
            if (text.length)
                text += this.sep;
            text += line;
        }
        fs.writeFileSync(this.filepath,text,{flag:'w+'});
    }

    sortLines(selFlag: boolean=false) {
        if (selFlag)
            this.selLines.sort(function (a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            });
        else
            this.lines.sort(function (a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            });
    }

    rollupLines(selFlag: boolean=false) {
        let lastLine = '';
        let deletes: number[] = new Array();
        let index: number = 0;

        if (selFlag) {
            for (let line of this.selLines) {
                if (line == lastLine || line.length == 0)
                    deletes.push(index);
                lastLine = line;
                index++;
            }
    
            for (let del of deletes.reverse()) {
                this.selLines.splice(del,1);
            }
        }
        else {
            for (let line of this.lines) {
                if (line == lastLine || line.length == 0)
                    deletes.push(index);
                lastLine = line;
                index++;
            }
    
            for (let del of deletes.reverse()) {
                this.lines.splice(del,1);
            }
        }
    }

    getExtension(type: nlpFileType): string {
        return this.nlpFileExts[type];
    }

    setStr(str: string, separateLines: boolean = true) {
        this.text = str;
        this.separation(separateLines);
    }

    setFile(file: string, separateLines: boolean = true): boolean {
        this.exists = false;
        this.clear();
        this.setFileType(this.filepath);
        this.filepath = file;

        if (file.length && fs.existsSync(file)) {
            this.text = fs.readFileSync(this.filepath, 'utf8');
            if (this.text.length)
                this.separation(separateLines);
            this.exists = true;
        }
        return this.exists;
    }

    isEmpty(): boolean {
        return this.filepath.length > 0 ? false : true;
    }

    setText(text: string, separateLines: boolean = true) {
        if (text.length) {
            this.text = text;
            this.separation(separateLines);
            this.exists = true;
        }
    }
    
	setFileType(filename: string) {
		this.basename = path.basename(filename, '.nlp');
        
        this.filetype = nlpFileType.NLP
        if (path.extname(filename) == '.seq')
            this.filetype = nlpFileType.SEQ;
        else if (path.extname(filename) == '.txt')
            this.filetype = nlpFileType.TXT;
		else if (path.extname(filename) == '.txxt')
			this.filetype = nlpFileType.TXXT;
		else if (path.extname(filename) == '.kb')
            this.filetype = nlpFileType.KB;
        else if (path.extname(filename) == '.kbb')
			this.filetype = nlpFileType.KBB;
		else if (path.extname(filename) == '.tree')
			this.filetype = nlpFileType.TREE;
		else if (path.extname(filename) == '.log')
			this.filetype = nlpFileType.LOG;
        else if (path.extname(filename) == '.dict')
			this.filetype = nlpFileType.DICT;
        else if (path.extname(filename) == '.nlm')
			this.filetype = nlpFileType.NLM;
    }

    fileExists(): boolean {
        return this.exists;
    }

    isFileType(type: nlpFileType): boolean {
        return type == this.filetype;
    }

	getFileType(): nlpFileType {
		return this.filetype;
	}
    
	getBasename(): string {
		return this.basename;
    }

    clear() {
        this.filepath = '';
        this.text = '';
        this.sepType = separatorType.SEP_UNKNOWN;
        this.sep = '';
        this.lines = [];
    }
    
    separation(separateLines: boolean=true) {
        if (this.text.length == 0)
            this.setFile(this.filepath,separateLines);

        if (this.text.length) {
            var counts_rn = this.text.split('\r\n');
            var counts_r = this.text.split('\r');
            var counts_n = this.text.split('\n');

            this.sepType = separatorType.SEP_UNKNOWN;
            this.sep = '';

            if (counts_rn.length > 1) {
                this.sepType = separatorType.SEP_RN;
                this.sep = '\r\n';
            } else if (counts_r.length > 1) {
                this.sepType = separatorType.SEP_R;
                this.sep = '\r';
            } else if (counts_n.length > 1) {
                this.sepType = separatorType.SEP_N;
                this.sep = '\n';
            }
            if (separateLines)
                this.separateLines();      
        }
    }

    normalizeText(): string {
        if (this.sepType == separatorType.SEP_RN) {
            const regReplace = new RegExp(this.sep, 'g');
            this.textNormalized = this.text.replace(regReplace, this.sepNormalized);            
        } else {
            this.textNormalized = this.text;
        }
        return this.textNormalized;
    }

    unnormalizeText(text: string): string {
        if (this.sepType == separatorType.SEP_RN) {
            const regReplace = new RegExp(this.sepNormalized, 'g');
            this.textNormalized = text.replace(regReplace, this.sep);            
        } else {
            this.textNormalized = text;
        }
        return this.textNormalized;
    }

    separateLines() {
        this.lines = [];
        if (this.sepType != separatorType.SEP_UNKNOWN && this.text.length) {
            this.lines = this.text.split(this.sep)
        } else if (this.text.length) {
            this.lines.push(this.text);
        }
    }

    getText(normalized: boolean = false): string {
        if (normalized) {
            if (this.textNormalized.length == 0) {
                this.normalizeText();
            }
            return this.textNormalized;
        }
        return this.text;
    }

    numberOfLines(): number {
        return this.lines.length;
    }

    getLines(normalized: boolean = false) {
        if (normalized) {
            if (this.linesNormalized.length == 0) {
                for (let line of this.lines) {
                    this.linesNormalized.push(line.concat(this.sepNormalized));
                }
            }
            return this.linesNormalized;
        }
        return this.lines;
    }

    getLine(lineNumber: number): string {
        return this.lines[lineNumber];
    }

    getSeparatorLength(): number {
        return this.sep.length;
    }

    getSeparator(): string {
        return this.sep;
    }
    
    getSeparatorNormalized(): string {
        return this.sep;
    }

    getStartLine(): number {
        return this.selStartLine;
    }

	anaFile(pass: number, type: nlpFileType = nlpFileType.TREE): string {
		var filename: string = 'ana';
		if (pass > 0) {
			if (pass < 10)
				filename = filename + '00';
			else if (pass < 100)
				filename = filename + '0';
			filename = filename + pass.toString() + '.' + this.getExtension(type);
		} else {
			filename = 'final.tree';
		}
		return visualText.analyzer.getOutputDirectory(filename);
    }

	hasFileType(filePath: string, pass: number, type: nlpFileType = nlpFileType.TREE): boolean {
        if (!fs.existsSync(filePath))
            return false;
		var anaFile = this.anaFile(pass,type);
		if (type == nlpFileType.TREE) {
			if (this.fileHasNLines(anaFile,6))
				return true;
			return false;
		}
		return fs.existsSync(anaFile);
	}

	fileHasNLines(filepath: string, max: number): boolean {
        if (!fs.existsSync(filepath))
            return false;
        const lineByLine = require('n-readlines');
        const liner = new lineByLine(filepath);
         
        let line;
        let lineNumber = 0;
        let found = false;
         
        while (line = liner.next()) {
            if (lineNumber++ >= max) {
                found = true;
                break;
            }
        }
        if (liner.next())
            liner.close();
        return found;
	}

	public readFirstLine(filepath: string): string {
        if (!fs.existsSync(filepath))
            return '';
        const lineByLine = require('n-readlines');
        const liner = new lineByLine(filepath);
         
        let line = '';
         
        while (line = liner.next()) {
            break;
        }

        if (liner.next())
            liner.close();
            
        return line.toString().trim();
	}

    replaceLineNumber(lineNum: number, text: string) {
        this.lines[lineNum] = text;
    }

    getNumLions(): number {
        return this.lines.length;
    }
}