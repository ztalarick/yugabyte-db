import { ProviderMin } from '../fields/ProvidersField/ProvidersField';

//types & interfaces
export enum clusterModes {
  NEW_PRIMARY,
  EDIT_PRIMARY,
  NEW_ASYNC,
  EDIT_ASYNC
}

export interface CommunicationPorts {
  masterHttpPort: number;
  masterRpcPort: number;
  tserverHttpPort: number;
  tserverRpcPort: number;
  redisServerHttpPort: number;
  redisServerRpcPort: number;
  yqlServerHttpPort: number;
  yqlServerRpcPort: number;
  ysqlServerHttpPort: number;
  ysqlServerRpcPort: number;
}

export interface CloudConfigFormValue {
  universeName: string;
  provider: ProviderMin | null;
  regionList: string[]; // array of region IDs
  totalNodes: number;
  replicationFactor: number;
  autoPlacement: boolean;
  placements: string[];
}

export interface AccessKey {
  idKey: {
    keyCode: string;
    providerUUID: string;
  };
  keyInfo: {
    publicKey: string;
    privateKey: string;
    vaultPasswordFile: string;
    vaultFile: string;
    sshUser: string;
    sshPort: number;
    airGapInstall: boolean;
    passwordlessSudoAccess: boolean;
    provisionInstanceScript: string;
  };
}

export interface Provider {
  uuid: string;
  code: CloudType;
  name: string;
  active: boolean;
  customerUUID: string;
}

export interface AvailabilityZone {
  uuid: string;
  code: string;
  name: string;
  active: boolean;
  subnet: string;
}
export interface Region {
  uuid: string;
  code: string;
  name: string;
  ybImage: string;
  longitude: number;
  latitude: number;
  active: boolean;
  securityGroupId: string | null;
  details: string | null;
  zones: AvailabilityZone[];
}

export interface InstanceConfigFormValue {
  instanceType: string | null;
  deviceInfo: DeviceInfo | null;
  instanceTags: string[];
  assignPublicIP: boolean;
  useTimeSync: boolean;
  enableClientToNodeEncrypt: boolean;
  enableNodeToNodeEncrypt: boolean;
  rootCA: string;
  enableEncryptionAtRest: boolean;
  enableYSQL: boolean;
  enableYSQLAuth: boolean;
  ysqlPassword: string;
  ysqlConfirmPassword: string;
  enableYCQL: boolean;
  enableYCQLAuth: boolean;
  ycqlPassword: string;
  ycqlConfirmPassword: string;
  enableYEDIS: boolean;
  awsArnString: string | null;
  kmsConfig: string | null;
}

export interface AdvancedConfigFormValue {
  useSystemd: boolean;
  ybcPackagePath: string | null;
  awsArnString: string | null;
  enableIPV6: boolean;
  enableExposingService: boolean;
  customizePort: boolean;
  accessKeyCode: string | null;
  ybSoftwareVersion: string | null;
  communicationPorts: CommunicationPorts;
}
export interface UniverseFormData {
  cloudConfig: CloudConfigFormValue;
  instanceConfig: InstanceConfigFormValue;
  advancedConfig: AdvancedConfigFormValue;
}

//Instance Config
export enum CloudType {
  unknown = 'unknown',
  aws = 'aws',
  gcp = 'gcp',
  azu = 'azu',
  docker = 'docker',
  onprem = 'onprem',
  kubernetes = 'kubernetes',
  cloud = 'cloud-1',
  other = 'other'
}
interface VolumeDetails {
  volumeSizeGB: number;
  volumeType: 'EBS' | 'SSD' | 'HDD' | 'NVME';
  mountPath: string;
}

export enum StorageType {
  IO1 = 'IO1',
  GP2 = 'GP2',
  GP3 = 'GP3',
  Scratch = 'Scratch',
  Persistent = 'Persistent',
  StandardSSD_LRS = 'StandardSSD_LRS',
  Premium_LRS = 'Premium_LRS',
  UltraSSD_LRS = 'UltraSSD_LRS'
}

export const DEFAULT_COMMUNICATION_PORTS: CommunicationPorts = {
  masterHttpPort: 7000,
  masterRpcPort: 7100,
  tserverHttpPort: 9000,
  tserverRpcPort: 9100,
  redisServerHttpPort: 11000,
  redisServerRpcPort: 6379,
  yqlServerHttpPort: 12000,
  yqlServerRpcPort: 9042,
  ysqlServerHttpPort: 13000,
  ysqlServerRpcPort: 5433
};

export interface DeviceInfo {
  volumeSize: number;
  numVolumes: number;
  diskIops: number | null;
  throughput: number | null;
  storageClass: 'standard'; // hardcoded in DeviceInfo.java
  mountPoints: string | null;
  storageType: StorageType | null;
}

interface InstanceTypeDetails {
  tenancy: 'Shared' | 'Dedicated' | 'Host' | null;
  volumeDetailsList: VolumeDetails[];
}
export interface InstanceType {
  active: boolean;
  providerCode: CloudType;
  instanceTypeCode: string;
  idKey: {
    providerCode: CloudType;
    instanceTypeCode: string;
  };
  numCores: number;
  memSizeGB: number;
  instanceTypeDetails: InstanceTypeDetails;
}
//Instance COnfig

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
  useTimeSync: true,
  enableClientToNodeEncrypt: true,
  enableNodeToNodeEncrypt: true,
  rootCA: '',
  enableEncryptionAtRest: false,
  enableYSQL: true,
  enableYSQLAuth: true,
  ysqlPassword: '',
  ysqlConfirmPassword: '',
  enableYCQL: true,
  enableYCQLAuth: true,
  ycqlPassword: '',
  ycqlConfirmPassword: '',
  enableYEDIS: false,
  awsArnString: '',
  kmsConfig: null
};

const DEFAULT_ADVANCED_CONFIG: AdvancedConfigFormValue = {
  useSystemd: false,
  ybcPackagePath: null,
  awsArnString: null,
  enableIPV6: false,
  enableExposingService: false,
  customizePort: false,
  accessKeyCode: null,
  ybSoftwareVersion: null,
  communicationPorts: DEFAULT_COMMUNICATION_PORTS
};

export const DEFAULT_FORM_DATA: UniverseFormData = {
  cloudConfig: DEFAULT_CLOUD_CONFIG,
  instanceConfig: DEFAULT_INSTANCE_CONFIG,
  advancedConfig: DEFAULT_ADVANCED_CONFIG
  // dbConfig: DEFAULT_DB_CONFIG,
  // securityConfig: DEFAULT_SECURITY_CONFIG,
  // hiddenConfig: DEFAULT_HIDDEN_CONFIG
};
