var clickType;
(function (clickType) {
    clickType[clickType["CODE"] = 0] = "CODE";
    clickType[clickType["TREE"] = 1] = "TREE";
    clickType[clickType["HIGHLIGHT"] = 2] = "HIGHLIGHT";
    clickType[clickType["KB"] = 3] = "KB";
})(clickType || (clickType = {}));
var helpInfo = {
    analyzers: [
        {
            name: "date-time",
            files: [
                {
                    name: "output.json",
                    tooltip: "NLP++ jason package output",
                    description: "This file is the output of the NLP++ jason package. It contains the output of the NLP++ date and time analyzer in JSON format."
                }
            ]
        },
        {
            name: "Formatted Text",
            files: [
                {
                    name: "lineAttrs",
                    tooltip: "Categorize the line",
                    description: "Categorizing lines with attributes that can help distinguish prose (regular text) from headers etc."
                },
                {
                    name: "stragglers",
                    tooltip: "straggling end of sentence",
                    description: "A line with a few words can be a header or the straggling end of a sentence. NLP++ can encode exactly how a person determines this by looking at the capitalization and looking for a sentence ending punctuation."
                }
            ]
        },
        {
            name: "NLP Demo",
            files: [
                {
                    name: "pt-nomes.dict",
                    tooltip: "Showing people and their attributes",
                    description: "There are dictionaries of human names, stop words, months, days, etc. available for many languages as a part of the NLP++ language extension for VSCode. This one is for Portuguese first names. These dictionary is a knowledge basis are being added to the system regularly."
                },
                {
                    name: "output.kbb",
                    tooltip: "Showing people and their attributes",
                    description: "Below, all the information about each person is consolidated from various places in the text into one place. The knowledge base not only holds the final results of the analysis but also the intermediate results."
                },
                {
                    name: "attributes",
                    tooltip: "Interesting people attributes",
                    description: "Depending on the purpose of the NLP analyzer, the attributes of interest can vary. These attributes include titles, country of origin, degrees, and university affiliation."
                }
            ]
        }
    ]
};
function writeComment(text) {
    var comment = document.getElementById('comment');
    // if (comment)
    comment.textContent = text;
}
function centerPopup(htmlFile) {
    var html = '';
    //if (localStorage.getItem(htmlFile)) {
    // return;
    //}
    // localStorage.setItem(htmlFile, 'true');
    fetch("/api/popup/".concat(htmlFile))
        .then(function (response) { return response.text(); })
        .then(function (content) {
        if (content.startsWith("Unable to read")) {
            return;
        }
        var popup = document.createElement('div');
        var text = document.createElement('div');
        var buttonPanel = document.createElement('div');
        buttonPanel.style.textAlign = 'center';
        popup.className = 'popup';
        popup.appendChild(text);
        popup.appendChild(buttonPanel);
        var closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', function () {
            document.body.removeChild(popup);
            displayArrow(true, 'look-here-left');
        });
        buttonPanel.appendChild(closeButton);
        text.innerHTML = content;
        popup.style.position = 'fixed';
        popup.style.left = '50%';
        popup.style.top = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.backgroundColor = 'white';
        popup.style.padding = '20px';
        popup.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        popup.style.zIndex = '1000';
        document.body.appendChild(popup);
    });
}
function displayArrow(display, id) {
    if (id === void 0) { id = 'look-here'; }
    var arrow = document.getElementById(id);
    if (arrow) {
        arrow.style.display = display ? 'inline' : 'none';
    }
}
function handleLoad() {
    fetch('/api/analyzers')
        .then(function (response) { return response.json(); })
        .then(function (analyzers) {
        displayArrow(false);
        displayArrow(false), 'look-here-left';
        var analyzerList = document.getElementById('analyzer-list');
        analyzerList.innerHTML = '';
        var main = document.getElementById('file-content');
        var para = document.createElement('p');
        para.setAttribute('class', 'ana-instructions');
        var pathdiv = document.getElementById('path');
        pathdiv.innerHTML = 'Video intro by David de Hilster';
        var youtubeIframe = document.createElement('iframe');
        youtubeIframe.className = 'video-container';
        youtubeIframe.height = '150';
        youtubeIframe.src = 'https://www.youtube.com/embed/Mf8rP-8j9zU?si=3LMrrGardsACVCWT';
        youtubeIframe.title = 'YouTube video player';
        youtubeIframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; allowfullscreen';
        main.appendChild(youtubeIframe);
        var firstLine = "<instructions>Choose one of the following NLP++ text analyzers:</instructions><br>\n";
        para.innerHTML = firstLine;
        main.appendChild(para);
        var ul = document.createElement('ul');
        ul.setAttribute('class', 'analyzer-list');
        analyzers.forEach(function (analyzer) {
            if (!analyzer.folder.startsWith('.')) {
                var li = document.createElement('li');
                li.classList.add('analyzer-item');
                li.textContent = analyzer.name;
                li.setAttribute('index', analyzer.index.toString());
                analyzerClick(li, analyzer);
                analyzerList.appendChild(li);
                if (analyzer.name.length > 0) {
                    var liana = document.createElement('li');
                    liana.setAttribute('class', 'analyzer-description');
                    analyzerClick(liana, analyzer);
                    liana.innerHTML = "<ananame>".concat(analyzer.name, "</ananame><br>\n").concat(analyzer.description);
                    ul.appendChild(liana);
                }
            }
        });
        main.appendChild(ul);
        displayArrow(true, 'look-here-up');
    });
}
function clearAllSelections() {
    ['sequence-list', 'kb-list', 'output-list'].forEach(clearSelections);
    removePopup();
    displayArrow(false);
    displayArrow(false, 'look-here-left');
    displayArrow(false, 'look-here-up');
    writeComment('');
}
function selectionLogic(id, index) {
    var the_list = document.getElementById(id);
    clearAllSelections();
    var listItem = Array.from(the_list.getElementsByTagName('li')).find(function (li) { return li.getAttribute('index') === index.toString(); });
    if (listItem) {
        listItem.classList.add('selected');
    }
}
function clearSelections(liClass) {
    var seq_list = document.getElementById(liClass);
    Array.from(seq_list.getElementsByTagName('li')).forEach(function (li) {
        li.classList.remove('selected');
    });
}
function removePopup() {
    var popups = document.querySelectorAll('.popup');
    popups.forEach(function (popup) { return document.body.removeChild(popup); });
}
function setPathText(text, html) {
    if (html === void 0) { html = false; }
    var comment = document.getElementById('comment');
    comment.style.display = 'none';
    var pathElement = document.getElementById('path');
    pathElement.style.display = 'block';
    if (html) {
        pathElement.innerHTML = text;
    }
    else {
        pathElement.textContent = text;
    }
}
function addPath(analyzer, list, file) {
    var anaObj = helpInfo.analyzers.find(function (a) { return a.name === analyzer; });
    if (anaObj) {
        var fileObj = anaObj.files.find(function (f) { return f.name === file; });
        if (fileObj) {
            displayArrow(true);
            displayArrow(true, 'look-here-left');
            setPathText(fileObj.description);
            return;
        }
    }
    setPathText("".concat(analyzer, " > ").concat(list, " > ").concat(file));
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
function starAddition(anchor, analyzer, file) {
    if (fileHasInfo(analyzer, file)) {
        anchor.className = 'seq-item-highlight';
        var icon = document.createElement('i');
        icon.className = 'fas fa-star';
        icon.style.color = 'yellow';
        anchor.appendChild(icon);
    }
}
function addToolHelp(anchor, analyzer, list, file) {
    var anaObj = helpInfo.analyzers.find(function (a) { return a.name === analyzer; });
    if (anaObj) {
        var fileObj = anaObj.files.find(function (f) { return f.name === file; });
        if (fileObj) {
            addTooltip(anchor, fileObj.tooltip);
            return;
        }
    }
}
function analyzerClick(li, analyzer) {
    li.addEventListener('click', function () {
        fetch("/api/sequence/".concat(analyzer.folder))
            .then(function (response) { return response.json(); })
            .then(function (files) {
            clearSelections("analyzer-list");
            selectionLogic("analyzer-list", analyzer.index);
            // fetch(`/api/readme/firstline/${analyzer.folder}`)
            //   .then(response => response.json())
            //   .then((firstLine: string) => {
            //     const tit = document.getElementById('sequenceTitle') as HTMLParagraphElement;
            //     tit.innerHTML = firstLine;
            // });
            centerPopup(analyzer.folder);
            fetch("/api/input/".concat(analyzer.folder, "/text.txt"))
                .then(function (response) { return response.text(); })
                .then(function (content) {
                console.log(content);
                var fileContent = document.getElementById('file-content');
                fileContent.innerHTML = content;
                setPathText("".concat(analyzer.name, " > text"));
            });
            fetch("/api/kb/".concat(analyzer.folder))
                .then(function (response) { return response.json(); })
                .then(function (kbs) {
                var kbDiv = document.getElementById('list-kb');
                kbDiv.style.display = 'block';
                var kbList = document.getElementById('kb-list');
                kbList.innerHTML = '';
                kbs.forEach(function (kb) {
                    var kbLi = document.createElement('li');
                    kbLi.classList.add('kb-item');
                    kbLi.setAttribute('index', kb.index.toString());
                    var anchor = document.createElement('a');
                    anchor.textContent = kb.name;
                    starAddition(anchor, analyzer.name, kb.name);
                    anchor.addEventListener('click', function () {
                        fetch("/api/kbload/".concat(analyzer.folder, "/").concat(kb.name))
                            .then(function (response) { return response.text(); })
                            .then(function (content) {
                            var fileContent = document.getElementById('file-content');
                            selectionLogic("kb-list", kb.index);
                            fileContent.innerHTML = content;
                            addPath(analyzer.name, 'kb', kb.name);
                        });
                    });
                    kbLi.appendChild(anchor);
                    kbList.append(kbLi);
                });
            });
            fetch("/api/output/".concat(analyzer.folder))
                .then(function (response) { return response.json(); })
                .then(function (outputs) {
                var outDiv = document.getElementById('list-output');
                outDiv.style.display = 'block';
                var outputList = document.getElementById('output-list');
                outputList.innerHTML = '';
                outputs.forEach(function (output) {
                    var outLi = document.createElement('li');
                    outLi.classList.add('output-item');
                    outLi.setAttribute('index', output.index.toString());
                    var anchor = document.createElement('a');
                    addToolHelp(anchor, analyzer.folder, 'output', output.name);
                    anchor.textContent = output.name;
                    starAddition(anchor, analyzer.name, output.name);
                    anchor.addEventListener('click', function () {
                        fetch("/api/outputload/".concat(analyzer.folder, "/").concat(output.name))
                            .then(function (response) { return response.text(); })
                            .then(function (content) {
                            var fileContent = document.getElementById('file-content');
                            selectionLogic("output-list", output.index);
                            fileContent.innerHTML = content;
                            addPath(analyzer.name, 'output', output.name);
                        });
                    });
                    outLi.appendChild(anchor);
                    outputList.append(outLi);
                });
            });
            var seqDiv = document.getElementById('list-seq');
            seqDiv.style.display = 'block';
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
                anchor.className = 'seq-item';
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
                starAddition(anchor, analyzer.name, file.name);
                li.appendChild(anchor);
                li.appendChild(document.createElement('ul'));
                seqList.appendChild(li);
            });
        });
    });
}
function fileHasInfo(analyzer, file) {
    var anaObj = helpInfo.analyzers.find(function (a) { return a.name === analyzer; });
    if (anaObj) {
        var fileObj = anaObj.files.find(function (f) { return f.name === file; });
        if (fileObj) {
            return true;
        }
    }
    return false;
}
function setCommentText(text, html) {
    if (html === void 0) { html = false; }
    var pathElement = document.getElementById('path');
    pathElement.style.display = 'none';
    var comment = document.getElementById('comment');
    comment.style.display = 'block';
    if (html) {
        comment.innerHTML = text;
    }
    else {
        comment.textContent = text;
    }
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
        addPath(analyzer.name, 'kb', file.name);
    });
}
function fetchCode(analyzer, file) {
    fetch("/api/seqfile/".concat(analyzer.folder, "/").concat(file.name))
        .then(function (response) { return response.text(); })
        .then(function (content) {
        var fileContent = document.getElementById('file-content');
        selectionLogic("sequence-list", file.index);
        fileContent.innerHTML = content;
        addPath(analyzer.name, 'sequence', file.name);
    });
}
function fetchTree(analyzer, file) {
    fetch("/api/tree/".concat(analyzer.folder, "/").concat(file.name, "/").concat(file.index))
        .then(function (response) { return response.text(); })
        .then(function (content) {
        var fileContent = document.getElementById('file-content');
        selectionLogic("sequence-list", file.index);
        fileContent.innerHTML = content;
        addPath(analyzer.name, 'sequence', file.name);
    });
}
function fetchHighlight(analyzer, file) {
    fetch("/api/highlight/".concat(analyzer.folder, "/").concat(file.name, "/").concat(file.index))
        .then(function (response) { return response.text(); })
        .then(function (content) {
        var fileContent = document.getElementById('file-content');
        selectionLogic("sequence-list", file.index);
        fileContent.innerHTML = content;
        addPath(analyzer.name, 'sequence', file.name);
    });
}
document.addEventListener('DOMContentLoaded', function () {
    handleLoad();
});
