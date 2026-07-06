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

## gc-overhead.js — GC overhead chart across heap sizes

```bash
node gc-overhead.js   # sweeps 64/128/256/512/1024/2048/4096/8192/16384 MB, writes index.html
open index.html
```

Spawns one worker process per heap size (64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384 MB), runs a
5 000-iteration circular-cache workload in each, and writes four Chart.js
charts to `index.html`:

| Chart | What to look for |
|-------|-----------------|
| **1. GC share (%)** | At 64 MB, MajorGC alone consumes ~55 % of elapsed time. The fraction drops steeply through 512 MB and plateaus near zero beyond 1–2 GB, where MinorGC dominates and MajorGC barely fires. |
| **2. GC total time (ms)** | MajorGC total collapses as the heap grows (high at 64 MB, near zero at ≥ 1 GB). MinorGC total rises in the opposite direction: with a large heap the young generation fills up without MajorGC intervening, forcing more minor scavenges. |
| **3. GC event count** | MajorGC fires dozens of times at 64 MB and approaches zero at ≥ 1 GB; IncrementalGC at 128+ MB tracks MajorGC 1:1. At 64 MB many major GCs are triggered by allocation failure rather than the incremental scheduler, so IncrementalGC count is lower. MinorGC count increases steadily with heap size. |
| **4. Avg time per event (ms/event)** | Counter-intuitively, each individual MajorGC event *takes longer* as the heap grows (a few ms at 64 MB, tens of ms at multi-GB sizes). With a large heap V8 commits more address space and has more internal metadata to process per cycle. The net overhead is still lower because events are far less frequent — the cost is in frequency, not per-event duration alone. |

A 200-entry circular cache keeps ~20 MB of objects alive in old generation.
With a small heap the working set occupies a large fraction of available space,
so V8 runs Major GC (MarkCompact via incremental marking) aggressively. With a
large heap the same 20 MB is negligible — Major GC barely fires.

Modern V8 routes all Major GC through the incremental marking pipeline, so the
stop-the-world MarkCompact phase shows up as `MajorGC` (kind=4), not
`ConstructRetained` (kind=2). Each MajorGC is paired with a corresponding
`IncrementalGC` event (kind=8) for the preceding marking phase.

### GC kinds

| Kind | Name                  | What it is |
|-----:|-----------------------|------------|
|    1 | `MinorGC`             | Scavenger on the young generation (new space). Fast; promotes survivors to old generation. |
|    2 | `ConstructRetained`   | Stop-the-world MarkCompact **without** incremental marking. Rare in normal runs; appears when GC is forced (e.g. `global.gc()` with `--expose-gc`). |
|    4 | `MajorGC`             | Full old-generation collection (MarkCompact) **with** incremental marking. This is the dominant cost under heap pressure. |
|    8 | `IncrementalGC`       | One incremental marking step. V8 slices marking work across many small pauses between JS execution turns. |
|   16 | `WeakCB`              | Processing weak references and their finalizer callbacks after a GC cycle. |
|   32 | `AllExternalMemory`   | GC triggered to account for externally allocated memory (e.g. large `Buffer` / `ArrayBuffer` backing stores) that exceeded a threshold. |
|   64 | `ScheduleIdle`        | Idle-time GC — V8 schedules a collection when the event loop has spare time, to amortise future pressure. |

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
