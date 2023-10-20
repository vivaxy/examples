/**
 * @since 2023-10-20
 * @author vivaxy
 */
const mo = new MutationObserver(function (records) {
  records.forEach(function (record) {
    if (record.type === 'childList') {
      console.log(
        record.target.id,
        'mutationObserver',
        `+ ${Array.from(record.removedNodes)
          .map((t) => JSON.stringify(t.textContent))
          .join(' ')}, - ${Array.from(record.addedNodes)
          .map((t) => JSON.stringify(t.textContent))
          .join(' ')}`,
      );
    } else if (record.type === 'characterData') {
      console.log(
        record.target.parentNode.closest('[contenteditable="true"]').id,
        'mutationObserver',
        `${record.oldValue} -> ${record.target.textContent}`,
      );
    }
  });
});

['outer', 'inner'].forEach(function (name) {
  const $element = document.getElementById(name);
  ['keypress', 'keydown'].forEach(function (eventName) {
    $element.addEventListener(eventName, function (e) {
      console.log(name, eventName, e.key);
    });
  });
  mo.observe($element, {
    childList: true,
    subtree: true,
    characterData: true,
    characterDataOldValue: true,
  });
});
