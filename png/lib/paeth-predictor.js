module.exports = function paethPredictor(left, above, upLeft) {

  const paeth = left + above - upLeft;
  const pLeft = Math.abs(paeth - left);
  const pAbove = Math.abs(paeth - above);
  const pUpLeft = Math.abs(paeth - upLeft);

  if (pLeft <= pAbove && pLeft <= pUpLeft) {
    return left;
  }
  if (pAbove <= pUpLeft) {
    return above;
  }
  return upLeft;
};
