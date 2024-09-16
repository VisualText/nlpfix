"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeFile = exports.generateType = void 0;
var path = require("path");
var fs = require("fs");
var textFile_1 = require("./textFile");
var sequence_1 = require("./sequence");
var server_1 = require("./server");
var dirfuncs_1 = require("./dirfuncs");
var generateType;
(function (generateType) {
    generateType[generateType["GENERAL"] = 0] = "GENERAL";
    generateType[generateType["EXACT"] = 1] = "EXACT";
})(generateType || (exports.generateType = generateType = {}));
var TreeFile = /** @class */ (function (_super) {
    __extends(TreeFile, _super);
    function TreeFile() {
        var _this = _super.call(this) || this;
        _this.fireds = [];
        _this.Highlight = [];
        _this.selectedTreeStr = '';
        _this.selStart = -1;
        _this.selEnd = -1;
        _this.treeFile = '';
        _this.HighlightFile = '';
        _this.inputFile = '';
        _this.selectedLines = [];
        return _this;
    }
    TreeFile.prototype.matchDictLine = function (original, line) {
        var tokens = line.split('=');
        if (tokens.length > 1) {
            var toks = tokens[0].split('\s');
            var lastIndex = tokens[0].lastIndexOf(" ");
            var str = tokens[0].substring(0, lastIndex);
            return str.localeCompare(original, undefined, { sensitivity: 'base' }) == 0;
        }
        return false;
    };
    TreeFile.prototype.gatherChildrenText = function () {
        var str = '';
        var lines = this.getLines();
        if (lines.length > this.selStartLine) {
            var i = this.selStartLine + 1;
            var indent = this.selectedLines[0].indent;
            while (i < lines.length) {
                var line = lines[i++];
                var treeLine = this.parseTreeLine(line);
                if (treeLine.indent > indent) {
                    str += ' ' + treeLine.node;
                }
                else {
                    break;
                }
            }
        }
        str = str.toLocaleLowerCase().trim();
        return str;
    };
    TreeFile.prototype.getPassFromPath = function (filePath) {
        var passNum = parseInt(filePath.substring(filePath.length - 8, filePath.length - 5));
        var seqFile = new sequence_1.SequenceFile();
        seqFile.init();
        return seqFile.getPathByPassNumber(passNum);
    };
    TreeFile.prototype.getFired = function (firedNumber) {
        var chosen = this.fireds[firedNumber];
        while (chosen.rulenum == 0 && firedNumber > 0) {
            firedNumber--;
            if (firedNumber < 0)
                break;
            var parent_1 = this.fireds[firedNumber];
            if (parent_1.to < chosen.from)
                break;
        }
        return chosen;
    };
    TreeFile.prototype.setFile = function (file, separateLines) {
        if (separateLines === void 0) { separateLines = true; }
        if (file.length) {
            _super.prototype.setFile.call(this, file, separateLines);
            this.setFilesNames(file);
            return true;
        }
        return false;
    };
    TreeFile.prototype.setFilesNames = function (filepath) {
        if (filepath.length) {
            this.basename = path.basename(filepath, '.log');
            this.basename = path.basename(this.basename, '.tree');
            this.basename = path.basename(this.basename, '.txxt');
            this.basename = path.basename(this.basename, '.txt');
            this.basename = path.basename(this.basename, '.pat');
            this.basename = path.basename(this.basename, '.nlp');
            this.treeFile = server_1.visualText.analyzer.getOutputDirectory(this.basename + '.tree');
            this.HighlightFile = server_1.visualText.analyzer.getOutputDirectory(this.basename + '.txxt');
            this.inputFile = server_1.visualText.analyzer.getTextPath();
        }
    };
    TreeFile.prototype.nlpppSplitter = function (str) {
        var len = str.length;
        var i = 0;
        var tokens = [];
        var tok = '';
        var isDigit = false;
        var charType;
        (function (charType) {
            charType[charType["UNKNOWN"] = 0] = "UNKNOWN";
            charType[charType["ALPHA"] = 1] = "ALPHA";
            charType[charType["DIGIT"] = 2] = "DIGIT";
            charType[charType["SPACE"] = 3] = "SPACE";
            charType[charType["SPECIAL"] = 4] = "SPECIAL";
        })(charType || (charType = {}));
        var type = charType.UNKNOWN;
        var lastType = charType.UNKNOWN;
        while (i < len) {
            var c = str[i++];
            if (c >= '0' && c <= '9') {
                type = charType.DIGIT;
            }
            else if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
                type = charType.ALPHA;
            }
            else if (c == ' ') {
                type = charType.SPACE;
            }
            else {
                type = charType.SPECIAL;
            }
            if (type != lastType && lastType != charType.UNKNOWN && lastType != charType.SPACE) {
                tokens.push(tok);
                if (type == charType.SPACE)
                    tok = '';
                else
                    tok = c;
                lastType = charType.UNKNOWN;
            }
            else if (type != charType.SPACE) {
                tok = tok + c;
            }
            lastType = type;
        }
        if (tok.length)
            tokens.push(tok);
        return tokens;
    };
    TreeFile.prototype.parseTreeLine = function (line) {
        var treeLine = { node: '', start: 0, end: 0, ustart: 0, uend: 0, passNum: 0, ruleLine: 0, type: '', fired: false, built: false, rest: '', indent: 0 };
        var tokens = line.split('[');
        var firstTok = 1;
        if (tokens.length > 1) {
            // Exception when the character is an open square bracket
            if (line.trim().startsWith('[')) {
                treeLine.node = '[';
                treeLine.indent = tokens[0].length;
                firstTok = 2;
            }
            else {
                treeLine.node = tokens[0].trim();
                treeLine.indent = tokens[0].search(/\S/) - 1;
            }
            var toks = tokens[firstTok].split(/[,\]]/);
            if (toks.length >= 4) {
                treeLine.start = +toks[0];
                treeLine.end = +toks[1];
                treeLine.ustart = +toks[2];
                treeLine.uend = +toks[3];
                treeLine.passNum = +toks[4];
                treeLine.ruleLine = +toks[5];
                treeLine.type = toks[6];
                if (toks.length > 7) {
                    if (toks[7].length)
                        treeLine.fired = true;
                }
                if (toks.length > 8) {
                    if (toks[8].length > 0)
                        treeLine.built = true;
                }
            }
        }
        return treeLine;
    };
    TreeFile.prototype.bracketCount = function (text, end) {
        if (end === void 0) { end = 0; }
        if (end) {
            text = text.substring(0, end);
        }
        var parens = text.split(/\(\(\(/);
        var parens2 = text.split(/\)\)\)/);
        var angle = text.split(/\<\<\</);
        var angle2 = text.split(/\>\>\>/);
        var parenCount = ((parens.length + parens2.length - 3)) * 3;
        var angleCount = ((angle.length + angle2.length - 3)) * 3;
        return parenCount + angleCount;
    };
    TreeFile.prototype.getCharacterLength = function (str) {
        return str.length;
    };
    TreeFile.prototype.findTreeFileLines = function () {
        var file = new textFile_1.TextFile(this.treeFile);
        var sep = file.getSeparatorNormalized();
        var from = 0;
        var to = 0;
        var add = false;
        this.selectedLines = [];
        this.selectedTreeStr = '';
        for (var _i = 0, _a = file.getLines(); _i < _a.length; _i++) {
            var line = _a[_i];
            from = 0;
            to = 0;
            add = false;
            var tokens = line.split('[');
            if (tokens.length > 1) {
                var toks = tokens[1].split(/[,\]]/);
                if (toks.length > 4) {
                    from = +toks[2];
                    to = +toks[3];
                    if (from >= this.selStart && to <= this.selEnd) {
                        this.selectedLines.push(this.parseTreeLine(line));
                        this.selectedTreeStr = this.selectedTreeStr.concat(line, sep);
                    }
                }
            }
        }
    };
    TreeFile.prototype.findMatchByAbsolute = function (absolute) {
        var firedNumber = 0;
        for (var _i = 0, _a = this.Highlight; _i < _a.length; _i++) {
            var Highlight_1 = _a[_i];
            if (Highlight_1.startb <= absolute && absolute <= Highlight_1.endb) {
                return firedNumber;
            }
            firedNumber++;
        }
        return -1;
    };
    TreeFile.prototype.parseBrackets = function () {
        this.Highlight = [];
        var squares = this.parseBracketsRegex('(');
        var curlies = this.parseBracketsRegex('<');
        this.Highlight.sort(function (a, b) { return a.start - b.start; });
        return squares + curlies;
    };
    TreeFile.prototype.parseBracketsRegex = function (bracket) {
        var startPattern = bracket === '<' ? '\<\<\<' : '\(\(\(';
        var endPattern = bracket === '<' ? '\>\>\>' : '\)\)\)';
        var file = new textFile_1.TextFile(this.HighlightFile, false);
        var tokens = file.getText(true).split(startPattern);
        var tokencount = 0;
        var len = 0;
        var lenBracket = 0;
        for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
            var token = tokens_1[_i];
            token = token.replace(/[\n\r]/g, '');
            if (tokencount) {
                var Highlight_2 = { start: 0, end: 0, startb: 0, endb: 0 };
                var toks = token.split(endPattern);
                Highlight_2.start = len;
                Highlight_2.end = len + toks[0].length - 1;
                Highlight_2.startb = lenBracket;
                Highlight_2.endb = lenBracket + toks[0].length - 1;
                this.Highlight.push(Highlight_2);
            }
            var tok = token.replace(/\<\<\</g, '');
            tok = tok.replace(/\>\>\>/g, '');
            tok = tok.replace(/\(\(\(/g, '');
            tok = tok.replace(/\)\)\)/g, '');
            len += tok.length;
            tokencount++;
            lenBracket += token.length + 2;
        }
        return tokencount - 1;
    };
    TreeFile.prototype.parseFireds = function (treeFile) {
        var refire = /[\[,\]]/g;
        this.fireds = [];
        var file = new textFile_1.TextFile(treeFile);
        var lastTo = 0;
        for (var i = 0; i < file.getLines().length; i++) {
            var line = file.getLine(i);
            var tokens = line.split(',fired');
            if (tokens.length > 1) {
                var fired = { str: '', from: 0, to: 0, ufrom: 0, uto: 0, rulenum: 0, ruleline: 0, built: false };
                var tts = line.split(refire);
                fired.built = (tts.length >= 9 && tts[9] === 'blt') ? true : false;
                if (+tts[2] > lastTo) {
                    fired.str = tts[0].trim();
                    fired.from = +tts[1];
                    fired.to = lastTo = +tts[2];
                    fired.ufrom = +tts[3];
                    fired.uto = +tts[4];
                    fired.rulenum = +tts[5];
                    fired.ruleline = +tts[6];
                    if (fired.built)
                        this.fireds.push(fired);
                    if (fired.str.startsWith('_')) {
                        var indent = line.search(/\S/);
                        fired.str = '';
                        while (indent > 0) {
                            i++;
                            var nextLine = file.getLine(i);
                            var pos = nextLine.search(/\S/);
                            if (pos <= indent)
                                break;
                            var ts = nextLine.split(/\s+/);
                            var rest = ts[1].trim();
                            fired.str = fired.str + ' ' + rest;
                        }
                        fired.str = fired.str.trim();
                        i--; // Back up one line
                    }
                }
            }
        }
        return this.fireds.length ? true : false;
    };
    TreeFile.prototype.firedFile = function (pass, rewrite) {
        if (rewrite === void 0) { rewrite = false; }
        var firefile = this.anaFile(pass, textFile_1.nlpFileType.TXXT);
        if (!fs.existsSync(firefile) || rewrite) {
            var treeFile = this.anaFile(pass);
            if (fs.existsSync(treeFile)) {
                this.parseFireds(treeFile);
                this.writeFiredText(treeFile, rewrite);
            }
        }
        return firefile;
    };
    TreeFile.prototype.fileCreateTime = function (filepath) {
        if (fs.existsSync(filepath)) {
            var stats = fs.statSync(filepath);
            if (stats)
                return stats.ctime;
        }
        return new Date(1970, 1, 1);
    };
    TreeFile.prototype.writeFiredText = function (treeFile, rewrite) {
        if (rewrite === void 0) { rewrite = false; }
        this.setFilesNames(treeFile);
        var logDate = this.fileCreateTime(treeFile);
        var inputDate = this.fileCreateTime(this.inputFile);
        if (!rewrite && inputDate < logDate && fs.existsSync(this.HighlightFile))
            return this.HighlightFile;
        else if (!rewrite && !fs.existsSync(this.inputFile))
            return treeFile;
        var file = new textFile_1.TextFile(this.inputFile, false);
        var textfire = '';
        var lastTo = 0;
        var between = '';
        var Highlight = '';
        var from = 0;
        var to = 0;
        var built = false;
        var byteText = new TextEncoder().encode(file.getText(true));
        if (this.fireds.length) {
            for (var i = 0; i < this.fireds.length; i++) {
                from = this.fireds[i].from;
                to = this.fireds[i].to;
                built = this.fireds[i].built;
                var hl = byteText.slice(from, to + 1);
                var Highlight = new TextDecoder().decode(hl);
                var bt = byteText.slice(lastTo, from);
                var between = new TextDecoder().decode(bt);
                if (built)
                    textfire = textfire.concat(between, '<<<', Highlight, '>>>');
                else
                    textfire = textfire.concat(between, '(((', Highlight, ')))');
                lastTo = to + 1;
            }
            var tx = byteText.slice(lastTo, byteText.length);
            var rest = new TextDecoder().decode(tx);
            textfire = textfire.concat(rest);
        }
        else {
            textfire = file.getText(true);
        }
        fs.writeFileSync(this.HighlightFile, file.unnormalizeText(textfire));
        this.fireds = [];
        return this.HighlightFile;
    };
    TreeFile.prototype.updateTxxtFiles = function (fileType) {
        var exts = new Array('.' + this.getExtension(fileType));
        var files = dirfuncs_1.dirfuncs.getFiles(server_1.visualText.analyzer.getOutputDirectory(), exts);
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            var numStr = path.basename(file).substring(3, 3);
            var passNum = Number.parseInt(numStr);
            this.firedFile(passNum, true);
        }
    };
    return TreeFile;
}(textFile_1.TextFile));
exports.TreeFile = TreeFile;
