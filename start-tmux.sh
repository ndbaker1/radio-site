#!/bin/sh
tmux new-session -d 'sudo node server.js'
tmux split-window -h 'sudo ngrok http 8000'
