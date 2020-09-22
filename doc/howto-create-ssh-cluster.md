# Create a Kubernetes cluster with WKP on existing machines

The following instructions contains the following steps:

1. Prerequisites
2. Install dependencies
3. let WKP install a Kubernetes cluster on at least three existing CentOS 7 machines
4. use Kubectl and WKP UI to learn more about the newly created Kubernetes cluster

## 1. Prerequisites

Before you start please make sure you have the following in place:

- An instance of the `wk` binary compatible with your current host
- The internal and external IP addresses of at least three CentOS 7 machines which will run the cluster
- The computer where you install WKP can access your machines on TCP port 6443
- SSH access to the machines that will run the cluster
- Dockerhub credentials to access the WKP images

Please contact Weaveworks technical sales if you have questions or need assistance.

## 2. Install dependencies

On the admin computer (the one where you currently read this text) you need to install Git and Kubectl:

```bash
# install Git on Ubuntu, read http://bit.ly/2uoDwSq for other distros
sudo apt-get install git && git version

# install Kubectl on Ubuntu, read http://bit.ly/2v5P4tU for other distros
# good to know: please ignore the error message "... connection to the server localhost:8080 was refused ..."
sudo snap install kubectl --classic && kubectl version
```

## 3. Configure WKP & let it install Kubernetes on machines

Unpack a local copy of necessary installation files

```bash
# Create the local directory structure necessary for installation
wk setup install
```

WKP needs to know the private and public IP addresses of the designated Kubernetes machines before it can start the installation process. Additionally it needs to know your git provider organization or user, your Docker Hub user, and the path to a file containing your Docker Hub password.

```bash
# Enter the public IPs, private IPs and optionally the roles of each machine. Also, set the following fields:
# gitProviderOrg, dockerIOUser, and dockerIOPasswordFile. Set the 'track' field to "wks-ssh". You may want to set the
# 'sshUser' and 'sshKeyFile' fields but the default values will work.
vim setup/config.yaml
```

Create a git repository and install the cluster

```bash
# Create a git repository and a Kubernetes cluster on the machines
wk setup run
```

## Access the Kubernetes cluster via Kubectl and WKP UI

When the cluster installation completes you can get a list of node:

```bash
export KUBECONFIG=${PWD}/setup/weavek8sops/example/kubeconfig
kubectl get nodes
```

And you can access the WKP UI web interface via a built-in `wk` command:

```bash
wk ui
```

The WKP UI is now available http://localhost:8090 in your browser.
