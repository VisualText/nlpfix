"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextFile = exports.nlpFileType = exports.separatorType = void 0;
var path = require("path");
var fs = require("fs");
var server_1 = require("./server");
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
var TextFile = /** @class */ (function () {
    function TextFile(filepath, separateLines, text) {
        if (filepath === void 0) { filepath = ''; }
        if (separateLines === void 0) { separateLines = true; }
        if (text === void 0) { text = ''; }
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
    TextFile.prototype.appendText = function (text) {
        this.text = this.text.concat(text);
    };
    TextFile.prototype.saveFile = function () {
        fs.writeFileSync(this.filepath, this.getText(), { flag: 'w+' });
    };
    TextFile.prototype.saveFileLines = function () {
        var text = '';
        for (var _i = 0, _a = this.lines; _i < _a.length; _i++) {
            var line = _a[_i];
            if (text.length)
                text += this.sep;
            text += line;
        }
        fs.writeFileSync(this.filepath, text, { flag: 'w+' });
    };
    TextFile.prototype.sortLines = function (selFlag) {
        if (selFlag === void 0) { selFlag = false; }
        if (selFlag)
            this.selLines.sort(function (a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            });
        else
            this.lines.sort(function (a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            });
    };
    TextFile.prototype.rollupLines = function (selFlag) {
        if (selFlag === void 0) { selFlag = false; }
        var lastLine = '';
        var deletes = new Array();
        var index = 0;
        if (selFlag) {
            for (var _i = 0, _a = this.selLines; _i < _a.length; _i++) {
                var line = _a[_i];
                if (line == lastLine || line.length == 0)
                    deletes.push(index);
                lastLine = line;
                index++;
            }
            for (var _b = 0, _c = deletes.reverse(); _b < _c.length; _b++) {
                var del = _c[_b];
                this.selLines.splice(del, 1);
            }
        }
        else {
            for (var _d = 0, _e = this.lines; _d < _e.length; _d++) {
                var line = _e[_d];
                if (line == lastLine || line.length == 0)
                    deletes.push(index);
                lastLine = line;
                index++;
            }
            for (var _f = 0, _g = deletes.reverse(); _f < _g.length; _f++) {
                var del = _g[_f];
                this.lines.splice(del, 1);
            }
        }
    };
    TextFile.prototype.getExtension = function (type) {
        return this.nlpFileExts[type];
    };
    TextFile.prototype.setStr = function (str, separateLines) {
        if (separateLines === void 0) { separateLines = true; }
        this.text = str;
        this.separation(separateLines);
    };
    TextFile.prototype.setFile = function (filepath, separateLines) {
        if (separateLines === void 0) { separateLines = true; }
        this.exists = false;
        this.clear();
        this.filepath = filepath;
        this.setFileType(this.filepath);
        if (filepath.length && fs.existsSync(filepath)) {
            this.text = fs.readFileSync(this.filepath, 'utf8');
            if (this.text.length)
                this.separation(separateLines);
            this.exists = true;
        }
        return this.exists;
    };
    TextFile.prototype.isEmpty = function () {
        return this.filepath.length > 0 ? false : true;
    };
    TextFile.prototype.setText = function (text, separateLines) {
        if (separateLines === void 0) { separateLines = true; }
        if (text.length) {
            this.text = text;
            this.separation(separateLines);
            this.exists = true;
        }
    };
    TextFile.prototype.setFileType = function (filename) {
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
    };
    TextFile.prototype.fileExists = function () {
        return this.exists;
    };
    TextFile.prototype.isFileType = function (type) {
        return type == this.filetype;
    };
    TextFile.prototype.getFileType = function () {
        return this.filetype;
    };
    TextFile.prototype.getBasename = function () {
        return this.basename;
    };
    TextFile.prototype.clear = function () {
        this.filepath = '';
        this.text = '';
        this.sepType = separatorType.SEP_UNKNOWN;
        this.sep = '';
        this.lines = [];
    };
    TextFile.prototype.separation = function (separateLines) {
        if (separateLines === void 0) { separateLines = true; }
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
    };
    TextFile.prototype.normalizeText = function () {
        if (this.sepType == separatorType.SEP_RN) {
            var regReplace = new RegExp(this.sep, 'g');
            this.textNormalized = this.text.replace(regReplace, this.sepNormalized);
        }
        else {
            this.textNormalized = this.text;
        }
        return this.textNormalized;
    };
    TextFile.prototype.unnormalizeText = function (text) {
        if (this.sepType == separatorType.SEP_RN) {
            var regReplace = new RegExp(this.sepNormalized, 'g');
            this.textNormalized = text.replace(regReplace, this.sep);
        }
        else {
            this.textNormalized = text;
        }
        return this.textNormalized;
    };
    TextFile.prototype.separateLines = function () {
        this.lines = [];
        if (this.sepType != separatorType.SEP_UNKNOWN && this.text.length) {
            this.lines = this.text.split(this.sep);
        }
        else if (this.text.length) {
            this.lines.push(this.text);
        }
    };
    TextFile.prototype.getText = function (normalized) {
        if (normalized === void 0) { normalized = false; }
        if (normalized) {
            if (this.textNormalized.length == 0) {
                this.normalizeText();
            }
            return this.textNormalized;
        }
        return this.text;
    };
    TextFile.prototype.numberOfLines = function () {
        return this.lines.length;
    };
    TextFile.prototype.getLines = function (normalized) {
        if (normalized === void 0) { normalized = false; }
        if (normalized) {
            if (this.linesNormalized.length == 0) {
                for (var _i = 0, _a = this.lines; _i < _a.length; _i++) {
                    var line = _a[_i];
                    this.linesNormalized.push(line.concat(this.sepNormalized));
                }
            }
            return this.linesNormalized;
        }
        return this.lines;
    };
    TextFile.prototype.getLine = function (lineNumber) {
        return this.lines[lineNumber];
    };
    TextFile.prototype.getSeparatorLength = function () {
        return this.sep.length;
    };
    TextFile.prototype.getSeparator = function () {
        return this.sep;
    };
    TextFile.prototype.getSeparatorNormalized = function () {
        return this.sep;
    };
    TextFile.prototype.getStartLine = function () {
        return this.selStartLine;
    };
    TextFile.prototype.anaFile = function (pass, type) {
        if (type === void 0) { type = nlpFileType.TREE; }
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
    };
    // hasFileType(filepath: string, pass: number, type: nlpFileType = nlpFileType.TREE): boolean {
    //     if (!fs.existsSync(filepath))
    //         return false;
    // 	var anaFile = this.anaFile(pass,type);
    // 	if (type == nlpFileType.TREE) {
    // 		if (this.fileHasNLines(anaFile.fsPath,6))
    // 			return true;
    // 		return false;
    // 	}
    // 	return fs.existsSync(anaFile.fsPath);
    // }
    TextFile.prototype.fileHasNLines = function (filepath, max) {
        if (!fs.existsSync(filepath))
            return false;
        var lineByLine = require('n-readlines');
        var liner = new lineByLine(filepath);
        var line;
        var lineNumber = 0;
        var found = false;
        while (line = liner.next()) {
            if (lineNumber++ >= max) {
                found = true;
                break;
            }
        }
        if (liner.next())
            liner.close();
        return found;
    };
    TextFile.prototype.readFirstLine = function (filepath) {
        if (!fs.existsSync(filepath))
            return '';
        var lineByLine = require('n-readlines');
        var liner = new lineByLine(filepath);
        var line = '';
        while (line = liner.next()) {
            break;
        }
        if (liner.next())
            liner.close();
        return line.toString().trim();
    };
    TextFile.prototype.replaceLineNumber = function (lineNum, text) {
        this.lines[lineNum] = text;
    };
    return TextFile;
}());
exports.TextFile = TextFile;
