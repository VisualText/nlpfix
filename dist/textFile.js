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
exports.TextFile = exports.nlpFileType = exports.separatorType = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const server_1 = require("./server");
var separatorType;
(function (separatorType) {
    separatorType[separatorType["SEP_UNKNOWN"] = 0] = "SEP_UNKNOWN";
    separatorType[separatorType["SEP_R"] = 1] = "SEP_R";
    separatorType[separatorType["SEP_RN"] = 2] = "SEP_RN";
    separatorType[separatorType["SEP_N"] = 3] = "SEP_N";
})(separatorType || (exports.separatorType = separatorType = {}));
var nlpFileType;
(function (nlpFileType) {
    nlpFileType[nlpFileType["UNKNOWN"] = 0] = "UNKNOWN";
    nlpFileType[nlpFileType["SEQ"] = 1] = "SEQ";
    nlpFileType[nlpFileType["TXT"] = 2] = "TXT";
    nlpFileType[nlpFileType["NLP"] = 3] = "NLP";
    nlpFileType[nlpFileType["TXXT"] = 4] = "TXXT";
    nlpFileType[nlpFileType["TREE"] = 5] = "TREE";
    nlpFileType[nlpFileType["LOG"] = 6] = "LOG";
    nlpFileType[nlpFileType["KB"] = 7] = "KB";
    nlpFileType[nlpFileType["KBB"] = 8] = "KBB";
    nlpFileType[nlpFileType["DICT"] = 9] = "DICT";
    nlpFileType[nlpFileType["NLM"] = 10] = "NLM";
})(nlpFileType || (exports.nlpFileType = nlpFileType = {}));
class TextFile {
    constructor(filepath = '', separateLines = true, text = '') {
        this.filepath = '';
        this.text = '';
        this.textNormalized = '';
        this.sepNormalized = '\n';
        this.sepType = separatorType.SEP_UNKNOWN;
        this.sep = '';
        this.lines = new Array();
        this.linesNormalized = new Array();
        this.filetype = nlpFileType.UNKNOWN;
        this.basename = '';
        this.nlpFileExts = new Array('unknown', 'seq', 'txt', 'nlp', 'txxt', 'tree', 'log', 'kb', 'kbb', 'dict', 'nlm');
        this.exists = false;
        this.selLines = [];
        this.selStartLine = 0;
        this.selEndLine = 0;
        if (text.length)
            this.setText(text, separateLines);
        else if (filepath.length)
            this.setFile(filepath, separateLines);
    }
    appendText(text) {
        this.text = this.text.concat(text);
    }
    saveFile() {
        fs.writeFileSync(this.filepath, this.getText(), { flag: 'w+' });
    }
    saveFileLines() {
        let text = '';
        for (let line of this.lines) {
            if (text.length)
                text += this.sep;
            text += line;
        }
        fs.writeFileSync(this.filepath, text, { flag: 'w+' });
    }
    sortLines(selFlag = false) {
        if (selFlag)
            this.selLines.sort(function (a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            });
        else
            this.lines.sort(function (a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            });
    }
    rollupLines(selFlag = false) {
        let lastLine = '';
        let deletes = new Array();
        let index = 0;
        if (selFlag) {
            for (let line of this.selLines) {
                if (line == lastLine || line.length == 0)
                    deletes.push(index);
                lastLine = line;
                index++;
            }
            for (let del of deletes.reverse()) {
                this.selLines.splice(del, 1);
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
                this.lines.splice(del, 1);
            }
        }
    }
    getExtension(type) {
        return this.nlpFileExts[type];
    }
    setStr(str, separateLines = true) {
        this.text = str;
        this.separation(separateLines);
    }
    setFile(file, separateLines = true) {
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
    isEmpty() {
        return this.filepath.length > 0 ? false : true;
    }
    setText(text, separateLines = true) {
        if (text.length) {
            this.text = text;
            this.separation(separateLines);
            this.exists = true;
        }
    }
    setFileType(filename) {
        this.basename = path.basename(filename, '.nlp');
        this.filetype = nlpFileType.NLP;
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
    fileExists() {
        return this.exists;
    }
    isFileType(type) {
        return type == this.filetype;
    }
    getFileType() {
        return this.filetype;
    }
    getBasename() {
        return this.basename;
    }
    clear() {
        this.filepath = '';
        this.text = '';
        this.sepType = separatorType.SEP_UNKNOWN;
        this.sep = '';
        this.lines = [];
    }
    separation(separateLines = true) {
        if (this.text.length == 0)
            this.setFile(this.filepath, separateLines);
        if (this.text.length) {
            var counts_rn = this.text.split('\r\n');
            var counts_r = this.text.split('\r');
            var counts_n = this.text.split('\n');
            this.sepType = separatorType.SEP_UNKNOWN;
            this.sep = '';
            if (counts_rn.length > 1) {
                this.sepType = separatorType.SEP_RN;
                this.sep = '\r\n';
            }
            else if (counts_r.length > 1) {
                this.sepType = separatorType.SEP_R;
                this.sep = '\r';
            }
            else if (counts_n.length > 1) {
                this.sepType = separatorType.SEP_N;
                this.sep = '\n';
            }
            if (separateLines)
                this.separateLines();
        }
    }
    normalizeText() {
        if (this.sepType == separatorType.SEP_RN) {
            const regReplace = new RegExp(this.sep, 'g');
            this.textNormalized = this.text.replace(regReplace, this.sepNormalized);
        }
        else {
            this.textNormalized = this.text;
        }
        return this.textNormalized;
    }
    unnormalizeText(text) {
        if (this.sepType == separatorType.SEP_RN) {
            const regReplace = new RegExp(this.sepNormalized, 'g');
            this.textNormalized = text.replace(regReplace, this.sep);
        }
        else {
            this.textNormalized = text;
        }
        return this.textNormalized;
    }
    separateLines() {
        this.lines = [];
        if (this.sepType != separatorType.SEP_UNKNOWN && this.text.length) {
            this.lines = this.text.split(this.sep);
        }
        else if (this.text.length) {
            this.lines.push(this.text);
        }
    }
    getText(normalized = false) {
        if (normalized) {
            if (this.textNormalized.length == 0) {
                this.normalizeText();
            }
            return this.textNormalized;
        }
        return this.text;
    }
    numberOfLines() {
        return this.lines.length;
    }
    getLines(normalized = false) {
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
    getLine(lineNumber) {
        return this.lines[lineNumber];
    }
    getSeparatorLength() {
        return this.sep.length;
    }
    getSeparator() {
        return this.sep;
    }
    getSeparatorNormalized() {
        return this.sep;
    }
    getStartLine() {
        return this.selStartLine;
    }
    anaFile(pass, type = nlpFileType.TREE) {
        var filename = 'ana';
        if (pass > 0) {
            if (pass < 10)
                filename = filename + '00';
            else if (pass < 100)
                filename = filename + '0';
            filename = filename + pass.toString() + '.' + this.getExtension(type);
        }
        else {
            filename = 'final.tree';
        }
        return server_1.visualText.analyzer.getOutputDirectory(filename);
    }
    hasFileType(filePath, pass, type = nlpFileType.TREE) {
        if (!fs.existsSync(filePath))
            return false;
        var anaFile = this.anaFile(pass, type);
        if (type == nlpFileType.TREE) {
            if (this.fileHasNLines(anaFile, 6))
                return true;
            return false;
        }
        return fs.existsSync(anaFile);
    }
    fileHasNLines(filepath, max) {
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
    readFirstLine(filepath) {
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
    replaceLineNumber(lineNum, text) {
        this.lines[lineNum] = text;
    }
}
exports.TextFile = TextFile;
