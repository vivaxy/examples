import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.LockSupport;

/**
 * Demonstrates the contract of {@link LockSupport#park()}: how it suspends a
 * thread, how the permit behaves, and every way a parked thread wakes up.
 *
 * <pre>
 * javac src/main/java/LockSupportParkDemo.java -d .
 * java -cp . LockSupportParkDemo
 * </pre>
 */
public class LockSupportParkDemo {

  private static final long START_NANOS = System.nanoTime();

  /** Passed to park(Object) so monitoring tools can name the blocking reason. */
  private static final Object BLOCKER =
      new Object() {
        @Override
        public String toString() {
          return "park-demo-blocker";
        }
      };

  public static void main(String[] args) throws InterruptedException {
    basicPark();
    unparkBeforePark();
    permitDoesNotAccumulate();
    interruptWhileParked();
    parkNanosTimeout();
    parkWithBlocker();
  }

  /** park() suspends the thread until another thread unparks it. */
  private static void basicPark() throws InterruptedException {
    title("[1] park / unpark: 挂起与唤醒");

    Thread worker =
        new Thread(
            () -> {
              log("park() 挂起");
              LockSupport.park();
              log("被唤醒，继续执行");
            },
            "worker-1");

    worker.start();
    sleep(300);
    log("worker state = " + worker.getState());
    log("unpark(worker)");
    LockSupport.unpark(worker);
    worker.join();
  }

  /** unpark() before park() leaves a permit, so the later park() does not block. */
  private static void unparkBeforePark() throws InterruptedException {
    title("[2] 先 unpark 再 park: park() 立即返回");

    Thread worker =
        new Thread(
            () -> {
              sleep(300); // 让 main 先发放许可
              log("park()，此时许可已存在");
              log("park() 返回，耗时 " + measure(LockSupport::park) + "ms");
            },
            "worker-2");

    worker.start();
    log("worker 还没 park，先 unpark(worker) 发放许可");
    LockSupport.unpark(worker);
    worker.join();
  }

  /** The permit is binary: two unparks do not let two parks through. */
  private static void permitDoesNotAccumulate() throws InterruptedException {
    title("[3] 许可不累积: 两次 unpark 只够一次 park");

    Thread worker =
        new Thread(
            () -> {
              sleep(300); // 让 main 先连发两次许可
              log("第 1 次 park() 返回，耗时 " + measure(LockSupport::park) + "ms");
              log("第 2 次 park() 返回，耗时 " + measure(LockSupport::park) + "ms");
            },
            "worker-3");

    worker.start();
    log("连续 unpark(worker) 两次");
    LockSupport.unpark(worker);
    LockSupport.unpark(worker);
    sleep(600);
    log("worker state = " + worker.getState() + "，第 2 次 park 仍被挂起");
    log("再 unpark(worker) 一次");
    LockSupport.unpark(worker);
    worker.join();
  }

  /** interrupt() wakes park() without throwing, and leaves the flag set. */
  private static void interruptWhileParked() throws InterruptedException {
    title("[4] 中断: 唤醒 park() 但不抛 InterruptedException");

    Thread worker =
        new Thread(
            () -> {
              log("park() 挂起，等待被中断");
              log("park() 返回，耗时 " + measure(LockSupport::park) + "ms，没有抛异常");
              log("isInterrupted() = " + Thread.currentThread().isInterrupted());
              log("标志未清除，再 park() 立即返回，耗时 " + measure(LockSupport::park) + "ms");
              log("Thread.interrupted() 清除标志，返回 " + Thread.interrupted());
              log("标志已清除，park() 重新阻塞");
              log("被 unpark 唤醒，耗时 " + measure(LockSupport::park) + "ms");
            },
            "worker-4");

    worker.start();
    sleep(300);
    log("worker state = " + worker.getState() + "，interrupt(worker)");
    worker.interrupt();
    sleep(300);
    log("worker state = " + worker.getState() + "，unpark(worker)");
    LockSupport.unpark(worker);
    worker.join();
  }

  /** parkNanos() returns on its own once the deadline passes. */
  private static void parkNanosTimeout() throws InterruptedException {
    title("[5] parkNanos: 超时自行返回，无需 unpark");

    Thread worker =
        new Thread(
            () -> {
              log("parkNanos(500ms) 挂起");
              long nanos = TimeUnit.MILLISECONDS.toNanos(500);
              log("parkNanos 返回，耗时 " + measure(() -> LockSupport.parkNanos(nanos)) + "ms");
            },
            "worker-5");

    worker.start();
    sleep(200);
    log("worker state = " + worker.getState() + "，main 不做任何 unpark");
    worker.join();
  }

  /** park(blocker) records why the thread is blocked, for diagnostic tools. */
  private static void parkWithBlocker() throws InterruptedException {
    title("[6] park(blocker): 把阻塞原因暴露给诊断工具");

    Thread worker =
        new Thread(
            () -> {
              log("park(blocker) 挂起");
              LockSupport.park(BLOCKER);
              log("被唤醒");
            },
            "worker-6");

    worker.start();
    sleep(300);
    Object blocker = LockSupport.getBlocker(worker);
    log("getBlocker(worker) = " + blocker + "，与传入的是同一个对象: " + (blocker == BLOCKER));
    log("jstack 里会显示: parking to wait for <" + BLOCKER + ">");
    log("unpark(worker)");
    LockSupport.unpark(worker);
    worker.join();
  }

  /** Runs a parking call and reports how long it actually blocked, in ms. */
  private static long measure(Runnable parking) {
    long start = System.nanoTime();
    parking.run();
    return TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - start);
  }

  private static void title(String text) {
    System.out.println();
    System.out.println(text);
  }

  private static void log(String message) {
    long millis = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - START_NANOS);
    System.out.printf("  [+%5dms] [%-8s] %s%n", millis, Thread.currentThread().getName(), message);
  }

  private static void sleep(long millis) {
    try {
      Thread.sleep(millis);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    }
  }
}
