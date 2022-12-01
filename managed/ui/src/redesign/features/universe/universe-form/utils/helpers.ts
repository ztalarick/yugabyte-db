import _ from 'lodash';
import { browserHistory } from 'react-router';
import { api } from './api';
import {
  CloudType,
  ClusterType,
  Cluster,
  UniverseDetails,
  UniverseConfigure,
  UniverseFormData,
  UserIntent,
  Gflag,
  DEFAULT_FORM_DATA,
  InstanceTag,
  InstanceTags
} from './dto';
import { UniverseFormContextState } from '../UniverseFormContainer';
import { getPlacementsFromCluster } from '../fields/PlacementsField/PlacementsFieldHelper';
import { ASYNC_FIELDS, PRIMARY_FIELDS, ASYNC_COPY_FIELDS } from './constants';

export const transitToUniverse = (universeUUID: string | undefined) => {
  if (universeUUID) browserHistory.push(`/universes/${universeUUID}/tasks`);
};

//get cluster data by cluster type
export const getClusterByType = (universeData: UniverseDetails, clusterType: ClusterType) => {
  return universeData.clusters.find((cluster) => cluster.clusterType === clusterType);
};

export const getPrimaryCluster = (universeData: UniverseDetails) => {
  return getClusterByType(universeData, ClusterType.PRIMARY);
};

export const getAsyncCluster = (universeData: UniverseDetails) => {
  return getClusterByType(universeData, ClusterType.ASYNC);
};

//Filter form data by cluster type
export const filterFormDataByClusterType = (
  formData: UniverseFormData,
  clusterType: ClusterType
) => {
  const formFields = clusterType === ClusterType.PRIMARY ? PRIMARY_FIELDS : ASYNC_FIELDS;
  return (_.pick(formData, formFields) as unknown) as UniverseFormData;
};

//returns fields needs to be copied from Primary to Async in Create+RR flow
export const getAsyncCopyFields = (formData: UniverseFormData) =>
  _.pick(formData, ASYNC_COPY_FIELDS);

//transform gflags
export const transformGFlagToFlagsArray = (gFlags: Record<string, any> = {}, flagType: string) => {
  const flagsArray = [
    ...Object.keys(gFlags).map((key: string) => ({
      Name: key,
      [flagType]: gFlags[key]
    }))
  ];
  return flagsArray;
};

//transform instance tags
const transformInstanceTags = (instanceTags: Record<string, string> = {}) =>
  Object.entries(instanceTags).map(([key, val]) => ({
    name: key,
    value: val
  }));

//Transform universe data to form data
export const getFormData = (universeData: UniverseDetails, clusterType: ClusterType) => {
  const { communicationPorts, encryptionAtRestConfig, rootCA } = universeData;
  const cluster = getClusterByType(universeData, clusterType);

  if (!cluster) return DEFAULT_FORM_DATA;

  const { userIntent } = cluster;

  let data: UniverseFormData = {
    cloudConfig: {
      universeName: userIntent.universeName,
      provider: {
        code: userIntent.providerType,
        uuid: userIntent.provider
      },
      regionList: userIntent.regionList,
      numNodes: userIntent.numNodes,
      replicationFactor: userIntent.replicationFactor,
      placements: getPlacementsFromCluster(cluster),
      autoPlacement: true //** */
    },
    instanceConfig: {
      instanceType: userIntent.instanceType,
      deviceInfo: userIntent.deviceInfo,
      assignPublicIP: !!userIntent.assignPublicIP,
      useTimeSync: !!userIntent.useTimeSync,
      enableClientToNodeEncrypt: !!userIntent.enableClientToNodeEncrypt,
      enableNodeToNodeEncrypt: !!userIntent.enableNodeToNodeEncrypt,
      enableYSQL: userIntent.enableYSQL,
      enableYSQLAuth: userIntent.enableYSQLAuth,
      enableYCQL: userIntent.enableYCQL,
      enableYCQLAuth: userIntent.enableYCQLAuth,
      enableYEDIS: !!userIntent.enableYEDIS,
      enableEncryptionAtRest: !!encryptionAtRestConfig.encryptionAtRestEnabled,
      kmsConfig: encryptionAtRestConfig?.kmsConfigUUID ?? null,
      rootCA
    },
    advancedConfig: {
      useSystemd: userIntent.useSystemd,
      awsArnString: userIntent.awsArnString ?? null,
      enableIPV6: !!userIntent.enableIPV6,
      enableExposingService: userIntent.enableExposingService,
      accessKeyCode: userIntent.accessKeyCode ?? null,
      ybSoftwareVersion: userIntent.ybSoftwareVersion,
      communicationPorts,
      customizePort: false, //** */
      ybcPackagePath: null //** */
    },
    instanceTags: transformInstanceTags(userIntent.instanceTags),
    gFlags: [
      ...transformGFlagToFlagsArray(userIntent.masterGFlags, 'MASTER'),
      ...transformGFlagToFlagsArray(userIntent.tserverGFlags, 'TSERVER')
    ]
  };

  return data;
};

export const getPrimaryFormData = (universeData: UniverseDetails) => {
  return getFormData(universeData, ClusterType.PRIMARY);
};

export const getAsyncFormData = (universeData: UniverseDetails) => {
  return getFormData(universeData, ClusterType.ASYNC);
};

const transformFlagArrayToObject = (
  flagsArray: Gflag[] = []
): { masterGFlags: Record<string, any>; tserverGFlags: Record<string, any> } => {
  let masterGFlags = {},
    tserverGFlags = {};
  flagsArray.forEach((flag: Gflag) => {
    if (flag?.hasOwnProperty('MASTER')) masterGFlags[flag.Name] = flag['MASTER'];
    if (flag?.hasOwnProperty('TSERVER')) tserverGFlags[flag.Name] = flag['TSERVER'];
  });
  return { masterGFlags, tserverGFlags };
};

const transformTagsArrayToObject = (instanceTags: InstanceTags) => {
  return instanceTags.reduce((tagsObj: Record<string, string>, tag: InstanceTag) => {
    tagsObj[tag.name] = tag.value;
    return tagsObj;
  }, {});
};

//Transform form data to intent
export const getUserIntent = ({ formData }: { formData: UniverseFormData }) => {
  const { cloudConfig, instanceConfig, advancedConfig, instanceTags, gFlags } = formData;
  const { masterGFlags, tserverGFlags } = transformFlagArrayToObject(gFlags);
  let intent: UserIntent = {
    universeName: cloudConfig.universeName,
    provider: cloudConfig.provider?.uuid as string,
    providerType: cloudConfig.provider?.code as CloudType,
    regionList: cloudConfig.regionList,
    numNodes: Number(cloudConfig.numNodes),
    replicationFactor: cloudConfig.replicationFactor,
    dedicatedNodes: !!instanceConfig?.dedicatedNodes,
    instanceType: instanceConfig.instanceType,
    deviceInfo: instanceConfig.deviceInfo,
    assignPublicIP: instanceConfig.assignPublicIP,
    enableNodeToNodeEncrypt: instanceConfig.enableNodeToNodeEncrypt,
    enableClientToNodeEncrypt: instanceConfig.enableClientToNodeEncrypt,
    enableYSQL: instanceConfig.enableYSQL,
    enableYSQLAuth: instanceConfig.enableYSQLAuth,
    enableYCQL: instanceConfig.enableYCQL,
    enableYCQLAuth: instanceConfig.enableYCQLAuth,
    useTimeSync: instanceConfig.useTimeSync,
    enableYEDIS: instanceConfig.enableYEDIS,
    accessKeyCode: advancedConfig.accessKeyCode,
    ybSoftwareVersion: advancedConfig.ybSoftwareVersion,
    enableIPV6: advancedConfig.enableIPV6,
    enableExposingService: advancedConfig.enableExposingService,
    useSystemd: advancedConfig.useSystemd
  };

  if (!_.isEmpty(masterGFlags)) intent.masterGFlags = masterGFlags;
  if (!_.isEmpty(tserverGFlags)) intent.tserverGFlags = tserverGFlags;
  if (!_.isEmpty(advancedConfig.awsArnString)) intent.awsArnString = advancedConfig.awsArnString;
  if (!_.isEmpty(instanceTags)) intent.instanceTags = transformTagsArrayToObject(instanceTags);

  if (instanceConfig.enableYSQLAuth && instanceConfig.ysqlPassword)
    intent.ysqlPassword = instanceConfig.ysqlPassword;

  if (instanceConfig.enableYCQLAuth && instanceConfig.ycqlPassword)
    intent.ycqlPassword = instanceConfig.ycqlPassword;

  return intent;
};

//Form Submit helpers
const patchConfigResponse = (response: UniverseDetails, original: UniverseDetails) => {
  const clusterIndex = response.clusters.findIndex(
    (cluster: Cluster) => cluster.clusterType === response.currentClusterType
  );

  response.clusterOperation = original.clusterOperation;
  response.currentClusterType = original.currentClusterType;
  response.encryptionAtRestConfig = original.encryptionAtRestConfig;

  const userIntent = response.clusters[clusterIndex].userIntent;
  userIntent.instanceTags = original.clusters[clusterIndex].userIntent.instanceTags;
  userIntent.masterGFlags = original.clusters[clusterIndex].userIntent.masterGFlags;
  userIntent.tserverGFlags = original.clusters[clusterIndex].userIntent.tserverGFlags;

  if (userIntent.enableYCQLAuth)
    userIntent.ycqlPassword = original.clusters[clusterIndex].userIntent.ycqlPassword;

  if (userIntent.enableYSQLAuth)
    userIntent.ysqlPassword = original.clusters[clusterIndex].userIntent.ysqlPassword;
};

export const createUniverse = async ({
  configurePayload,
  universeContextData
}: {
  configurePayload: UniverseConfigure;
  universeContextData: UniverseFormContextState;
}) => {
  let response;
  try {
    // in create mode no configure call is made with all form fields ( intent )
    const finalPayload = await api.universeConfigure(
      _.merge(universeContextData.universeConfigureTemplate, configurePayload)
    );

    //some data format changes after configure call
    patchConfigResponse(finalPayload, configurePayload as UniverseDetails);

    // now everything is ready to create universe
    response = await api.createUniverse(finalPayload);
  } catch (error) {
    console.error(error);
  } finally {
    transitToUniverse(response?.universeUUID);
  }
};

export const createReadReplica = async (configurePayload: UniverseConfigure) => {
  let universeUUID = configurePayload.universeUUID;
  if (!universeUUID) return false;
  try {
    // now everything is ready to create async cluster
    return await api.createReadReplica(configurePayload, universeUUID);
  } catch (error) {
    console.error(error);
    return error;
  } finally {
    transitToUniverse(universeUUID);
  }
};

export const editReadReplica = async (configurePayload: UniverseConfigure) => {
  let universeUUID = configurePayload.universeUUID;
  if (!universeUUID) return false;
  try {
    // now everything is ready to edit universe
    return await api.editUniverse(configurePayload, universeUUID);
  } catch (error) {
    console.error(error);
    return error;
  } finally {
    transitToUniverse(universeUUID);
  }
};
