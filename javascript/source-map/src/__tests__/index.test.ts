/**
 * @since 2020-03-08 17:45:41
 * @author vivaxy
 */
import * as path from 'path';
import * as fse from 'fs-extra';
import * as webpack from 'webpack';
import parse from '../index';

function buildWebpack() {
  return new Promise(function(resolve, reject) {
    webpack(
      {
        entry: './index.js',
        context: path.join(__dirname, 'fixtures', 'webpack', 'src'),
        output: {
          path: path.join(__dirname, 'fixtures', 'webpack', 'dist'),
          filename: 'bundle.js',
        },
        mode: 'production',
        devtool: 'source-map',
      },
      function(err, stats) {
        if (err || stats.hasErrors()) {
          reject(err || stats.toString());
        } else {
          resolve(stats.toString());
        }
      },
    );
  });
}

async function getSourceMap(fixtureName: string, sourceMapPath: string) {
  const sourceMapFilePath = path.join(
    __dirname,
    'fixtures',
    fixtureName,
    'dist',
    sourceMapPath,
  );
  const sourceMapFileContent = await fse.readFileSync(
    sourceMapFilePath,
    'utf8',
  );
  return JSON.parse(sourceMapFileContent);
}

test('uglify', async function() {
  const sourceMap = await getSourceMap('uglify', 'index.js.map');
  expect(parse(sourceMap)).toMatchSnapshot();
});

test('webpack', async function() {
  // await buildWebpack();
  const sourceMap = await getSourceMap('webpack', 'bundle.js.map');
  expect(parse(sourceMap)).toMatchSnapshot();
});
