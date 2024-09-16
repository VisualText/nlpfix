"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const treeFile_1 = require("./treeFile");
const treeFile = new treeFile_1.TreeFile();
const analyzersPath = path_1.default.join(path_1.default.dirname(__dirname), 'analyzers');
fs_1.default.readdirSync(analyzersPath).forEach((folder) => {
    const folderPath = path_1.default.join(analyzersPath, folder, 'input', 'text.txt_log');
    if (fs_1.default.existsSync(folderPath)) {
        fs_1.default.readdirSync(folderPath).forEach((file) => {
            if (file.endsWith('.tree')) {
                const num = parseInt(file.substring(file.lastIndexOf('.') - 3, file.lastIndexOf('.')));
                treeFile.firedFile(num, true);
            }
        });
    }
});
