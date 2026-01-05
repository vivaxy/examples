#include <jni.h>
#include <stdint.h>
#include <string.h>

JNIEXPORT jstring JNICALL
Java_NativeBridge_readBuffer(JNIEnv* env, jclass cls, jobject buffer) {
    // 取得 native 地址
    uint8_t* ptr = (*env)->GetDirectBufferAddress(env, buffer);
    if (!ptr) {
        return NULL;
    }

    // 读取长度（小端）
    uint32_t len =
        (uint32_t)ptr[0] |
        ((uint32_t)ptr[1] << 8) |
        ((uint32_t)ptr[2] << 16) |
        ((uint32_t)ptr[3] << 24);

    const char* str_data = (const char*)(ptr + 4);

    // 调用 Rust 解析字符串
    extern jstring rust_read_string(
        JNIEnv*,
        const char*,
        uint32_t
    );

    return rust_read_string(env, str_data, len);
}
