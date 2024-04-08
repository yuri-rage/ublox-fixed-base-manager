#!/bin/bash

start_time=$(date +%s)

project_root="$(dirname "$(realpath "$0")")"
esbuild_bin="$project_root/node_modules/.bin/esbuild"
server_src="$project_root/src/server/server.ts"
dist_dir="$project_root/dist"
release_dir="$project_root/release"
server_out="$release_dir/server.cjs"
config_dir="$project_root/config"
log_dir="$project_root/logs"
service_template="fixedbase.service.template"
version="v$(grep '"version":' $project_root/package.json | head -1 | awk -F '"' '{print $4}')"

echo -e "\nBuilding release for $version..."

if [ ! -d "$release_dir" ]; then
    echo -e "\nCreating release directory: $release_dir"
    mkdir -p "$release_dir"
else
    echo -e "\nCleaning release directory: $release_dir"
    rm -rf "$release_dir"/*
fi

if [ -d "$log_dir" ]; then
    echo -e "\nCleaning log directory: $log_dir"
    rm -rf "$log_dir"/*
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

echo -e "\nCopying additional files...\n"
sed "s/{{VERSION}}/$version/g" "$project_root/$service_template" > "$release_dir/$service_template"
echo "$version" > "$release_dir/version.txt"
cp -v "$project_root/LICENSE" "$release_dir"

echo -e "\nCreating release tarball...\n"
cd "$project_root"
tar -czvf release.tar.gz release

echo -e "\nRelease $version build complete.\n"

end_time=$(date +%s)
elapsed_time=$(( end_time - start_time ))
echo -e "Total build time: $elapsed_time seconds."

echo -e "\nDon't forget to update the release URL in the installer script!\n"
