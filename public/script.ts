function handleLoad(): void {
  fetch('/api/analyzers')
  .then(response => response.json())
  .then((analyzers: {'name': string, 'folder': string, 'index': number}[] ) => {
    const analyzerList = document.getElementById('analyzer-list') as HTMLUListElement;
    analyzerList.innerHTML = '';
    analyzers.forEach(analyzer => {
      if (!analyzer.folder.startsWith('.')) {
        const li = document.createElement('li');
        li.classList.add('analyzer-item');
        li.textContent = analyzer.name;
        li.setAttribute('index', analyzer.index.toString());     

        li.addEventListener('click', () => {
          console.log('Clicked:', analyzer.name);
            fetch(`/api/sequence/${analyzer.folder}`)
              .then(response => response.json())
              .then((files: {'name': string, 'index': number, 'highlight': boolean}[] ) => {

                selectionLogic("analyzer-list",analyzer.index);   

                fetch(`/api/readme/firstline/${analyzer.folder}`)
                  .then(response => response.json())
                  .then((firstLine: string) => {
                    const tit = document.getElementById('sequenceTitle') as HTMLParagraphElement;
                    tit.innerHTML = firstLine;
                });

                fetch(`/api/kb/${analyzer.folder}`)
                  .then(response => response.json())
                  .then((kbs: {'name': string, 'type': string}[]) => {
                    const kbList = document.getElementById('kb-list') as HTMLUListElement;
                    kbList.innerHTML = '';
                    kbs.forEach(kb => {
                      console.log("kb: ", kb);
                      let kbLi = document.createElement('li');
                      kbLi.classList.add('seq-item');

                      let anchor = document.createElement('a');
                      anchor.style.marginLeft = '10px';
                      anchor.textContent = kb.name;
                      anchor.addEventListener('click', () => {
                        fetch(`/api/kbload/${analyzer.folder}/${kb.name}`)
                          .then(response => response.text())
                          .then(content => {
                            const fileContent = document.getElementById('file-content') as HTMLDivElement;
                            // selectionLogic("sequence-list",file.index);
                            fileContent.innerHTML = `<pre>${content}</pre>`;
                          });
                      });
                      kbLi.appendChild(anchor);
                      kbList.append(kbLi);
                    });
                });

                const seqList = document.getElementById('sequence-list') as HTMLUListElement;
                seqList.innerHTML = '';
                files.forEach(file => {
                  const li = document.createElement('li');
                  li.classList.add('seq-item');
                  li.setAttribute('index', file.index.toString());

                  let anchor = document.createElement('a');
                  anchor.style.marginLeft = '10px';
                  anchor.addEventListener('click', () => {
                    fetch(`/api/seqfile/${analyzer.folder}/${file.name}`)
                      .then(response => response.text())
                      .then(content => {
                        const fileContent = document.getElementById('file-content') as HTMLDivElement;
                        selectionLogic("sequence-list",file.index);
                        fileContent.innerHTML = content;
                      });
                  })
                  let icon = document.createElement('i');
                  icon.className = 'fas fa-code'; // Change this to the desired icon class
                  icon.style.color = 'yellow';
                  anchor.appendChild(icon);
                  li.appendChild(anchor);

                  anchor = document.createElement('a');
                  anchor.style.marginLeft = '10px';
                  anchor.setAttribute('index', file.index.toString());
                  anchor.addEventListener('click', () => {
                    fetch(`/api/tree/${analyzer.folder}/${file.name}/${file.index}`)
                      .then(response => response.text())
                      .then(content => {
                        const fileContent = document.getElementById('file-content') as HTMLDivElement;
                        selectionLogic("sequence-list",file.index);
                        fileContent.innerHTML = content;
                      });
                  })
                  icon = document.createElement('i');
                  icon.className = 'fas fa-sitemap'; // Change this to the desired icon class
                  icon.style.color = 'yellow';
                  anchor.appendChild(icon);
                  li.appendChild(anchor);

                  anchor = document.createElement('a');
                  anchor.style.marginLeft = '10px';
                  anchor.textContent = file.name;
                  if (file.highlight) {
                    anchor.addEventListener('click', () => {
                      fetch(`/api/highlight/${analyzer.folder}/${file.name}/${file.index}`)
                        .then(response => response.text())
                        .then(content => {
                          const fileContent = document.getElementById('file-content') as HTMLDivElement;
                          selectionLogic("sequence-list",file.index);
                          fileContent.innerHTML = `<pre>${content}</pre>`;
                        });
                    })
                  } else {
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

function selectionLogic(id: string, index: number) {
  const seq_list = document.getElementById(id) as HTMLUListElement;
  Array.from(seq_list.getElementsByTagName('li')).forEach(li => {
    li.classList.remove('selected');
  });
  const listItem = Array.from(seq_list.getElementsByTagName('li')).find(li => li.getAttribute('index') === index.toString());
  if (listItem) {
    listItem.classList.add('selected');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  handleLoad();
});