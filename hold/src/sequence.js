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
exports.SequenceFile = exports.PassItem = exports.newPassType = exports.moveDirection = void 0;
var path = require("path");
var fs = require("fs");
var textFile_1 = require("./textFile");
var treeFile_1 = require("./treeFile");
var dirfuncs_1 = require("./dirfuncs");
var server_1 = require("./server");
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
var PassItem = /** @class */ (function () {
    function PassItem() {
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
        this.tokenizers = ['tokenize', 'tok', 'token', 'cmltokenize', 'cmltok', 'dicttok', 'dicttokz', 'chartok'];
    }
    PassItem.prototype.isTokenizer = function () {
        return this.tokenizers.includes(this.typeStr.toLowerCase());
    };
    // public fetchTooltip(): string {
    // 	var index = this.tokenizers.indexOf(this.typeStr);
    // 	var tooltip = this.tokenizerTooltips[index];
    // 	return tooltip;
    // }
    PassItem.prototype.isRuleFile = function () {
        return this.typeStr.localeCompare('nlp') == 0 || this.typeStr.localeCompare('rec') == 0;
    };
    PassItem.prototype.isFolder = function () {
        return this.typeStr.localeCompare('folder') == 0;
    };
    PassItem.prototype.isStub = function () {
        return this.typeStr.localeCompare('stub') == 0;
    };
    PassItem.prototype.isEnd = function (name) {
        return this.typeStr.localeCompare('end') == 0 && this.name.localeCompare(name) == 0;
    };
    PassItem.prototype.fileExists = function () {
        return fs.existsSync(this.filepath) ? true : false;
    };
    PassItem.prototype.exists = function () {
        return this.empty ? false : true;
    };
    PassItem.prototype.isEmpty = function () {
        return this.empty;
    };
    PassItem.prototype.clear = function () {
        this.text = '';
        this.name = '';
        this.comment = '';
        this.passNum = 0;
        this.row = 0;
        this.typeStr = '';
        this.inFolder = false;
        this.empty = true;
        this.active = true;
    };
    return PassItem;
}());
exports.PassItem = PassItem;
var SequenceFile = /** @class */ (function (_super) {
    __extends(SequenceFile, _super);
    function SequenceFile() {
        var _this = _super.call(this) || this;
        _this.specDir = '';
        _this.passItems = new Array();
        _this.cleanpasses = new Array();
        _this.newcontent = '';
        return _this;
    }
    SequenceFile.prototype.init = function () {
        if (this.filepath) {
            this.getPassFiles(this.filepath);
        }
    };
    SequenceFile.prototype.setSpecDir = function (specDir) {
        this.specDir = specDir;
    };
    SequenceFile.prototype.getPassFiles = function (specDir, addSpec) {
        if (addSpec === void 0) { addSpec = false; }
        specDir = addSpec ? path.join(specDir, server_1.visualText.ANALYZER_SEQUENCE_FOLDER) : specDir;
        if (addSpec)
            this.setSpecDir(specDir);
        var anaFile = path.join(specDir, server_1.visualText.ANALYZER_SEQUENCE_FILE);
        _super.prototype.setFile.call(this, anaFile, true);
        var passNum = 1;
        this.passItems = [];
        var folder = '';
        var row = 0;
        for (var _i = 0, _a = this.getLines(); _i < _a.length; _i++) {
            var passStr = _a[_i];
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
                this.passItems.push(passItem);
            }
        }
    };
    SequenceFile.prototype.getPassItemFiles = function () {
        var files = new Array();
        for (var _i = 0, _a = this.passItems; _i < _a.length; _i++) {
            var passItem = _a[_i];
            files.push(passItem.filepath);
        }
        return files;
    };
    SequenceFile.prototype.getPassItems = function () {
        return this.passItems;
    };
    SequenceFile.prototype.getLastItem = function () {
        return this.passItems[this.passItems.length - 1];
    };
    SequenceFile.prototype.getLastItemInFolder = function (row) {
        var folderItem = this.passItems[row];
        for (var i = row; i < this.passItems.length; i++) {
            var passItem = this.passItems[i];
            if (passItem.name.localeCompare(folderItem.name) == 0 && passItem.typeStr.localeCompare('end') == 0)
                return passItem;
        }
        return folderItem;
    };
    SequenceFile.prototype.isOrphan = function (nlpFileName) {
        for (var _i = 0, _a = this.passItems; _i < _a.length; _i++) {
            var passItem = _a[_i];
            if (passItem.name.localeCompare(nlpFileName) == 0)
                return false;
        }
        return true;
    };
    SequenceFile.prototype.setPass = function (passStr, passNum) {
        var passItem = new PassItem();
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
    };
    SequenceFile.prototype.passItemPath = function (passItem) {
        passItem.filepath = path.join(this.specDir, passItem.name + '.pat');
        if (!fs.existsSync(passItem.filepath))
            passItem.filepath = path.join(this.specDir, passItem.name + '.nlp');
        return passItem.filepath;
    };
    SequenceFile.prototype.tokenStr = function (tokens, start) {
        var tokenStr = '';
        var i = 0;
        var end = tokens.length;
        for (i = start; i < end; i++) {
            var tok = tokens[i];
            if (tokenStr.length)
                tokenStr = tokenStr + ' ';
            tokenStr = tokenStr + tok;
        }
        return tokenStr;
    };
    SequenceFile.prototype.passString = function (passItem) {
        var activeStr = passItem.active ? '' : '/';
        return activeStr + passItem.typeStr + '\t' + passItem.name + '\t' + passItem.comment;
    };
    SequenceFile.prototype.base = function (passname) {
        var basename = path.basename(passname, '.pat');
        basename = path.basename(basename, '.nlp');
        return basename;
    };
    SequenceFile.prototype.getPassByRow = function (row) {
        for (var _i = 0, _a = this.passItems; _i < _a.length; _i++) {
            var passItem = _a[_i];
            if (passItem.row == row)
                return passItem;
        }
        return new PassItem();
    };
    SequenceFile.prototype.getPassByNumber = function (passNumber) {
        for (var _i = 0, _a = this.passItems; _i < _a.length; _i++) {
            var passItem = _a[_i];
            if (passItem.passNum == passNumber)
                return passItem;
        }
        return new PassItem();
    };
    SequenceFile.prototype.getPathByPassNumber = function (passNumber) {
        var passItem = this.getPassByNumber(passNumber);
        if (!passItem.isEmpty())
            return passItem.filepath;
        return '';
    };
    SequenceFile.prototype.passCount = function () {
        return this.passItems.length;
    };
    SequenceFile.prototype.atBottom = function (passItem) {
        var passes = this.getFolderPasses(passItem.typeStr, passItem.name, true);
        return passes.length + passItem.row == this.passCount();
    };
    SequenceFile.prototype.cleanPasses = function () {
        this.cleanpasses = [];
        var passNum = 1;
        for (var _i = 0, _a = this.passItems; _i < _a.length; _i++) {
            var passItem = _a[_i];
            this.cleanpasses.push(this.passString(passItem));
        }
    };
    SequenceFile.prototype.inFolder = function (passItem) {
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
    };
    SequenceFile.prototype.renamePass = function (name, type, newPassName) {
        if (this.passItems.length) {
            var passItem = this.findPass(type, name);
            if (type.localeCompare('folder') == 0) {
                var passes = this.getFolderPasses(type, name, true);
                passes[passes.length - 1].name = newPassName;
            }
            passItem.name = newPassName;
            this.saveFile();
        }
    };
    SequenceFile.prototype.duplicatePass = function (name, type, newPassName) {
        if (this.passItems.length) {
            var passItem = this.findPass(type, name);
            var dupePath = path.join(path.dirname(passItem.filepath), newPassName + '.nlp');
            fs.copyFileSync(passItem.filepath, dupePath);
            var dupeItem = this.createPassItemFromFile(dupePath);
            this.passItems.splice(passItem.row + 1, 0, dupeItem);
            this.saveFile();
        }
    };
    SequenceFile.prototype.insertPass = function (row, newpass) {
        if (this.passItems.length) {
            if (row >= 0) {
                var passes = new Array();
                passes.push(newpass);
                var copy = false;
                var specDir = server_1.visualText.analyzer.getSpecDirectory();
                if (specDir.localeCompare(path.dirname(newpass))) {
                    if (dirfuncs_1.dirfuncs.isDir(newpass)) {
                        passes = [];
                        passes = dirfuncs_1.dirfuncs.getFiles(newpass);
                    }
                    copy = true;
                }
                var pi = this.passItems[0];
                for (var _i = 0, passes_1 = passes; _i < passes_1.length; _i++) {
                    var pass = passes_1[_i];
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
    };
    SequenceFile.prototype.findPassByFilename = function (filename) {
        var passes = this.getPasses();
        var name = path.parse(filename).name;
        for (var _i = 0, passes_2 = passes; _i < passes_2.length; _i++) {
            var pass = passes_2[_i];
            if (pass.name == name) {
                return pass.passNum;
            }
        }
        return 0;
    };
    SequenceFile.prototype.insertNewPass = function (name, type, newPass, passtype) {
        if (this.passItems.length && newPass.length) {
            var foundItem = this.findPass(type, name);
            if (foundItem) {
                var newfile = this.createNewPassFile(newPass, passtype);
                var passItem = this.createPassItemFromFile(newfile);
                this.passItems.splice(foundItem.row + 1, 0, passItem);
                this.saveFile();
            }
        }
    };
    SequenceFile.prototype.insertNewPassEnd = function (newpass, type) {
        if (this.passItems.length && newpass.length) {
            var newfile = this.createNewPassFile(newpass, type);
            var passItem = this.createPassItemFromFile(newfile);
            this.passItems.push(passItem);
            this.saveFile();
        }
    };
    SequenceFile.prototype.insertNewFolderPass = function (row, folderName, type) {
        var passItem = this.getPassByRow(row);
        if (folderName.length) {
            if (passItem) {
                var newPassItem = this.createPassItemFolder(type, folderName);
                newPassItem.row = row + 1;
                newPassItem.passNum = passItem.passNum;
                this.passItems.splice(newPassItem.row, 0, newPassItem);
                this.saveFile();
                return newPassItem.row;
            }
        }
        return row;
    };
    SequenceFile.prototype.insertNewFolder = function (name, type, newFolder) {
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
    };
    SequenceFile.prototype.moveToFolderEnd = function (passItem) {
        var passes = this.getFolderPasses(passItem.typeStr, passItem.name, true);
        return passes[passes.length - 1];
    };
    SequenceFile.prototype.insertNewFolderEnd = function (newFolder) {
        if (this.passItems.length && newFolder.length) {
            var passItem = this.createPassItemFolder('folder', newFolder);
            this.passItems.push(passItem);
            passItem = this.createPassItemFolder('end', newFolder);
            this.passItems.push(passItem);
            this.saveFile();
        }
    };
    SequenceFile.prototype.createPassItemFolder = function (type, name) {
        var passItem = new PassItem();
        passItem.typeStr = type;
        passItem.name = name;
        passItem.comment = '# new folder';
        return passItem;
    };
    SequenceFile.prototype.deletePass = function (name, type) {
        var passItem = this.findPass(type, name);
        if (passItem.isFolder()) {
            this.deleteFolder(passItem);
        }
        else
            this.deletePassInSeqFile(passItem.typeStr, passItem.name);
        this.saveFile();
    };
    SequenceFile.prototype.deleteFolder = function (passItem, foldersOnly) {
        if (foldersOnly === void 0) { foldersOnly = false; }
        var passes = this.getFolderPasses(passItem.typeStr, passItem.name, true);
        if (foldersOnly) {
            var len = passes.length;
            var first = passes[0];
            var last = passes[len - 1];
            this.deletePassInSeqFile(last.typeStr, last.name);
            this.deletePassInSeqFile(first.typeStr, first.name);
        }
        else {
            this.passItems.splice(passes[0].row, passes.length);
        }
    };
    SequenceFile.prototype.deletePassInSeqFile = function (type, name) {
        var passItem = this.findPass(type, name);
        if (passItem) {
            this.passItems.splice(passItem.row, 1);
        }
    };
    SequenceFile.prototype.createNewPassFile = function (filename, type) {
        var newfilepath = path.join(server_1.visualText.analyzer.getSpecDirectory(), filename.concat('.nlp'));
        fs.writeFileSync(newfilepath, this.newPassContent(filename, type), { flag: 'w+' });
        return newfilepath;
    };
    SequenceFile.prototype.todayDate = function () {
        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        return date + ' ' + time;
    };
    SequenceFile.prototype.newPassContent = function (filename, type) {
        // const config = vscode.workspace.getConfiguration('user');
        // var username = config.get<string>('name');
        var username = 'de Hilster';
        if ((username === null || username === void 0 ? void 0 : username.length) == 0)
            username = 'Your Name';
        var newpass = '###############################################\n';
        newpass = newpass.concat('# FILE: ', filename, '\n');
        newpass = newpass.concat('# SUBJ: comment\n');
        newpass = newpass.concat("# AUTH: ".concat(username, "\n"));
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
    };
    SequenceFile.prototype.createPassItemFromFile = function (filePath) {
        var passItem = new PassItem();
        passItem.filepath = filePath;
        passItem.name = this.base(filePath);
        passItem.typeStr = path.extname(filePath).substring(1);
        passItem.comment = '# comment';
        passItem.text = this.passString(passItem);
        passItem.empty = false;
        return passItem;
    };
    SequenceFile.prototype.passFileName = function (passName) {
        return passName.concat('.nlp');
    };
    SequenceFile.prototype.getFolderPasses = function (type, name, includeStubs) {
        if (includeStubs === void 0) { includeStubs = false; }
        var passes = Array();
        var collect = '';
        for (var _i = 0, _a = this.getPasses(); _i < _a.length; _i++) {
            var pass = _a[_i];
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
    };
    SequenceFile.prototype.getPasses = function () {
        if (this.passItems.length == 0) {
            this.init();
        }
        return this.passItems;
    };
    SequenceFile.prototype.getPassFilePaths = function (topFlag) {
        var files = new Array();
        var infolder = false;
        for (var _i = 0, _a = this.getPasses(); _i < _a.length; _i++) {
            var pass = _a[_i];
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
    };
    SequenceFile.prototype.getSequenceFile = function () {
        var dir = server_1.visualText.analyzer.getSpecDirectory();
        if (dir.length)
            dir = path.join(server_1.visualText.analyzer.getSpecDirectory(), server_1.visualText.ANALYZER_SEQUENCE_FILE);
        return dir;
    };
    SequenceFile.prototype.getSpecDirectory = function () {
        return server_1.visualText.analyzer.getSpecDirectory();
    };
    SequenceFile.prototype.saveType = function (name, type, passType) {
        var passItem = this.findPass(type, name);
        if (passItem.exists()) {
            passItem.typeStr = passType;
            passItem.active = true;
            this.saveFile();
        }
    };
    SequenceFile.prototype.saveActive = function (name, type, active) {
        var passItem = this.findPass(type, name);
        if (passItem.typeStr == 'folder') {
            var passes = this.getFolderPasses(passItem.typeStr, passItem.name);
            for (var _i = 0, passes_3 = passes; _i < passes_3.length; _i++) {
                var pass = passes_3[_i];
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
    };
    SequenceFile.prototype.saveFile = function () {
        this.newcontent = '';
        for (var _i = 0, _a = this.passItems; _i < _a.length; _i++) {
            var passItem = _a[_i];
            if (this.newcontent.length)
                this.newcontent = this.newcontent.concat('\n');
            this.newcontent = this.newcontent.concat(this.passString(passItem));
        }
        fs.writeFileSync(path.join(this.specDir, server_1.visualText.ANALYZER_SEQUENCE_FILE), this.newcontent, { flag: 'w+' });
    };
    SequenceFile.prototype.movePass = function (name, type, direction) {
        var passItem = this.findPass(type, name);
        var row = passItem.row;
        if (passItem.isRuleFile()) {
            if (direction == moveDirection.UP) {
                var prev = this.passItems[row - 1];
                this.swapItems(passItem, prev);
            }
            else {
                var next = this.passItems[row + 1];
                this.swapItems(passItem, next);
            }
        }
        else {
            var nextTop = this.nextTop(passItem);
            var prevTop = this.prevTop(passItem);
            if (direction == moveDirection.DOWN && nextTop.isFolder()) {
                var passesOne = this.getFolderPasses(type, name, true);
                var passesTwo = this.getFolderPasses(nextTop.typeStr, nextTop.name, true);
                var totalPassCount = passesOne.length + passesTwo.length - 1;
                var i = 0;
                var top_1 = passesOne[0].row;
                for (i = 0; i < passesOne.length; i++) {
                    var pass = this.passItems[top_1];
                    this.moveCount(pass, totalPassCount);
                }
            }
            else if (direction == moveDirection.UP && prevTop.isFolder()) {
                var passesOne = this.getFolderPasses(prevTop.typeStr, prevTop.name, true);
                var passesTwo = this.getFolderPasses(type, name, true);
                var totalPassCount = passesOne.length + passesTwo.length - 1;
                var i = 0;
                var top_2 = passesOne[0].row;
                var len = passesOne.length;
                for (i = 0; i < len; i++) {
                    var pass = this.passItems[top_2];
                    this.moveCount(pass, totalPassCount);
                }
            }
            else {
                var passes = this.getFolderPasses(type, name, true);
                if (direction == moveDirection.UP) {
                    row--;
                }
                else {
                    passes = passes.reverse();
                    row += passes.length;
                }
                var other = this.passItems[row];
                for (var _i = 0, passes_4 = passes; _i < passes_4.length; _i++) {
                    var pass = passes_4[_i];
                    this.swapItems(other, pass);
                    this.saveFile();
                    other = pass;
                }
            }
        }
        this.renumberPasses();
    };
    SequenceFile.prototype.renumberPasses = function () {
        var passNum = 1;
        var row = 1;
        for (var _i = 0, _a = this.passItems; _i < _a.length; _i++) {
            var passItem = _a[_i];
            passItem.row = row++;
            if (passItem.isRuleFile())
                passNum++;
            passItem.passNum = passNum;
            var pause = 1;
        }
        this.passItems;
    };
    SequenceFile.prototype.moveCount = function (passItem, count) {
        var i = 0;
        var pass = passItem;
        var next = passItem;
        for (i = passItem.row; i < count + passItem.row; i++) {
            next = this.passItems[i + 1];
            this.swapItems(pass, next);
            pass = next;
        }
        this.passItems;
    };
    SequenceFile.prototype.prevNLP = function (passItem) {
        var row = passItem.row;
        var prev = this.passItems[--row];
        while (prev.typeStr.localeCompare('nlp') != 0) {
            prev = this.passItems[--row];
        }
        return prev;
    };
    SequenceFile.prototype.prevTop = function (passItem) {
        var row = passItem.row;
        var prev = this.passItems[--row];
        while (prev.inFolder || prev.typeStr.localeCompare('end') == 0) {
            prev = this.passItems[--row];
        }
        return prev;
    };
    SequenceFile.prototype.nextPass = function (passItem) {
        var row = passItem.row;
        var next = this.passItems[++row];
        return next;
    };
    SequenceFile.prototype.nextTop = function (passItem) {
        var row = passItem.row;
        var next = this.passItems[++row];
        while (next.inFolder) {
            next = this.passItems[++row];
        }
        if (next.typeStr.localeCompare('end') == 0)
            next = this.passItems[++row];
        return next;
    };
    SequenceFile.prototype.swapItems = function (itemOne, itemTwo) {
        var hold = new PassItem();
        this.copyItem(hold, itemOne);
        this.copyItem(itemOne, itemTwo);
        this.copyItem(itemTwo, hold);
        this.swapAuxFiles(itemOne, itemTwo, textFile_1.nlpFileType.TXXT);
        this.swapAuxFiles(itemOne, itemTwo, textFile_1.nlpFileType.KBB);
    };
    SequenceFile.prototype.copyItem = function (toItem, fromItem) {
        toItem.text = fromItem.text;
        toItem.name = fromItem.name;
        toItem.tokenizer = fromItem.tokenizer;
        toItem.typeStr = fromItem.typeStr;
        toItem.inFolder = fromItem.inFolder;
        toItem.filepath = fromItem.filepath;
        toItem.comment = fromItem.comment;
        toItem.active = fromItem.active;
    };
    SequenceFile.prototype.swapAuxFiles = function (itemOne, itemTwo, type) {
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
    };
    SequenceFile.prototype.findPass = function (type, name) {
        var row = 1;
        var found = false;
        for (var _i = 0, _a = this.passItems; _i < _a.length; _i++) {
            var passItem = _a[_i];
            if (type.localeCompare(passItem.typeStr) == 0 && name.localeCompare(passItem.name) == 0) {
                return passItem;
            }
        }
        return new PassItem();
    };
    SequenceFile.prototype.findPassFromUri = function (filepath) {
        var found = false;
        for (var _i = 0, _a = this.passItems; _i < _a.length; _i++) {
            var passItem = _a[_i];
            if (filepath == 'tokenizer pass' || filepath == passItem.uri.fsPath) {
                return passItem;
            }
        }
        return new PassItem();
    };
    return SequenceFile;
}(textFile_1.TextFile));
exports.SequenceFile = SequenceFile;
