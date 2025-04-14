#!/bin/bash
echo "Starting the application with debugging information..."
echo "Checking for running processes..."
npx kill-port 3000 3001 3002
echo "Ports cleared. Starting application..."
PORT=3002 npm start
