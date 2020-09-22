# Team Workspaces Demo Reset Script

This script (`setup.sh`) resets the Team Workspaces demo to the virgin state (reverting all objects modified in the GitOps repo and deleting created git repositories).

## Runtime assumptions

The `reset.sh` script assumes that:
- it is being run from a working tree corresponding to the current `HEAD` of the GitOps repo,
- `kubectl` can access the managed WKP cluster for reading (without any extra flags - that is, `kubectl get namespaces` works),
- `hub` is installed in a recent version and that `~/.config/hub` is configured for a user who has the right to delete repos in the `wkp-example-org` organization. User `wkp-workspace-admin` (in 1Password) is a good GitHub user for this purpose.
    Example `~/.config/hub`:

        github.com
        - user: wkp-workspace-admin
          oauth_token: <token from 1Password>
          protocol: https

## Usage

Replace `origin` with the name of the remote that tracks the GitOps repository read by Flux.

```
git pull origin
env REMOTE=origin setup/team-workspaces-demo/reset.sh
```
