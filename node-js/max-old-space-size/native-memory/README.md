# native-memory

Demonstrates that `Buffer.alloc` (and `Uint8Array`) back their data with native
C++ memory, which does **not** count against `--max-old-space-size`.

```bash
node --max-old-space-size=128 native-memory.js
```

Allocates 600 MB via `Buffer.alloc` — far above the 128 MB heap limit. Because the
data lives outside the V8 heap, `heapUsed` stays low and no OOM occurs. RSS grows
instead.
