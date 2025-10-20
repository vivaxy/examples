import fs from 'fs';
import http from 'http';
import path from 'path';

function handleTest(req, res) {
  let totalBytes = 0;
  let body = '';

  req.on('data', (chunk) => {
    totalBytes += chunk.length;
    body += chunk.toString();
  });

  req.on('end', () => {
    console.log('Request body size:', totalBytes, 'bytes');
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ bodySize: totalBytes, body }));
  });
}

const server = http.createServer((req, res) => {
  const url = req.url;

  if (url === '/index.html' || url === '/index.js') {
    const filePath = path.join(process.cwd(), url.slice(1)); // 移除开头的 /

    // 检查文件是否存在
    fs.readFile(filePath, (err, data) => {
      if (err) {
        // 文件不存在，返回 404
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('文件未找到');
        return;
      }

      // 根据文件类型设置 Content-Type
      const contentType = url.endsWith('.html')
        ? 'text/html'
        : 'application/javascript';
      res.writeHead(200, { 'Content-Type': `${contentType}; charset=utf-8` });
      res.end(data);
    });
  } else if (url === '/test') {
    return handleTest(req, res);
  } else {
    res.writeHead(404, {
      'Content-Type': 'application/javascript; charset=utf-8',
    });
    res.end();
  }
});

// 监听端口 3000
server.listen(3000, () => {
  console.log('server listen: http://localhost:3000');
});
