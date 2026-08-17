# Arc Shared Data

Demonstrates sharing one large in-memory dataset across N compute threads with
`Arc<Vec<f64>>`, instead of cloning the data per thread.

A counting global allocator tracks peak memory usage, and each scenario is
timed over multiple rounds, so you can see that:

- Cloning per thread peaks at roughly `(threads + 1) ×` the dataset size.
- Sharing via `Arc` peaks at the dataset size — every thread reads the same
  buffer through a refcount bump, with no data copied.

# Run

```bash
cargo run --release
```

# Results

12 threads (Apple Silicon, 12 cores) summing a 76.3 MiB `Vec<f64>` dataset,
5 rounds per scenario:

```
clone per thread:
  peak memory: 991.8 MiB
  average: copy 80.0 ms | compute 32.6 ms | total 112.6 ms

Arc share:
  peak memory: 76.3 MiB
  average: compute 15.6 ms
```

- **Arc share is ~7× faster end to end**, and peaks at 1× the dataset size
  instead of 13×.
- The clone scenario's first round is much slower (copy ~293 ms vs ~20 ms
  warm): the first round actually maps 12 × 76 MiB of fresh pages, while later
  rounds reuse allocator blocks freed by the previous round.
- Even the compute-only phase is faster with `Arc`: 12 threads scanning the
  same 76 MiB buffer share L3 cache and consume one dataset's worth of memory
  bandwidth, while 12 cloned copies (~900 MiB live) thrash cache and bandwidth
  simultaneously.

Sharing a memory object doesn't just save the copy time — the computation
itself gets faster.
