#!/usr/bin/env bash
cd /workspace/datumos_v17
while true; do
  cloudflared tunnel --url http://localhost:3000 \
    --protocol http2 --no-autoupdate --edge-ip-version 4 \
    --retries 10 --grace-period 30s > /workspace/datumos_v17/tunnel.log 2>&1
  echo "[$(date -u)] cloudflared exited, restarting in 3s..." >> /workspace/datumos_v17/tunnel_restart.log
  sleep 3
done
