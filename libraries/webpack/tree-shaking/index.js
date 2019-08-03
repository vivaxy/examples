import importedUsed from './submodules/imported-used';
import imported from './submodules/imported';
import partialImportedDefault from './submodules/partial-imported-default';
import partialImportedNotDefault from './submodules/partial-imported-not-default';

import importedUsedWithinTrueCondition from './submodules/imported-used-within-true-condition.js';
import importedUsedWithinFalseCondition from './submodules/imported-used-within-false-condition.js';

const env = 'production';

if (env === 'production') {
  importedUsedWithinTrueCondition();
}

if (env !== 'production') {
  importedUsedWithinFalseCondition();
}

importedUsed();
