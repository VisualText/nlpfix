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
exports.dirfuncs = exports.getFileTypes = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const rimraf = __importStar(require("rimraf"));
const server_1 = require("./server");
const analyzer_1 = require("./analyzer");
var getFileTypes;
(function (getFileTypes) {
    getFileTypes[getFileTypes["UNKNOWN"] = 0] = "UNKNOWN";
    getFileTypes[getFileTypes["FILES"] = 1] = "FILES";
    getFileTypes[getFileTypes["FILES_DIRS"] = 2] = "FILES_DIRS";
    getFileTypes[getFileTypes["DIRS"] = 3] = "DIRS";
})(getFileTypes || (exports.getFileTypes = getFileTypes = {}));
var dirfuncs;
(function (dirfuncs) {
    function copyDirectory(fromPath, toPath) {
        var copydir = require('copy-dir');
        if (!fs.existsSync(toPath)) {
            if (!makeDir(toPath))
                return false;
        }
        copydir(fromPath, toPath, function (err) {
            if (err)
                return false;
        });
        return true;
    }
    dirfuncs.copyDirectory = copyDirectory;
    function copyFile(fromPath, toPath) {
        if (!fs.existsSync(fromPath)) {
            // vscode.window.showInformationMessage('copyFile from does not exist: ' + fromPath);
            return false;
        }
        try {
            const statsFrom = fs.statSync(fromPath);
            if (statsFrom.isFile()) {
                fs.copyFileSync(fromPath, toPath);
                return true;
            }
        }
        catch (err) {
            // vscode.window.showInformationMessage('Could not copy file ' + fromPath + ' to ' + toPath + ' - ' + err.message);
        }
        return false;
    }
    dirfuncs.copyFile = copyFile;
    function changeMod(filePath, mod) {
        try {
            fs.chmodSync(filePath, mod);
            return true;
        }
        catch (err) {
            // vscode.window.showInformationMessage('Could not chmod on ' + filePath + ' - ' + err.message);
        }
        return false;
    }
    dirfuncs.changeMod = changeMod;
    function sameParentDirectory(dir1, dir2) {
        return path.dirname(dir1).localeCompare(path.dirname(dir2)) == 0 ? true : false;
    }
    dirfuncs.sameParentDirectory = sameParentDirectory;
    function isDir(path) {
        if (path.length <= 1)
            return false;
        try {
            const stats = fs.statSync(path);
            if (stats.isDirectory())
                return true;
        }
        catch (err) {
            //visualText.debugMessage(err.message);
        }
        return false;
    }
    dirfuncs.isDir = isDir;
    function rename(oldPath, newPath) {
        try {
            fs.renameSync(oldPath, newPath);
            return true;
        }
        catch (err) {
            // vscode.window.showInformationMessage('Could not rename file ' + oldPath + ' to ' + newPath + ' - ' + err.message);
        }
        return false;
    }
    dirfuncs.rename = rename;
    function findFolder(dirPath, folderToFind) {
        var parentDir = path.dirname(dirPath);
        if (path.basename(parentDir).localeCompare(folderToFind) == 0) {
            return parentDir;
        }
        if (parentDir && (parentDir === null || parentDir === void 0 ? void 0 : parentDir.length) > 1) {
            var found = findFolder(parentDir, folderToFind);
            if (found.length > 2)
                return found;
        }
        var dirs = getDirectories(dirPath);
        for (let dir of dirs) {
            if (path.basename(dir).localeCompare(folderToFind) == 0) {
                return dir;
            }
        }
        return '';
    }
    dirfuncs.findFolder = findFolder;
    function analyzerFolderCount(dirPath) {
        var specCount = 0;
        var dirs = getDirectories(dirPath);
        for (let dir of dirs) {
            var subDirs = getDirectories(dir);
            for (let subDir of subDirs) {
                if (path.basename(subDir).localeCompare(server_1.visualText.ANALYZER_SEQUENCE_FOLDER) == 0) {
                    let specfile = path.join(subDir, server_1.visualText.ANALYZER_SEQUENCE_FILE);
                    if (fs.existsSync(specfile))
                        specCount++;
                }
            }
        }
        return specCount;
    }
    dirfuncs.analyzerFolderCount = analyzerFolderCount;
    function getDirectories(folder) {
        const dirUris = new Array();
        if (dirfuncs.isDir(folder)) {
            const filenames = fs.readdirSync(folder);
            for (let filename of filenames) {
                if (!filename.startsWith('.')) {
                    var filepath = path.join(folder, filename);
                    try {
                        const stats = fs.statSync(filepath);
                        if (stats.isDirectory())
                            dirUris.push(filepath);
                    }
                    catch (err) {
                        console.error(err);
                    }
                }
            }
        }
        return dirUris;
    }
    dirfuncs.getDirectories = getDirectories;
    function fileCount(dir) {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        let count = 0;
        for (const file of files) {
            if (file.isFile()) {
                count++;
            }
            else if (file.isDirectory() && !dirfuncs.directoryIsLog(file.name)) {
                count += fileCount(path.join(dir, file.name));
            }
        }
        return count;
    }
    dirfuncs.fileCount = fileCount;
    function getFiles(folder, filter = [], getType = getFileTypes.FILES, recurse = false) {
        const fileUris = new Array();
        const filenames = fs.readdirSync(folder);
        for (let filename of filenames) {
            if (!filename.startsWith('.')) {
                var filePath = path.join(folder, filename);
                var ext = path.extname(filePath);
                const stats = fs.statSync(filePath);
                if ((getType == getFileTypes.DIRS && stats.isDirectory()) || filter.length == 0 || filter.includes(ext))
                    fileUris.push(filePath);
                if (stats.isDirectory() && recurse) {
                    var children = getFiles(filename, filter, getType, recurse);
                    for (let child of children) {
                        fileUris.push(child);
                    }
                }
            }
        }
        return fileUris;
    }
    dirfuncs.getFiles = getFiles;
    function makeDir(dirPath) {
        try {
            fs.mkdirSync(dirPath);
            return true;
        }
        catch (err) {
            // vscode.window.showInformationMessage('Error creating folder ' + dirPath + ': ' + err.message);
        }
        return false;
    }
    dirfuncs.makeDir = makeDir;
    function writeFile(filePath, content) {
        var dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            try {
                fs.mkdirSync(dir);
            }
            catch (err) {
                // vscode.window.showInformationMessage('Error creating directory ' + dir + ': ' + err.message);
                return false;
            }
        }
        try {
            fs.writeFileSync(filePath, content, 'utf-8');
            return true;
        }
        catch (err) {
            // vscode.window.showInformationMessage('Error writing file ' + filePath + ': ' + err.message);
        }
        return false;
    }
    dirfuncs.writeFile = writeFile;
    function getDirPath(filePath) {
        try {
            const stats = fs.statSync(filePath);
            if (stats.isDirectory())
                return filePath;
            else if (stats.isFile()) {
                return path.dirname(filePath);
            }
        }
        catch (err) {
            // vscode.window.showInformationMessage('Error reading file stats on ' + filePath + ': ' + err.message);
        }
        return '';
    }
    dirfuncs.getDirPath = getDirPath;
    function delFile(filePath) {
        try {
            fs.unlinkSync(filePath);
            return true;
        }
        catch (err) {
            // vscode.window.showInformationMessage('Error deleting file ' + filePath + ': ' + err.message);
        }
        return false;
    }
    dirfuncs.delFile = delFile;
    function delDir(dirPath) {
        if (!fs.existsSync(dirPath) || dirPath.length <= 2)
            return false;
        try {
            rimraf.sync(dirPath);
            return true;
        }
        catch (err) {
            // vscode.window.showInformationMessage('Error deleting folder ' + dirPath + ': ' + err.message);
        }
        return false;
    }
    dirfuncs.delDir = delDir;
    function deleteFiles(folder, filter = []) {
        const fileUris = new Array();
        const filenames = fs.readdirSync(folder);
        for (let filename of filenames) {
            if (!filename.startsWith('.')) {
                var filePath = path.join(folder, filename);
                var ext = path.extname(filePath);
                const stats = fs.statSync(filePath);
                if (!stats.isDirectory() && (filter.length == 0 || filter.includes(ext)))
                    delFile(filePath);
            }
        }
        return fileUris;
    }
    dirfuncs.deleteFiles = deleteFiles;
    function emptyDir(dirPath) {
        if (!fs.existsSync(dirPath) || dirPath.length <= 2)
            return false;
        try {
            rimraf.sync(dirPath);
            fs.mkdirSync(dirPath);
            return true;
        }
        catch (err) {
            // vscode.window.showInformationMessage('Error emptying folder ' + dirPath + ': ' + err.message);
        }
        return false;
    }
    dirfuncs.emptyDir = emptyDir;
    function analyzerHasLogFiles(dir) {
        var outputDir = server_1.visualText.analyzer.constructDir(dir, analyzer_1.anaSubDir.OUTPUT);
        if (fs.existsSync(outputDir) && dirfuncs.directoryHasFiles(outputDir))
            return true;
        var logsDir = server_1.visualText.analyzer.constructDir(dir, analyzer_1.anaSubDir.LOGS);
        if (fs.existsSync(logsDir) && dirfuncs.directoryHasFiles(logsDir))
            return true;
        var inputDir = server_1.visualText.analyzer.constructDir(dir, analyzer_1.anaSubDir.INPUT);
        if (fs.existsSync(inputDir)) {
            return dirfuncs.hasLogDirs(inputDir, false);
        }
        return false;
    }
    dirfuncs.analyzerHasLogFiles = analyzerHasLogFiles;
    function directoryHasFiles(dir) {
        const filenames = fs.readdirSync(dir);
        return filenames.length ? true : false;
    }
    dirfuncs.directoryHasFiles = directoryHasFiles;
    function hasLogDirs(dir, first) {
        if (dirfuncs.isDir(dir)) {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (let entry of entries) {
                if (entry.isDirectory()) {
                    if (server_1.visualText.isAnalyzerDirectory(entry.name) && dirfuncs.analyzerHasLogFiles(entry.name))
                        return true;
                    if (dirfuncs.directoryIsLog(entry.name))
                        return true;
                    else {
                        var has = dirfuncs.hasLogDirs(entry.name, false);
                        if (has)
                            return true;
                    }
                }
            }
        }
        else {
            return dirfuncs.fileHasLog(dir);
        }
        return false;
    }
    dirfuncs.hasLogDirs = hasLogDirs;
    function hasFile(dir, filename) {
        if (dirfuncs.isDir(dir)) {
            const files = fs.readdirSync(dir, { withFileTypes: true });
            for (const file of files) {
                if (file.name == filename)
                    return true;
            }
        }
        return false;
    }
    dirfuncs.hasFile = hasFile;
    function hasFiles(dir) {
        if (dirfuncs.isDir(dir)) {
            const files = fs.readdirSync(dir, { withFileTypes: true });
            if (files && files.length > 0)
                return true;
        }
        return false;
    }
    dirfuncs.hasFiles = hasFiles;
    function hasDirs(dir) {
        if (dirfuncs.isDir(dir)) {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory() && !server_1.visualText.isAnalyzerDirectory(entry.name)) {
                    return true;
                }
            }
        }
        return false;
    }
    dirfuncs.hasDirs = hasDirs;
    function parentHasOtherDirs(dir) {
        var parent = path.dirname(dir);
        var basename = path.basename(dir);
        if (parent.length) {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory()
                    && path.basename(entry.name) != basename
                    && !server_1.visualText.isAnalyzerDirectory(entry.name)
                    && !entry.name.endsWith(server_1.visualText.TEST_SUFFIX)
                    && !dirfuncs.directoryIsLog(entry.name)) {
                    return true;
                }
            }
        }
        return false;
    }
    dirfuncs.parentHasOtherDirs = parentHasOtherDirs;
    function directoryIsLog(dirPath) {
        return dirPath.endsWith(server_1.visualText.LOG_SUFFIX);
    }
    dirfuncs.directoryIsLog = directoryIsLog;
    function fileHasLog(filePath) {
        return dirfuncs.isDir(filePath + server_1.visualText.LOG_SUFFIX);
    }
    dirfuncs.fileHasLog = fileHasLog;
    function needToCopy(fileFrom, fileTo) {
        if (!fs.existsSync(fileTo))
            return true;
        try {
            const file1Content = fs.readFileSync(fileFrom, 'utf-8');
            const file2Content = fs.readFileSync(fileTo, 'utf-8');
            if (file1Content === file2Content)
                return false;
            return true;
        }
        catch (error) {
            console.error('Error reading files:', error);
            return false;
        }
    }
    dirfuncs.needToCopy = needToCopy;
})(dirfuncs || (exports.dirfuncs = dirfuncs = {}));
