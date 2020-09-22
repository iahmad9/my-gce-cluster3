#!/usr/bin/env bash
# shellcheck shell=bash

set -euo pipefail

unset CD_PATH
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}" || exit 1

. ../lib/functions.sh

if [[ -z "${REMOTE+x}" ]]; then
    echo_blue "Error: The REMOTE environment variable must be set."
    exit 1
fi

echo_blue -n "Listing created repos... "
ORG=wkp-example-org
REPOS=$(kubectl get gitrepositories --all-namespaces --output json | jq ".items[].spec.github.repositoryName" | sed 's/"//g')
echo_blue "$REPOS"

echo_blue "Committing..."
cp team-workspaces.yaml.template ../../cluster/platform/team-workspaces.yaml
git commit --allow-empty ../../cluster/platform/team-workspaces.yaml -m 'revert team-workspaces.yaml'
echo_blue "Pushing..."
git push "$REMOTE" HEAD

echo_blue -n "Waiting for GitRepository resources to disappear from the cluster."
while true; do
    NAMES=$(kubectl get gitrepositories --all-namespaces --output name)
    if [ -z "$NAMES" ]; then break; fi

    echo_blue -n '.'
    sleep 1
done
echo_blue

SOME_REPOS_FAILED=0
echo_blue "Deleting remote git repositories..."
for repo in "${REPOS[@]}"; do
    if [ -z "$repo" ]; then continue; fi
    if ! hub delete -y "$ORG/$repo"; then
        echo_yellow "Repo $ORG/$repo not deleted because of an error."
        SOME_REPOS_FAILED=1
    fi
done

echo_blue "Complete."
[ "$SOME_REPOS_FAILED" -eq 0 ] || echo_yellow "Some repos failed to delete. Please go to https://github.com/$ORG and delete the them manually."
