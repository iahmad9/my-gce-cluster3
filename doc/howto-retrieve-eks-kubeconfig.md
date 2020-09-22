# How To: Retrieve the cluster admin kubeconfig file

```bash
export CLUSTER_NAME=wk-$USER
export REGION=eu-west-3

# Write and export kubeconfig
eksctl utils write-kubeconfig --cluster ${CLUSTER_NAME} --region ${REGION} --auto-kubeconfig
export KUBECONFIG=${HOME}/.kube/eksctl/clusters/${CLUSTER_NAME}
```
