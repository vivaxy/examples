# pm2-overcommit

Tests whether N PM2 cluster workers — each with `--max-old-space-size` set so
their combined limit exceeds system RAM — run normally and whether memory
auto-recycles to the system ceiling.

## Background

- `--max-old-space-size` is a **per-process** V8 heap limit (see `oom/`,
  `native-memory/`, `first-gc/`).
- V8 GC is per-process and bounded by that limit — no awareness of other
  processes or total system RAM.
- PM2 cluster `instances: N` multiplies the limit N× (one heap per worker).
- This test sets each worker's V8 limit **2× its target** so no single worker
  hits V8 OOM. The overcommit comes from **combined** usage exceeding system
  RAM, not from any worker reaching its own limit.

## Run

> **Warning:** can freeze the machine. Save your work first. The script
> auto-stops after `DURATION` (default 60 s) and caps restarts at 10, but the
> system may become unresponsive during the run.

```bash
npm install && npm start
# or: npm i -g pm2 && ./run.sh
```

Second terminal:

```bash
pm2 logs pm2-overcommit
```

Environment variables (all optional — defaults auto-overcommit 2× RAM):

| Variable | Default | Description |
| --- | --- | --- |
| `PM2_INSTANCES` | `4` | Number of cluster workers |
| `OVERCOMMIT` | `2` | Total target as multiple of system RAM |
| `TARGET_MB` | `RAM × OVERCOMMIT / instances` | Per-worker heap target (grow then hold) |
| `MAX_OLD_SPACE_SIZE` | `TARGET_MB × 2` | Per-worker V8 heap limit (2× target headroom) |
| `CHUNK_MB` | `RAM / (instances × 60)`, min 20 | Allocation chunk size (MB) |
| `CHURN` | `0` | Dead chunks per cycle (GC pressure; >0 may cause heap climb) |
| `CYCLE_MS` | `500` | Allocation interval (ms) |
| `DURATION` | `60` | Run duration before auto-stop (s) |

## Standalone (no PM2)

```bash
node --max-old-space-size=256 app.js
```

`TARGET_MB` defaults to 0 (unlimited) → heap grows until V8 OOM. This
demonstrates the per-process limit in isolation.

With a target:

```bash
TARGET_MB=200 node --max-old-space-size=512 app.js
```

Grows to 200 MB, then holds — no V8 OOM.

## What to observe

- `pm2 ls` — per-worker `memory` (RSS) stays low; `restart` stays 0 (no V8
  OOM, no OS kills).
- `pm2 logs` — `GROW` phase: `heapUsed` climbs to target. `HOLD` phase:
  `heapUsed` stable, `chunks` constant. RSS ≪ heapUsed (macOS memory
  compression).
- System — swap may grow slightly; machine stays responsive (macOS compresses
  inactive heap pages instead of killing processes).

## Findings (macOS, 18 GB RAM, 4 × 9216 MB target, 120 s)

1. **Does it run abnormally?** No. All 4 workers stayed online (↺=0) for 120
   s. No V8 OOM (each worker's heapUsed stable at ~9282 MB / 18480 MB limit =
   50%). No OS kills (RSS stayed 52 MB–3.7 GB per worker). macOS memory
   compression absorbed the overcommit: V8 reported 37 GB total heap (201% of
   RAM), but actual RSS was as low as ~200 MB total — macOS compressed nearly
   all inactive heap pages.
2. **Does memory auto-recycle to the system limit?** No. V8 GC reclaims dead
   objects **within each process**, bounded by that process's
   `--max-old-space-size` — not by system RAM. No cross-process or
   system-aware coordination exists. macOS compression keeps RSS under system
   RAM by compressing inactive pages, but this is OS-level paging, not
   "recycling" — V8 heap is not reclaimed or bounded to the system ceiling.

## Findings (Linux, 32 GB RAM, 4 × 16384 MB target)

1. **Does it run abnormally?** Yes — the system froze. All 4 workers grew
   linearly (~272 MB/s each, ~1088 MB/s total). At ~30 s, combined RSS
   reached ~31 GB (4 × 7.8 GB), exhausting the 32 GB physical RAM. The
   system became completely unresponsive; SSH unreachable; required reboot.
   No V8 OOM (workers at ~7.9 GB / 32.8 GB limit = 24%). No OOM-killer
   log — the system froze before the killer could run (dmesg empty after
   reboot).
2. **Does memory auto-recycle to the system limit?** No. On Linux, V8 heap
   pages allocated via `.fill(0)` are fully resident (RSS ≈ heapUsed). There
   is no memory compression to absorb overcommit (unlike macOS). The 4
   workers' combined RSS directly consumed physical RAM with no mitigation,
   freezing the machine in ~30 s.

### macOS vs Linux comparison

| | macOS (18 GB RAM) | Linux (32 GB RAM) |
| --- | --- | --- |
| Target | 4 × 9216 MB (200%) | 4 × 16384 MB (200%) |
| V8 heapUsed/worker | ~9282 MB | ~7893 MB |
| RSS/worker | **52 MB** (99.4% compressed) | **7815 MB** (0% compressed) |
| Memory compression | ✅ Compresses inactive heap pages | ❌ None |
| OOM | No OOM, no kills, 120 s stable | System freeze at ~30 s, reboot required |
| V8 GC reclaims | Per-process dead objects only | Same — but RSS = heapUsed, so no slack |

The key difference is **memory compression**. macOS compresses inactive V8
heap pages (9.2 GB heap → 52 MB RSS), keeping physical memory under system
RAM. Linux has no compression; every `.fill(0)` page is resident, so 4
workers × 7.9 GB = 31.6 GB directly exhausts the 32 GB RAM.

Set `instances × max-old-space-size < system RAM` (leave headroom); or PM2
`max_memory_restart` (per-process RSS, still not system-aware); or cgroups /
container memory limit (the real system-level bound).
