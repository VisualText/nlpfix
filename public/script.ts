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
    "output": [
      {
        "file": "output.json",
        "tooltip":  "NLP++ jason package output",
        "description": "This file is the output of the NLP++ jason package. It contains the output of the NLP++ date and time analyzer in JSON format." 
      }
    ]
}

function handleLoad(): void {
  fetch('/api/analyzers')
  .then(response => response.json())
  .then((analyzers: AnaFile[] ) => {
    const analyzerList = document.getElementById('analyzer-list') as HTMLUListElement;
    analyzerList.innerHTML = '';
    
    const main = document.getElementById('file-content') as HTMLDivElement;
    let para = document.createElement('p');
    para.setAttribute('class', 'ana-instructions');
    const firstLine = "<instructions>Choose one of the following NLP++ text analyzers:</instructions><br>\n";
    para.innerHTML = firstLine;
    main.appendChild(para);
    let ul = document.createElement('ul');
    ul.setAttribute('class', 'analyzer-list');

    analyzers.forEach(analyzer => {
      if (!analyzer.folder.startsWith('.')) {
        const li = document.createElement('li');
        li.classList.add('analyzer-item');
        li.textContent = analyzer.name;
        li.setAttribute('index', analyzer.index.toString());

        analyzerClick(li, analyzer);
        analyzerList.appendChild(li);
        if (analyzer.name.length > 0) {
          let liana = document.createElement('li');
          liana.setAttribute('class', 'analyzer-description');
          analyzerClick(liana, analyzer);
          liana.innerHTML = `<ananame>${analyzer.name}</ananame><br>\n${analyzer.description}`; 
          ul.appendChild(liana);
        }
      }
    });

    main.appendChild(ul);
  });
}

function analyzerClick(li: HTMLLIElement, analyzer: AnaFile) {
  li.addEventListener('click', () => {
    fetch(`/api/sequence/${analyzer.folder}`)
      .then(response => response.json())
      .then((files: SeqFile[] ) => {

        clearSelections("analyzer-list");
        selectionLogic("analyzer-list",analyzer.index);   

        // fetch(`/api/readme/firstline/${analyzer.folder}`)
        //   .then(response => response.json())
        //   .then((firstLine: string) => {
        //     const tit = document.getElementById('sequenceTitle') as HTMLParagraphElement;
        //     tit.innerHTML = firstLine;
        // });

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
            const kbList = document.getElementById('kb-list') as HTMLUListElement;
            kbList.innerHTML = '';
            kbs.forEach(kb => {
              let kbLi = document.createElement('li');
              kbLi.classList.add('kb-item');
              kbLi.setAttribute('index', kb.index.toString());

              let anchor = document.createElement('a');
              anchor.textContent = kb.name;
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
        });

        fetch(`/api/output/${analyzer.folder}`)
        .then(response => response.json())
        .then((outputs: {'name': string, 'type': string, 'index': number}[]) => {
          const outputList = document.getElementById('output-list') as HTMLUListElement;
          outputList.innerHTML = '';
          outputs.forEach(output => {
            let outLi = document.createElement('li');
            outLi.classList.add('output-item');
            outLi.setAttribute('index', output.index.toString());

            let anchor = document.createElement('a');
            addToolHelp(anchor, 'output', output.name);
            anchor.textContent = output.name;
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
        });

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
          li.appendChild(anchor);

          li.appendChild(document.createElement('ul'));
          seqList.appendChild(li);
        });
    });
  });
}

function addPath(analyzer: string, list: string, file: string) {
  const helpStr = helpInfo[list];
  if (helpStr && file === helpStr[0].file) {
    setPathText(helpStr[0].description);
  } else {
    setPathText(`${analyzer} > ${list} > ${file}`);
  }
}

function setPathText(text: string, html: boolean = false) {
  const comment = document.getElementById('comment') as HTMLParagraphElement;
  comment.style.display = 'none';
  const path = document.getElementById('path') as HTMLParagraphElement;
  path.style.display  = 'block';
  if (html) {
    path.innerHTML = text;
  } else {
    path.textContent = text;
  }
}

function setCommentText(text: string, html: boolean = false) {
  const path = document.getElementById('path') as HTMLParagraphElement;
  path.style.display = 'none';
  const comment = document.getElementById('comment') as HTMLParagraphElement;
  comment.style.display  = 'block';
  if (html) {
    comment.innerHTML = text;
  } else {
    comment.textContent = text;
  }
} 

function addToolHelp(anchor: HTMLAnchorElement, list: string, file: string) {
  const helpStr = helpInfo[list];
  if (helpStr && file === helpStr[0].file) {
    addTooltip(anchor, helpStr[0].tooltip);
  }
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

function selectionLogic(id: string, index: number) {
  const the_list = document.getElementById(id) as HTMLUListElement;
  clearAllSelections();
  const listItem = Array.from(the_list.getElementsByTagName('li')).find(li => li.getAttribute('index') === index.toString());
  if (listItem) {
    listItem.classList.add('selected');
  }
}

function clearAllSelections() {
  ['sequence-list', 'kb-list', 'output-list'].forEach(clearSelections);
} 

function clearSelections(liClass: string) {
  const seq_list = document.getElementById(liClass) as HTMLUListElement;
  Array.from(seq_list.getElementsByTagName('li')).forEach(li => {
    li.classList.remove('selected');
  });
} 

document.addEventListener('DOMContentLoaded', () => {
  handleLoad();
});