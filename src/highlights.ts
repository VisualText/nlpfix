import path from 'path';
import fs from 'fs';
import { TreeFile } from './treeFile'

const treeFile = new TreeFile();
const analyzersPath = path.join(path.dirname(__dirname),'analyzers');

fs.readdirSync(analyzersPath).forEach((folder) => {
    const folderPath = path.join(analyzersPath, folder, 'input', 'text.txt_log');
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach((file) => {
            if (file.endsWith('.tree')) {
                const num = parseInt(file.substring(file.lastIndexOf('.') - 3, file.lastIndexOf('.')));
                treeFile.firedFile(num,true);
            }
        });
    }
});