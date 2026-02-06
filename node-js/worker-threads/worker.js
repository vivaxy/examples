// worker.js
import { parentPort } from 'worker_threads';

// 监听主线程发送的消息
parentPort.on('message', (task) => {
  console.log('Worker 收到任务:', task);

  // 模拟 CPU 密集型计算：统计从 2 到 n 之间所有的素数
  const isPrime = (num) => {
    if (num < 2) return false;
    if (num === 2) return true;
    if (num % 2 === 0) return false;
    for (let i = 3; i <= Math.sqrt(num); i += 2) {
      if (num % i === 0) return false;
    }
    return true;
  };

  const countPrimes = (n) => {
    let count = 0;
    const primes = [];
    for (let i = 2; i <= n; i++) {
      if (isPrime(i)) {
        count++;
        primes.push(i);
      }
    }
    return {
      count,
      largest: primes[primes.length - 1] || null,
      primes: primes.slice(-10),
    };
  };

  const result = countPrimes(task.num);

  // 处理完成后把结果发送回主线程
  parentPort.postMessage({ taskId: task.id, result });
});
