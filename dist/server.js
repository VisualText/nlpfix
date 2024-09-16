"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.treeFile = exports.textFile = exports.visualText = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const treeFile_1 = require("./treeFile");
const visualText_1 = require("./visualText");
const textFile_1 = require("./textFile");
const treeFile_2 = require("./treeFile");
const app = (0, express_1.default)();
const PORT = 3000;
exports.visualText = new visualText_1.VisualText();
exports.textFile = new textFile_1.TextFile();
exports.treeFile = new treeFile_2.TreeFile();
app.use(express_1.default.static('public'));
app.get('/api/readme/firstline/:analyzer', (req, res) => {
    const readMePath = path_1.default.join('analyzers', req.params.analyzer, 'README.md');
    let firstLine = exports.textFile.readFirstLine(readMePath);
    firstLine = firstLine.replace(/^#/, '').trim();
    const titleCase = (str) => {
        const words = str.toLowerCase().split(' ');
        const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
        return capitalizedWords.join(' ');
    };
    res.json(titleCase(firstLine));
});
app.get('/api/analyzers', (req, res) => {
    fs_1.default.readdir('analyzers', (err, folders) => {
        if (err) {
            return res.status(500).send('Unable to scan files');
        }
        res.json(folders);
    });
});
app.get('/api/sequence/:analyzer', (req, res) => {
    const anaDir = path_1.default.join('analyzers', req.params.analyzer);
    const dirPath = path_1.default.join(process.cwd(), anaDir);
    exports.visualText.analyzer.setWorkingDir(dirPath);
    const sequenceFile = exports.visualText.analyzer.seqFile;
    sequenceFile.getPassFiles(anaDir, true);
    let files = [];
    let i = 1;
    for (let passItem of sequenceFile.getPassItems()) {
        if (passItem.typeStr == 'nlp') {
            let data = { 'name': passItem.name, 'index': i, 'highlight': passItem.highlightFile };
            files.push(data);
        }
        i++;
    }
    res.json(files);
});
app.get('/api/highlight/:analyzer/:filename/:index', (req, res) => {
    const index = parseInt(req.params.index);
    exports.visualText.analyzer.setPassNum(index);
    const dirPath = path_1.default.join('analyzers', req.params.analyzer, 'input', 'text.txt_log');
    fs_1.default.readdir(dirPath, (err, folders) => {
        for (let file of folders) {
            if (file.endsWith('.txxt')) {
                const num = parseInt(file.substring(file.lastIndexOf('.') - 3, file.lastIndexOf('.')));
                if (num == index) {
                    const newFile = exports.visualText.analyzer.genHightlightFile(treeFile_1.genFileType.HTML);
                    fs_1.default.readFile(newFile, 'utf8', (err, data) => {
                        if (err) {
                            return res.status(500).send(`Unable to read file : ${path_1.default.join(newFile)}`);
                        }
                        res.send(data);
                    });
                    break;
                }
            }
            ;
        }
    });
});
app.get('/api/tree/:analyzer/:filename/:index', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const dirPath = path_1.default.join('analyzers', req.params.analyzer, 'input', 'text.txt_log');
    const index = parseInt(req.params.index);
    let found = false;
    let treeContent = 'No tree file found';
    try {
        const folders = yield fs_1.default.promises.readdir(dirPath);
        let found = false;
        for (let file of folders) {
            if (file.endsWith('.tree.html')) {
                const str = file.substring(3, 6);
                const num = parseInt(str);
                if (num == index) {
                    let f = path_1.default.join(dirPath, file);
                    const data = yield fs_1.default.promises.readFile(f, 'utf8');
                    treeContent = data;
                    found = true;
                    break;
                }
            }
        }
        if (!found) {
            for (let file of folders) {
                if (file.endsWith('.tree')) {
                    const str = file.substring(3, 6);
                    const num = parseInt(str);
                    if (num == index) {
                        let f = path_1.default.join(dirPath, file);
                        const data = yield fs_1.default.promises.readFile(f, 'utf8');
                        treeContent = data;
                    }
                }
            }
        }
        res.send(treeContent);
    }
    catch (err) {
        return res.status(500).send(`Unable to read directory: ${dirPath}`);
    }
}));
app.get('/api/seqfile/:analyzer/:filename', (req, res) => {
    let filePath = path_1.default.join('analyzers', req.params.analyzer, 'spec', req.params.filename + '.nlp.html');
    let html = true;
    if (!fs_1.default.existsSync(filePath)) {
        filePath = path_1.default.join('analyzers', req.params.analyzer, 'spec', req.params.filename + '.nlp');
        html = false;
    }
    fs_1.default.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send(`Unable to read file : ${filePath}`);
        }
        if (html)
            res.send(data);
        else
            res.send(`<pre>${data}</pre>`);
    });
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
