/**
 * @since 2019-07-01 08:19:32
 * @author vivaxy
 */
const prompts = require('prompts');

(async function() {
  const { name } = await prompts({
    type: 'autocomplete',
    name: 'name',
    message: 'Select name',
    choices: Array.from({ length: 26 }, function(v, index) {
      return String.fromCharCode(index + 65);
    }),
    suggest(input, choices) {
      if (!input) {
        return choices;
      }
      return choices.filter(function(choice) {
        return choice.includes(input);
      });
    },
  });
  console.log('Selected name:', name);
})();
