/**
 * @since 150702 14:36
 * @author vivaxy
 */
indeterminate.addEventListener('change', function () {
    test.indeterminate = indeterminate.checked;
});

checked.addEventListener('change', function () {
    test.checked = checked.checked;
});
