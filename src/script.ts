interface AnaFile {
  name: string;
  description: string;
  folder: string;
  index: number;
}

interface SeqFile {
  name: string;
  index: number;
  highlight: boolean;
  tree: boolean;
}

enum clickType { CODE, TREE, HIGHLIGHT, KB }

const helpInfo = {
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

function loadSpec(analyzer: string, spec: string) {
  fetch(`/api/seqfile/${analyzer}/${spec}`)
  .then(response => response.text())
  .then(content => {
    const fileContent = document.getElementById('file-content');
    if (fileContent)
      fileContent.innerHTML = content;
  });
}

function writeComment(text: string) {
  const comment = document.getElementById('comment') as HTMLParagraphElement;
  // if (comment)
    comment.textContent = text;
}

function centerPopup(htmlFile: string) {
  var html: string = '';

  fetch(`/api/popup/${htmlFile}`)
    .then(response => response.text())
    .then(content => {
      if (content.startsWith("Unable to read")) {
        return;
      }

      const popup = document.createElement('div');
      const text = document.createElement('div');
      const buttonPanel = document.createElement('div');
      buttonPanel.style.textAlign = 'center';
      popup.className = 'popup';
      popup.appendChild(text);
      popup.appendChild(buttonPanel);

      const closeButton = document.createElement('button');
      closeButton.textContent = 'Close';
      closeButton.addEventListener('click', () => {
        document.body.removeChild(popup);
        displayImage(true,'look-here-left');
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

function displayImage(display: boolean, id: string = 'look-here') {
  const arrow = document.getElementById(id);
  if (arrow) {
    arrow.style.display = display ? 'inline' : 'none';
  }
}

function handleLoad(): void {
  
  fetch('/api/analyzers')
  .then(response => response.json())
  .then((analyzers: AnaFile[] ) => {
    displayImage(false);
    displayImage(false, 'look-here-left');
    displayImage(false, 'logo-start');
    const analyzerList = document.getElementById('analyzer-list') as HTMLUListElement;
    analyzerList.innerHTML = '';

    const main = document.getElementById('file-content') as HTMLDivElement;
    let para = document.createElement('p');
    para.setAttribute('class', 'ana-instructions');

    const pathdiv = document.getElementById('path') as HTMLDivElement;
    pathdiv.innerHTML = 'Video intro by David de Hilster';

    const youtubeIframe = document.createElement('iframe');
    youtubeIframe.className = 'video-container';
    youtubeIframe.height = '150';
    youtubeIframe.src = 'https://www.youtube.com/embed/zKMALEiu2qI?si=YsieHpmKGY_c3VbP';
    youtubeIframe.title = 'YouTube video player';
    youtubeIframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; allowfullscreen';
    const mainWidth = main.offsetWidth;

    let fontsize = '1em';

    if (mainWidth < 600) {
      youtubeIframe.width = '300';
      youtubeIframe.height = '187';
    } else if (mainWidth < 900) {
      youtubeIframe.width = '450';
      youtubeIframe.height = '281';
      fontsize = '1.5em';
    } else {
      youtubeIframe.width = '600';
      youtubeIframe.height = '375';
      fontsize = '1.25em';
    }

    main.appendChild(youtubeIframe);

    displayImage(true, 'logo-start');

    const firstLine = "<instructions>Choose one of the following NLP++ text analyzers:</instructions><br>\n";
    para.innerHTML = firstLine;
    para.setAttribute('style', `font-size: ${fontsize} !important;`);
    main.appendChild(para);
    let ul = document.createElement('ul');
    ul.setAttribute('class', 'analyzer-list');
    ul.setAttribute('style', `font-size: ${fontsize} !important;`);

    analyzers.forEach(analyzer => {
      if (!analyzer.folder.startsWith('.') && analyzer.name.length > 0) {
        const li = document.createElement('li');
        li.classList.add('analyzer-item');
        li.textContent = analyzer.name;
        li.setAttribute('index', analyzer.index.toString());
        analyzerClick(li, analyzer);
        analyzerList.appendChild(li);

        // Add the description of the analyzer into the main window
        let liana = document.createElement('li');
        liana.setAttribute('class', 'analyzer-description');
        analyzerClick(liana, analyzer);
        liana.innerHTML = `<ananame>${analyzer.name}</ananame><br>\n${analyzer.description}`; 
        ul.appendChild(liana);
      }
    });

    main.appendChild(ul);

    // Add the click event to the look-here arrow so the user can hide it
    let arrow = document.getElementById('look-here');
    if (arrow) {
      arrow.addEventListener('click', function() {
        this.style.display = 'none';
        const comment = document.getElementById('comment') as HTMLParagraphElement;
        comment.style.display = 'none';
      });
    }
    displayImage(true, 'look-here-up');

    let seqTitle = document.getElementById('sequenceTitle');
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

function selectionLogic(id: string, index: number) {
  const the_list = document.getElementById(id) as HTMLUListElement;
  clearAllSelections();
  const listItem = Array.from(the_list.getElementsByTagName('li')).find(li => li.getAttribute('index') === index.toString());
  if (listItem) {
    listItem.classList.add('selected');
  }
}

function clearSelections(liClass: string) {
  const seq_list = document.getElementById(liClass) as HTMLUListElement;
  Array.from(seq_list.getElementsByTagName('li')).forEach(li => {
    li.classList.remove('selected');
  });
}

function removePopup() {
  const popups = document.querySelectorAll('.popup');
  popups.forEach(popup => document.body.removeChild(popup));
}

function setPathText(text: string, html: boolean = false) {
  const pathElement = document.getElementById('path') as HTMLParagraphElement;
  pathElement.style.display  = 'block';
  if (html) {
    pathElement.innerHTML = text;
  } else {
    pathElement.textContent = text;
  }
}

function addPath(analyzer: string, list: string, file: string) {
  const anaObj = helpInfo.analyzers.find(a => a.name === analyzer);
  if (anaObj) {
    const fileObj = anaObj.files.find(f => f.name === file);
    if (fileObj) {
      displayImage(true);
      setCommentText(fileObj.description);
    }
  }
  setPathText(`${analyzer} > ${list} > ${file}`);
}

function addTooltip(anchor: HTMLAnchorElement, text: string) {

  // Set the text content of the anchor
  anchor.textContent = 'Hover over me';

  // Create the tooltip element
  const tooltip = document.createElement('span');
  tooltip.textContent = text;
  tooltip.style.position = 'absolute';
  tooltip.style.backgroundColor = '#976845';
  tooltip.style.color = 'white';
  tooltip.style.padding = '5px';
  tooltip.style.borderRadius = '5px';
  tooltip.style.visibility = 'hidden';

  // Add the mouseover event listener to show the tooltip
  anchor.addEventListener('mouseover', (event) => {
      tooltip.style.left = `${event.pageX}px`;
      tooltip.style.top = `${event.pageY}px`;
      tooltip.style.visibility = 'visible';
  });

  // Add the mouseout event listener to hide the tooltip
  anchor.addEventListener('mouseout', () => {
      tooltip.style.visibility = 'hidden';
  });

  // Append the tooltip to the body
  document.body.appendChild(tooltip);
}

function starAddition(anchor: HTMLAnchorElement, analyzer: string, file: string) {
  if (fileHasInfo(analyzer, file)) {
    anchor.className = 'seq-item-highlight';
    let icon = document.createElement('i');
    icon.className = 'fas fa-star';
    icon.style.color = 'yellow';
    icon.style.marginRight = '2px';
    anchor.appendChild(icon);
  }
}

function addToolHelp(anchor: HTMLAnchorElement, analyzer: string, list: string, file: string) {
  const anaObj = helpInfo.analyzers.find(a => a.name === analyzer);
  if (anaObj) {
    const fileObj = anaObj.files.find(f => f.name === file);
    if (fileObj) {
      addTooltip(anchor, fileObj.tooltip);
      return;
    }
  }
}

function analyzerClick(li: HTMLLIElement, analyzer: AnaFile) {
  li.addEventListener('click', () => {
    fetch(`/api/sequence/${analyzer.folder}`)
      .then(response => response.json())
      .then((files: SeqFile[] ) => {

        clearSelections("analyzer-list");
        selectionLogic("analyzer-list",analyzer.index);   

        const seqTitle = document.getElementById('sequenceTitle') as HTMLUListElement;
        if (seqTitle)
          seqTitle.style.display = 'block';

        centerPopup(analyzer.folder);

        fetch(`/api/input/${analyzer.folder}/text.txt`)
          .then(response => response.text())
          .then((content: string) => {
            console.log(content)
            const fileContent = document.getElementById('file-content') as HTMLDivElement;
            fileContent.innerHTML = content;
            setPathText(`${analyzer.name} > text`);
        });

        fetch(`/api/kb/${analyzer.folder}`)
          .then(response => response.json())
          .then((kbs: {'name': string, 'type': string, 'index': number}[]) => {
						const kbDiv = document.getElementById('list-kb') as HTMLDivElement;
            const kbList = document.getElementById('kb-list') as HTMLUListElement;
            kbList.innerHTML = '';
            kbs.forEach(kb => {
              let kbLi = document.createElement('li');
              kbLi.classList.add('kb-item');
              kbLi.setAttribute('index', kb.index.toString());

              let anchor = document.createElement('a');
              anchor.textContent = kb.name;
              starAddition(anchor, analyzer.name, kb.name);
              anchor.addEventListener('click', () => {
                fetch(`/api/kbload/${analyzer.folder}/${kb.name}`)
                  .then(response => response.text())
                  .then((content: string) => {
                    const fileContent = document.getElementById('file-content') as HTMLDivElement;
                    selectionLogic("kb-list",kb.index);
                    fileContent.innerHTML = content;
                    addPath(analyzer.name, 'kb', kb.name);
                  });
              });
              kbLi.appendChild(anchor);
              kbList.append(kbLi);
            });
            if (kbList.innerHTML == '') {
              kbDiv.style.display = 'none';
            } else {
              kbDiv.style.display = 'block';
            }
        });

        fetch(`/api/output/${analyzer.folder}`)
        .then(response => response.json())
        .then((outputs: {'name': string, 'type': string, 'index': number}[]) => {
					const outDiv = document.getElementById('list-output') as HTMLDivElement;
          const outputList = document.getElementById('output-list') as HTMLUListElement;
          outputList.innerHTML = '';
          outputs.forEach(output => {
            let outLi = document.createElement('li');
            outLi.classList.add('output-item');
            outLi.setAttribute('index', output.index.toString());

            let anchor = document.createElement('a');
            addToolHelp(anchor, analyzer.folder, 'output', output.name);
            anchor.textContent = output.name;
            starAddition(anchor, analyzer.name, output.name);
            anchor.addEventListener('click', () => {
              fetch(`/api/outputload/${analyzer.folder}/${output.name}`)
                .then(response => response.text())
                .then((content: string) => {
                  const fileContent = document.getElementById('file-content') as HTMLDivElement;
                  selectionLogic("output-list",output.index);
                  fileContent.innerHTML = content
                  addPath(analyzer.name, 'output', output.name);
                });
            });
            outLi.appendChild(anchor);
            outputList.append(outLi);
          });
          if (outputList.innerHTML == '') {
            outDiv.style.display = 'none';
          } else {
            outDiv.style.display = 'block';
          }
        });

        const seqDiv = document.getElementById('list-seq') as HTMLDivElement;
        seqDiv.style.display = 'block';
        const seqList = document.getElementById('sequence-list') as HTMLUListElement;
        seqList.innerHTML = '';
        files.forEach(file => {
          console.log(file);
          const li = document.createElement('li');
          li.classList.add('seq-item');
          li.setAttribute('index', file.index.toString());
          li.setAttribute('anchors', '');
          let colorCode = file.name == 'final.tree' || file.name.includes('tok') ? 'gray' : 'yellow';
          let anchor = document.createElement('a');
          anchor.style.marginRight = '5px';
          if (colorCode != 'gray') {
            handleClick(anchor, analyzer, file, clickType.CODE);
            li.setAttribute('anchors', clickType.CODE.toString());
          }
          let icon = document.createElement('i');
          icon.className = 'fas fa-code';
          icon.style.color = colorCode;
          anchor.appendChild(icon);
          li.appendChild(anchor);

          anchor = document.createElement('a');
          anchor.style.marginRight = '5px';
          anchor.setAttribute('index', file.index.toString());
          const colorTree = file.tree ? 'yellow' : 'gray';
          if (colorTree != 'gray') {
            handleClick(anchor, analyzer, file, clickType.TREE);
            li.setAttribute('anchors', `${li.getAttribute('anchors')}${clickType.TREE.toString()}`);
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
            li.setAttribute('anchors', `${li.getAttribute('anchors')}${clickType.HIGHLIGHT.toString()}`);
          } else if (file.tree) {
            handleClick(anchor, analyzer, file, clickType.TREE);
            anchor.style.color = 'gray';
          } else if (colorCode != 'gray') {
            handleClick(anchor, analyzer, file, clickType.CODE);
            anchor.style.color = 'gray';
          } else {
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

function fileHasInfo(analyzer: string, file: string): boolean {
  const anaObj = helpInfo.analyzers.find(a => a.name === analyzer);
  if (anaObj) {
    const fileObj = anaObj.files.find(f => f.name === file);
    if (fileObj) {
      return true;
    } 
  }
  return false;
}

function setCommentText(text: string, html: boolean = false) {
  const comment = document.getElementById('comment') as HTMLParagraphElement;
  comment.style.display = 'block';
  if (html) {
    comment.innerHTML = text;
  } else {
    comment.textContent = text;
  }
} 

function handleClick(anchor: HTMLAnchorElement, analyzer: AnaFile, file: SeqFile, type: clickType) {
  anchor.addEventListener('click', () => {
    rotateClick(anchor, analyzer, file, type);
  })
}

function rotateClick(anchor: HTMLAnchorElement, analyzer: AnaFile, file: SeqFile, type: clickType) {
  const ul = anchor.closest('ul');
  const li = anchor.closest('li');
  const typeStr = type.toString();

  // This code handles the rotation of the anchor when clicked multiple times
  if (ul && li) {
    let index = ul.getAttribute('index');
    if (index) {
      const liIndex = li.getAttribute('index');
      if (!liIndex || index != liIndex) {
        if (liIndex)
          ul.setAttribute('index', liIndex);
      } else {
        const anchors = li.getAttribute('anchors');
        if (anchors && anchors.length > 1) {
          const enumLength = Object.keys(clickType).length / 2;
          const lastAnchor = li.getAttribute('anchor');
          let charIndex = 0;
          if (lastAnchor) {
            charIndex = parseInt(lastAnchor);
          } else {
            charIndex = type;
          }
          type = (charIndex + 1) % enumLength;
          li.setAttribute('debug', `type: ${type.toString()} char: ${charIndex.toString()}`);
          while (anchors.indexOf(type.toString()) < 0) {
            type = (++type) % enumLength;
          }
          li.setAttribute('anchor', type.toString());
        }
      }
    } else {
      const liIndex = li.getAttribute('index');
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

function fetchKB(analyzer: AnaFile, file: SeqFile) {
  fetch(`/api/kbload/${analyzer.folder}/${file.name}`)
    .then(response => response.text())
    .then(content => {
      const fileContent = document.getElementById('file-content') as HTMLDivElement;
      selectionLogic("kb-list",file.index);
      fileContent.innerHTML = content;
      addPath(analyzer.name, 'kb', file.name);
    });
}

function fetchCode(analyzer: AnaFile, file: SeqFile) {
  fetch(`/api/seqfile/${analyzer.folder}/${file.name}`)
    .then(response => response.text())
    .then(content => {
      const fileContent = document.getElementById('file-content') as HTMLDivElement;
      selectionLogic("sequence-list",file.index);
      fileContent.innerHTML = content;
      addPath(analyzer.name, 'sequence', file.name);
    });
}

function fetchTree(analyzer: AnaFile, file: SeqFile) {
  fetch(`/api/tree/${analyzer.folder}/${file.name}/${file.index}`)
    .then(response => response.text())
    .then(content => {
      const fileContent = document.getElementById('file-content') as HTMLDivElement;
      selectionLogic("sequence-list",file.index);
      fileContent.innerHTML = content;
      addPath(analyzer.name, 'sequence', file.name);
    });
}

function fetchHighlight(analyzer: AnaFile, file: SeqFile) {
  fetch(`/api/highlight/${analyzer.folder}/${file.name}/${file.index}`)
    .then(response => response.text())
    .then(content => {
      const fileContent = document.getElementById('file-content') as HTMLDivElement;
      selectionLogic("sequence-list",file.index);
      fileContent.innerHTML = content;
      addPath(analyzer.name, 'sequence', file.name);
    });
}

document.addEventListener('DOMContentLoaded', () => {
  handleLoad();
});