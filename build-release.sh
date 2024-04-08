#!/bin/bash

project_root="$(dirname "$(realpath "$0")")"
esbuild_bin="$project_root/node_modules/.bin/esbuild"
server_src="$project_root/src/server/server.ts"
dist_dir="$project_root/dist"
release_dir="$project_root/release"
server_out="$release_dir/server.cjs"
config_dir="$project_root/config"

if [ ! -d "$release_dir" ]; then
    echo -e "\nCreating release directory: $release_dir"
    mkdir -p "$release_dir"
else
    echo -e "\nCleaning release directory: $release_dir"
    rm -rf "$release_dir"/*
fi

if npm run build; then
    echo -e "\nBuild successful. Copying files to release directory...\n"
    cp -rv "$dist_dir" "$release_dir"
else
    echo -e "\nBuild failed. See errors above.\n"
    exit 1
fi

echo -e "\nStarting esbuild for server..."
if "$esbuild_bin" "$server_src" --external:'@serialport' --bundle --platform=node --outfile="$server_out"; then
    echo -e "\nServer bundling complete.\n"
else
    echo -e "\nServer bundling failed. See errors above.\n"
    exit 1
fi

if [ ! -d "$config_dir" ]; then
    echo -e "Config directory not found: $config_dir\n"
    exit 1
else
    echo -e "Copying config directory...\n"
    cp -rv "$config_dir" "$release_dir"
fi

echo -e "Copying systemd template...\n"
cp -v "$project_root/rtkbase.service.template" "$release_dir"

echo -e "Creating release tarball...\n"
cd "$project_root"
tar -czvf release.tar.gz release

echo -e "\nRelease build complete.\n"
