# max-old-space-size

Demonstrates how `--max-old-space-size=<MB>` sets the V8 old generation heap
limit. Three scripts cover OOM behavior, GC overhead under heap pressure, and
the contrast with native C++ memory allocations.

## oom.js — fill old-gen heap until OOM

```bash
node --max-old-space-size=256 oom.js
node --max-old-space-size=128 oom.js   # OOM occurs sooner
node oom.js                            # default limit (~1.5 GB on 64-bit)
```

Each iteration allocates a plain JS array kept alive in `chunks[]`. The process
exits with `FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap
out of memory` once V8 cannot reclaim enough space.

## gc-overhead.js — GC overhead under heap pressure

```bash
node --max-old-space-size=64  gc-overhead.js
node --max-old-space-size=512 gc-overhead.js
```

A 200-entry circular cache keeps ~20 MB of objects alive in old generation. With
a small heap that 20 MB occupies a large fraction of the limit, so V8 runs
incremental marking aggressively to stay ahead of old-space pressure. With a
large heap the same 20 MB is negligible — incremental marking barely runs.

The key signal is the `Incremental` row in the GC breakdown: expect ~10–20× more
incremental marking events and time at 64 MB versus 512 MB.

## native-memory.js — Buffer.alloc bypasses the heap limit

```bash
node --max-old-space-size=128 native-memory.js
```

Allocates 600 MB via `Buffer.alloc` — far above the 128 MB heap limit. Because
`Buffer.alloc` (and `Uint8Array`) back their data with native C++ memory, `heapUsed`
stays low and no OOM occurs. RSS grows instead.

## How it works

- `--max-old-space-size=N` caps the V8 old generation at N MB.
  `v8.getHeapStatistics().heap_size_limit` reflects this value.
- Plain JS arrays (`new Array(...).fill(...)`) live in the V8 JavaScript heap
  and count against this limit.
- `Buffer.alloc` / `Uint8Array` back their data with native C++ memory (outside
  the V8 heap) and do **not** count against `heap_size_limit`.
- When V8 exhausts the old generation after a full GC, Node.js aborts with:
  `FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory`

## Default limit

The default old-generation size varies by Node.js version and system. On 64-bit
Node.js 20+ it is approximately 1.5 GB.
