/**
 * @since 20180503 13:33
 * @author vivaxy
 */

class CheckerboardPainter {
  static get inputProperties() {
    return ['--checkerboard-spacing', '--checkerboard-size'];
  }

  paint(ctx, geom, properties) {
    const size = parseInt(properties.get('--checkerboard-size').toString()) || 1;
    const spacing = parseInt(properties.get('--checkerboard-spacing').toString()) || 1;
    const colors = ['red', 'green', 'blue'];

    for (let y = 0; y < geom.height / size; y++) {
      for (let x = 0; x < geom.width / size; x++) {
        ctx.fillStyle = colors[(x + y) % colors.length];
        ctx.beginPath();
        ctx.rect(x * (size + spacing), y * (size + spacing), size, size);
        ctx.fill();
      }
    }
  }
}

registerPaint('checkerboard', CheckerboardPainter);
