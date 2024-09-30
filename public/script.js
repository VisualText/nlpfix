var clickType;
(function (clickType) {
    clickType[clickType["CODE"] = 0] = "CODE";
    clickType[clickType["TREE"] = 1] = "TREE";
    clickType[clickType["HIGHLIGHT"] = 2] = "HIGHLIGHT";
    clickType[clickType["KB"] = 3] = "KB";
})(clickType || (clickType = {}));
var helpInfo = {
    "output": [
        {
            "file": "output.json",
            "tooltip": "NLP++ jason package output",
            "description": "This file is the output of the NLP++ jason package. It contains the output of the NLP++ date and time analyzer in JSON format."
        }
    ]
};
function handleLoad() {
    fetch('/api/analyzers')
        .then(function (response) { return response.json(); })
        .then(function (analyzers) {
        var analyzerList = document.getElementById('analyzer-list');
        analyzerList.innerHTML = '';
        analyzers.forEach(function (analyzer) {
            if (!analyzer.folder.startsWith('.')) {
                var li = document.createElement('li');
                li.classList.add('analyzer-item');
                li.textContent = analyzer.name;
                li.setAttribute('index', analyzer.index.toString());
                li.addEventListener('click', function () {
                    fetch("/api/sequence/".concat(analyzer.folder))
                        .then(function (response) { return response.json(); })
                        .then(function (files) {
                        selectionLogic("analyzer-list", analyzer.index);
                        // fetch(`/api/readme/firstline/${analyzer.folder}`)
                        //   .then(response => response.json())
                        //   .then((firstLine: string) => {
                        //     const tit = document.getElementById('sequenceTitle') as HTMLParagraphElement;
                        //     tit.innerHTML = firstLine;
                        // });
                        fetch("/api/input/".concat(analyzer.folder, "/text.txt"))
                            .then(function (response) { return response.text(); })
                            .then(function (content) {
                            console.log(content);
                            var fileContent = document.getElementById('file-content');
                            fileContent.innerHTML = content;
                        });
                        fetch("/api/kb/".concat(analyzer.folder))
                            .then(function (response) { return response.json(); })
                            .then(function (kbs) {
                            var kbList = document.getElementById('kb-list');
                            kbList.innerHTML = '';
                            kbs.forEach(function (kb) {
                                var kbLi = document.createElement('li');
                                kbLi.classList.add('kb-item');
                                kbLi.setAttribute('index', kb.index.toString());
                                var anchor = document.createElement('a');
                                anchor.textContent = kb.name;
                                anchor.addEventListener('click', function () {
                                    fetch("/api/kbload/".concat(analyzer.folder, "/").concat(kb.name))
                                        .then(function (response) { return response.text(); })
                                        .then(function (content) {
                                        var fileContent = document.getElementById('file-content');
                                        selectionLogic("kb-list", kb.index);
                                        fileContent.innerHTML = content;
                                        addDescription(analyzer.folder, 'kb', kb.name);
                                    });
                                });
                                kbLi.appendChild(anchor);
                                kbList.append(kbLi);
                            });
                        });
                        fetch("/api/output/".concat(analyzer.folder))
                            .then(function (response) { return response.json(); })
                            .then(function (outputs) {
                            var outputList = document.getElementById('output-list');
                            outputList.innerHTML = '';
                            outputs.forEach(function (output) {
                                var outLi = document.createElement('li');
                                outLi.classList.add('output-item');
                                outLi.setAttribute('index', output.index.toString());
                                var anchor = document.createElement('a');
                                addToolHelp(anchor, 'output', output.name);
                                anchor.textContent = output.name;
                                anchor.addEventListener('click', function () {
                                    fetch("/api/outputload/".concat(analyzer.folder, "/").concat(output.name))
                                        .then(function (response) { return response.text(); })
                                        .then(function (content) {
                                        var fileContent = document.getElementById('file-content');
                                        selectionLogic("output-list", output.index);
                                        fileContent.innerHTML = content;
                                        addDescription(analyzer.folder, 'output', output.name);
                                    });
                                });
                                outLi.appendChild(anchor);
                                outputList.append(outLi);
                            });
                        });
                        var seqList = document.getElementById('sequence-list');
                        seqList.innerHTML = '';
                        files.forEach(function (file) {
                            console.log(file);
                            var li = document.createElement('li');
                            li.classList.add('seq-item');
                            li.setAttribute('index', file.index.toString());
                            li.setAttribute('anchors', '');
                            var colorCode = file.name == 'final.tree' || file.name.includes('tok') ? 'gray' : 'yellow';
                            var anchor = document.createElement('a');
                            anchor.style.marginRight = '5px';
                            if (colorCode != 'gray') {
                                handleClick(anchor, analyzer, file, clickType.CODE);
                                li.setAttribute('anchors', clickType.CODE.toString());
                            }
                            var icon = document.createElement('i');
                            icon.className = 'fas fa-code';
                            icon.style.color = colorCode;
                            anchor.appendChild(icon);
                            li.appendChild(anchor);
                            anchor = document.createElement('a');
                            anchor.style.marginRight = '5px';
                            anchor.setAttribute('index', file.index.toString());
                            var colorTree = file.tree ? 'yellow' : 'gray';
                            if (colorTree != 'gray') {
                                handleClick(anchor, analyzer, file, clickType.TREE);
                                li.setAttribute('anchors', "".concat(li.getAttribute('anchors')).concat(clickType.TREE.toString()));
                            }
                            icon = document.createElement('i');
                            icon.className = 'fas fa-sitemap';
                            icon.style.color = colorTree;
                            anchor.appendChild(icon);
                            li.appendChild(anchor);
                            anchor = document.createElement('a');
                            anchor.style.marginRight = '5px';
                            anchor.textContent = file.name;
                            if (file.highlight) {
                                handleClick(anchor, analyzer, file, clickType.HIGHLIGHT);
                                li.setAttribute('anchors', "".concat(li.getAttribute('anchors')).concat(clickType.HIGHLIGHT.toString()));
                            }
                            else if (file.tree) {
                                handleClick(anchor, analyzer, file, clickType.TREE);
                                anchor.style.color = 'gray';
                            }
                            else if (colorCode != 'gray') {
                                handleClick(anchor, analyzer, file, clickType.CODE);
                                anchor.style.color = 'gray';
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
function addDescription(analyzer, list, file) {
    var helpStr = helpInfo[list];
    var paragraph = document.getElementById('explanation');
    if (helpStr && file === helpStr[0].file) {
        paragraph.textContent = helpStr[0].description;
    }
    else {
        paragraph.textContent = "".concat(analyzer, " > ").concat(list, " > ").concat(file);
    }
}
function addToolHelp(anchor, list, file) {
    var helpStr = helpInfo[list];
    if (helpStr && file === helpStr[0].file) {
        addTooltip(anchor, helpStr[0].tooltip);
    }
}
function addTooltip(anchor, text) {
    // Set the text content of the anchor
    anchor.textContent = 'Hover over me';
    // Create the tooltip element
    var tooltip = document.createElement('span');
    tooltip.textContent = text;
    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = '#976845';
    tooltip.style.color = 'white';
    tooltip.style.padding = '5px';
    tooltip.style.borderRadius = '5px';
    tooltip.style.visibility = 'hidden';
    // Add the mouseover event listener to show the tooltip
    anchor.addEventListener('mouseover', function (event) {
        tooltip.style.left = "".concat(event.pageX, "px");
        tooltip.style.top = "".concat(event.pageY, "px");
        tooltip.style.visibility = 'visible';
    });
    // Add the mouseout event listener to hide the tooltip
    anchor.addEventListener('mouseout', function () {
        tooltip.style.visibility = 'hidden';
    });
    // Append the tooltip to the body
    document.body.appendChild(tooltip);
}
function handleClick(anchor, analyzer, file, type) {
    anchor.addEventListener('click', function () {
        rotateClick(anchor, analyzer, file, type);
    });
}
function rotateClick(anchor, analyzer, file, type) {
    var ul = anchor.closest('ul');
    var li = anchor.closest('li');
    var typeStr = type.toString();
    // This code handles the rotation of the anchor when clicked multiple times
    if (ul && li) {
        var index = ul.getAttribute('index');
        if (index) {
            var liIndex = li.getAttribute('index');
            if (!liIndex || index != liIndex) {
                if (liIndex)
                    ul.setAttribute('index', liIndex);
            }
            else {
                var anchors = li.getAttribute('anchors');
                if (anchors && anchors.length > 1) {
                    var enumLength = Object.keys(clickType).length / 2;
                    var lastAnchor = li.getAttribute('anchor');
                    var charIndex = 0;
                    if (lastAnchor) {
                        charIndex = parseInt(lastAnchor);
                    }
                    else {
                        charIndex = type;
                    }
                    type = (charIndex + 1) % enumLength;
                    li.setAttribute('debug', "type: ".concat(type.toString(), " char: ").concat(charIndex.toString()));
                    while (anchors.indexOf(type.toString()) < 0) {
                        type = (++type) % enumLength;
                    }
                    li.setAttribute('anchor', type.toString());
                }
            }
        }
        else {
            var liIndex = li.getAttribute('index');
            if (liIndex) {
                ul.setAttribute('index', liIndex);
                li.setAttribute('anchor', type.toString());
            }
        }
    }
    switch (type) {
        case clickType.CODE:
            fetchCode(analyzer, file);
            break;
        case clickType.TREE:
            fetchTree(analyzer, file);
            break;
        case clickType.KB:
            fetchKB(analyzer, file);
            break;
        case clickType.HIGHLIGHT:
            fetchHighlight(analyzer, file);
            break;
    }
}
function fetchKB(analyzer, file) {
    fetch("/api/kbload/".concat(analyzer.folder, "/").concat(file.name))
        .then(function (response) { return response.text(); })
        .then(function (content) {
        var fileContent = document.getElementById('file-content');
        selectionLogic("kb-list", file.index);
        fileContent.innerHTML = content;
        addDescription(analyzer.folder, 'kb', file.name);
    });
}
function fetchCode(analyzer, file) {
    fetch("/api/seqfile/".concat(analyzer.folder, "/").concat(file.name))
        .then(function (response) { return response.text(); })
        .then(function (content) {
        var fileContent = document.getElementById('file-content');
        selectionLogic("sequence-list", file.index);
        fileContent.innerHTML = content;
        addDescription(analyzer.folder, 'sequence', file.name);
    });
}
function fetchTree(analyzer, file) {
    fetch("/api/tree/".concat(analyzer.folder, "/").concat(file.name, "/").concat(file.index))
        .then(function (response) { return response.text(); })
        .then(function (content) {
        var fileContent = document.getElementById('file-content');
        selectionLogic("sequence-list", file.index);
        fileContent.innerHTML = content;
        addDescription(analyzer.folder, 'sequence', file.name);
    });
}
function fetchHighlight(analyzer, file) {
    fetch("/api/highlight/".concat(analyzer.folder, "/").concat(file.name, "/").concat(file.index))
        .then(function (response) { return response.text(); })
        .then(function (content) {
        var fileContent = document.getElementById('file-content');
        selectionLogic("sequence-list", file.index);
        fileContent.innerHTML = content;
        addDescription(analyzer.folder, 'sequence', file.name);
    });
}
function selectionLogic(id, index) {
    var seq_list = document.getElementById(id);
    clearAllSelections();
    var listItem = Array.from(seq_list.getElementsByTagName('li')).find(function (li) { return li.getAttribute('index') === index.toString(); });
    if (listItem) {
        listItem.classList.add('selected');
    }
}
function clearAllSelections() {
    ['sequence-list', 'kb-list', 'output-list'].forEach(clearSelections);
}
function clearSelections(liClass) {
    var seq_list = document.getElementById(liClass);
    Array.from(seq_list.getElementsByTagName('li')).forEach(function (li) {
        li.classList.remove('selected');
    });
}
document.addEventListener('DOMContentLoaded', function () {
    handleLoad();
});
