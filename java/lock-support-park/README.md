# LockSupport.park()

演示用 `java.util.concurrent.locks.LockSupport.park()` 挂起线程、用 `unpark()`
唤醒线程，以及 `park()` 那些从签名上看不出来的语义。

`LockSupport` 是 JDK 提供的底层线程阻塞原语，AQS（`AbstractQueuedSynchronizer`）、
`ReentrantLock`、`CompletableFuture` 的阻塞都建立在它之上。

## 核心概念：permit（许可）

每个线程关联一个**许可**：

- `park()`：有许可就消费掉并立即返回；没有许可就挂起当前线程。
- `unpark(thread)`：给目标线程发放许可；若它正被 park 挂起，则立刻唤醒。
- **许可最多一个，不累积。** 连发两次 `unpark` 也只够一次 `park` 通过。

因为许可可以「先发后用」，`unpark` 早于 `park` 也不会丢失信号——这正是它区别于
`Object.wait()` / `notify()` 的地方。

## 运行方式

需要 Java 8+（`LockSupport` 自 1.5 起，`park(Object blocker)` 自 1.6 起）。

### 方式一：直接运行

```bash
./run.sh
```

### 方式二：手动编译运行

```bash
javac src/main/java/LockSupportParkDemo.java -d .
java -cp . LockSupportParkDemo
```

## 演示场景

| # | 场景 | 预期现象 |
| --- | --- | --- |
| 1 | `park()` / `unpark()` | worker 挂起后线程状态为 `WAITING`，`unpark` 后才继续 |
| 2 | 先 `unpark` 再 `park` | 许可已存在，`park()` 耗时 0ms 直接返回 |
| 3 | 连续两次 `unpark` | 第 1 次 `park()` 0ms 返回，第 2 次照样阻塞 |
| 4 | `interrupt()` 一个 parked 线程 | `park()` 返回但**不抛异常**，中断标志保持 `true` |
| 5 | `parkNanos(500ms)` | 无人 `unpark` 也会自行返回，期间状态是 `TIMED_WAITING` |
| 6 | `park(blocker)` | `getBlocker()` 能读出阻塞原因对象 |

`Thread.State` 的取值由 JDK 定义：`WAITING` 对应 `LockSupport.park`，
`TIMED_WAITING` 对应 `LockSupport.parkNanos` / `parkUntil`。

## 示例输出

```
[1] park / unpark: 挂起与唤醒
  [+    2ms] [worker-1] park() 挂起
  [+  309ms] [main    ] worker state = WAITING
  [+  309ms] [main    ] unpark(worker)
  [+  310ms] [worker-1] 被唤醒，继续执行

[2] 先 unpark 再 park: park() 立即返回
  [+  310ms] [main    ] worker 还没 park，先 unpark(worker) 发放许可
  [+  615ms] [worker-2] park()，此时许可已存在
  [+  626ms] [worker-2] park() 返回，耗时 0ms

[3] 许可不累积: 两次 unpark 只够一次 park
  [+  627ms] [main    ] 连续 unpark(worker) 两次
  [+  928ms] [worker-3] 第 1 次 park() 返回，耗时 0ms
  [+ 1234ms] [main    ] worker state = WAITING，第 2 次 park 仍被挂起
  [+ 1235ms] [main    ] 再 unpark(worker) 一次
  [+ 1235ms] [worker-3] 第 2 次 park() 返回，耗时 306ms

[4] 中断: 唤醒 park() 但不抛 InterruptedException
  [+ 1236ms] [worker-4] park() 挂起，等待被中断
  [+ 1539ms] [main    ] worker state = WAITING，interrupt(worker)
  [+ 1539ms] [worker-4] park() 返回，耗时 302ms，没有抛异常
  [+ 1544ms] [worker-4] isInterrupted() = true
  [+ 1544ms] [worker-4] 标志未清除，再 park() 立即返回，耗时 0ms
  [+ 1545ms] [worker-4] Thread.interrupted() 清除标志，返回 true
  [+ 1545ms] [worker-4] 标志已清除，park() 重新阻塞
  [+ 1844ms] [main    ] worker state = WAITING，unpark(worker)
  [+ 1844ms] [worker-4] 被 unpark 唤醒，耗时 297ms

[5] parkNanos: 超时自行返回，无需 unpark
  [+ 1845ms] [worker-5] parkNanos(500ms) 挂起
  [+ 2047ms] [main    ] worker state = TIMED_WAITING，main 不做任何 unpark
  [+ 2352ms] [worker-5] parkNanos 返回，耗时 505ms

[6] park(blocker): 把阻塞原因暴露给诊断工具
  [+ 2355ms] [worker-6] park(blocker) 挂起
  [+ 2665ms] [main    ] getBlocker(worker) = park-demo-blocker，与传入的是同一个对象: true
  [+ 2666ms] [main    ] jstack 里会显示: parking to wait for <park-demo-blocker>
  [+ 2666ms] [main    ] unpark(worker)
  [+ 2667ms] [worker-6] 被唤醒
```

## park() 的三个坑

### 1. 会虚假唤醒，必须放在循环里

`park()` 的 Javadoc 明确写了它可能「spuriously (that is, for no reason) returns」，
而且**不告诉你**这次返回是因为 unpark、中断还是虚假唤醒。所以返回后必须重新检查条件：

```java
while (!canProceed()) {
  // 保证 unpark 请求对其他线程可见
  LockSupport.park(this);
}
```

条件变量要用 `volatile` 或原子类——Javadoc：「Reliable usage requires the use of
volatile (or atomic) variables to control when to park or unpark.」

### 2. 中断只唤醒，不抛异常，也不清标志

`park()` 的签名上没有 `throws InterruptedException`。被中断时它只是返回，中断标志
仍是 `true`；而**标志为 true 时 `park()` 会立即返回**。所以不清标志的 park 循环会空转
跑满 CPU（场景 4 的第 2 次 park 耗时 0ms 就是这个现象）。要么用 `Thread.interrupted()`
消费掉标志，要么退出循环。

### 3. 许可不累积，会「丢 unpark」

因为最多只有一个许可，中途任何一次意料之外的 `park()`——包括类加载等隐式触发的——都可能
把许可吃掉，导致后面真正要等的那次 `park()` 永久挂起。这也是 Javadoc 建议在静态块里
预加载 `LockSupport` 类的原因。

## 对比其他挂起线程的方式

| 方式 | 是否需要持锁 | 是否顺序敏感 | 状态 |
| --- | --- | --- | --- |
| `Thread.suspend()` / `resume()` | — | — | **已废弃**，JDK 17 标注 `@Deprecated(since="1.2", forRemoval=true)` |
| `Object.wait()` / `notify()` | 必须在 `synchronized` 块内，否则抛 `IllegalMonitorStateException` | **是**，`notify` 早于 `wait` 会丢信号 | 可用 |
| `LockSupport.park()` / `unpark()` | 不需要 | 否，先 `unpark` 后 `park` 也能正常返回 | 推荐 |

`Thread.suspend()` 被废弃的原因是它「inherently deadlock-prone」：线程若在持有临界资源
的锁时被挂起，其他线程都拿不到该资源；如果负责 `resume` 它的线程恰好也要抢这把锁，就死锁了。

`LockSupport` 的类 Javadoc 直接点明了它为什么能替代 suspend/resume：

> park and unpark provide efficient means of blocking and unblocking threads that do not
> encounter the problems that cause the deprecated methods Thread.suspend and
> Thread.resume to be unusable for such purposes: Races between one thread invoking park
> and another thread trying to unpark it will preserve liveness, due to the permit.

即：靠许可机制，`park` 和 `unpark` 的**竞态不会破坏活性**——这正是场景 2 演示的内容。
