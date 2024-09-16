import * as path from 'path';
import * as fs from 'fs';
import * as rimraf from 'rimraf';
import { visualText } from './server';
import { anaSubDir } from './analyzer';

export enum getFileTypes { UNKNOWN, FILES, FILES_DIRS, DIRS }

export namespace dirfuncs {

    export function copyDirectory(fromPath: string, toPath: string): boolean {
        var copydir = require('copy-dir');
        if (!fs.existsSync(toPath)) {
            if (!makeDir(toPath))
                return false;
        }
 
        copydir(fromPath,toPath, function(err: Error) {
            if (err)
                return false;
        });

        return true;
    }

    export function copyFile(fromPath: string, toPath: string): boolean {
        if (!fs.existsSync(fromPath)) {
            // vscode.window.showInformationMessage('copyFile from does not exist: ' + fromPath);
            return false;
        }
        try {
            const statsFrom = fs.statSync(fromPath);
            if (statsFrom.isFile()) {
                fs.copyFileSync(fromPath,toPath);
                return true;
            }
        } catch (err: any) {
            // vscode.window.showInformationMessage('Could not copy file ' + fromPath + ' to ' + toPath + ' - ' + err.message);
        }
        return false;
    }

    export function changeMod(filePath: string, mod: number): boolean {
        try {
            fs.chmodSync(filePath,mod);
            return true;
        } catch (err: any) {
            // vscode.window.showInformationMessage('Could not chmod on ' + filePath + ' - ' + err.message);
        }
        return false;
    }

    export function sameParentDirectory(dir1: string, dir2: string): boolean {
        return path.dirname(dir1).localeCompare(path.dirname(dir2)) == 0 ? true : false;
    }

    export function isDir(path: string): boolean {
        if (path.length <= 1)
            return false;
        try {
            const stats = fs.statSync(path);
            if (stats.isDirectory())
                return true;
        } catch (err: any) {
            //visualText.debugMessage(err.message);
        }
        return false;
    }

    export function rename(oldPath: string, newPath: string): boolean {
        try {
            fs.renameSync(oldPath,newPath);
            return true;
        } catch (err: any) {
            // vscode.window.showInformationMessage('Could not rename file ' + oldPath + ' to ' + newPath + ' - ' + err.message);
        }
        return false;
    }

    export function findFolder(dirPath: string, folderToFind: string): string {
        var parentDir = path.dirname(dirPath);
        if (path.basename(parentDir).localeCompare(folderToFind) == 0) {
            return parentDir;
        }

        if (parentDir && parentDir?.length > 1) {
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

    export function analyzerFolderCount(dirPath: string): number {
        var specCount = 0;
        var dirs = getDirectories(dirPath);
        for (let dir of dirs) {
            var subDirs = getDirectories(dir);
            for (let subDir of subDirs) {
                if (path.basename(subDir).localeCompare(visualText.ANALYZER_SEQUENCE_FOLDER) == 0) {
                    let specfile = path.join(subDir,visualText.ANALYZER_SEQUENCE_FILE);
                    if (fs.existsSync(specfile))
                        specCount++;
                }
            }
        }

        return specCount;
    }
    
    export function getDirectories(folder: string): string[] {
        const dirUris: string[] = new Array();
        if (dirfuncs.isDir(folder)) {
            const filenames = fs.readdirSync(folder);
            for (let filename of filenames) {
                if (!filename.startsWith('.')) {
                    var filepath = path.join(folder,filename);
                    try {
                        const stats = fs.statSync(filepath);
                        if (stats.isDirectory())
                            dirUris.push(filepath);
                    } catch (err: any) {
                        console.error(err)
                    }
                }
            }            
        }
        return dirUris;
    }
    
    export function fileCount(dir: string): number {
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

    export function getFiles(folder: string, filter: string[]=[], getType: getFileTypes=getFileTypes.FILES, recurse: boolean=false): string[] {
        const fileUris: string[] = new Array();
        const filenames = fs.readdirSync(folder);
        for (let filename of filenames) {
            if (!filename.startsWith('.')) {
                var filePath = path.join(folder,filename);
                var ext = path.extname(filePath);
                const stats = fs.statSync(filePath);
                if ((getType == getFileTypes.DIRS && stats.isDirectory()) || filter.length == 0 || filter.includes(ext))
                    fileUris.push(filePath);
                if (stats.isDirectory() && recurse) {
                    var children = getFiles(filename,filter,getType,recurse);
                    for (let child of children) {
                        fileUris.push(child);
                    }
                }
            }
        }
        return fileUris;
    }

    export function makeDir(dirPath: string): boolean {
        try {
            fs.mkdirSync(dirPath);
            return true;
        } catch (err: any) {
            // vscode.window.showInformationMessage('Error creating folder ' + dirPath + ': ' + err.message);
        } 
        return false;
    }

    export function writeFile(filePath: string, content: string): boolean {
        var dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            try {
                fs.mkdirSync(dir);
            } catch (err: any) {
                // vscode.window.showInformationMessage('Error creating directory ' + dir + ': ' + err.message);
                return false;
            }
        }
        try {
            fs.writeFileSync(filePath,content,'utf-8');
            return true;
        } catch (err: any) {
            // vscode.window.showInformationMessage('Error writing file ' + filePath + ': ' + err.message);
        }
        return false;    
    }

    export function getDirPath(filePath: string): string {
        try {
            const stats = fs.statSync(filePath);
            if (stats.isDirectory())
                return filePath;
            else if (stats.isFile()) {
                return path.dirname(filePath);
            }
        } catch (err: any) {
            // vscode.window.showInformationMessage('Error reading file stats on ' + filePath + ': ' + err.message);
        }
        return '';
    }
    
    export function delFile(filePath: string): boolean {
        try {
            fs.unlinkSync(filePath);
            return true;
        } catch (err: any) {
            // vscode.window.showInformationMessage('Error deleting file ' + filePath + ': ' + err.message);
        } 
        return false;
    }

    export function delDir(dirPath: string): boolean {
        if (!fs.existsSync(dirPath) || dirPath.length <= 2)
            return false;
        try {
            rimraf.sync(dirPath);
            return true;
        } catch (err: any) {
            // vscode.window.showInformationMessage('Error deleting folder ' + dirPath + ': ' + err.message);
        } 
        return false;
    }
    
    export function deleteFiles(folder: string, filter: string[]=[]): string[] {
        const fileUris: string[] = new Array();
        const filenames = fs.readdirSync(folder);
        for (let filename of filenames) {
            if (!filename.startsWith('.')) {
                var filePath = path.join(folder,filename);
                var ext = path.extname(filePath);
                const stats = fs.statSync(filePath);
                if (!stats.isDirectory() && (filter.length == 0 || filter.includes(ext)))
                    delFile(filePath);
            }
        }
        return fileUris;
    }

    export function emptyDir(dirPath: string): boolean {
        if (!fs.existsSync(dirPath) || dirPath.length <= 2)
            return false;
        try {
            rimraf.sync(dirPath);
            fs.mkdirSync(dirPath);
            return true;
        } catch (err: any) {
            // vscode.window.showInformationMessage('Error emptying folder ' + dirPath + ': ' + err.message);
        } 
        return false;
    }

    export function analyzerHasLogFiles(dir: string): boolean {
        var outputDir = visualText.analyzer.constructDir(dir,anaSubDir.OUTPUT);
        if (fs.existsSync(outputDir) && dirfuncs.directoryHasFiles(outputDir))
            return true;
        var logsDir = visualText.analyzer.constructDir(dir,anaSubDir.LOGS);
        if (fs.existsSync(logsDir) && dirfuncs.directoryHasFiles(logsDir))
            return true;
        var inputDir = visualText.analyzer.constructDir(dir,anaSubDir.INPUT);
        if (fs.existsSync(inputDir)) {
            return dirfuncs.hasLogDirs(inputDir,false);
        }
		return false;
	}

    export function directoryHasFiles(dir: string) {
        const filenames = fs.readdirSync(dir);
        return filenames.length ? true : false;
    }

    export function hasLogDirs(dir: string, first: boolean): boolean {
        if (dirfuncs.isDir(dir)) {
            const entries = fs.readdirSync(dir, { withFileTypes: true });

            for (let entry of entries) {
                if (entry.isDirectory()) {
                    if (visualText.isAnalyzerDirectory(entry.name) && dirfuncs.analyzerHasLogFiles(entry.name))
                        return true;
                    if (dirfuncs.directoryIsLog(entry.name))
                        return true;
                    else {
                        var has = dirfuncs.hasLogDirs(entry.name,false);
                        if (has)
                            return true;
                    }
                }
            }                  
        } else {
            return dirfuncs.fileHasLog(dir);
        }

		return false;
	}

    export function hasFile(dir: string, filename: string): boolean {
        if (dirfuncs.isDir(dir)) {
            const files = fs.readdirSync(dir, { withFileTypes: true });
            for (const file of files) {
                if (file.name == filename)
                    return true;
            }                  
        }

		return false;
	}

    export function hasFiles(dir: string): boolean {
        if (dirfuncs.isDir(dir)) {
            const files = fs.readdirSync(dir, { withFileTypes: true });
            if (files && files.length > 0)
                return true;                 
        }

		return false;
	}

    export function hasDirs(dir: string): boolean {
        if (dirfuncs.isDir(dir)) {
            const entries = fs.readdirSync(dir, { withFileTypes: true });

            for (const entry of entries) {
                if (entry.isDirectory() && !visualText.isAnalyzerDirectory(entry.name)) {
                    return true;
                }
            }                  
        }
		return false;
	}

    export function parentHasOtherDirs(dir: string): boolean {
        var parent = path.dirname(dir);
        var basename = path.basename(dir);

        if (parent.length) {
            const entries = fs.readdirSync(dir, { withFileTypes: true });

            for (const entry of entries) {
                if (entry.isDirectory()
                    && path.basename(entry.name) != basename
                    && !visualText.isAnalyzerDirectory(entry.name)
                    && !entry.name.endsWith(visualText.TEST_SUFFIX)
                    && !dirfuncs.directoryIsLog(entry.name)) {
                    return true;
                }
            }                  
        }
		return false;
	}

    export function directoryIsLog(dirPath: string): boolean {
		return dirPath.endsWith(visualText.LOG_SUFFIX);
	}

    export function fileHasLog(filePath: string): boolean {
        return dirfuncs.isDir(filePath + visualText.LOG_SUFFIX);
    }

    export function needToCopy(fileFrom: string, fileTo: string): boolean {
        if (!fs.existsSync(fileTo))
            return true;
        try {
            const file1Content = fs.readFileSync(fileFrom, 'utf-8');
            const file2Content = fs.readFileSync(fileTo, 'utf-8');
            if (file1Content === file2Content)
                return false;
            return true;
        } catch (error) {
            console.error('Error reading files:', error);
            return false;
        }
    }
}