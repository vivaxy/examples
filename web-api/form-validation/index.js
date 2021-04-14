/**
 * @since 2019-08-19 13:39
 * @author vivaxy
 */
const input = document.querySelector('#input');

function log() {
  console.clear();
  console.log('input', input);
  console.log('-.validationMessage', input.validationMessage);
  console.log('-.willValidate', input.willValidate);
  console.log('-.validity', input.validity);
  console.log('--.badInput', input.validity.badInput);
  console.log('--.customError', input.validity.customError);
  console.log('--.patternMismatch', input.validity.patternMismatch);
  console.log('--.rangeOverflow', input.validity.rangeOverflow);
  console.log('--.rangeUnderflow', input.validity.rangeUnderflow);
  console.log('--.stepMismatch', input.validity.stepMismatch);
  console.log('--.tooLong', input.validity.tooLong);
  console.log('--.tooShort', input.validity.tooShort);
  console.log('--.typeMismatch', input.validity.typeMismatch);
  console.log('--.valid', input.validity.valid);
  console.log('--.valueMissing', input.validity.valueMissing);

  if (Number.isNaN(Number(input.value))) {
    input.setCustomValidity('please input a number');
  } else {
    input.setCustomValidity('');
  }
}

log();

input.addEventListener('input', log);

const $reportValidity = document.querySelector('#reportValidity');
$reportValidity.addEventListener('click', function () {
  input.reportValidity();
});

const $checkValidity = document.querySelector('#checkValidity');
$checkValidity.addEventListener('click', function () {
  console.log('input.checkValidity()', input.checkValidity());
});
