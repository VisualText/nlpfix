"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visualText = void 0;
var express_1 = require("express");
var path_1 = require("path");
var fs_1 = require("fs");
var sequence_1 = require("./sequence");
var visualText_1 = require("./visualText");
var app = (0, express_1.default)();
var PORT = 3000;
app.use(express_1.default.static('public'));
app.get('/api/analyzers', function (req, res) {
    fs_1.default.readdir('analyzers', function (err, folders) {
        if (err) {
            return res.status(500).send('Unable to scan files');
        }
        res.json(folders);
    });
});
app.get('/api/sequence/:analyzer', function (req, res) {
    var anaDir = path_1.default.join('analyzers', req.params.analyzer);
    var sequenceFile = new sequence_1.SequenceFile();
    sequenceFile.getPassFiles(anaDir, true);
    var files = [];
    var i = 1;
    for (var _i = 0, _a = sequenceFile.getPassItems(); _i < _a.length; _i++) {
        var passItem = _a[_i];
        if (passItem.typeStr == 'nlp')
            files.push({ 'name': passItem.name, 'index': i });
        i++;
    }
    res.json(files);
});
app.get('/api/highlight/:analyzer/:filename/:index', function (req, res) {
    var dirPath = path_1.default.join('analyzers', req.params.analyzer, 'input', 'text.txt_log');
    var index = parseInt(req.params.index);
    fs_1.default.readdir(dirPath, function (err, folders) {
        var _loop_1 = function (file) {
            if (file.endsWith('.txxt')) {
                var num = parseInt(file.substring(file.lastIndexOf('.') - 3, file.lastIndexOf('.')));
                if (num == index) {
                    fs_1.default.readFile(path_1.default.join(dirPath, file), 'utf8', function (err, data) {
                        if (err) {
                            return res.status(500).send("Unable to read file : ".concat(path_1.default.join(dirPath, file)));
                        }
                        res.send(data);
                    });
                    return "break";
                }
            }
            ;
        };
        for (var _i = 0, folders_1 = folders; _i < folders_1.length; _i++) {
            var file = folders_1[_i];
            var state_1 = _loop_1(file);
            if (state_1 === "break")
                break;
        }
    });
});
app.get('/api/tree/:analyzer/:filename/:index', function (req, res) {
    var dirPath = path_1.default.join('analyzers', req.params.analyzer, 'input', 'text.txt_log');
    console.log(dirPath);
    var index = parseInt(req.params.index);
    var found = false;
    fs_1.default.readdir(dirPath, function (err, folders) {
        var _loop_2 = function (file) {
            if (file.endsWith('.tree')) {
                var num = parseInt(file.substring(file.lastIndexOf('.') - 3, file.lastIndexOf('.')));
                if (num == index) {
                    fs_1.default.readFile(path_1.default.join(dirPath, file), 'utf8', function (err, data) {
                        if (err) {
                            return res.status(500).send("Unable to read file : ".concat(path_1.default.join(dirPath, file)));
                        }
                        res.send(data);
                        found = true;
                    });
                    return "break";
                }
            }
            ;
        };
        for (var _i = 0, folders_2 = folders; _i < folders_2.length; _i++) {
            var file = folders_2[_i];
            var state_2 = _loop_2(file);
            if (state_2 === "break")
                break;
        }
        ;
        if (!found) {
            res.status(500).send("No tree file for ".concat(req.params.filename, " index ").concat(index));
        }
    });
});
app.get('/api/seqfile/:analyzer/:filename', function (req, res) {
    var filePath = path_1.default.join('analyzers', req.params.analyzer, 'spec', req.params.filename + '.nlp');
    fs_1.default.readFile(filePath, 'utf8', function (err, data) {
        if (err) {
            return res.status(500).send("Unable to read file : ".concat(filePath));
        }
        res.send(data);
    });
});
exports.visualText = new visualText_1.VisualText();
app.listen(PORT, function () {
    console.log("Server is running on http://localhost:".concat(PORT));
});
