/**
 * @since 2025-07-24 16:36
 * @author vivaxy
 */
process.on('message', (msg) => {
  // 模拟处理完毕后回传
  process.send({ ok: true });
});
