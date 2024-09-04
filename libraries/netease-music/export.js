/**
 * @since 2024-09-04
 * @author vivaxy
 */
import fs from 'fs';
import path from 'path';

const content = fs.readFileSync('./list.json', 'utf8');
const list = JSON.parse(content);
let fileContent = 'Name\tArtist\tComposer\tAlbum\n';

list.forEach(({ name, ar, al }) => {
  fileContent += `${name}\t${ar[0].name}\t\t${al.name}\n`;
});

fs.writeFileSync('./output.txt', fileContent);
