#!/usr/bin/bash
CRESET="\e[0m"
RED="\e[1;31m"
CYAN="\e[1;36m"

if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run with SUDO!${CRESET}"
    exit
fi
BANNER="
===================================================================
                  ______           __         _ __  
                 / ____/___  _____/ /______  (_) /_ 
                / /   / __ \/ ___/ //_/ __ \/ / __/ 
    v1.0.0     / /___/ /_/ / /__/ ,< / /_/ / / /_     by @t0nyc23
               \____/\____/\___/_/|_/ .___/_/\__/   
                                   /_/              
  ______           __      __  ___                                 
 /_  __/___ ______/ /__   /  |/  /___ _____  ____ _____ ____  _____
  / / / __ \`/ ___/ //_/  / /|_/ / __ \`/ __ \/ __ \`/ __ \`/ _ \/ ___/
 / / / /_/ (__  ) ,<    / /  / / /_/ / / / / /_/ / /_/ /  __/ /    
/_/  \__,_/____/_/|_|  /_/  /_/\__,_/_/ /_/\__,_/\__, /\___/_/     
                                                /____/             
===================================================================
~~~~~~~~~ A simple TO-DO/task manager plugin for Cockpit. ~~~~~~~~~
===================================================================
"
echo -e "$CYAN$BANNER$CRESET"

if ! dpkg -s python3-venv >/dev/null 2>&1; then
    echo -e "${CYAN}[+] Installing dependency 'python3-venv'.${CRESET}"
    echo -e "${CYAN}[+] Writing log to /tmp/cockpit-task-manager-installer.log ${CRESET}"
    apt-get update &>>/tmp/cockpit-task-manager-installer.log
    apt-get install -y python3-venv &>>/tmp/cockpit-task-manager-installer.log
fi


INSTALL_DIR=/usr/share/cockpit/cockpit-task-manager
mkdir -p $INSTALL_DIR

echo -e "${CYAN}[+] Cloning to $INSTALL_DIR${CRESET}"
git clone --quiet https://github.com/t0nyc23/cockpit-task-manager $INSTALL_DIR
cd $INSTALL_DIR


echo -e "${CYAN}[+] Creating Virtual Environment and Installing Python Requirements${CRESET}"
python3 -m venv venv
venv/bin/pip3 install -q -r requirements.txt


SERVICE_FILE_NAME="cockpit-task-manager.service"
SERVICE_FILE="[Unit]
Description=Start Task Manager Plugin Service for Cockpit
After=network.target

[Service]
User=root
WorkingDirectory=$INSTALL_DIR
ExecStart=$INSTALL_DIR/venv/bin/python $INSTALL_DIR/manager.py
Restart=always

[Install]
WantedBy=multi-user.target"

echo -e "${CYAN}[+] Creating SystemD Service for Task Manager Flask API${CRESET}"
echo "$SERVICE_FILE" | sudo tee /etc/systemd/system/$SERVICE_FILE_NAME &>>/tmp/cockpit-task-manager-installer.log
echo -e "${CYAN}[+] Reloading Daemon${CRESET}"
systemctl daemon-reload
echo -e "${CYAN}[+] Enabling/Starting Task Manager Service${CRESET}"
systemctl enable $SERVICE_FILE_NAME
systemctl start $SERVICE_FILE_NAME

echo -e "${CYAN}[+] Finished.${CRESET}"
echo