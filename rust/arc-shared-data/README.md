# Arc Shared Data

Demonstrates sharing a large **nested composite object** across N compute
threads with `Arc`, instead of deep-cloning the whole tree per thread — and
how to let threads **mutate inner state** through a fine-grained `RwLock`.

The object tree is `Dataset` → `Vec<Region>` → `{ String name, Vec<f64> cells }`
(~76 MiB of `f64` cells plus per-region `String`s):

- **Cloning per thread** deep-copies the tree: every `Vec<Region>`, `String`,
  and `Vec<f64>` is duplicated, peaking at roughly `(threads + 1) ×` the
  dataset size.
- **Sharing via `Arc`** puts one `Arc` at the root. `Arc::clone` only bumps a
  refcount — O(1) no matter how deep or large the tree is — so every thread
  reads the same nested structure, peaking at 1× the dataset size.

## Cross-thread mutation

`Arc<T>` only gives shared *reads*; you can't get `&mut` through it. The
pattern here keeps the two concerns separate:

```rust
struct Shared {
  dataset: Dataset,             // heavy nested tree, immutable
  sums: RwLock<Vec<f64>>,       // small write-back target, mutable
}
```

The heavy read-mostly tree stays immutable, and interior mutability lives only
on the small field threads actually write. Each worker thread sums the nested
`dataset` read-only, then writes its result into its own slot of `sums`
through `shared.sums.write()`.

Wrapping the whole thing in `Arc<RwLock<Dataset>>` also "works", but every
reader would then serialize on the lock — with a read-heavy workload you'd
give up the parallelism that made sharing worthwhile.

A counting global allocator tracks peak memory usage, and each scenario is
timed over multiple rounds.

# Run

```bash
cargo run --release
```

# Results

12 threads (Apple Silicon, 12 cores) summing a 76.3 MiB nested dataset
(12 regions × 833,333 `f64` cells), 5 rounds per scenario:

```
clone per thread:
  peak memory: 991.8 MiB
  average: copy 95.8 ms | compute 28.8 ms | total 124.6 ms

Arc share + RwLock write-back:
  peak memory: 76.3 MiB
  average: compute 13.6 ms
```

- **Arc share is ~9× faster end to end**, and peaks at 1× the dataset size
  instead of 13×.
- The clone scenario's first round is much slower (copy ~279 ms vs ~45 ms
  warm): the first round actually maps 12 × 76 MiB of fresh pages, while later
  rounds reuse allocator blocks freed by the previous round.
- Even the compute-only phase is faster with `Arc`: 12 threads scanning the
  same 76 MiB tree share L3 cache and consume one dataset's worth of memory
  bandwidth, while 12 cloned copies (~900 MiB live) thrash cache and bandwidth
  simultaneously.

Sharing a memory object doesn't just save the copy time — the computation
itself gets faster.
