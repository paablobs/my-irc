#!/bin/bash

# Start the IRC server, WebSocket gateway, and client

echo "Starting IRC Server..."
cd /home/pablo/my-irc && npm run dev &
IRC_PID=$!

sleep 2

echo "Starting WebSocket Gateway..."
cd /home/pablo/my-irc/gateway && npm run dev &
GW_PID=$!

sleep 2

echo "Starting Client..."
cd /home/pablo/my-irc/client && npm run dev &
CLIENT_PID=$!

echo ""
echo "=========================================="
echo "IRC Server running on port 6667"
echo "WebSocket Gateway running on port 8080"
echo "Client running on http://localhost:5173"
echo "=========================================="
echo ""
echo "Press Ctrl+C to stop all services"

trap "kill $IRC_PID $GW_PID $CLIENT_PID 2>/dev/null; exit" INT TERM

wait
