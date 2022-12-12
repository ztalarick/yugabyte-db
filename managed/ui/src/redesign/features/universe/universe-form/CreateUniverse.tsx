import React, { FC, useContext } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useUpdateEffect, useEffectOnce } from 'react-use';
import { browserHistory } from 'react-router';
import { UniverseFormContext } from './UniverseFormContainer';
import { UniverseForm } from './form/UniverseForm';
import { YBLoading } from '../../../../components/common/indicators';
import { getPlacements } from './form/fields/PlacementsField/PlacementsFieldHelper';
import {
  createUniverse,
  filterFormDataByClusterType,
  getAsyncCopyFields,
  getUserIntent
} from './utils/helpers';
import {
  ClusterType,
  ClusterModes,
  DEFAULT_FORM_DATA,
  UniverseFormData,
  CloudType,
  UniverseConfigure
} from './utils/dto';

export const CreateUniverse: FC = () => {
  const { t } = useTranslation();
  const [contextState, contextMethods] = useContext(UniverseFormContext);
  const { asyncFormData, clusterType, isLoading, primaryFormData } = contextState;
  const {
    initializeForm,
    setPrimaryFormData,
    setAsyncFormData,
    setLoader,
    toggleClusterType
  } = contextMethods;
  const featureFlags = useSelector((state: any) => state.featureFlags);
  const isPrimary = clusterType === ClusterType.PRIMARY;

  useEffectOnce(() => {
    initializeForm({
      clusterType: ClusterType.PRIMARY,
      mode: ClusterModes.CREATE,
      newUniverse: true
    });
  });

  useUpdateEffect(() => {
    toggleClusterType(ClusterType.ASYNC);
  }, [primaryFormData]);

  useUpdateEffect(() => {
    toggleClusterType(ClusterType.PRIMARY);
  }, [asyncFormData]);

  useUpdateEffect(() => {
    setLoader(false);
  }, [clusterType]);

  const onCancel = () => browserHistory.goBack();

  const onSubmit = (primaryData: UniverseFormData, asyncData: UniverseFormData) => {
    const configurePayload: UniverseConfigure = {
      clusterOperation: ClusterModes.CREATE,
      currentClusterType: contextState.clusterType,
      rootCA: primaryData.instanceConfig.rootCA,
      userAZSelected: false,
      resetAZConfig: false,
      enableYbc: featureFlags.released.enableYbc || featureFlags.test.enableYbc,
      communicationPorts: primaryData.advancedConfig.communicationPorts,
      mastersInDefaultRegion: !!primaryData?.cloudConfig?.mastersInDefaultRegion,
      encryptionAtRestConfig: {
        key_op: primaryData.instanceConfig.enableEncryptionAtRest ? 'ENABLE' : 'UNDEFINED'
      },
      clusters: [
        {
          clusterType: ClusterType.PRIMARY,
          userIntent: getUserIntent({ formData: primaryData }),
          placementInfo: {
            cloudList: [
              {
                uuid: primaryData.cloudConfig.provider?.uuid as string,
                code: primaryData.cloudConfig.provider?.code as CloudType,
                regionList: getPlacements(primaryData),
                defaultRegion: primaryData.cloudConfig.defaultRegion
              }
            ]
          }
        }
      ]
    };
    if (asyncData) {
      configurePayload.clusters?.push({
        clusterType: ClusterType.ASYNC,
        userIntent: getUserIntent({ formData: asyncData }),
        placementInfo: {
          cloudList: [
            {
              uuid: asyncData.cloudConfig.provider?.uuid as string,
              code: asyncData.cloudConfig.provider?.code as CloudType,
              regionList: getPlacements(asyncData)
            }
          ]
        }
      });
    }

    if (
      primaryData?.instanceConfig?.enableEncryptionAtRest &&
      primaryData?.instanceConfig?.kmsConfig &&
      configurePayload.encryptionAtRestConfig
    ) {
      configurePayload.encryptionAtRestConfig.configUUID = primaryData.instanceConfig.kmsConfig;
    }
    createUniverse({ configurePayload, universeContextData: contextState });
  };

  if (isLoading) return <YBLoading />;

  if (isPrimary)
    return (
      <UniverseForm
        defaultFormData={primaryFormData ?? DEFAULT_FORM_DATA}
        onFormSubmit={(data: UniverseFormData) =>
          onSubmit(
            data,
            asyncFormData ? { ...asyncFormData, ...getAsyncCopyFields(primaryFormData) } : null
          )
        }
        submitLabel={t('common.create')}
        onCancel={onCancel}
        onClusterTypeChange={(data: UniverseFormData) => {
          setLoader(true);
          setPrimaryFormData(data);
        }}
        isNewUniverse //Mandatory flag for new universe flow
        key={ClusterType.PRIMARY}
      />
    );
  else
    return (
      <UniverseForm
        defaultFormData={
          asyncFormData
            ? { ...asyncFormData, ...getAsyncCopyFields(primaryFormData) } //Not all the fields needs to be copied from primary -> async
            : filterFormDataByClusterType(primaryFormData, ClusterType.ASYNC)
        }
        onFormSubmit={(data: UniverseFormData) => onSubmit(primaryFormData, data)}
        onCancel={onCancel}
        submitLabel={t('common.create')}
        onClusterTypeChange={(data: UniverseFormData) => {
          setLoader(true);
          setAsyncFormData(data);
        }}
        isNewUniverse //Mandatory flag for new universe flow
        key={ClusterType.ASYNC}
      />
    );
};
