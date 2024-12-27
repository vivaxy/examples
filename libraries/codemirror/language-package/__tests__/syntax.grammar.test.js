import * as fs from 'fs';
import * as path from 'path';
import { describe, it } from 'vitest';
import { fileTests } from '@lezer/generator/dist/test';
import { parser } from '../syntax.grammar.js';

let caseDir = path.join(__dirname, 'syntax-grammar');

for (let file of fs.readdirSync(caseDir)) {
  if (!/\.txt$/.test(file)) continue;

  let name = /^[^\.]*/.exec(file)[0];
  describe(name, () => {
    for (let { name, run } of fileTests(
      fs.readFileSync(path.join(caseDir, file), 'utf8'),
      file,
    )) {
      it(name, () => run(parser));
    }
  });
}
