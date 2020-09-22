import * as param from '@jkcfg/std/param'
import * as std from '@jkcfg/std'

const config = param.all();
let output = [];

const lbNodeCount = config.controlPlane.nodes > 1 ? 1 : 0;
const numNodes = config => config.controlPlane.nodes + config.workers.nodes + lbNodeCount;

const backend = {
  docker: {
    image: 'quay.io/footloose/centos7:0.6.0',
    // The below is required for dockerd to run smoothly.
    // See also: https://github.com/weaveworks/footloose#running-dockerd-in-container-machines
    privileged: true,
    volumes: [{
      type: 'volume',
      destination: '/var/lib/docker',
    }]
  },
  ignite: {
    image: 'weaveworks/ignite-centos:firekube-pre3',
    privileged: false,
    volumes: [],
  },
};

const image = config => (config.image != '' && config.image != null) ? config.image:backend[config.backend].image;
const privileged = config => backend[config.backend].privileged;
const volumes = config => backend[config.backend].volumes;

const footloose = config => ({
  cluster: {
    name: 'wk-quickstart',
    privateKey: 'cluster-key',
  },
  machines: [{
    count: numNodes(config),
    spec: {
      image: image(config),
      name: 'node%d',
      backend: config.backend,
      ignite: {
        cpus: 2,
        memory: '1GB',
        diskSize: '5GB',
        kernel: 'weaveworks/ignite-kernel:4.19.47',
      },
      portMappings: [{
        containerPort: 22,
        hostPort: 2222,
      }, {
        containerPort: 6443,
        hostPort: 6443,
      }, {
        containerPort: 30443,
        hostPort: 30443,
      }, {
        containerPort: 30080,
        hostPort: 30080,
      }],
      privileged: privileged(config),
      volumes: volumes(config),
    },
  }],
});

output.push({ path: 'footloose.yaml', value: footloose(config) });

// List is a Kubernetes list.
const List = items => ({
  apiVersion: "v1",
  kind: "List",
  items
});

// Machine returns a WKS machine description from a configuration object describing its public IP, private IP, id, and its role.
const Machine = ({ id, privateIP, sshPort, role, k8sVersion }) => ({
  apiVersion: 'cluster.k8s.io/v1alpha1',
  kind: 'Machine',
  metadata: {
    labels: {
      set: role,
    },
    name: `${role}-${id}`,
    namespace: 'weavek8sops'
  },
  spec: {
    versions: {
      kubelet: k8sVersion,
    },
    providerSpec: {
      value: {
        apiVersion: 'baremetalproviderspec/v1alpha1',
        kind: 'BareMetalMachineProviderSpec',
        public: {
          address: '127.0.0.1',
          port: sshPort,
        },
        private: {
          address: privateIP,
          port: 22,
        }
      }
    }
  }
});

const sshPort = machine => machine.ports.find(p => p.guest == 22).host;

if (config.machines !== undefined) {
  const machines = [];

  for (let i = 0; i < config.controlPlane.nodes; i++) {
    const machine = config.machines[i];
    machines.push(Machine({
      id: i,
      privateIP: machine.runtimeNetworks[0].ip,
      sshPort: sshPort(machine),
      role: 'master',
      k8sVersion: config.kubernetesVersion,
    }));
  }

  for (let i = 0; i < config.workers.nodes; i++) {
    const machine = config.machines[config.controlPlane.nodes + i];
    machines.push(Machine({
      id: i,
      privateIP: machine.runtimeNetworks[0].ip,
      sshPort: sshPort(machine),
      role: 'worker',
      k8sVersion: config.kubernetesVersion,
    }));
  }

  output.push({ path: 'machines.yaml', value: List(machines) });
}

export default output;
