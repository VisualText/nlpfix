import * as path from 'path';
import * as fs from 'fs';
import { TextFile, nlpFileType } from './textFile';
import { visualText } from './server';
import { dirfuncs } from './dirfuncs';

export enum generateType { GENERAL, EXACT }
export enum genFileType { TXXT, HTML }

export interface Highlight {
	start: number;
	end: number;
	startb: number;
	endb: number;
}

export interface Fired {
	str: string;
	from: number;
	to: number;
	ufrom: number;
	uto: number;
	rulenum: number;
	ruleline: number;
	built: boolean;
}

export interface TreeLine {
	node: string
	start: number;
	end: number;
	ustart: number;
	uend: number;
	passNum: number;
	ruleLine: number;
	type: string;
	rest: string;
	fired: boolean;
	built: boolean;
	indent: number;
}

export class TreeFile extends TextFile {
	
	private fireds: Fired[] = [];
	private Highlight: Highlight[] = [];
	private selectedTreeStr = '';
	private selStart = -1;
	private selEnd = -1;
	private treeFile = '';
	private HighlightFile = '';
	private inputFile = '';
	private selectedLines: TreeLine[] = [];

	constructor() {
		super();
	}

	matchDictLine(original: string, line: string): boolean {
		var tokens = line.split('=');
		if (tokens.length > 1) {
			var toks = tokens[0].split('\s');
			let lastIndex: number = tokens[0].lastIndexOf(" ");
			let str = tokens[0].substring(0, lastIndex);
			return str.localeCompare(original, undefined, { sensitivity: 'base' }) == 0;
		}
		return false;
	}

	gatherChildrenText(): string {
		var str = '';
		var lines = this.getLines();
		if (lines.length > this.selStartLine) {
			var i = this.selStartLine+1;
			var indent = this.selectedLines[0].indent;
			while (i < lines.length) {
				var line = lines[i++];
				var treeLine = this.parseTreeLine(line);
				if (treeLine.indent > indent) {
					str += ' ' + treeLine.node;
				} else {
					break;
				}
			}
		}
		str = str.toLocaleLowerCase().trim();
		return str;
	}

	public getPassFromPath(filePath: string): string {
		let passNum = parseInt(filePath.substring(filePath.length-8,filePath.length-5));
		var seqFile = visualText.analyzer.seqFile;
		seqFile.init();
		return seqFile.getPathByPassNumber(passNum);
	}

	getFired(firedNumber: number): Fired {
		var chosen = this.fireds[firedNumber];
		while (chosen.rulenum == 0 && firedNumber > 0) {
			firedNumber--;
			if (firedNumber < 0)
				break;
			let parent: Fired = this.fireds[firedNumber];
			if (parent.to < chosen.from)
				break;
		}
		return chosen;
	}

	setFile(file: string, separateLines: boolean = true): boolean {
		if (file.length) {
			super.setFile(file,separateLines);
			this.setFilesNames(file);
			return true;	
		}
		return false;
	}
	
	setFilesNames(filepath: string, genType: genFileType = genFileType.TXXT) {
		if (filepath.length) {
			const dirPath = path.dirname(filepath);
			this.basename = path.basename(filepath,'.log');
			this.basename = path.basename(this.basename,'.tree');
			this.basename = path.basename(this.basename,'.txxt');
			this.basename = path.basename(this.basename,'.txt');
			this.basename = path.basename(this.basename,'.pat');
			this.basename = path.basename(this.basename,'.nlp');
			this.treeFile = path.join(dirPath,this.basename+'.tree');
			this.HighlightFile = path.join(dirPath,this.basename+'.txxt');
			if (genType == genFileType.TXXT) {
				this.HighlightFile = this.HighlightFile + ".html";
			}
			this.inputFile = path.join(path.dirname(dirPath),path.basename(dirPath).replace("_log",""));
		}
	}

	nlpppSplitter(str: string): string[] {
		let len = str.length;
		let i = 0;
		let tokens: string[] = [];
		let tok = '';
		let isDigit: boolean = false;
		enum charType { UNKNOWN, ALPHA, DIGIT, SPACE, SPECIAL }
		let type: charType = charType.UNKNOWN;
		let lastType: charType = charType.UNKNOWN;

		while (i < len) {
			let c = str[i++];
			if (c >= '0' && c <= '9') {
				type = charType.DIGIT;
			} else if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
				type = charType.ALPHA;
			} else if (c == ' ') {
				type = charType.SPACE;
			} else {
				type = charType.SPECIAL;
			}
			if (type != lastType && lastType != charType.UNKNOWN && lastType != charType.SPACE) {
				tokens.push(tok);
				if (type == charType.SPACE)
					tok = '';
				else
					tok = c;
				lastType = charType.UNKNOWN;
			} else if (type != charType.SPACE) {
				tok = tok + c;
			}
			lastType = type;
		}
		if (tok.length)
			tokens.push(tok);

		return tokens;
	}

	parseTreeLine(line: string): TreeLine {
		let treeLine: TreeLine = {node: '', start: 0, end: 0, ustart: 0, uend: 0, passNum: 0, ruleLine: 0, type: '', fired: false, built: false, rest: '', indent: 0};
		var tokens = line.split('[');
		let firstTok = 1;
		if (tokens.length > 1) {
			// Exception when the character is an open square bracket
			if (line.trim().startsWith('[')) {
				treeLine.node = '[';
				treeLine.indent = tokens[0].length;
				firstTok = 2;
			} else {
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
				if (toks.length > 7 ) {
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

	bracketCount(text: string, end: number = 0): number {
		if (end) {
			text = text.substring(0,end);
		}
		var parens = text.split(/\(\(\(/);
		var parens2 = text.split(/\)\)\)/);
		var angle = text.split(/\<\<\</);
		var angle2 = text.split(/\>\>\>/);
		var parenCount = ((parens.length + parens2.length - 3))*3;
		var angleCount = ((angle.length + angle2.length - 3))*3;
		return parenCount + angleCount;
	}

	getCharacterLength(str: string) {
		return str.length;
	}

	findTreeFileLines() {
		var file = new TextFile(this.treeFile);
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
						this.selectedTreeStr = this.selectedTreeStr.concat(line,sep);
					}		
				}
			}
		}
	}

	findMatchByAbsolute(absolute: number): number {
		var firedNumber = 0;

		for (let Highlight of this.Highlight) {
			if (Highlight.startb <= absolute && absolute <= Highlight.endb) {
				return firedNumber;
			}
			firedNumber++;
		}

		return -1;
	}

	parseBrackets(): number {
		this.Highlight = [];
		var squares = this.parseBracketsRegex('(');
		var curlies = this.parseBracketsRegex('<');
		this.Highlight.sort(function(a,b){return a.start - b.start});
		return squares + curlies;
	}

	parseBracketsRegex(bracket: string): number {
		var startPattern = bracket === '<' ? '\<\<\<' : '\(\(\(';
		var endPattern = bracket === '<' ? '\>\>\>' : '\)\)\)';

		var file = new TextFile(this.HighlightFile,false);
		var tokens = file.getText(true).split(startPattern);
		var tokencount = 0;
		var len = 0;
		var lenBracket = 0;

		for (let token of tokens) {
			token = token.replace(/[\n\r]/g, '');
			if (tokencount) {
				let Highlight: Highlight = {start: 0, end: 0, startb: 0, endb: 0};
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
	
	parseFireds(treeFile: string) {
		var refire = /[\[,\]]/g;
		this.fireds = [];

		var file = new TextFile(treeFile);
		var lastTo = 0;

		for (let i=0; i < file.getLines().length; i++) {
			let line = file.getLine(i);
			var tokens = line.split(',fired');
			if (tokens.length > 1) {
				let fired: Fired = {str: '', from: 0, to: 0, ufrom: 0, uto: 0, rulenum: 0, ruleline: 0, built: false};
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
						i--;  // Back up one line
					}
				}
				// console.log("fired >>> ", fired);
			}
		}
		return this.fireds.length ? true : false;
	}

	firedFile(pass: number, rewrite: boolean=false): string {
		var firefile: string = this.anaFile(pass,nlpFileType.TXXT);
		const currDir = visualText.analyzer.outputDirectory(firefile);
		const filePath = path.join(currDir,firefile);
		if (!fs.existsSync(filePath) || rewrite) {
			if (!fs.existsSync(filePath)) {
				this.parseFireds(filePath);
				this.writeFiredText(firefile,genFileType.TXXT,rewrite);
			}
		}
		return firefile;
    }
    
	fileCreateTime(filepath: string): Date {
		if (fs.existsSync(filepath)) {
			var stats = fs.statSync(filepath);
			if (stats)
				return stats.ctime;
		}
		return new Date(1970, 1, 1);
	}

	writeFiredText(treeFile: string, genFileType: genFileType, rewrite: boolean=false): string {
		var logDate: Date = this.fileCreateTime(treeFile);
		var inputDate: Date = this.fileCreateTime(this.inputFile);
		if (!rewrite && inputDate < logDate && fs.existsSync(this.HighlightFile))
			return this.HighlightFile;
		else if (!rewrite && !fs.existsSync(this.inputFile))
			return treeFile;

		var file = new TextFile(this.inputFile,false);

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

				var hl = byteText.slice(from,to+1);
				var Highlight = new TextDecoder().decode(hl);

				var bt = byteText.slice(lastTo,from);
				var between = new TextDecoder().decode(bt);

				if (built)
					textfire = textfire.concat(between,`${bracket}${Highlight}</span>`);
				else
					textfire = textfire.concat(between,`${paren}${Highlight}</span>`);

				lastTo = to + 1;
			}
			var tx = byteText.slice(lastTo,byteText.length);
			var rest = new TextDecoder().decode(tx);
			textfire = textfire.concat(rest);
		} else {
			textfire = file.getText(true);
		}

		textfire = `<html><body>${textfire}</body></html>`;
		fs.writeFileSync(this.HighlightFile,file.unnormalizeText(textfire));
		this.fireds = [];
		return this.HighlightFile;
	}

	updateTxxtFiles(fileType: nlpFileType) {
		var exts = new Array('.'+this.getExtension(fileType));
		var files = dirfuncs.getFiles(visualText.analyzer.getOutputDirectory(),exts);
		for (let file of files) {
			var numStr = path.basename(file).substring(3,3);
			var passNum = Number.parseInt(numStr);
			this.firedFile(passNum,true);
		}
	}
}