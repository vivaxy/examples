/**
 * @since 2024-07-09
 * @author vivaxy
 */
const blocks = [document.querySelector('.a'), document.querySelector('.b')];

blocks.forEach(
  /**
   *
   * @param {HTMLDivElement} block
   */
  function (block) {
    let x = 0;
    let y = 0;
    let xOffset = 0;
    let yOffset = 0;

    function handleMouseUp() {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    /**
     * @param {MouseEvent} e
     */
    function handleMouseMove(e) {
      x = xOffset - e.clientX;
      y = yOffset - e.clientY;
      xOffset = e.clientX;
      yOffset = e.clientY;
      block.style.top = `${block.offsetTop - y}px`;
      block.style.left = `${block.offsetLeft - x}px`;
    }

    /**
     * @param {MouseEvent} e
     */
    function handleMouseDown(e) {
      e.preventDefault();
      xOffset = e.clientX;
      yOffset = e.clientY;

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    block.addEventListener('mousedown', handleMouseDown);
  },
);
