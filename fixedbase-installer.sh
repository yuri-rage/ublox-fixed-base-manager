#!/bin/bash

echo -e "\n *** Fixed Base Installer ***\n"

user="$(whoami)"
systemd_dir="$HOME/.config/systemd/user"
app_dir="$HOME/fixedbase"
app_conf_file="config/default.json"
service="fixedbase.service"
template_path="$app_dir/$service.template"
service_path="$systemd_dir/$service"
ip_address=$(hostname -I | awk '{print $1}')
release_url="https://github.com/yuri-rage/ublox-fixed-base-manager/releases/download/v0.1.0-pre-release/release.tar.gz"
release_dir="$HOME/release"
is_initial_install=true # will be set to false later for update only

if [ $EUID == 0 ]; then
    echo -e "Please do not run this script as root; don't sudo it!\n"
    exit 1
fi

if ! sudo -v; then
    echo -e "User $user does not have sudo privileges, exiting.\n"
    exit 1
fi

echo -e "Performing system-wide (apt) update...\n"

sudo apt update && sudo apt upgrade -y

if [ -d "$app_dir" ]; then
    is_initial_install=false
    existing_version=$(cat "$app_dir/version.txt")
    echo -e "\nFound $existing_version. Checking for updates..."
fi

if $is_initial_install; then
    echo -e  "\nInstalling Node.js...\n"

    # reference: https://deb.nodesource.com/
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - &&\
    sudo apt install -y nodejs
fi

echo -e "\nDownloading from GitHub...\n"

curl -fsSL "$release_url" | tar -xzv -C "$HOME"

version=$(cat "$release_dir/version.txt")

if [ "$is_initial_install" = "false" ]; then
    if [ "$existing_version" = "$version" ]; then
        echo -e "\nThe downloaded version ($version) is the same as the existing version ($existing_version)."
        read -p "Do you want keep the existing installation (answer N to overwrite)? (Y/n): " -n 1 -r
        echo    # new line
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            echo -e "\nReinstall skipped, deleting downloaded files..."
            rm -rf "$release_dir"
            echo -e "\nDone.\n"
            exit 0
        fi
    else
        echo -e "\nUpdating $existing_version to $version...\n"
    fi

    echo -e "Stopping $service...\n"
    systemctl --user stop "$service"
    systemctl --user disable "$service"

    echo # new line
    read -p "Keep existing $app_conf_file? (Y/n): " -n 1 -r
    echo    # new line
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        echo -e "\nCopying existing config file: $app_dir/$app_conf_file...\n"
        cp -v "$app_dir/$app_conf_file" "$release_dir/$app_conf_file"
    fi

    echo -e "\nCleaning previous installation: $app_dir..."
    rm -rf "$app_dir"
fi

echo -e "\nInstalling extracted files to: $app_dir...\n"
mv -v "$release_dir" "$app_dir"

echo -e "\nInstalling Node.js dependencies...\n"

cd "$app_dir"
npm i better-port

if [ ! -d "$systemd_dir" ]; then
    echo -e "\nCreating user systemd directory: $systemd_dir"
    mkdir -p "$systemd_dir"
fi

echo -e "\nConfiguring, enabling, and starting $service...\n"
sed "s/{{USERNAME}}/$user/g" "$template_path" > "$service_path"
systemctl --user daemon-reload
systemctl --user enable "$service"
systemctl --user start "$service"
sudo loginctl enable-linger "$user" # allow user level service to start on boot

echo -e "\n$version installation complete!\n"

echo -e "To monitor server side messages, run:"
echo -e "journalctl -f --user-unit $service\n"

echo -e "Access the web app at http://$ip_address:8080\n"
