import { api } from './api';
import {
  CloudType,
  ClusterType,
  clusterModes,
  UniverseDetails,
  UniverseConfigure,
  UniverseFormData
} from './dto';
import { UniverseFormContextState } from '../reducer';
import { getPlacements } from '../fields/PlacementsField/placementHelper';
import { browserHistory } from 'react-router';

const patchConfigResponse = (response: UniverseDetails, original: UniverseDetails) => {
  const clusterIndex = 0; // TODO: change to dynamic when support async clusters

  response.clusterOperation = original.clusterOperation;
  response.currentClusterType = original.currentClusterType;
  response.encryptionAtRestConfig = original.encryptionAtRestConfig;

  const userIntent = response.clusters[clusterIndex].userIntent;
  userIntent.instanceTags = original.clusters[clusterIndex].userIntent.instanceTags;
};

const transitToUniverse = (universeUUID: string | undefined) => {
  if (universeUUID) browserHistory.push(`/universes/${universeUUID}/tasks`);
};

const getUserIntent = ({ formData }: { formData: UniverseFormData }) => {
  return {
    universeName: formData.cloudConfig.universeName,
    provider: formData.cloudConfig.provider?.uuid as string,
    providerType: formData.cloudConfig.provider?.code as CloudType,
    regionList: formData.cloudConfig.regionList,
    numNodes: formData.cloudConfig.numNodes,
    replicationFactor: formData.cloudConfig.replicationFactor,
    instanceType: formData.instanceConfig.instanceType as string,
    deviceInfo: formData.instanceConfig.deviceInfo,
    instanceTags: formData.instanceTags.filter((tag) => tag.name && tag.value),
    assignPublicIP: formData.instanceConfig.assignPublicIP,
    awsArnString: formData.instanceConfig.awsArnString,
    enableNodeToNodeEncrypt: formData.instanceConfig.enableNodeToNodeEncrypt,
    enableClientToNodeEncrypt: formData.instanceConfig.enableClientToNodeEncrypt,
    enableYSQL: formData.instanceConfig.enableYSQL,
    enableYSQLAuth: formData.instanceConfig.enableYSQLAuth,
    ysqlPassword: formData.instanceConfig.ysqlPassword,
    enableYCQL: formData.instanceConfig.enableYCQL,
    enableYCQLAuth: formData.instanceConfig.enableYCQLAuth,
    ycqlPassword: formData.instanceConfig.ycqlPassword,
    useTimeSync: formData.instanceConfig.useTimeSync,
    enableYEDIS: formData.instanceConfig.enableYEDIS,
    accessKeyCode: formData.advancedConfig.accessKeyCode,
    ybSoftwareVersion: formData.advancedConfig.ybSoftwareVersion,
    enableIPV6: formData.advancedConfig.enableIPV6,
    enableExposingService: formData.advancedConfig.enableExposingService,
    ybcPackagePath: formData.advancedConfig.ybcPackagePath,
    useSystemd: formData.advancedConfig.useSystemd
  };
};

export const createUniverse = async ({
  formData,
  universeContextData
}: {
  mode: clusterModes;
  formData: UniverseFormData;
  universeContextData: UniverseFormContextState;
}) => {
  let response;
  try {
    const configurePayload: UniverseConfigure = {
      ...universeContextData.UniverseConfigureData,
      clusterOperation: 'CREATE',
      currentClusterType: ClusterType.PRIMARY,
      rootCA: formData.instanceConfig.rootCA,
      userAZSelected: false,
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
    const finalPayload = await api.universeConfigure(configurePayload);

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
