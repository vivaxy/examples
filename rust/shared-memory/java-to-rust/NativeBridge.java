import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.StandardCharsets;

public class NativeBridge {

    static {
        System.loadLibrary("demo"); // libdemo.so / .dylib / .dll
    }

    // JNI 方法：把 buffer 交给 Rust 读，返回 String
    public static native String readBuffer(ByteBuffer buffer);

    public static void main(String[] args) {
        String original = "Hello from Java → Rust 🦀";

        byte[] data = original.getBytes(StandardCharsets.UTF_8);

        // Java 分配 DirectByteBuffer
        ByteBuffer buffer = ByteBuffer
                .allocateDirect(4 + data.length)
                .order(ByteOrder.LITTLE_ENDIAN);

        buffer.putInt(data.length);
        buffer.put(data);
        buffer.flip();

        // 调用 Rust 读取
        String result = readBuffer(buffer);

        System.out.println("Original: " + original);
        System.out.println("Rust read: " + result);
    }
}
