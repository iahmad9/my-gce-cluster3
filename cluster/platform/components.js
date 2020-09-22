import * as param from '@jkcfg/std/param';

const track = param.String('track');
const eksConfig = param.Object('eksConfig');
const clusterName = param.String('clusterName');
const gitProvider = param.String('gitProvider');
const gitopsParams = param.Object('gitopsParams');
const gitopsSecrets = param.Object('gitopsSecrets');
const teamWorkspaces = param.Object('team-workspaces');
const enabledFeatures = param.Object('enabledFeatures');

const clusterInfo = {
	"name":  clusterName,
	"provider": track === 'eks' ? "AWS" : '',
	"regions": track === 'eks' ? eksConfig.clusterRegion : '',
}

const wkpEKSController = {
	"name": "wkp-eks-controller",
	"disabled": !enabledFeatures.fleetManagement,
	"params": {
		"imagePullSecret": gitopsSecrets.sealedImagePullSecrets.dockerio["wkp-eks-controller"],
		"images": gitopsParams.images,
	},
};

const wkpFluxBootstrapComponent = {
	"name": "wkp-flux-bootstrap",
	"params": {
		"git": gitopsParams.git,
		"gitDeployKey": gitopsSecrets.sealedGitDeployKey["wkp-flux"],
		"imagePullSecret": gitopsSecrets.sealedImagePullSecrets.dockerio["wkp-flux"],
		"images": gitopsParams.images,
	}
};

const wkpGitopsRepoBroker = {
	"name": "wkp-gitops-repo-broker",
	"params": {
		"git": gitopsParams.git,
		"gitDeployKey": gitopsSecrets.sealedGitDeployKey["wkp-gitops-repo-broker"],
		"imagePullSecret": gitopsSecrets.sealedImagePullSecrets.dockerio["wkp-gitops-repo-broker"],
		"images": gitopsParams.images,
	},
}

const wkpFluxHelmOperatorComponent = {
	"name": "wkp-flux-helm-operator",
};

const wkpTillerComponent = {
	"name": "wkp-tiller",
};

const wkpExternalComponent = {
	"name": "wkp-external-dns",
};

const wkpPrometheusComponent = {
	"name": "wkp-prometheus",
	"params": {
		"endpoints": {
			"alertmanager": "/alertmanager/",
			"prometheus": "/prometheus/"
		}
	}
};

const wkpUIComponent = {
	"name": "wkp-ui",
	"params": {
		"endpoints": {
			"ui": "/"
		},
		"chart": {
			"values": {
				"config": {
					"clusterInfo": clusterInfo,
					"featureGates": {
						"teamWorkspaces": enabledFeatures.teamWorkspaces,
						"fleetManagement": enabledFeatures.fleetManagement,
					}
				}
			}
		},
		"git": {
			...gitopsParams.git,
			provider: gitProvider,
		},
		"gitDeployKey": gitopsSecrets.sealedGitDeployKey["wkp-ui"],
		"imagePullSecret": gitopsSecrets.sealedImagePullSecrets.dockerio["wkp-ui"],
		"ALBIngress": {
			"enabled": eksConfig.uiALBIngress === true
		}
	}
};

const wkpGrafanaComponent = {
	"name": "wkp-grafana",
	"params": {
		"dashboards-path": "cluster/platform/grafana-dashboards",
		"datasources": {
			"prometheus": {
				"url": "http://prometheus-operator-prometheus.wkp-prometheus.svc:9090"
			}
		},
		"endpoints": {
			"grafana": "/grafana/"
		}
	}
};

const wkpScopeComponent = {
	"name": "wkp-scope",
	"params": {
		"endpoints": {
			"scope": "/scope/"
		}
	}
};

const wkpALBIngressController = {
	"name": "wkp-alb-ingress-controller",
	"params": {
		"clusterName": clusterInfo.name,
	}
};

const wkpWorkspacesController = {
	"name": "wkp-workspaces",
	"disabled": !enabledFeatures.teamWorkspaces,
	"params": {
		"imagePullSecret": gitopsSecrets.sealedImagePullSecrets.dockerio["wkp-workspaces"],
		"images": gitopsParams.images,
	}
};

const wkpManifestLoader = {
  name: 'wkp-manifest-loader',
  params: {
    paths: [
      { path: './cluster/platform/workspaces', recursive: true },
      { path: './cluster/manifests', recursive: true },
      {
        path: './cluster/platform/clusters/default',
        disabled: !enabledFeatures.fleetManagement,
      },
      { path: './setup', disabled: track == 'eks' },
    ],
  },
};

const components = [
	wkpEKSController,
	wkpFluxBootstrapComponent,
	wkpFluxHelmOperatorComponent,
	wkpTillerComponent,
	wkpExternalComponent,
	wkpPrometheusComponent,
	wkpUIComponent,
	wkpGrafanaComponent,
	wkpScopeComponent,
	wkpGitopsRepoBroker,
	wkpWorkspacesController,
	wkpManifestLoader,
];

const eksComponents = [
	wkpALBIngressController
];

if (track === 'eks') {
	components.push(...eksComponents);
}

export default components;

