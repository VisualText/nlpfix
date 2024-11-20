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
            name: "Dates and Times",
            files: [
                {
                    name: "timezones.dict",
                    tooltip: "NLP++ jason package output",
                    description: "Dictionaries are human readable files that match during the tokenizer phase of the analyzer sequence. NLP++ has a growing library of dictionary and knowledge base files. This is one of them."
                },
                {
                    name: "dicttokz",
                    tooltip: "NLP++ jason package output",
                    description: "The first pass in every NLP++ analyzer is the tokenizer which breaks text down into words and numbers. The tokenizer also loads the dictionary and knowledge based files. Here, you see the dictionary matches highlighted."
                },
                {
                    name: "numbers",
                    tooltip: "NLP++ jason package output",
                    description: "A very common technique used in NLP++ is to classify all the numbers in a text. The reason this is no a library function is because the possible meanings of numbers favy depending on the topic."
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
                    name: "document.kbb",
                    tooltip: "Categorize the line",
                    description: "This is the knowledge base representation of the reconstruction of the formatted document."
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
function loadSpec(analyzer, spec) {
    fetch("/api/seqfile/".concat(analyzer, "/").concat(spec))
        .then(function (response) { return response.text(); })
        .then(function (content) {
        var fileContent = document.getElementById('file-content');
        if (fileContent)
            fileContent.innerHTML = content;
    });
}
function writeComment(text) {
    var comment = document.getElementById('comment');
    // if (comment)
    comment.textContent = text;
}
function centerPopup(htmlFile) {
    var html = '';
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
            displayImage(true, 'look-here-left');
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
function displayImage(display, id) {
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
        displayImage(false);
        displayImage(false, 'look-here-left');
        displayImage(false, 'logo-start');
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
        youtubeIframe.src = 'https://www.youtube.com/embed/zKMALEiu2qI?si=YsieHpmKGY_c3VbP';
        youtubeIframe.title = 'YouTube video player';
        youtubeIframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; allowfullscreen';
        var mainWidth = main.offsetWidth;
        var fontsize = '1em';
        if (mainWidth < 600) {
            youtubeIframe.width = '300';
            youtubeIframe.height = '187';
        }
        else if (mainWidth < 900) {
            youtubeIframe.width = '450';
            youtubeIframe.height = '281';
            fontsize = '1.5em';
        }
        else {
            youtubeIframe.width = '600';
            youtubeIframe.height = '375';
            fontsize = '1.25em';
        }
        main.appendChild(youtubeIframe);
        displayImage(true, 'logo-start');
        var firstLine = "<instructions>Choose one of the following NLP++ text analyzers:</instructions><br>\n";
        para.innerHTML = firstLine;
        para.setAttribute('style', "font-size: ".concat(fontsize, " !important;"));
        main.appendChild(para);
        var ul = document.createElement('ul');
        ul.setAttribute('class', 'analyzer-list');
        ul.setAttribute('style', "font-size: ".concat(fontsize, " !important;"));
        analyzers.forEach(function (analyzer) {
            if (!analyzer.folder.startsWith('.') && analyzer.name.length > 0) {
                var li = document.createElement('li');
                li.classList.add('analyzer-item');
                li.textContent = analyzer.name;
                li.setAttribute('index', analyzer.index.toString());
                analyzerClick(li, analyzer);
                analyzerList.appendChild(li);
                // Add the description of the analyzer into the main window
                var liana = document.createElement('li');
                liana.setAttribute('class', 'analyzer-description');
                analyzerClick(liana, analyzer);
                liana.innerHTML = "<ananame>".concat(analyzer.name, "</ananame><br>\n").concat(analyzer.description);
                ul.appendChild(liana);
            }
        });
        main.appendChild(ul);
        // Add the click event to the look-here arrow so the user can hide it
        var arrow = document.getElementById('look-here');
        if (arrow) {
            arrow.addEventListener('click', function () {
                this.style.display = 'none';
                var comment = document.getElementById('comment');
                comment.style.display = 'none';
            });
        }
        displayImage(true, 'look-here-up');
        var seqTitle = document.getElementById('sequenceTitle');
        if (seqTitle)
            seqTitle.style.display = 'none';
    });
}
function clearAllSelections() {
    ['sequence-list', 'kb-list', 'output-list'].forEach(clearSelections);
    removePopup();
    displayImage(false);
    displayImage(false, 'look-here-left');
    displayImage(false, 'look-here-up');
    displayImage(false, 'logo-start');
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
            displayImage(true);
            setCommentText(fileObj.description);
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
        icon.style.marginRight = '2px';
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
            var seqTitle = document.getElementById('sequenceTitle');
            if (seqTitle)
                seqTitle.style.display = 'block';
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
                if (kbList.innerHTML == '') {
                    kbDiv.style.display = 'none';
                }
                else {
                    kbDiv.style.display = 'block';
                }
            });
            fetch("/api/output/".concat(analyzer.folder))
                .then(function (response) { return response.json(); })
                .then(function (outputs) {
                var outDiv = document.getElementById('list-output');
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
                if (outputList.innerHTML == '') {
                    outDiv.style.display = 'none';
                }
                else {
                    outDiv.style.display = 'block';
                }
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
