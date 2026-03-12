import com.google.gson.Gson;
import com.google.gson.JsonElement;

import java.util.Random;

/**
 * Gson JSON parsing benchmark.
 *
 * <p>Tests how JSON data size (in bytes) affects Gson parsing performance. Generates JSON strings
 * of various sizes (1KB to 10MB) and measures average parsing time over multiple iterations.
 *
 * <p>Build and run:
 *
 * <pre>
 *   mvn package -q
 *   java -jar target/gson-benchmark-1.0.0-jar-with-dependencies.jar
 * </pre>
 */
public class GsonBenchmark {

  private static final Gson GSON = new Gson();
  private static final Random RANDOM = new Random(42);

  // Characters used for generating random string values in JSON
  private static final String CHARS =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  /** Target sizes to benchmark (in bytes). */
  private static final int[] TARGET_SIZES = {
    1_024,        //  1 KB
    10_240,       // 10 KB
    102_400,      // 100 KB
    512_000,      // 500 KB
    1_048_576,    //  1 MB
    5_242_880,    //  5 MB
    10_485_760,   // 10 MB
  };

  private static final int WARMUP_ITERATIONS = 10;
  private static final int MEASURE_ITERATIONS = 50;

  public static void main(String[] args) {
    System.out.println("Gson JSON Parsing Benchmark");
    System.out.println("Factor: JSON data size (bytes)");
    System.out.println("Warmup iterations : " + WARMUP_ITERATIONS);
    System.out.println("Measure iterations: " + MEASURE_ITERATIONS);
    System.out.println();
    System.out.printf("%-15s %-15s %-15s %-15s%n", "Size", "Actual bytes", "Avg time (ms)", "MB/s");
    System.out.println("--------------------------------------------------------------");

    for (int targetSize : TARGET_SIZES) {
      String json = buildJson(targetSize);
      int actualBytes = json.getBytes(java.nio.charset.StandardCharsets.UTF_8).length;

      // Warmup: let JIT compile the hot path before measuring
      for (int i = 0; i < WARMUP_ITERATIONS; i++) {
        GSON.fromJson(json, JsonElement.class);
      }

      // Measure
      long totalNs = 0;
      for (int i = 0; i < MEASURE_ITERATIONS; i++) {
        long start = System.nanoTime();
        GSON.fromJson(json, JsonElement.class);
        totalNs += System.nanoTime() - start;
      }

      double avgMs = totalNs / 1_000_000.0 / MEASURE_ITERATIONS;
      double mbPerSec = (actualBytes / 1024.0 / 1024.0) / (avgMs / 1000.0);

      System.out.printf(
          "%-15s %-15d %-15.3f %-15.2f%n",
          formatSize(targetSize),
          actualBytes,
          avgMs,
          mbPerSec);
    }
  }

  /**
   * Builds a JSON array of objects whose total UTF-8 byte size is approximately {@code
   * targetSizeBytes}.
   *
   * <p>Each element is an object like: {@code {"id":42,"name":"abcde","value":3.14,"active":true}}
   * The number of elements is calculated so that the resulting JSON string is close to the target
   * size.
   */
  private static String buildJson(int targetSizeBytes) {
    // Estimate the size of one element (key names + typical value sizes)
    // {"id":XXXXX,"name":"XXXXXXXXXX","value":X.XXXXXX,"active":true}
    // Approximate element size: ~70 bytes
    int estimatedElementSize = 70;
    int elementCount = Math.max(1, targetSizeBytes / estimatedElementSize);

    StringBuilder sb = new StringBuilder(targetSizeBytes + 64);
    sb.append('[');
    for (int i = 0; i < elementCount; i++) {
      if (i > 0) sb.append(',');
      sb.append('{');
      sb.append("\"id\":").append(i).append(',');
      sb.append("\"name\":\"").append(randomString(10)).append("\",");
      sb.append("\"value\":").append(RANDOM.nextDouble() * 1000).append(',');
      sb.append("\"active\":").append(RANDOM.nextBoolean());
      sb.append('}');
    }
    sb.append(']');
    return sb.toString();
  }

  /** Generates a random alphanumeric string of the given length. */
  private static String randomString(int length) {
    char[] chars = new char[length];
    for (int i = 0; i < length; i++) {
      chars[i] = CHARS.charAt(RANDOM.nextInt(CHARS.length()));
    }
    return new String(chars);
  }

  /** Formats a byte count as a human-readable size string (e.g. "1 KB", "10 MB"). */
  private static String formatSize(int bytes) {
    if (bytes >= 1_048_576) {
      return (bytes / 1_048_576) + " MB";
    } else if (bytes >= 1_024) {
      return (bytes / 1_024) + " KB";
    } else {
      return bytes + " B";
    }
  }
}
