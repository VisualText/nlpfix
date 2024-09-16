"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
document.addEventListener('DOMContentLoaded', function () {
    fetch('/api/analyzers')
        .then(function (response) { return response.json(); })
        .then(function (folders) {
        var analyzerList = document.getElementById('analyzer-list');
        analyzerList.innerHTML = '';
        folders.forEach(function (folder) {
            if (!folder.startsWith('.')) {
                var li = document.createElement('li');
                li.classList.add('analyzer-item');
                li.textContent = folder;
                li.addEventListener('click', function () {
                    console.log('Clicked:', folder);
                    fetch("/api/sequence/".concat(folder))
                        .then(function (response) { return response.json(); })
                        .then(function (files) {
                        // const readMeFilePath = path.join('analyzers', folder, 'README.md');
                        // console.log('ReadMe file path:', readMeFilePath);
                        // const firstLine = dirFuncs.readFirstLine(readMeFilePath);
                        var tit = document.getElementById('sequenceTitle');
                        tit.innerHTML = folder;
                        var seqList = document.getElementById('sequence-list');
                        seqList.innerHTML = '';
                        files.forEach(function (file) {
                            var li = document.createElement('li');
                            li.classList.add('seq-item');
                            li.setAttribute('index', file.index.toString());
                            var anchor = document.createElement('a');
                            anchor.style.marginLeft = '10px';
                            anchor.addEventListener('click', function () {
                                fetch("/api/seqfile/".concat(folder, "/").concat(file.name))
                                    .then(function (response) { return response.text(); })
                                    .then(function (content) {
                                    var fileContent = document.getElementById('file-content');
                                    fileContent.innerHTML = "<pre>".concat(content, "</pre>");
                                });
                            });
                            var icon = document.createElement('i');
                            icon.className = 'fas fa-code'; // Change this to the desired icon class
                            icon.style.color = 'yellow';
                            anchor.appendChild(icon);
                            li.appendChild(anchor);
                            anchor = document.createElement('a');
                            anchor.style.marginLeft = '10px';
                            anchor.setAttribute('index', file.index.toString());
                            anchor.addEventListener('click', function () {
                                fetch("/api/tree/".concat(folder, "/").concat(file.name, "/").concat(file.index))
                                    .then(function (response) { return response.text(); })
                                    .then(function (content) {
                                    var fileContent = document.getElementById('file-content');
                                    fileContent.innerHTML = "<pre>".concat(content, "</pre>");
                                });
                            });
                            icon = document.createElement('i');
                            icon.className = 'fas fa-sitemap'; // Change this to the desired icon class
                            icon.style.color = 'yellow';
                            anchor.appendChild(icon);
                            li.appendChild(anchor);
                            anchor = document.createElement('a');
                            anchor.style.marginLeft = '10px';
                            anchor.textContent = file.name;
                            anchor.addEventListener('click', function () {
                                fetch("/api/highlight/".concat(folder, "/").concat(file.name, "/").concat(file.index))
                                    .then(function (response) { return response.text(); })
                                    .then(function (content) {
                                    var fileContent = document.getElementById('file-content');
                                    fileContent.innerHTML = "<pre>".concat(content, "</pre>");
                                });
                            });
                            li.appendChild(anchor);
                            li.appendChild(document.createElement('ul'));
                            seqList.appendChild(li);
                        });
                    });
                });
                analyzerList.appendChild(li);
            }
        });
    });
});
