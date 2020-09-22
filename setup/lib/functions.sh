#!/usr/bin/env bash
# shellcheck shell=bash

log() {
    echo "•" "$@"
}

error() {
    log "error:" "$@"
    exit 1
}

command_exists() {
    command -v "${1}" >/dev/null 2>&1
}

check_command() {
    local cmd="${1}"

    if ! command_exists "${cmd}"; then
        error "${cmd}: command not found, please install ${cmd}."
    fi
}

os() {
    uname -s
}

goos() {
    local os
    os="$(uname -s)"
    case "${os}" in
    Linux*)
        echo linux
        ;;
    Darwin*)
        echo darwin
        ;;
    *)
        error "unknown OS: ${os}"
        ;;
    esac
}

arch() {
    uname -m
}

goarch() {
    local arch
    arch="$(uname -m)"
    case "${arch}" in
    armv5*)
        echo "armv5"
        ;;
    armv6*)
        echo "armv6"
        ;;
    armv7*)
        echo "armv7"
        ;;
    aarch64)
        echo "arm64"
        ;;
    x86)
        echo "386"
        ;;
    x86_64)
        echo "amd64"
        ;;
    i686)
        echo "386"
        ;;
    i386)
        echo "386"
        ;;
    *)
        error "uknown arch: ${arch}"
        ;;
    esac
}

mktempdir() {
    mktemp -d 2>/dev/null || mktemp -d -t 'wk-quickstart'
}

footloose_machine_count() {
    awk '/- count: [0-9]+/ {print($3)}' "${1}"
}

footloose_master_count() {
    awk '/controlPlane/ {found=1; next}; found==1 {print($2); exit}' "${1}"
}

# IMPORTANT REMINDER:
# You cannot rely on a GitHub (or GitLab or BitBucket) git url having "github" in the url.
ssh_user_and_host_address() {
    # git@git.mycompany.com:repo/name -> git@git.mycompany.com
    # ssh://git@git.mycompany.com/repo/name -> git@git.mycompany.com
    [[ ${1} =~ ^ssh://(git[@][^/]+).* ]] || [[ ${1} =~ ^(git[@][^:/]+).* ]]
    echo ${BASH_REMATCH[1]}
}

# IMPORTANT REMINDER:
# You cannot rely on a GitHub (or GitLab or BitBucket) git url having "github" in the url.
ssh_host_address() {
    # git@git.mycompany.com:repo/name -> git.mycompany.com
    user_and_host=$(ssh_user_and_host_address "${1}")
    echo "${user_and_host#*@}"
}

ssh_strip_port() {
    if [[ ${1} =~ ^([^:]+)[:].*$ ]]; then
        echo ${BASH_REMATCH[1]}
    else
        echo ${1}
    fi
}

ssh_port() {
    if [[ ${1} =~ ^[^:]+[:](.*)$ ]]; then
        echo ${BASH_REMATCH[1]}
    else
        echo 22
    fi
}

git_ssh_url() {
    echo "${1//https:\/\/github.com\//git@github.com:}"
}

git_current_branch() {
    # Fails when not on a branch unlike: `git name-rev --name-only HEAD`
    git symbolic-ref --short HEAD
}

git_remote_fetchurl() {
    git config --get "remote.${1}.url"
}

ANSI_YELLOW="$(printf "\033[1;33m")"
ANSI_BLUE="$(printf "\033[1;34m")"
ANSI_RESET="$(printf "\033[0m")"

echo_blue() {
    echo -n "${ANSI_BLUE}"
    echo "$@"
    echo -n "${ANSI_RESET}"
}

echo_yellow() {
    echo -n "${ANSI_YELLOW}"
    echo "$@"
    echo -n "${ANSI_RESET}"
}

bool() {
    if [[ $1 == true ]]; then
        echo true
    else
        echo false
    fi
}
