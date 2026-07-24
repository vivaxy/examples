use std::fmt::Write as _;
use std::fs;
use std::hint::black_box;
use std::time::Instant;

const LENGTH: usize = 1_024_000;
const LOOP: usize = 200;

fn vec_add_scalar(a: &[f32], b: &[f32], out: &mut [f32]) {
    for i in 0..a.len() {
        // `black_box` prevents the compiler from auto-vectorizing this loop,
        // so the comparison reflects a genuinely scalar implementation.
        out[i] = black_box(a[i]) + black_box(b[i]);
    }
}

#[cfg(target_arch = "aarch64")]
fn vec_add_simd(a: &[f32], b: &[f32], out: &mut [f32]) {
    use std::arch::aarch64::*;

    let len = a.len();
    let mut i = 0;
    unsafe {
        while i + 4 <= len {
            let va = vld1q_f32(a.as_ptr().add(i));
            let vb = vld1q_f32(b.as_ptr().add(i));
            let vout = vaddq_f32(va, vb);
            vst1q_f32(out.as_mut_ptr().add(i), vout);
            i += 4;
        }
    }
    while i < len {
        out[i] = a[i] + b[i];
        i += 1;
    }
}

#[cfg(target_arch = "x86_64")]
fn vec_add_simd(a: &[f32], b: &[f32], out: &mut [f32]) {
    use std::arch::x86_64::*;

    let len = a.len();
    let mut i = 0;
    unsafe {
        while i + 4 <= len {
            let va = _mm_loadu_ps(a.as_ptr().add(i));
            let vb = _mm_loadu_ps(b.as_ptr().add(i));
            let vout = _mm_add_ps(va, vb);
            _mm_storeu_ps(out.as_mut_ptr().add(i), vout);
            i += 4;
        }
    }
    while i < len {
        out[i] = a[i] + b[i];
        i += 1;
    }
}

#[cfg(not(any(target_arch = "aarch64", target_arch = "x86_64")))]
fn vec_add_simd(a: &[f32], b: &[f32], out: &mut [f32]) {
    vec_add_scalar(a, b, out);
}

struct BenchResult {
    name: &'static str,
    total: std::time::Duration,
    avg_nanos: f64,
    sample: Vec<f32>,
}

fn bench(name: &'static str, f: fn(&[f32], &[f32], &mut [f32])) -> BenchResult {
    let a: Vec<f32> = (0..LENGTH).map(|i| i as f32).collect();
    let b: Vec<f32> = (0..LENGTH).map(|i| (i * 2) as f32).collect();
    let mut out = vec![0.0f32; LENGTH];

    // warm up
    for _ in 0..5 {
        f(&a, &b, &mut out);
    }

    let start = Instant::now();
    for _ in 0..LOOP {
        f(&a, &b, &mut out);
    }
    let total = start.elapsed();

    BenchResult {
        name,
        total,
        avg_nanos: total.as_nanos() as f64 / LOOP as f64,
        sample: out[0..4].to_vec(),
    }
}

fn render_html(results: &[BenchResult], arch: &str) -> String {
    let baseline = results
        .iter()
        .find(|r| r.name == "Scalar")
        .map(|r| r.avg_nanos)
        .unwrap_or(1.0);

    let mut rows = String::new();
    for r in results {
        let speedup = baseline / r.avg_nanos;
        write!(
            rows,
            r#"<tr>
        <td>{name}</td>
        <td>{avg_us:.3} µs</td>
        <td>{speedup:.2}x</td>
        <td>{sample:?}</td>
      </tr>
"#,
            name = r.name,
            avg_us = r.avg_nanos / 1000.0,
            speedup = speedup,
            sample = r.sample,
        )
        .unwrap();
    }

    format!(
        r#"<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
    />
    <meta name="description" content="SIMD vs Scalar" />
    <meta
      name="keywords"
      content="vivaxy,example,examples,github,demo,demos,playground,test,SIMD vs Scalar,benchmark,sample,samples,simd-vs-scalar,rust"
    />
    <meta name="author" content="vivaxy" />
    <link type="image/png" rel="shortcut icon" href="/vivaxy.icon.png" />
    <title>SIMD vs Scalar</title>
    <style>
      body {{
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        max-width: 720px;
        margin: 40px auto;
        padding: 0 16px;
        color: #222;
      }}
      table {{
        width: 100%;
        border-collapse: collapse;
        margin-top: 16px;
      }}
      th,
      td {{
        border: 1px solid #ddd;
        padding: 8px 12px;
        text-align: left;
      }}
      th {{
        background: #f5f5f5;
      }}
      code {{
        background: #f5f5f5;
        padding: 2px 4px;
        border-radius: 4px;
      }}
    </style>
  </head>
  <body>
    <h1>SIMD vs Scalar</h1>
    <p>
      Rust native benchmark comparing SIMD (<code>{arch}</code> intrinsics) vs
      scalar implementations of element-wise float32 vector addition.
    </p>
    <p>
      Vector length: <code>{length}</code>, Loop: <code>{loop_count}</code>
    </p>
    <table>
      <thead>
        <tr>
          <th>Implementation</th>
          <th>Avg time / run</th>
          <th>Speedup vs Scalar</th>
          <th>Sample result (first 4)</th>
        </tr>
      </thead>
      <tbody>
{rows}      </tbody>
    </table>
    <p>
      Run <code>cargo run --release</code> in this directory to regenerate
      this report on your own machine.
    </p>
    <script type="text/javascript" charset="utf-8" src="/cm.js"></script>
  </body>
</html>
"#,
        arch = arch,
        length = LENGTH,
        loop_count = LOOP,
        rows = rows,
    )
}

fn main() {
    let arch = if cfg!(target_arch = "aarch64") {
        "aarch64/neon"
    } else if cfg!(target_arch = "x86_64") {
        "x86_64/sse2"
    } else {
        "scalar fallback"
    };

    let results = vec![
        bench("Scalar", vec_add_scalar),
        bench("SIMD", vec_add_simd),
    ];

    for r in &results {
        println!(
            "{:<8} avg: {:>10.3} µs  total: {:?}  sample: {:?}",
            r.name,
            r.avg_nanos / 1000.0,
            r.total,
            r.sample
        );
    }

    let html = render_html(&results, arch);
    fs::write("index.html", html).expect("failed to write index.html");
    println!("report written to index.html");
}
