use jni::objects::{JClass, JString};
use jni::sys::jstring;
use jni::JNIEnv;
use std::slice;
use std::str;

#[unsafe(no_mangle)]
pub extern "C" fn rust_read_string(
    env: JNIEnv,
    data: *const u8,
    len: u32,
) -> jstring {
    if data.is_null() {
        return std::ptr::null_mut();
    }

    let bytes = unsafe { slice::from_raw_parts(data, len as usize) };

    let s = match str::from_utf8(bytes) {
        Ok(v) => {
            let mut string = v.to_string();
            string.push_str(" from Rust");
            string
        },
        Err(_) => return std::ptr::null_mut(),
    };

    // 创建新的 Java String 返回
    env.new_string(s)
        .expect("Failed to create Java string")
        .into_raw()
}
