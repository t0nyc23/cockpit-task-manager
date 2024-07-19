#!/usr/bin/bash
CRESET="\e[0m"
RED="\e[1;31m"
CYAN="\e[1;36m"
INSTALL_DIR="$HOME/.local/share/cockpit/cockpit-task-manager"

mkdir -p $INSTALL_DIR

echo -e "${CYAN}[+] Cloning to $INSTALL_DIR${CRESET}"
git clone https://github.com/t0nyc23/cockpit-task-manager $INSTALL_DIR
cd $INSTALL_DIR


echo -e "${CYAN}[+] Creating Virtual Environment and Installing Python Requirements${CRESET}"
python3 -m venv venv
venv/bin/pip3 install -r requirements.txt


SERVICE_FILE_NAME="cockpit-task-manager.service"
SERVICE_FILE="[Unit]
Description=Start Task Manager Plugin Service for Cockpit
After=network.target

[Service]
User=$USER
WorkingDirectory=$INSTALL_DIR
ExecStart=$INSTALL_DIR/venv/bin/python manager.py
Restart=always

[Install]
WantedBy=multi-user.target"

echo -e "${CYAN}[+] Creating SystemD Service for Task Manager Flask API${CRESET}"
echo "$SERVICE_FILE" | sudo tee /etc/systemd/system/$SERVICE_FILE_NAME
echo -e "${CYAN}[+] Reloading Daemon${CRESET}"
sudo systemctl daemon-reload
echo -e "${CYAN}[+] Enabling/Starting Task Manager Service${CRESET}"
sudo systemctl enable $SERVICE_FILE_NAME
sudo systemctl start $SERVICE_FILE_NAME
