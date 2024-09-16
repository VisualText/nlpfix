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
exports.TreeFile = exports.genFileType = exports.generateType = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const textFile_1 = require("./textFile");
const server_1 = require("./server");
const dirfuncs_1 = require("./dirfuncs");
var generateType;
(function (generateType) {
    generateType[generateType["GENERAL"] = 0] = "GENERAL";
    generateType[generateType["EXACT"] = 1] = "EXACT";
})(generateType || (exports.generateType = generateType = {}));
var genFileType;
(function (genFileType) {
    genFileType[genFileType["TXXT"] = 0] = "TXXT";
    genFileType[genFileType["HTML"] = 1] = "HTML";
})(genFileType || (exports.genFileType = genFileType = {}));
class TreeFile extends textFile_1.TextFile {
    constructor() {
        super();
        this.fireds = [];
        this.Highlight = [];
        this.selectedTreeStr = '';
        this.selStart = -1;
        this.selEnd = -1;
        this.treeFile = '';
        this.HighlightFile = '';
        this.inputFile = '';
        this.selectedLines = [];
    }
    matchDictLine(original, line) {
        var tokens = line.split('=');
        if (tokens.length > 1) {
            var toks = tokens[0].split('\s');
            let lastIndex = tokens[0].lastIndexOf(" ");
            let str = tokens[0].substring(0, lastIndex);
            return str.localeCompare(original, undefined, { sensitivity: 'base' }) == 0;
        }
        return false;
    }
    gatherChildrenText() {
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
    }
    getPassFromPath(filePath) {
        let passNum = parseInt(filePath.substring(filePath.length - 8, filePath.length - 5));
        var seqFile = server_1.visualText.analyzer.seqFile;
        seqFile.init();
        return seqFile.getPathByPassNumber(passNum);
    }
    getFired(firedNumber) {
        var chosen = this.fireds[firedNumber];
        while (chosen.rulenum == 0 && firedNumber > 0) {
            firedNumber--;
            if (firedNumber < 0)
                break;
            let parent = this.fireds[firedNumber];
            if (parent.to < chosen.from)
                break;
        }
        return chosen;
    }
    setFile(file, separateLines = true) {
        if (file.length) {
            super.setFile(file, separateLines);
            this.setFilesNames(file);
            return true;
        }
        return false;
    }
    setFilesNames(filepath, genType = genFileType.TXXT) {
        if (filepath.length) {
            const dirPath = path.dirname(filepath);
            this.basename = path.basename(filepath, '.log');
            this.basename = path.basename(this.basename, '.tree');
            this.basename = path.basename(this.basename, '.txxt');
            this.basename = path.basename(this.basename, '.txt');
            this.basename = path.basename(this.basename, '.pat');
            this.basename = path.basename(this.basename, '.nlp');
            this.treeFile = path.join(dirPath, this.basename + '.tree');
            this.HighlightFile = path.join(dirPath, this.basename + '.txxt');
            if (genType == genFileType.TXXT) {
                this.HighlightFile = this.HighlightFile + ".html";
            }
            this.inputFile = path.join(path.dirname(dirPath), path.basename(dirPath).replace("_log", ""));
        }
    }
    nlpppSplitter(str) {
        let len = str.length;
        let i = 0;
        let tokens = [];
        let tok = '';
        let isDigit = false;
        let charType;
        (function (charType) {
            charType[charType["UNKNOWN"] = 0] = "UNKNOWN";
            charType[charType["ALPHA"] = 1] = "ALPHA";
            charType[charType["DIGIT"] = 2] = "DIGIT";
            charType[charType["SPACE"] = 3] = "SPACE";
            charType[charType["SPECIAL"] = 4] = "SPECIAL";
        })(charType || (charType = {}));
        let type = charType.UNKNOWN;
        let lastType = charType.UNKNOWN;
        while (i < len) {
            let c = str[i++];
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
    }
    parseTreeLine(line) {
        let treeLine = { node: '', start: 0, end: 0, ustart: 0, uend: 0, passNum: 0, ruleLine: 0, type: '', fired: false, built: false, rest: '', indent: 0 };
        var tokens = line.split('[');
        let firstTok = 1;
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
    }
    bracketCount(text, end = 0) {
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
    }
    getCharacterLength(str) {
        return str.length;
    }
    findTreeFileLines() {
        var file = new textFile_1.TextFile(this.treeFile);
        var sep = file.getSeparatorNormalized();
        var from = 0;
        var to = 0;
        var add = false;
        this.selectedLines = [];
        this.selectedTreeStr = '';
        for (let line of file.getLines()) {
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
    }
    findMatchByAbsolute(absolute) {
        var firedNumber = 0;
        for (let Highlight of this.Highlight) {
            if (Highlight.startb <= absolute && absolute <= Highlight.endb) {
                return firedNumber;
            }
            firedNumber++;
        }
        return -1;
    }
    parseBrackets() {
        this.Highlight = [];
        var squares = this.parseBracketsRegex('(');
        var curlies = this.parseBracketsRegex('<');
        this.Highlight.sort(function (a, b) { return a.start - b.start; });
        return squares + curlies;
    }
    parseBracketsRegex(bracket) {
        var startPattern = bracket === '<' ? '\<\<\<' : '\(\(\(';
        var endPattern = bracket === '<' ? '\>\>\>' : '\)\)\)';
        var file = new textFile_1.TextFile(this.HighlightFile, false);
        var tokens = file.getText(true).split(startPattern);
        var tokencount = 0;
        var len = 0;
        var lenBracket = 0;
        for (let token of tokens) {
            token = token.replace(/[\n\r]/g, '');
            if (tokencount) {
                let Highlight = { start: 0, end: 0, startb: 0, endb: 0 };
                var toks = token.split(endPattern);
                Highlight.start = len;
                Highlight.end = len + toks[0].length - 1;
                Highlight.startb = lenBracket;
                Highlight.endb = lenBracket + toks[0].length - 1;
                this.Highlight.push(Highlight);
            }
            let tok = token.replace(/\<\<\</g, '');
            tok = tok.replace(/\>\>\>/g, '');
            tok = tok.replace(/\(\(\(/g, '');
            tok = tok.replace(/\)\)\)/g, '');
            len += tok.length;
            tokencount++;
            lenBracket += token.length + 2;
        }
        return tokencount - 1;
    }
    parseFireds(treeFile) {
        var refire = /[\[,\]]/g;
        this.fireds = [];
        var file = new textFile_1.TextFile(treeFile);
        var lastTo = 0;
        for (let i = 0; i < file.getLines().length; i++) {
            let line = file.getLine(i);
            var tokens = line.split(',fired');
            if (tokens.length > 1) {
                let fired = { str: '', from: 0, to: 0, ufrom: 0, uto: 0, rulenum: 0, ruleline: 0, built: false };
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
                    this.fireds.push(fired);
                    if (fired.str.startsWith('_')) {
                        let indent = line.search(/\S/);
                        fired.str = '';
                        while (indent > 0) {
                            i++;
                            let nextLine = file.getLine(i);
                            let pos = nextLine.search(/\S/);
                            if (pos <= indent)
                                break;
                            let ts = nextLine.split(/\s+/);
                            let rest = ts[1].trim();
                            fired.str = fired.str + ' ' + rest;
                        }
                        fired.str = fired.str.trim();
                        i--; // Back up one line
                    }
                }
                // console.log("fired >>> ", fired);
            }
        }
        return this.fireds.length ? true : false;
    }
    firedFile(pass, rewrite = false) {
        var firefile = this.anaFile(pass, textFile_1.nlpFileType.TXXT);
        const currDir = server_1.visualText.analyzer.outputDirectory(firefile);
        const filePath = path.join(currDir, firefile);
        if (!fs.existsSync(filePath) || rewrite) {
            if (!fs.existsSync(filePath)) {
                this.parseFireds(filePath);
                this.writeFiredText(firefile, genFileType.TXXT, rewrite);
            }
        }
        return firefile;
    }
    fileCreateTime(filepath) {
        if (fs.existsSync(filepath)) {
            var stats = fs.statSync(filepath);
            if (stats)
                return stats.ctime;
        }
        return new Date(1970, 1, 1);
    }
    writeFiredText(treeFile, genFileType, rewrite = false) {
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
        const bracket = '<span style="color:rgb(145,145,255);background-color:rgb(68,68,68);">';
        const paren = '<span style="color:rgb(0,204,0);background-color:rgb(68,68,68);">';
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
                    textfire = textfire.concat(between, `${bracket}${Highlight}</span>`);
                else
                    textfire = textfire.concat(between, `${paren}${Highlight}</span>`);
                lastTo = to + 1;
            }
            var tx = byteText.slice(lastTo, byteText.length);
            var rest = new TextDecoder().decode(tx);
            textfire = textfire.concat(rest);
        }
        else {
            textfire = file.getText(true);
        }
        textfire = `<html><body>${textfire}</body></html>`;
        fs.writeFileSync(this.HighlightFile, file.unnormalizeText(textfire));
        this.fireds = [];
        return this.HighlightFile;
    }
    updateTxxtFiles(fileType) {
        var exts = new Array('.' + this.getExtension(fileType));
        var files = dirfuncs_1.dirfuncs.getFiles(server_1.visualText.analyzer.getOutputDirectory(), exts);
        for (let file of files) {
            var numStr = path.basename(file).substring(3, 3);
            var passNum = Number.parseInt(numStr);
            this.firedFile(passNum, true);
        }
    }
}
exports.TreeFile = TreeFile;
