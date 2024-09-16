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
exports.SequenceFile = exports.PassItem = exports.newPassType = exports.moveDirection = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const textFile_1 = require("./textFile");
const treeFile_1 = require("./treeFile");
const dirfuncs_1 = require("./dirfuncs");
const server_1 = require("./server");
var moveDirection;
(function (moveDirection) {
    moveDirection[moveDirection["UP"] = 0] = "UP";
    moveDirection[moveDirection["DOWN"] = 1] = "DOWN";
})(moveDirection || (exports.moveDirection = moveDirection = {}));
var newPassType;
(function (newPassType) {
    newPassType[newPassType["RULES"] = 0] = "RULES";
    newPassType[newPassType["CODE"] = 1] = "CODE";
    newPassType[newPassType["DECL"] = 2] = "DECL";
})(newPassType || (exports.newPassType = newPassType = {}));
class PassItem {
    constructor() {
        this.filepath = '';
        this.text = '';
        this.name = '';
        this.comment = '';
        this.passNum = 0;
        this.row = 0;
        this.tokenizer = false;
        this.typeStr = '';
        this.inFolder = false;
        this.empty = true;
        this.active = true;
        this.highlightFile = false;
        this.tokenizers = ['tokenize', 'tok', 'token', 'cmltokenize', 'cmltok', 'dicttok', 'dicttokz', 'chartok'];
    }
    isTokenizer() {
        return this.tokenizers.includes(this.typeStr.toLowerCase());
    }
    // public fetchTooltip(): string {
    // 	var index = this.tokenizers.indexOf(this.typeStr);
    // 	var tooltip = this.tokenizerTooltips[index];
    // 	return tooltip;
    // }
    isRuleFile() {
        return this.typeStr.localeCompare('nlp') == 0 || this.typeStr.localeCompare('rec') == 0;
    }
    isFolder() {
        return this.typeStr.localeCompare('folder') == 0;
    }
    isStub() {
        return this.typeStr.localeCompare('stub') == 0;
    }
    isEnd(name) {
        return this.typeStr.localeCompare('end') == 0 && this.name.localeCompare(name) == 0;
    }
    fileExists() {
        return fs.existsSync(this.filepath) ? true : false;
    }
    exists() {
        return this.empty ? false : true;
    }
    isEmpty() {
        return this.empty;
    }
    clear() {
        this.text = '';
        this.name = '';
        this.comment = '';
        this.passNum = 0;
        this.row = 0;
        this.typeStr = '';
        this.inFolder = false;
        this.empty = true;
        this.active = true;
        this.highlightFile = false;
    }
}
exports.PassItem = PassItem;
class SequenceFile extends textFile_1.TextFile {
    constructor() {
        super();
        this.specDir = '';
        this.passItems = new Array();
        this.cleanpasses = new Array();
        this.newcontent = '';
        this.currentPassNum = 0;
    }
    init() {
        if (this.specDir) {
            this.getPassFiles(this.specDir);
        }
    }
    setSpecDir(specDir) {
        this.specDir = specDir;
    }
    getPassFiles(specDir, addSpec = false) {
        specDir = addSpec ? path.join(specDir, server_1.visualText.ANALYZER_SEQUENCE_FOLDER) : specDir;
        if (addSpec)
            this.setSpecDir(specDir);
        const anaFile = path.join(specDir, server_1.visualText.ANALYZER_SEQUENCE_FILE);
        super.setFile(anaFile, true);
        let passNum = 1;
        this.passItems = [];
        var folder = '';
        var row = 0;
        for (let passStr of this.getLines()) {
            var passItem = this.setPass(passStr, passNum);
            if (passItem.typeStr == 'folder' || passItem.typeStr == 'stub') {
                folder = passItem.name;
            }
            else if (folder.length) {
                if (passItem.typeStr == 'end' && passItem.name.localeCompare(folder) == 0) {
                    folder = '';
                }
                else {
                    passItem.inFolder = true;
                    passNum++;
                }
            }
            else if (passItem.exists())
                passNum++;
            if (passItem.text.length) {
                passItem.row = row++;
                passItem.filepath = path.join(specDir, passItem.name + '.nlp');
                this.hasHighLightFile(passItem);
                this.passItems.push(passItem);
            }
        }
    }
    getPassItemFiles() {
        let files = new Array();
        for (let passItem of this.passItems) {
            files.push(passItem.filepath);
        }
        return files;
    }
    getPassItems() {
        return this.passItems;
    }
    getPassNumber() {
        return this.currentPassNum;
    }
    setPassNum(num) {
        this.currentPassNum = num;
    }
    getPassItem(num) {
        return this.passItems[num - 1];
    }
    getCurrentItem() {
        return this.passItems[this.currentPassNum - 1];
    }
    getLastItem() {
        return this.passItems[this.passItems.length - 1];
    }
    genHighlightFile(genType = treeFile_1.genFileType.TXXT) {
        const treeFile = new treeFile_1.TreeFile();
        let filePath = this.getOutputFile(this.currentPassNum, textFile_1.nlpFileType.TREE);
        treeFile.setFile(filePath);
        treeFile.parseFireds(filePath);
        const newFile = treeFile.writeFiredText(filePath, genType);
        return newFile;
    }
    getLastItemInFolder(row) {
        let folderItem = this.passItems[row];
        for (let i = row; i < this.passItems.length; i++) {
            let passItem = this.passItems[i];
            if (passItem.name.localeCompare(folderItem.name) == 0 && passItem.typeStr.localeCompare('end') == 0)
                return passItem;
        }
        return folderItem;
    }
    isOrphan(nlpFileName) {
        for (let passItem of this.passItems) {
            if (passItem.name.localeCompare(nlpFileName) == 0)
                return false;
        }
        return true;
    }
    setPass(passStr, passNum) {
        const passItem = new PassItem();
        var tokens = passStr.split(/[\t\s]/);
        if (tokens.length >= 3) {
            passItem.text = passStr;
            passItem.passNum = passNum;
            if (tokens[0].localeCompare('#') == 0) {
                passItem.comment = this.tokenStr(tokens, 2);
                passItem.typeStr = '#';
            }
            else {
                var clean = tokens[0].replace('/', '');
                if (clean.length < tokens[0].length) {
                    passItem.active = false;
                    passItem.typeStr = clean;
                }
                else {
                    passItem.active = true;
                    passItem.typeStr = tokens[0];
                    if (passItem.isTokenizer()) {
                        passItem.tokenizer = true;
                    }
                }
                passItem.name = tokens[1];
                if (passItem.typeStr.localeCompare('pat') == 0) {
                    passItem.typeStr = 'nlp';
                }
                if (passItem.typeStr.localeCompare('nlp') == 0 || passItem.typeStr.localeCompare('rec') == 0) {
                    passItem.filepath = this.passItemPath(passItem);
                }
                passItem.comment = this.tokenStr(tokens, 2);
            }
            passItem.empty = false;
        }
        return passItem;
    }
    passItemPath(passItem) {
        passItem.filepath = path.join(this.specDir, passItem.name + '.pat');
        if (!fs.existsSync(passItem.filepath))
            passItem.filepath = path.join(this.specDir, passItem.name + '.nlp');
        return passItem.filepath;
    }
    tokenStr(tokens, start) {
        var tokenStr = '';
        let i = 0;
        let end = tokens.length;
        for (i = start; i < end; i++) {
            var tok = tokens[i];
            if (tokenStr.length)
                tokenStr = tokenStr + ' ';
            tokenStr = tokenStr + tok;
        }
        return tokenStr;
    }
    passString(passItem) {
        var activeStr = passItem.active ? '' : '/';
        return activeStr + passItem.typeStr + '\t' + passItem.name + '\t' + passItem.comment;
    }
    base(passname) {
        var basename = path.basename(passname, '.pat');
        basename = path.basename(basename, '.nlp');
        return basename;
    }
    getPassByRow(row) {
        for (let passItem of this.passItems) {
            if (passItem.row == row)
                return passItem;
        }
        return new PassItem();
    }
    getPassByNumber(passNumber) {
        for (let passItem of this.passItems) {
            if (passItem.passNum == passNumber)
                return passItem;
        }
        return new PassItem();
    }
    getPathByPassNumber(passNumber) {
        var passItem = this.getPassByNumber(passNumber);
        if (!passItem.isEmpty())
            return passItem.filepath;
        return '';
    }
    passCount() {
        return this.passItems.length;
    }
    atBottom(passItem) {
        let passes = this.getFolderPasses(passItem.typeStr, passItem.name, true);
        return passes.length + passItem.row == this.passCount();
    }
    cleanPasses() {
        this.cleanpasses = [];
        let passNum = 1;
        for (let passItem of this.passItems) {
            this.cleanpasses.push(this.passString(passItem));
        }
    }
    inFolder(passItem) {
        var passes = this.getPasses();
        var row = passes[passItem.row].row;
        while (row) {
            row--;
            var currentPass = passes[row];
            if (currentPass.typeStr == 'end') {
                return false;
            }
            else if (currentPass.typeStr == 'folder') {
                return true;
            }
        }
        return false;
    }
    renamePass(name, type, newPassName) {
        if (this.passItems.length) {
            var passItem = this.findPass(type, name);
            if (type.localeCompare('folder') == 0) {
                var passes = this.getFolderPasses(type, name, true);
                passes[passes.length - 1].name = newPassName;
            }
            passItem.name = newPassName;
            this.saveFile();
        }
    }
    duplicatePass(name, type, newPassName) {
        if (this.passItems.length) {
            var passItem = this.findPass(type, name);
            var dupePath = path.join(path.dirname(passItem.filepath), newPassName + '.nlp');
            fs.copyFileSync(passItem.filepath, dupePath);
            var dupeItem = this.createPassItemFromFile(dupePath);
            this.passItems.splice(passItem.row + 1, 0, dupeItem);
            this.saveFile();
        }
    }
    insertPass(row, newpass) {
        if (this.passItems.length) {
            if (row >= 0) {
                var passes = new Array();
                passes.push(newpass);
                var copy = false;
                const specDir = server_1.visualText.analyzer.getSpecDirectory();
                if (specDir.localeCompare(path.dirname(newpass))) {
                    if (dirfuncs_1.dirfuncs.isDir(newpass)) {
                        passes = [];
                        passes = dirfuncs_1.dirfuncs.getFiles(newpass);
                    }
                    copy = true;
                }
                var pi = this.passItems[0];
                for (let pass of passes) {
                    var passPath = path.join(specDir, path.basename(pass.fsPath));
                    if (copy) {
                        fs.copyFileSync(pass.fsPath, passPath);
                    }
                    pi = this.createPassItemFromFile(passPath);
                    row++;
                    this.passItems.splice(row, 0, pi);
                }
                this.saveFile();
                this.renumberPasses();
            }
        }
        return row;
    }
    findPassByFilename(filename) {
        var passes = this.getPasses();
        var name = path.parse(filename).name;
        for (let pass of passes) {
            if (pass.name == name) {
                return pass.passNum;
            }
        }
        return 0;
    }
    insertNewPass(name, type, newPass, passtype) {
        if (this.passItems.length && newPass.length) {
            var foundItem = this.findPass(type, name);
            if (foundItem) {
                var newfile = this.createNewPassFile(newPass, passtype);
                var passItem = this.createPassItemFromFile(newfile);
                this.passItems.splice(foundItem.row + 1, 0, passItem);
                this.saveFile();
            }
        }
    }
    insertNewPassEnd(newpass, type) {
        if (this.passItems.length && newpass.length) {
            var newfile = this.createNewPassFile(newpass, type);
            var passItem = this.createPassItemFromFile(newfile);
            this.passItems.push(passItem);
            this.saveFile();
        }
    }
    insertNewFolderPass(row, folderName, type) {
        const passItem = this.getPassByRow(row);
        if (folderName.length) {
            if (passItem) {
                const newPassItem = this.createPassItemFolder(type, folderName);
                newPassItem.row = row + 1;
                newPassItem.passNum = passItem.passNum;
                this.passItems.splice(newPassItem.row, 0, newPassItem);
                this.saveFile();
                return newPassItem.row;
            }
        }
        return row;
    }
    insertNewFolder(name, type, newFolder) {
        if (this.passItems.length && newFolder.length) {
            var foundItem = this.findPass(type, name);
            if (foundItem) {
                if (foundItem.isFolder()) {
                    foundItem = this.moveToFolderEnd(foundItem);
                }
                var passItem = this.createPassItemFolder('end', newFolder);
                this.passItems.splice(foundItem.row + 1, 0, passItem);
                passItem = this.createPassItemFolder('folder', newFolder);
                this.passItems.splice(foundItem.row + 1, 0, passItem);
                this.saveFile();
            }
        }
    }
    moveToFolderEnd(passItem) {
        var passes = this.getFolderPasses(passItem.typeStr, passItem.name, true);
        return passes[passes.length - 1];
    }
    insertNewFolderEnd(newFolder) {
        if (this.passItems.length && newFolder.length) {
            var passItem = this.createPassItemFolder('folder', newFolder);
            this.passItems.push(passItem);
            passItem = this.createPassItemFolder('end', newFolder);
            this.passItems.push(passItem);
            this.saveFile();
        }
    }
    createPassItemFolder(type, name) {
        var passItem = new PassItem();
        passItem.typeStr = type;
        passItem.name = name;
        passItem.comment = '# new folder';
        return passItem;
    }
    deletePass(name, type) {
        let passItem = this.findPass(type, name);
        if (passItem.isFolder()) {
            this.deleteFolder(passItem);
        }
        else
            this.deletePassInSeqFile(passItem.typeStr, passItem.name);
        this.saveFile();
    }
    deleteFolder(passItem, foldersOnly = false) {
        let passes = this.getFolderPasses(passItem.typeStr, passItem.name, true);
        if (foldersOnly) {
            let len = passes.length;
            let first = passes[0];
            let last = passes[len - 1];
            this.deletePassInSeqFile(last.typeStr, last.name);
            this.deletePassInSeqFile(first.typeStr, first.name);
        }
        else {
            this.passItems.splice(passes[0].row, passes.length);
        }
    }
    deletePassInSeqFile(type, name) {
        var passItem = this.findPass(type, name);
        if (passItem) {
            this.passItems.splice(passItem.row, 1);
        }
    }
    createNewPassFile(filename, type) {
        var newfilepath = path.join(server_1.visualText.analyzer.getSpecDirectory(), filename.concat('.nlp'));
        fs.writeFileSync(newfilepath, this.newPassContent(filename, type), { flag: 'w+' });
        return newfilepath;
    }
    todayDate() {
        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        return date + ' ' + time;
    }
    newPassContent(filename, type) {
        // const config = vscode.workspace.getConfiguration('user');
        // var username = config.get<string>('name');
        let username = 'de Hilster';
        if ((username === null || username === void 0 ? void 0 : username.length) == 0)
            username = 'Your Name';
        var newpass = '###############################################\n';
        newpass = newpass.concat('# FILE: ', filename, '\n');
        newpass = newpass.concat('# SUBJ: comment\n');
        newpass = newpass.concat(`# AUTH: ${username}\n`);
        newpass = newpass.concat('# CREATED: ', this.todayDate(), '\n');
        newpass = newpass.concat('# MODIFIED:\n');
        newpass = newpass.concat('###############################################\n\n');
        switch (type) {
            case newPassType.RULES:
                newpass = newpass.concat('@NODES _ROOT\n\n');
                newpass = newpass.concat('@RULES\n');
                newpass = newpass.concat('_xNIL <-\n');
                newpass = newpass.concat('	_xNIL	### (1)\n');
                newpass = newpass.concat('	@@\n');
                break;
            case newPassType.CODE:
                newpass = newpass.concat('@CODE\n\n');
                newpass = newpass.concat('G("kb") = getconcept(findroot(),"kb");\n');
                newpass = newpass.concat('SaveKB("mykb.kbb",G("kb"),2);\n');
                newpass = newpass.concat('\n@@CODE');
                break;
            case newPassType.DECL:
                newpass = newpass.concat('@DECL\n\n');
                newpass = newpass.concat('MyFunction(L("var")) {\n');
                newpass = newpass.concat('\n');
                newpass = newpass.concat('}\n');
                newpass = newpass.concat('\n@@DECL');
                break;
        }
        return newpass;
    }
    createPassItemFromFile(filePath) {
        const passItem = new PassItem();
        passItem.filepath = filePath;
        passItem.name = this.base(filePath);
        passItem.typeStr = path.extname(filePath).substring(1);
        passItem.comment = '# comment';
        passItem.text = this.passString(passItem);
        passItem.empty = false;
        return passItem;
    }
    passFileName(passName) {
        return passName.concat('.nlp');
    }
    getFolderPasses(type, name, includeStubs = false) {
        var passes = Array();
        var collect = '';
        for (let pass of this.getPasses()) {
            if (collect.length == 0 && pass.typeStr.localeCompare(type) == 0 && pass.name.localeCompare(name) == 0) {
                collect = pass.name;
                if (includeStubs)
                    passes.push(pass);
            }
            else if (collect.length) {
                if (pass.typeStr.localeCompare('end') == 0 && pass.name.localeCompare(collect) == 0) {
                    if (includeStubs)
                        passes.push(pass);
                    break;
                }
                else {
                    passes.push(pass);
                }
            }
        }
        return passes;
    }
    getPasses() {
        if (this.passItems.length == 0) {
            this.init();
        }
        return this.passItems;
    }
    getPassFilePaths(topFlag) {
        let files = new Array();
        let infolder = false;
        for (let pass of this.getPasses()) {
            if (topFlag) {
                if (pass.typeStr == 'folder') {
                    infolder = true;
                }
                else if (pass.typeStr == 'end') {
                    infolder = false;
                }
            }
            if (!infolder && pass.typeStr == 'nlp' && pass.filepath && pass.filepath.length > 4)
                files.push(pass.filepath);
        }
        return files;
    }
    getSequenceFile() {
        var dir = server_1.visualText.analyzer.getSpecDirectory();
        if (dir.length)
            dir = path.join(server_1.visualText.analyzer.getSpecDirectory(), server_1.visualText.ANALYZER_SEQUENCE_FILE);
        return dir;
    }
    getSpecDirectory() {
        return server_1.visualText.analyzer.getSpecDirectory();
    }
    saveType(name, type, passType) {
        var passItem = this.findPass(type, name);
        if (passItem.exists()) {
            passItem.typeStr = passType;
            passItem.active = true;
            this.saveFile();
        }
    }
    saveActive(name, type, active) {
        var passItem = this.findPass(type, name);
        if (passItem.typeStr == 'folder') {
            var passes = this.getFolderPasses(passItem.typeStr, passItem.name);
            for (let pass of passes) {
                pass.active = active;
            }
            passItem.active = active;
            var last = passes[passes.length - 1];
            last = this.nextPass(last);
            last.active = active;
            this.saveFile();
        }
        else if (passItem.exists()) {
            passItem.active = active;
            this.saveFile();
        }
    }
    saveFile() {
        this.newcontent = '';
        for (let passItem of this.passItems) {
            if (this.newcontent.length)
                this.newcontent = this.newcontent.concat('\n');
            this.newcontent = this.newcontent.concat(this.passString(passItem));
        }
        fs.writeFileSync(path.join(this.specDir, server_1.visualText.ANALYZER_SEQUENCE_FILE), this.newcontent, { flag: 'w+' });
    }
    movePass(name, type, direction) {
        let passItem = this.findPass(type, name);
        let row = passItem.row;
        if (passItem.isRuleFile()) {
            if (direction == moveDirection.UP) {
                let prev = this.passItems[row - 1];
                this.swapItems(passItem, prev);
            }
            else {
                let next = this.passItems[row + 1];
                this.swapItems(passItem, next);
            }
        }
        else {
            let nextTop = this.nextTop(passItem);
            let prevTop = this.prevTop(passItem);
            if (direction == moveDirection.DOWN && nextTop.isFolder()) {
                let passesOne = this.getFolderPasses(type, name, true);
                let passesTwo = this.getFolderPasses(nextTop.typeStr, nextTop.name, true);
                let totalPassCount = passesOne.length + passesTwo.length - 1;
                let i = 0;
                let top = passesOne[0].row;
                for (i = 0; i < passesOne.length; i++) {
                    let pass = this.passItems[top];
                    this.moveCount(pass, totalPassCount);
                }
            }
            else if (direction == moveDirection.UP && prevTop.isFolder()) {
                let passesOne = this.getFolderPasses(prevTop.typeStr, prevTop.name, true);
                let passesTwo = this.getFolderPasses(type, name, true);
                let totalPassCount = passesOne.length + passesTwo.length - 1;
                let i = 0;
                let top = passesOne[0].row;
                let len = passesOne.length;
                for (i = 0; i < len; i++) {
                    let pass = this.passItems[top];
                    this.moveCount(pass, totalPassCount);
                }
            }
            else {
                let passes = this.getFolderPasses(type, name, true);
                if (direction == moveDirection.UP) {
                    row--;
                }
                else {
                    passes = passes.reverse();
                    row += passes.length;
                }
                let other = this.passItems[row];
                for (let pass of passes) {
                    this.swapItems(other, pass);
                    this.saveFile();
                    other = pass;
                }
            }
        }
        this.renumberPasses();
    }
    renumberPasses() {
        let passNum = 1;
        let row = 1;
        for (let passItem of this.passItems) {
            passItem.row = row++;
            if (passItem.isRuleFile())
                passNum++;
            passItem.passNum = passNum;
            const pause = 1;
        }
        this.passItems;
    }
    moveCount(passItem, count) {
        let i = 0;
        let pass = passItem;
        let next = passItem;
        for (i = passItem.row; i < count + passItem.row; i++) {
            next = this.passItems[i + 1];
            this.swapItems(pass, next);
            pass = next;
        }
        this.passItems;
    }
    prevNLP(passItem) {
        let row = passItem.row;
        let prev = this.passItems[--row];
        while (prev.typeStr.localeCompare('nlp') != 0) {
            prev = this.passItems[--row];
        }
        return prev;
    }
    prevTop(passItem) {
        let row = passItem.row;
        let prev = this.passItems[--row];
        while (prev.inFolder || prev.typeStr.localeCompare('end') == 0) {
            prev = this.passItems[--row];
        }
        return prev;
    }
    nextPass(passItem) {
        let row = passItem.row;
        let next = this.passItems[++row];
        return next;
    }
    nextTop(passItem) {
        let row = passItem.row;
        let next = this.passItems[++row];
        while (next.inFolder) {
            next = this.passItems[++row];
        }
        if (next.typeStr.localeCompare('end') == 0)
            next = this.passItems[++row];
        return next;
    }
    getOutputFile(passNum = this.currentPassNum, type) {
        const treeFile = new treeFile_1.TreeFile();
        const currPath = process.cwd();
        const dirPath = path.join(path.dirname(this.specDir), 'input', 'text.txt_log');
        const filePath = path.join(currPath, dirPath, treeFile.anaFile(passNum, type));
        return filePath;
    }
    hasHighLightFile(passItem) {
        const treeFile = this.getOutputFile(passItem.passNum, textFile_1.nlpFileType.TREE);
        if (fs.existsSync(treeFile)) {
            const content = fs.readFileSync(treeFile, 'utf8');
            passItem.highlightFile = content.includes('fired');
        }
        else {
            passItem.highlightFile = false;
        }
    }
    swapItems(itemOne, itemTwo) {
        const hold = new PassItem();
        this.copyItem(hold, itemOne);
        this.copyItem(itemOne, itemTwo);
        this.copyItem(itemTwo, hold);
        this.swapAuxFiles(itemOne, itemTwo, textFile_1.nlpFileType.TXXT);
        this.swapAuxFiles(itemOne, itemTwo, textFile_1.nlpFileType.KBB);
    }
    copyItem(toItem, fromItem) {
        toItem.text = fromItem.text;
        toItem.name = fromItem.name;
        toItem.tokenizer = fromItem.tokenizer;
        toItem.typeStr = fromItem.typeStr;
        toItem.inFolder = fromItem.inFolder;
        toItem.filepath = fromItem.filepath;
        toItem.comment = fromItem.comment;
        toItem.active = fromItem.active;
    }
    swapAuxFiles(itemOne, itemTwo, type) {
        var logFile = new treeFile_1.TreeFile();
        var oneFile = logFile.anaFile(itemOne.passNum, type);
        var swapFile = oneFile + ".swap";
        var twoFile = logFile.anaFile(itemTwo.passNum, type);
        var oneExists = fs.existsSync(oneFile);
        var twoExists = fs.existsSync(twoFile);
        if (oneExists && twoExists) {
            fs.copyFileSync(oneFile, swapFile);
            fs.copyFileSync(twoFile, oneFile);
            fs.copyFileSync(swapFile, twoFile);
            dirfuncs_1.dirfuncs.delFile(swapFile);
        }
        else if (oneExists) {
            dirfuncs_1.dirfuncs.rename(oneFile, twoFile);
        }
        else if (twoExists) {
            dirfuncs_1.dirfuncs.rename(twoFile, oneFile);
        }
    }
    findPass(type, name) {
        var row = 1;
        var found = false;
        for (let passItem of this.passItems) {
            if (type.localeCompare(passItem.typeStr) == 0 && name.localeCompare(passItem.name) == 0) {
                return passItem;
            }
        }
        return new PassItem();
    }
    findPassFromUri(filepath) {
        var found = false;
        for (let passItem of this.passItems) {
            if (filepath == 'tokenizer pass' || filepath == passItem.uri.fsPath) {
                return passItem;
            }
        }
        return new PassItem();
    }
    genHighLightFile() {
        const treeFile = new treeFile_1.TreeFile();
        const passItem = this.getCurrentItem();
        const currPath = process.cwd();
        const dirPath = path.join(path.dirname(this.specDir), 'input', 'text.txt_log');
        for (let passItem of this.passItems) {
            const filePath = path.join(currPath, dirPath, treeFile.anaFile(passItem.passNum, textFile_1.nlpFileType.TXXT));
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, '');
            }
        }
    }
}
exports.SequenceFile = SequenceFile;
