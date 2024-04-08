#!/bin/bash

echo -e "\nFixed Base Configurator Installer\n"

user="$(whoami)"
systemd_dir="$HOME/.config/systemd/user"
app_dir="$HOME/rtkbase"
service="rtkbase.service"
template_path="$app_dir/$service.template"
service_path="$systemd_dir/$service"
release_url="https://github.com/yuri-rage/ublox-fixed-base-configurator/releases/download/v0.1.0-pre-release/release.tar.gz"


if [ $EUID == 0 ]; then
    echo "Please do not run this script as root; don't sudo it!"
    exit 1
fi

if ! sudo -v; then
    echo "User $user does not have sudo privileges, exiting."
    exit 1
fi

echo -e "Updating system...\n"

sudo apt update && sudo apt upgrade -y

echo -e  "\nInstalling Node.js...\n"

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - &&\
sudo apt install -y nodejs

echo -e "\nDownloading from GitHub...\n"

curl -fsSL "$release_url" | tar -xzv -C "$HOME"
mv "$HOME/release" "$app_dir"

echo -e "\nInstalling Node.js dependencies...\n"

cd "$app_dir"
npm i better-port

if [ ! -d "$systemd_dir" ]; then
    echo -e "\nCreating user systemd directory: $systemd_dir"
    mkdir -p "$systemd_dir"
fi

echo -e "\nConfiguring systemd service file."
sed "s/{{USERNAME}}/$USER/g" "$template_path" > "$service_path"

echo -e "\nEnabling and starting $service"
systemctl --user daemon-reload
systemctl --user enable "$service"
systemctl --user start "$service"
# sudo loginctl enable-linger "$user" # uncomment if users report issues with the service not starting on boot

echo -e "\nInstallation complete!\n"

echo -e "Access the web app at http://$ip_address:8080\n"
