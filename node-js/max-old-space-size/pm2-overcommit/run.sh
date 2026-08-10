#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# 1. Detect OS + total RAM
case "$(uname -s)" in
  Darwin) TOTAL_MB=$(( $(sysctl -n hw.memsize) / 1024 / 1024 )) ;;
  Linux) TOTAL_MB=$(awk '/MemTotal/{printf "%d", $2/1024}' /proc/meminfo) ;;
  *) echo "Unsupported OS: $(uname -s)"; exit 1 ;;
esac

# 2. Compute overcommit (default 2x RAM)
INSTANCES="${PM2_INSTANCES:-4}"
PM2_INSTANCES="$INSTANCES"
OVERCOMMIT="${OVERCOMMIT:-2}"
# Per-worker target: each worker grows to this, then holds (no V8 OOM)
TARGET_MB="${TARGET_MB:-$(( TOTAL_MB * OVERCOMMIT / INSTANCES ))}"
# V8 heap limit: 2x target so no single worker hits V8 OOM (V8 overhead ~40%)
MAX_OLD_SPACE_SIZE="${MAX_OLD_SPACE_SIZE:-$(( TARGET_MB * 2 ))}"
PER="$MAX_OLD_SPACE_SIZE"
CHUNK_MB="${CHUNK_MB:-$(( TOTAL_MB / (INSTANCES * 60) ))}"
if [ "$CHUNK_MB" -lt 20 ]; then CHUNK_MB=20; fi
CHURN="${CHURN:-0}"
CYCLE_MS="${CYCLE_MS:-500}"
PORT="${PORT:-3000}"
DURATION="${DURATION:-60}"

TARGET_PRODUCT=$(( INSTANCES * TARGET_MB ))
tpct=$(( TARGET_PRODUCT * 100 / TOTAL_MB ))
LIMIT_PRODUCT=$(( INSTANCES * PER ))
lpct=$(( LIMIT_PRODUCT * 100 / TOTAL_MB ))

export PM2_INSTANCES MAX_OLD_SPACE_SIZE TARGET_MB CHUNK_MB CHURN CYCLE_MS PORT

echo "System RAM: ${TOTAL_MB} MB"
echo "Target: ${INSTANCES} x ${TARGET_MB} MB = ${TARGET_PRODUCT} MB (${tpct}% of RAM) -- workers grow to target, then hold (no V8 OOM)"
echo "V8 limit: ${PER} MB/worker (2x target headroom) | limit total ${LIMIT_PRODUCT} MB (${lpct}% of RAM)"

# 3. Safety countdown
echo "Starting in 5s -- Ctrl-C to abort (can freeze the machine)..."
sleep 5

# 5. Trap -- no orphaned workers
trap 'pm2 delete pm2-overcommit 2>/dev/null || true' INT TERM EXIT

# 4. Start
pm2 delete pm2-overcommit 2>/dev/null || true
pm2 start ecosystem.config.cjs
echo "curl http://127.0.0.1:${PORT}/stats"

# 6. Monitor loop for DURATION seconds
end=$(( SECONDS + DURATION ))
while [ "$SECONDS" -lt "$end" ]; do
  echo "--- $(date '+%H:%M:%S') ---"
  case "$(uname -s)" in
    Darwin) sysctl -n vm.swapusage ;;
    Linux) free -m | awk '/Mem:/{printf "mem: %d used / %d total, %d avail MB\n",$3,$2,$7}' ;;
  esac
  pm2 ls
  sleep 3
done

# 7. Done -- EXIT trap deletes the app
echo "Done. During run: pm2 logs pm2-overcommit (2nd terminal)."
