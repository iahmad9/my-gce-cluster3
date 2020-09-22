# How To: Create an EKS cluster with WKP

The following instructions contains the following steps:

1. Prerequisites
2. Install dependencies
3. Use WKP to install EKS cluster

## 1. Prerequisites

Before you start please make sure you have an instance of the `wk` binary compatible with your current host

## 2. Install dependencies

On the admin computer (the one where you currently read this text) you need to install Git and Kubectl:

```bash
# install Git on Ubuntu, read http://bit.ly/2uoDwSq for other distros
sudo apt-get install git && git version

# install Kubectl on Ubuntu, read http://bit.ly/2v5P4tU for other distros
# good to know: please ignore the error message "... connection to the server localhost:8080 was refused ..."
sudo snap install kubectl --classic && kubectl version
```

## 3. Use WKP to install EKS cluster

Unpack a local copy of necessary installation files

```bash
# Create the local directory structure necessary for installation
wk setup install
```

WKP needs to know your git provider organization or user, your Docker Hub user, and the path to a file containing your Docker Hub password.

```bash
# Enter your gitProviderOrg, dockerIOUser, and dockerIOPasswordFile. Set the 'track' field to "eks". Additionally,
# set the clusterName, clusterRegion, and kubernetesVersion fields or keep the defaults.
# Enter any node group configuration you require.
vim setup/config.yaml

# Edit cluster/platform/backend-params.yaml and fill in the git provider API username and token (take values from 1Password for user wkp-workspace-admin)
vim cluster/platform/backend-params.yaml

# Stage cluster/platform/backend-params.yaml
git add cluster/platform/backend-params.yaml

# Create a git repository and install the cluster
wk setup run

# Optional: Delete the cluster created above.
./setup/cleanup.sh
```
