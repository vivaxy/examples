/**
 * @since 2020-10-11 10:41
 * @author vivaxy
 */
const $openFile = document.getElementById('open-file');
const $content = document.getElementById('content');
const $saveFile = document.getElementById('save-file');

const filePickerOptions = {
  types: [
    {
      description: 'Text Files',
      accept: {
        'text/plain': ['.txt', '.text'],
        'text/html': ['.html', '.htm'],
        'application/javascript': ['.js'],
        'text/css': ['.css'],
      },
    },
  ],
  excludeAcceptAllOption: true,
};

$openFile.addEventListener('click', async function () {
  const [handle] = await window.showOpenFilePicker(filePickerOptions);
  const file = await handle.getFile();
  console.log('file', file);
  const content = await file.text();
  console.log('content', content);
  $content.value = content;
});

$saveFile.addEventListener('click', async function () {
  await saveFile($content.value);
});
async function saveFile(content) {
  const fileHandle = await window.showSaveFilePicker(filePickerOptions);
  const writable = await fileHandle.createWritable({
    keepExistingData: false,
  });
  await writable.write(content);
  await writable.close();
}
