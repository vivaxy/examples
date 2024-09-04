/**
 * @since 2024-09-04
 * @author vivaxy
 */
import fs from 'fs';

const content = fs.readFileSync('./list.json', 'utf8');
const list = JSON.parse(content).map(function (item) {
  return {
    Name: item.name,
    Artist: item.ar[0].name,
    Album: item.al.name,
  };
});
const columns = [
  'Name',
  'Artist',
  // 'Composer',
  // 'Album',
  // 'Grouping',
  // 'Work',
  // 'Movement Number',
  // 'Movement Count',
  // 'Movement Name',
  // 'Genre',
  // 'Size',
  // 'Time',
  // 'Disc Number',
  // 'Disc Count',
  // 'Track Number',
  // 'Track Count',
  // 'Year',
  // 'Date Modified',
  // 'Date Added',
  // 'Bit Rate',
  // 'Sample Rate',
  // 'Volume Adjustment',
  // 'Kind',
  // 'Equalizer',
];
let fileContent = columns.join('\t') + '\n';

list.forEach((object) => {
  columns.forEach((column) => {
    fileContent += `${object[column] || ''}\t`;
  });
  fileContent += '\n';
});

fs.writeFileSync('./output.txt', fileContent);
