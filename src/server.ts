import express from 'express';
import https from 'https';
import path from 'path';
import fs from 'fs';
import { genFileType } from './treeFile';
import { VisualText } from './visualText';
import { TextFile } from './textFile';
import { TreeFile } from './treeFile'

const app = express();
const PORT = 3000;

export const visualText = new VisualText();
export const textFile = new TextFile();
export const treeFile = new TreeFile();

app.use(express.static('public'));

app.get('/api/readme/firstline/:analyzer', (req, res) => {
  const readMePath = path.join('analyzers', req.params.analyzer, 'README.md');
  let firstLine = textFile.readFirstLine(readMePath);
  firstLine = firstLine.replace(/^#/, '').trim();

  const titleCase = (str: string) => {
    const words = str.toLowerCase().split(' ');
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return capitalizedWords.join(' ');
  };

  res.json(titleCase(firstLine));
});

app.get('/api/analyzers', (req, res) => {
  fs.readdir('analyzers', (err, folders) => {
    if (err) {
      return res.status(500).send('Unable to scan files');
    }
    let i = 1;
    let fs = [];
    for (let folder of folders) {
      const readMePath = path.join('analyzers', folder, 'README.md');
      let firstLine = textFile.readFirstLine(readMePath);
      firstLine = firstLine.replace(/^#/, '').trim();
    
      let data = {'name': firstLine, 'folder': folder, 'index': i};
      i++;
      fs.push(data);
    }
    res.json(fs);
  });
});

app.get('/api/sequence/:analyzer', (req, res) => {
  const anaDir = path.join('analyzers', req.params.analyzer);
  const dirPath = path.join(process.cwd(),anaDir);
  visualText.analyzer.setWorkingDir(dirPath);
  const sequenceFile = visualText.analyzer.seqFile;
  sequenceFile.getPassFiles(anaDir,true);  let files = [];
  let i = 1;
  for (let passItem of sequenceFile.getPassItems()) {
    if (passItem.typeStr == 'nlp') {
      let data = {'name': passItem.name, 'index': i, 'highlight': passItem.highlightFile};
      files.push(data);
    } else if (i == 1) {
      let data = {'name': passItem.typeStr, 'index': i, 'highlight': passItem.highlightFile};
      files.push(data);
    }
    i++;
  }
  res.json(files);
});

app.get('/api/kb/:analyzer', (req, res) => {
  const anaDir = path.join('analyzers', req.params.analyzer, 'kb', 'user');
  fs.readdir(anaDir, (err, files) => {
    if (err) {
      return res.status(500).send('Unable to scan files');
    }
    let data = [];
    for (let file of files) {
      let type = 'none';
      if (file.endsWith('.dict')) {
        type = 'dict';
      } else if (file.endsWith('.kbb')) {
        type = 'kbb';
      }
      if (type != 'none') { 
        data.push({'name': file, 'type': type});
      }
    }
    res.json(data);
  });
});

app.get('/api/kbload/:analyzer/:filename', (req, res) => {
  let filePath = path.join('analyzers', req.params.analyzer, 'kb', 'user', req.params.filename);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send(`Unable to read file : ${filePath}`);
    }
    res.send(`<pre>${data}</pre>`);
  });
});

app.get('/api/highlight/:analyzer/:filename/:index', (req, res) => {
  const index = parseInt(req.params.index);
  visualText.analyzer.setPassNum(index);
  const dirPath = path.join('analyzers', req.params.analyzer, 'input', 'text.txt_log');

  fs.readdir(dirPath, (err, folders) => {
    for (let file of folders) {
      if (file.endsWith('.tree')) {
        const num = parseInt(file.substring(file.lastIndexOf('.') - 3, file.lastIndexOf('.')));
        if (num == index) {
          const newFile = visualText.analyzer.genHightlightFile(genFileType.HTML);
          fs.readFile(newFile, 'utf8', (err, data) => {   
            if (err) {
              return res.status(500).send(`Unable to read file : ${path.join (newFile)}`);
            }
            res.send(data);
          });
          break;
        }
      };
    }
  });
});

app.get('/api/tree/:analyzer/:filename/:index', async (req, res) => {
  const dirPath = path.join('analyzers', req.params.analyzer, 'input', 'text.txt_log');
  const index = parseInt(req.params.index);
  let found = false;
  let treeContent = 'No tree file found';

  try {
    const folders = await fs.promises.readdir(dirPath);

    let found = false;
    for (let file of folders) {
      if (file.endsWith('.tree.html')) {
        const str = file.substring(3,6);
        const num = parseInt(str);
        if (num == index) {
          let f = path.join(dirPath, file);
          const data = await fs.promises.readFile(f, 'utf8');
          treeContent = data;
          found = true;
          break;
        }
      }
    }
    if (!found) {
      for (let file of folders) {
        if (file.endsWith('.tree')) {
          const str = file.substring(3,6);
          const num = parseInt(str);
          if (num == index) {
            let f = path.join(dirPath, file);
            const data = await fs.promises.readFile(f, 'utf8');
            treeContent = `<pre>${data}</pre>`;
          }
        }
      }
    }

    res.send(treeContent);

  } catch (err) {
    return res.status(500).send(`Unable to read directory: ${dirPath}`);
  }
});

app.get('/api/seqfile/:analyzer/:filename', (req, res) => {
  let filePath = path.join('analyzers', req.params.analyzer, 'spec', req.params.filename + '.nlp.html');
  let html = true;
  if (!fs.existsSync(filePath)) {
    filePath = path.join('analyzers', req.params.analyzer, 'spec', req.params.filename + '.nlp');
    html = false;
  }
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send(`Unable to read file : ${filePath}`);
    }
    if (html)
      res.send(data);
    else
      res.send(`<pre>${data}</pre>`);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// https.createServer(options, app).listen(443, () => {
//   console.log('HTTPS server running on port 443');
// });