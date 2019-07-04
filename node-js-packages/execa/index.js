/**
 * @since 2019-06-30 21:28:00
 * @author vivaxy
 */

const execa = require('execa');

(async function() {
  // const { exitCode, stdout, stderr } = await execa('git', ['describe', '--tags', '--always']);
  const { exitCode, stdout, stderr } = await execa(
    'git',
    ['describe', '--tags', '--always'],
    { shell: true },
  );
  console.log(exitCode, stdout, stderr);
})();
