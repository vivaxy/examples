# oom

Fills the V8 old-generation heap with plain JS arrays until Node.js aborts.

```bash
node --max-old-space-size=256 oom.js
node --max-old-space-size=128 oom.js   # OOM occurs sooner
node oom.js                            # default limit (~1.5 GB on 64-bit)
```

Each iteration allocates a plain JS array kept alive in `chunks[]`. The process
exits with `FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap
out of memory` once V8 cannot reclaim enough space.
