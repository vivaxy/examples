// index.js
import http from 'http';
import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function runTaskInWorker(task) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(join(__dirname, 'worker.js'));

    // 接收 Worker 的返回
    worker.once('message', resolve);
    worker.once('error', reject);
    worker.once('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker 停止，退出码 ${code}`));
    });

    // 向 Worker 发送任务
    worker.postMessage(task);
  });
}

// 测试
async function main() {
  try {
    const task = { id: 1, num: 50000000 };
    console.log('主线程发送任务:', task);
    const result = await runTaskInWorker(task);
    console.log('主线程收到结果:', result);
    return result;
  } catch (error) {
    console.error('主线程处理异常:', error);
    throw error;
  }
}

// 创建 HTTP 服务器
const server = http.createServer(async (req, res) => {
  // 解析 URL
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/test') {
    try {
      const result = await main();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, result }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Not Found' }));
  }
});

// 监听 8080 端口
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`访问 http://localhost:${PORT}/test 执行计算任务`);
});
