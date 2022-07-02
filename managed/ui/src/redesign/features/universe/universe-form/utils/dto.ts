//types & interfaces

export enum clusterModes {
  NEW_PRIMARY,
  EDIT_PRIMARY,
  NEW_ASYNC,
  EDIT_ASYNC
}

export interface CloudConfigFormValue {
  universeName: string;
  provider: string | null;
  regionList: string[]; // array of region IDs
  totalNodes: number;
  replicationFactor: number;
  autoPlacement: boolean;
  placements: string[];
}

export interface InstanceConfigFormValue {
  instanceType: string | null;
  deviceInfo: string | null;
  instanceTags: string[];
  assignPublicIP: boolean;
  awsArnString: string | null;
}

export interface UniverseFormData {
  cloudConfig: CloudConfigFormValue;
  instanceConfig: InstanceConfigFormValue;
}

//Data
const DEFAULT_CLOUD_CONFIG: CloudConfigFormValue = {
  universeName: '',
  provider: null,
  regionList: [],
  totalNodes: 3,
  replicationFactor: 3,
  autoPlacement: true, // "AUTO" is the default value when creating new universe
  placements: []
};

const DEFAULT_INSTANCE_CONFIG: InstanceConfigFormValue = {
  instanceType: null,
  deviceInfo: null,
  instanceTags: [],
  assignPublicIP: true,
  awsArnString: ''
};

export const DEFAULT_FORM_DATA: UniverseFormData = {
  cloudConfig: DEFAULT_CLOUD_CONFIG,
  instanceConfig: DEFAULT_INSTANCE_CONFIG
  // dbConfig: DEFAULT_DB_CONFIG,
  // securityConfig: DEFAULT_SECURITY_CONFIG,
  // hiddenConfig: DEFAULT_HIDDEN_CONFIG
};
