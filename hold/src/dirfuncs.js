"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dirfuncs = exports.getFileTypes = void 0;
var path = require("path");
var fs = require("fs");
var rimraf = require("rimraf");
var server_1 = require("./server");
var analyzer_1 = require("./analyzer");
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
            var statsFrom = fs.statSync(fromPath);
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
            var stats = fs.statSync(path);
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
        for (var _i = 0, dirs_1 = dirs; _i < dirs_1.length; _i++) {
            var dir = dirs_1[_i];
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
        for (var _i = 0, dirs_2 = dirs; _i < dirs_2.length; _i++) {
            var dir = dirs_2[_i];
            var subDirs = getDirectories(dir);
            for (var _a = 0, subDirs_1 = subDirs; _a < subDirs_1.length; _a++) {
                var subDir = subDirs_1[_a];
                if (path.basename(subDir).localeCompare(server_1.visualText.ANALYZER_SEQUENCE_FOLDER) == 0) {
                    var specfile = path.join(subDir, server_1.visualText.ANALYZER_SEQUENCE_FILE);
                    if (fs.existsSync(specfile))
                        specCount++;
                }
            }
        }
        return specCount;
    }
    dirfuncs.analyzerFolderCount = analyzerFolderCount;
    function getDirectories(folder) {
        var dirUris = new Array();
        if (dirfuncs.isDir(folder)) {
            var filenames = fs.readdirSync(folder);
            for (var _i = 0, filenames_1 = filenames; _i < filenames_1.length; _i++) {
                var filename = filenames_1[_i];
                if (!filename.startsWith('.')) {
                    var filepath = path.join(folder, filename);
                    try {
                        var stats = fs.statSync(filepath);
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
        var files = fs.readdirSync(dir, { withFileTypes: true });
        var count = 0;
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
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
    function getFiles(folder, filter, getType, recurse) {
        if (filter === void 0) { filter = []; }
        if (getType === void 0) { getType = getFileTypes.FILES; }
        if (recurse === void 0) { recurse = false; }
        var fileUris = new Array();
        var filenames = fs.readdirSync(folder);
        for (var _i = 0, filenames_2 = filenames; _i < filenames_2.length; _i++) {
            var filename = filenames_2[_i];
            if (!filename.startsWith('.')) {
                var filePath = path.join(folder, filename);
                var ext = path.extname(filePath);
                var stats = fs.statSync(filePath);
                if ((getType == getFileTypes.DIRS && stats.isDirectory()) || filter.length == 0 || filter.includes(ext))
                    fileUris.push(filePath);
                if (stats.isDirectory() && recurse) {
                    var children = getFiles(filename, filter, getType, recurse);
                    for (var _a = 0, children_1 = children; _a < children_1.length; _a++) {
                        var child = children_1[_a];
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
            var stats = fs.statSync(filePath);
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
    function deleteFiles(folder, filter) {
        if (filter === void 0) { filter = []; }
        var fileUris = new Array();
        var filenames = fs.readdirSync(folder);
        for (var _i = 0, filenames_3 = filenames; _i < filenames_3.length; _i++) {
            var filename = filenames_3[_i];
            if (!filename.startsWith('.')) {
                var filePath = path.join(folder, filename);
                var ext = path.extname(filePath);
                var stats = fs.statSync(filePath);
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
        var filenames = fs.readdirSync(dir);
        return filenames.length ? true : false;
    }
    dirfuncs.directoryHasFiles = directoryHasFiles;
    function hasLogDirs(dir, first) {
        if (dirfuncs.isDir(dir)) {
            var entries = fs.readdirSync(dir, { withFileTypes: true });
            for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                var entry = entries_1[_i];
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
            var files = fs.readdirSync(dir, { withFileTypes: true });
            for (var _i = 0, files_2 = files; _i < files_2.length; _i++) {
                var file = files_2[_i];
                if (file.name == filename)
                    return true;
            }
        }
        return false;
    }
    dirfuncs.hasFile = hasFile;
    function hasFiles(dir) {
        if (dirfuncs.isDir(dir)) {
            var files = fs.readdirSync(dir, { withFileTypes: true });
            if (files && files.length > 0)
                return true;
        }
        return false;
    }
    dirfuncs.hasFiles = hasFiles;
    function hasDirs(dir) {
        if (dirfuncs.isDir(dir)) {
            var entries = fs.readdirSync(dir, { withFileTypes: true });
            for (var _i = 0, entries_2 = entries; _i < entries_2.length; _i++) {
                var entry = entries_2[_i];
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
            var entries = fs.readdirSync(dir, { withFileTypes: true });
            for (var _i = 0, entries_3 = entries; _i < entries_3.length; _i++) {
                var entry = entries_3[_i];
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
            var file1Content = fs.readFileSync(fileFrom, 'utf-8');
            var file2Content = fs.readFileSync(fileTo, 'utf-8');
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
