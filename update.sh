#!/bin/bash
set -e

reset

NC='\033[0m'
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'

if [ "$(id -u)" != "0" ]; then
  echo -e "${CYAN}[Bastion]: ${GREEN}[ERROR] Bastion BOT Installer requires root permissions.${NC}"
  hash sudo &>/dev/null || (echo -e "${CYAN}[Bastion]: ${NC} Run this installer with root permissions.\n" && exit 1)
  sudo ./update.sh
  exit 1
fi

echo -e "${CYAN}[Bastion]:${NC} Updating Bastion BOT..."
git pull origin master 1>/dev/null || (echo -e "${CYAN}[Bastion]: ${RED} Unable to update the bot.\n" && exit 1)
echo -e "${CYAN}[Bastion]:${NC} Done."
echo

echo -e "${CYAN}[Bastion]:${NC} Updating dependencies... This may take a while, please be patient."
npm install --production 1>/dev/null 2>update.log || (echo -e "${CYAN}[Bastion]: ${RED} Failed installing dependencies. Please see update.log file and report it, if it's really an issue.\n" && exit 1)
npm install -g ffmpeg-binaries 1>/dev/null 2>update.log || (echo -e "${CYAN}[Bastion]: ${RED} Failed updating ffmpeg. Please see update.log file and report it, if it's really an issue.\n" && exit 1)
echo -e "${CYAN}[Bastion]:${NC} Done."
echo -e "${CYAN}[Bastion]:${NC} Deleting unused dependencies..."
npm prune 1>/dev/null 2>update.log
echo -e "${CYAN}[Bastion]:${NC} Done."
echo -e "${CYAN}[Bastion]:${NC} Ready to boot up and start running."
echo
