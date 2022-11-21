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
  FlagsArray,
  DEFAULT_FORM_DATA
} from './dto';
import { UniverseFormContextState } from '../UniverseFormContainer';
import { getPlacements, getPlacementsFromCluster } from '../fields/PlacementsField/placementHelper';
import { ASYNC_FIELDS, PRIMARY_FIELDS } from './constants';

const transitToUniverse = (universeUUID: string | undefined) => {
  if (universeUUID) browserHistory.push(`/universes/${universeUUID}/tasks`);
};

//get cluster data by cluster type
export const getClusterByType = (
  universeData: UniverseDetails,
  clusterType: ClusterType
): Cluster | undefined => {
  return universeData?.clusters?.find((cluster: Cluster) => cluster.clusterType === clusterType);
};

export const getPrimaryCluster = (universeData: UniverseDetails): Cluster | undefined => {
  return getClusterByType(universeData, ClusterType.PRIMARY);
};

export const getAsyncCluster = (universeData: UniverseDetails): Cluster | undefined => {
  return getClusterByType(universeData, ClusterType.ASYNC);
};

const transformMasterTserverToFlags = (
  masterGFlags: FlagsArray,
  tserverGFlags: FlagsArray
): Gflag[] => {
  const flagsArray: Gflag[] = [
    ...Object.keys(masterGFlags).map((key: string) => ({
      Name: key,
      MASTER: masterGFlags[key]
    })),
    ...Object.keys(tserverGFlags).map((key: string) => ({
      Name: key,
      MASTER: masterGFlags[key]
    }))
  ];

  return flagsArray;
};

//Filter form data by cluster type
export const filterFormDataByClusterType = (
  formData: UniverseFormData,
  clusterType: ClusterType
): UniverseFormData => {
  const formFields = clusterType === ClusterType.PRIMARY ? PRIMARY_FIELDS : ASYNC_FIELDS;
  return (_.pick(formData, formFields) as unknown) as UniverseFormData;
};

//Transform universe data to form data
export const getFormData = (
  universeData: UniverseDetails,
  clusterType: ClusterType
): UniverseFormData => {
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
      assignPublicIP: userIntent.assignPublicIP,
      useTimeSync: userIntent.useTimeSync,
      enableClientToNodeEncrypt: userIntent.enableClientToNodeEncrypt,
      enableNodeToNodeEncrypt: userIntent.enableNodeToNodeEncrypt,
      enableYSQL: userIntent.enableYSQL,
      enableYSQLAuth: userIntent.enableYSQLAuth,
      enableYCQL: userIntent.enableYCQL,
      enableYCQLAuth: userIntent.enableYCQLAuth,
      enableYEDIS: userIntent.enableYEDIS,
      awsArnString: userIntent.awsArnString,
      enableEncryptionAtRest: !!encryptionAtRestConfig.encryptionAtRestEnabled,
      kmsConfig: encryptionAtRestConfig?.kmsConfigUUID ?? null,
      rootCA
    },
    advancedConfig: {
      useSystemd: userIntent.useSystemd,
      awsArnString: userIntent.awsArnString,
      enableIPV6: userIntent.enableIPV6,
      enableExposingService: userIntent.enableExposingService,
      accessKeyCode: userIntent.accessKeyCode,
      ybSoftwareVersion: userIntent.ybSoftwareVersion,
      communicationPorts,
      customizePort: false, //** */
      ybcPackagePath: null //** */
    },
    instanceTags: Object.keys(userIntent.instanceTags).map((key: string) => ({
      name: key,
      value: userIntent.instanceTags[key]
    })),
    gFlags: transformMasterTserverToFlags(userIntent.masterGFlags, userIntent.tserverGFlags)
  };
  return data;
};

export const getPrimaryFormData = (universeData: UniverseDetails): UniverseFormData => {
  return getFormData(universeData, ClusterType.PRIMARY);
};

export const getAsyncFormData = (universeData: UniverseDetails): UniverseFormData => {
  return getFormData(universeData, ClusterType.ASYNC);
};

const transformFlagsToMasterTserver = (
  flagsArray: Gflag[]
): { masterGFlags: FlagsArray; tserverGFlags: FlagsArray } => {
  const masterGFlags: FlagsArray = [],
    tserverGFlags: FlagsArray = [];
  (flagsArray || []).forEach((flag: Gflag) => {
    if (flag?.hasOwnProperty('MASTER'))
      masterGFlags.push({ name: flag?.Name, value: flag['MASTER'] });
    if (flag?.hasOwnProperty('TSERVER'))
      tserverGFlags.push({ name: flag?.Name, value: flag['TSERVER'] });
  });

  return { masterGFlags, tserverGFlags };
};

//Transform form data to intent
export const getUserIntent = ({ formData }: { formData: UniverseFormData }) => {
  const { masterGFlags, tserverGFlags } = transformFlagsToMasterTserver(formData.gFlags);

  let intent: UserIntent = {
    universeName: formData.cloudConfig.universeName,
    provider: formData.cloudConfig.provider?.uuid as string,
    providerType: formData.cloudConfig.provider?.code as CloudType,
    regionList: formData.cloudConfig.regionList,
    numNodes: formData.cloudConfig.numNodes,
    replicationFactor: formData.cloudConfig.replicationFactor,
    instanceType: (formData?.instanceConfig?.instanceType || '') as string,
    deviceInfo: formData.instanceConfig.deviceInfo,
    instanceTags: formData.instanceTags?.filter((tag) => tag.name && tag.value) ?? [],
    assignPublicIP: formData.instanceConfig.assignPublicIP,
    awsArnString: formData.instanceConfig.awsArnString,
    enableNodeToNodeEncrypt: formData.instanceConfig.enableNodeToNodeEncrypt,
    enableClientToNodeEncrypt: formData.instanceConfig.enableClientToNodeEncrypt,
    enableYSQL: formData.instanceConfig.enableYSQL,
    enableYSQLAuth: formData.instanceConfig.enableYSQLAuth,
    enableYCQL: formData.instanceConfig.enableYCQL,
    enableYCQLAuth: formData.instanceConfig.enableYCQLAuth,
    useTimeSync: formData.instanceConfig.useTimeSync,
    enableYEDIS: formData.instanceConfig.enableYEDIS,
    accessKeyCode: formData.advancedConfig.accessKeyCode,
    ybSoftwareVersion: formData.advancedConfig.ybSoftwareVersion,
    enableIPV6: formData.advancedConfig.enableIPV6,
    enableExposingService: formData.advancedConfig.enableExposingService,
    useSystemd: formData.advancedConfig.useSystemd,
    masterGFlags,
    tserverGFlags
  };

  if (formData.instanceConfig.enableYSQLAuth && formData.instanceConfig.ysqlPassword)
    intent.ysqlPassword = formData.instanceConfig.ysqlPassword;

  if (formData.instanceConfig.enableYCQLAuth && formData.instanceConfig.ycqlPassword)
    intent.ycqlPassword = formData.instanceConfig.ycqlPassword;

  return intent;
};

//Form Submit helpers
const patchConfigResponse = (response: UniverseDetails, original: UniverseDetails) => {
  const clusterIndex = 0; // TODO: change to dynamic when support async clusters

  response.clusterOperation = original.clusterOperation;
  response.currentClusterType = original.currentClusterType;
  response.encryptionAtRestConfig = original.encryptionAtRestConfig;

  const userIntent = response.clusters[clusterIndex].userIntent;
  userIntent.instanceTags = original.clusters[clusterIndex].userIntent.instanceTags;
  userIntent.masterGFlags = original.clusters[clusterIndex].userIntent.masterGFlags;
  userIntent.tserverGFlags = original.clusters[clusterIndex].userIntent.tserverGFlags;
};

export const createUniverse = async ({
  formData,
  universeContextData,
  featureFlags
}: {
  formData: UniverseFormData;
  universeContextData: UniverseFormContextState;
  featureFlags: any;
}) => {
  let response;
  try {
    const configurePayload: UniverseConfigure = {
      clusterOperation: 'CREATE',
      currentClusterType: ClusterType.PRIMARY,
      rootCA: formData.instanceConfig.rootCA,
      userAZSelected: false,
      resetAZConfig: false,
      enableYbc: featureFlags.released.enableYbc || featureFlags.test.enableYbc,
      communicationPorts: formData.advancedConfig.communicationPorts,
      encryptionAtRestConfig: {
        key_op: formData.instanceConfig.enableEncryptionAtRest ? 'ENABLE' : 'UNDEFINED'
      },
      clusters: [
        {
          clusterType: ClusterType.PRIMARY,
          userIntent: getUserIntent({ formData }),
          placementInfo: {
            cloudList: [
              {
                uuid: formData.cloudConfig.provider?.uuid as string,
                code: formData.cloudConfig.provider?.code as CloudType,
                regionList: getPlacements(formData)
              }
            ]
          }
        }
      ]
    };

    if (
      formData?.instanceConfig?.enableEncryptionAtRest &&
      formData?.instanceConfig?.kmsConfig &&
      configurePayload.encryptionAtRestConfig
    ) {
      configurePayload.encryptionAtRestConfig.configUUID = formData.instanceConfig.kmsConfig;
    }

    // in create mode no configure call is made with all form fields ( intent )
    const finalPayload = await api.universeConfigure(
      _.merge(universeContextData.universeConfigureTemplate, configurePayload)
    );

    //some data format changes after configure call
    patchConfigResponse(finalPayload, configurePayload as UniverseDetails);

    // now everything is ready to create universe
    response = await api.universeCreate(finalPayload);
  } catch (error) {
    console.error(error);
  } finally {
    transitToUniverse(response?.universeUUID);
  }
};

// export const createReadReplica = async ({formData, universeContextData}: {mode:clusterModes, formData: UniverseFormData, universeContextData: UniverseFormContextState}) => {

//   try {
//     let configurePayload: UniverseConfigure = {
//       ...universeContextData.UniverseConfigureData,
//     }

//         // convert form data into payload suitable for the configure api call
//         configurePayload = {
//           ...configurePayload,
//           clusterOperation: 'CREATE',
//           currentClusterType: ClusterType.ASYNC,
//           rootCA: formData.instanceConfig.rootCA,
//           userAZSelected: false,
//           communicationPorts: formData.advancedConfig.communicationPorts,
//           encryptionAtRestConfig: {
//             key_op: formData.instanceConfig.enableEncryptionAtRest ? 'ENABLE' : 'UNDEFINED'
//           },
//           clusters: [
//             {
//               clusterType: ClusterType.PRIMARY,
//               userIntent: getUserIntent({formData}),
//               placementInfo: {
//                 cloudList: [
//                   {
//                     uuid: formData.cloudConfig.provider?.uuid as string,
//                     code: formData.cloudConfig.provider?.code as CloudType,
//                     regionList: getPlacements(formData)
//                   }
//                 ]
//               }
//             },
//             {
//               clusterType: ClusterType.ASYNC,
//               userIntent: getUserIntent({formData})
//             }
//           ]
//         };

//         if (
//           formData?.instanceConfig?.enableEncryptionAtRest &&
//           formData?.instanceConfig?.kmsConfig &&
//           configurePayload.encryptionAtRestConfig
//         ) {
//           configurePayload.encryptionAtRestConfig.configUUID = formData.instanceConfig.kmsConfig;
//         }

//         // in create mode no configure call is made with all form fields ( intent )
//         const finalPayload = await api.universeConfigure(configurePayload);

//         // now everything is ready to create universe
//         await api.universeCreate(finalPayload);

//   } catch (error) {
//     console.error(error);
//   }
// };
