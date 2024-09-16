function handleLoad(): void {
  fetch('/api/analyzers')
  .then(response => response.json())
  .then((folders: string[]) => {
    const analyzerList = document.getElementById('analyzer-list') as HTMLUListElement;
    analyzerList.innerHTML = '';
    folders.forEach(folder => {
      if (!folder.startsWith('.')) {
        const li = document.createElement('li');
        li.classList.add('analyzer-item');
        li.textContent = folder;

        li.addEventListener('click', () => {
          console.log('Clicked:', folder);
            fetch(`/api/sequence/${folder}`)
              .then(response => response.json())
              .then((files: {'name': string, 'index': number, 'highlight': boolean}[] ) => {

                fetch(`/api/readme/firstline/${folder}`)
                .then(response => response.json())
                .then((firstLine: string) => {
                  const tit = document.getElementById('sequenceTitle') as HTMLParagraphElement;
                  tit.innerHTML = firstLine;
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
                    fetch(`/api/seqfile/${folder}/${file.name}`)
                      .then(response => response.text())
                      .then(content => {
                        const fileContent = document.getElementById('file-content') as HTMLDivElement;
                        selectionLogic(file.index);
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
                    fetch(`/api/tree/${folder}/${file.name}/${file.index}`)
                      .then(response => response.text())
                      .then(content => {
                        const fileContent = document.getElementById('file-content') as HTMLDivElement;
                        selectionLogic(file.index);
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
                      fetch(`/api/highlight/${folder}/${file.name}/${file.index}`)
                        .then(response => response.text())
                        .then(content => {
                          const fileContent = document.getElementById('file-content') as HTMLDivElement;
                          selectionLogic(file.index);
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

function selectionLogic(index: number) {
  const seq_list = document.getElementById('sequence-list') as HTMLUListElement;
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