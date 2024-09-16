function handleLoad() {
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
                        fetch("/api/readme/firstline/".concat(folder))
                            .then(function (response) { return response.json(); })
                            .then(function (firstLine) {
                            var tit = document.getElementById('sequenceTitle');
                            tit.innerHTML = firstLine;
                        });
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
                                    selectionLogic(file.index);
                                    fileContent.innerHTML = content;
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
                                    selectionLogic(file.index);
                                    fileContent.innerHTML = content;
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
                            if (file.highlight) {
                                anchor.addEventListener('click', function () {
                                    fetch("/api/highlight/".concat(folder, "/").concat(file.name, "/").concat(file.index))
                                        .then(function (response) { return response.text(); })
                                        .then(function (content) {
                                        var fileContent = document.getElementById('file-content');
                                        selectionLogic(file.index);
                                        fileContent.innerHTML = "<pre>".concat(content, "</pre>");
                                    });
                                });
                            }
                            else {
                                anchor.style.color = 'gray';
                            }
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
}
function selectionLogic(index) {
    var seq_list = document.getElementById('sequence-list');
    Array.from(seq_list.getElementsByTagName('li')).forEach(function (li) {
        li.classList.remove('selected');
    });
    var listItem = Array.from(seq_list.getElementsByTagName('li')).find(function (li) { return li.getAttribute('index') === index.toString(); });
    if (listItem) {
        listItem.classList.add('selected');
    }
}
document.addEventListener('DOMContentLoaded', function () {
    handleLoad();
});
