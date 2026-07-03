process.on('message', (msg) => {
  // 模拟处理完毕后回传
  process.send({ ok: true });
});
