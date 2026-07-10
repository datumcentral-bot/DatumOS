#!/bin/bash
# Tunnel script for exposing local development server

PORT=${1:-3000}
NAME=${2:-datumos-dev}

echo "Starting tunnel for port $PORT with name $NAME"

# Using ngrok as example (install via: npm install -g ngrok)
# ngrok http $PORT --authtoken YOUR_TOKEN

# Or using localtunnel
# npm install -g localtunnel
# lt --port $PORT --subdomain $NAME

echo "Configure your tunneling service and update this script"
