/**
 * @since 2024-12-17
 * @author vivaxy
 */
import { LRLanguage, LanguageSupport } from '@codemirror/language';
import { foldNodeProp, foldInside, indentNodeProp } from '@codemirror/language';
import { styleTags, tags as t } from '@lezer/highlight';
import { completeFromList } from '@codemirror/autocomplete';
import { parser } from './syntax.grammar.js';

let parserWithMetadata = parser.configure({
  props: [
    styleTags({
      Type: t.string,
      Scope: t.atom,
      Description: t.className,
    }),
    indentNodeProp.add({
      Application: (context) =>
        context.column(context.node.from) + context.unit,
    }),
    foldNodeProp.add({
      Application: foldInside,
    }),
  ],
});

const conventionalCommitsLanguage = LRLanguage.define({
  parser: parserWithMetadata,
  languageData: {},
});

const conventionalCommitsCompletion = conventionalCommitsLanguage.data.of({
  autocomplete: completeFromList([]),
});

export function conventionalCommits() {
  return new LanguageSupport(conventionalCommitsLanguage, [
    conventionalCommitsCompletion,
  ]);
}
