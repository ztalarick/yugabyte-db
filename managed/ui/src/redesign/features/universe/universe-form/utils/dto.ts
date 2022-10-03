import { ProviderMin } from '../fields/ProvidersField/ProvidersField';

//types & interfaces
export enum clusterModes {
  NEW_PRIMARY,
  EDIT_PRIMARY,
  NEW_ASYNC,
  EDIT_ASYNC
}

export enum ClusterModes {
  CREATE = 'CREATE',
  EDIT = 'EDIT'
}

export enum ClusterType {
  PRIMARY = 'PRIMARY',
  ASYNC = 'ASYNC'
}
export interface PlacementCloud {
  uuid: string;
  code: string;
  regionList: PlacementRegion[];
}

export enum ExposingServiceTypes {
  EXPOSED = 'EXPOSED',
  UNEXPOSED = 'UNEXPOSED'
}

export type FlagsArray = { name: string; value: string | boolean | number | undefined }[];
export type FlagsObject = Record<string, string>;

export interface UserIntent {
  universeName: string;
  provider: string;
  providerType: CloudType;
  replicationFactor: number;
  regionList: string[];
  instanceType: string;
  numNodes: number;
  ybSoftwareVersion: string | null;
  accessKeyCode: string | null;
  deviceInfo: DeviceInfo | null;
  assignPublicIP: boolean;
  useTimeSync: boolean;
  enableYSQL: boolean;
  enableYSQLAuth: boolean;
  ysqlPassword?: string | null;
  enableYCQL: boolean;
  enableYCQLAuth: boolean;
  ycqlPassword?: string | null;
  enableNodeToNodeEncrypt: boolean;
  enableClientToNodeEncrypt: boolean;
  awsArnString: string | null;
  enableYEDIS: boolean;
  enableIPV6: boolean;
  enableExposingService: ExposingServiceTypes | null;
  ybcPackagePath?: string | null;
  useSystemd: boolean;
  instanceTags: InstanceTags[];
  masterGFlags: FlagsArray;
  tserverGFlags: FlagsArray;
}

export interface Certificate {
  uuid: string;
  customerUUID: string;
  label: string;
  startDate: string;
  expiryDate: string;
  privateKey: string;
  certificate: string;
  certType: 'SelfSigned' | 'CustomCertHostPath';
}

export interface KmsConfig {
  credentials: {
    AWS_ACCESS_KEY_ID: string;
    AWS_REGION: string;
    AWS_SECRET_ACCESS_KEY: string;
    cmk_id: string;
  };
  metadata: {
    configUUID: string;
    in_use: boolean;
    name: string;
    provider: string;
  };
}

export interface Cluster {
  placementInfo?: {
    cloudList: PlacementCloud[];
  };
  clusterType: ClusterType;
  userIntent: UserIntent;
  regions?: any;
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

export interface PlacementAZ {
  uuid: string;
  name: string;
  replicationFactor: number;
  subnet: string;
  numNodesInAZ: number;
  isAffinitized: boolean;
}

export interface PlacementRegion {
  uuid: string;
  code: string;
  name: string;
  azList: PlacementAZ[];
}
export interface RegionInfo {
  parentRegionId: string;
  parentRegionName: string;
  parentRegionCode: string;
}

// export type Placement = (PlacementAZ & RegionInfo) | null;

export interface Placement {
  uuid: string;
  name: string;
  replicationFactor: number;
  subnet: string;
  numNodesInAZ: number;
  isAffinitized: boolean;
  parentRegionId: string;
  parentRegionName: string;
  parentRegionCode: string;
}

export interface CloudConfigFormValue {
  universeName: string;
  provider: ProviderMin | null;
  regionList: string[]; // array of region IDs
  numNodes: number;
  replicationFactor: number;
  autoPlacement: boolean;
  placements: Placement[];
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
  instanceTags: InstanceTags[];
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
  enableExposingService: ExposingServiceTypes | null;
  customizePort: boolean;
  accessKeyCode: string | null;
  ybSoftwareVersion: string | null;
  communicationPorts: CommunicationPorts;
}

export interface InstanceTags {
  name: string;
  value: string;
}

export interface Gflag {
  Name: string;
  MASTER?: string | boolean | number;
  TSERVER?: string | boolean | number;
}

export interface UniverseFormData {
  cloudConfig: CloudConfigFormValue;
  instanceConfig: InstanceConfigFormValue;
  advancedConfig: AdvancedConfigFormValue;
  instanceTags: InstanceTags[];
  gFlags: Gflag[];
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

export interface InstanceTypeWithGroup extends InstanceType {
  groupName: string;
}
//Instance COnfig

//Data
export const DEFAULT_CLOUD_CONFIG: CloudConfigFormValue = {
  universeName: '',
  provider: null,
  regionList: [],
  numNodes: 3,
  replicationFactor: 3,
  autoPlacement: true, // "AUTO" is the default value when creating new universe
  placements: []
};

export const DEFAULT_INSTANCE_CONFIG: InstanceConfigFormValue = {
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

export const DEFAULT_ADVANCED_CONFIG: AdvancedConfigFormValue = {
  useSystemd: false,
  ybcPackagePath: null,
  awsArnString: null,
  enableIPV6: false,
  enableExposingService: null,
  customizePort: false,
  accessKeyCode: null,
  ybSoftwareVersion: null,
  communicationPorts: DEFAULT_COMMUNICATION_PORTS
};

export const DEFAULT_USER_TAGS = [{ name: '', value: '' }];
export const DEFAULT_GFLAGS = [];

export const DEFAULT_FORM_DATA: UniverseFormData = {
  cloudConfig: DEFAULT_CLOUD_CONFIG,
  instanceConfig: DEFAULT_INSTANCE_CONFIG,
  advancedConfig: DEFAULT_ADVANCED_CONFIG,
  instanceTags: DEFAULT_USER_TAGS,
  gFlags: DEFAULT_GFLAGS
};

export enum NodeState {
  ToBeAdded = 'ToBeAdded',
  Provisioned = 'Provisioned',
  SoftwareInstalled = 'SoftwareInstalled',
  UpgradeSoftware = 'UpgradeSoftware',
  UpdateGFlags = 'UpdateGFlags',
  Live = 'Live',
  Stopping = 'Stopping',
  Starting = 'Starting',
  Stopped = 'Stopped',
  Unreachable = 'Unreachable',
  ToBeRemoved = 'ToBeRemoved',
  Removing = 'Removing',
  Removed = 'Removed',
  Adding = 'Adding',
  BeingDecommissioned = 'BeingDecommissioned',
  Decommissioned = 'Decommissioned'
}

export interface NodeDetails {
  nodeIdx: number;
  nodeName: string | null;
  nodeUuid: string | null;
  placementUuid: string;
  state: NodeState;
}

export interface EncryptionAtRestConfig {
  configUUID?: string; // KMS config Id field for configure/create calls
  key_op?: 'ENABLE' | 'DISABLE' | 'UNDEFINED'; // operation field for configure/create calls
  type?: 'DATA_KEY' | 'CMK';
}
export interface UniverseDetails {
  currentClusterType?: ClusterType; // used in universe configure calls
  clusterOperation?: 'CREATE' | 'EDIT' | 'DELETE';
  allowInsecure: boolean;
  backupInProgress: boolean;
  capability: 'READ_ONLY' | 'EDITS_ALLOWED';
  clusters: Cluster[];
  communicationPorts: CommunicationPorts;
  cmkArn: string;
  deviceInfo: DeviceInfo | null;
  encryptionAtRestConfig: EncryptionAtRestConfig;
  errorString: string | null;
  expectedUniverseVersion: number;
  importedState: 'NONE' | 'STARTED' | 'MASTERS_ADDED' | 'TSERVERS_ADDED' | 'IMPORTED';
  itestS3PackagePath: string;
  nextClusterIndex: number;
  nodeDetailsSet: NodeDetails[];
  nodePrefix: string;
  resetAZConfig: boolean;
  rootCA: string | null;
  universeUUID: string;
  updateInProgress: boolean;
  updateSucceeded: boolean;
  userAZSelected: boolean;
  enableYbc: boolean;
}

export type UniverseConfigure = Partial<UniverseDetails>;

export interface Resources {
  azList: string[];
  ebsPricePerHour: number;
  memSizeGB: number;
  numCores: number;
  numNodes: number;
  pricePerHour: number;
  volumeCount: number;
  volumeSizeGB: number;
}

export interface UniverseConfig {
  disableAlertsUntilSecs: string;
  takeBackups: string;
}
export interface Universe {
  creationDate: string;
  name: string;
  resources: Resources;
  universeConfig: UniverseConfig;
  universeDetails: UniverseDetails;
  universeUUID: string;
  version: number;
}
