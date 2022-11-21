import React, { FC, useContext } from 'react';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { UniverseForm } from '../UniverseForm';
import {
  ClusterType,
  UniverseFormData,
  ClusterModes,
  UniverseConfigure,
  CloudType
} from '../utils/dto';
import { UniverseFormContext } from '../UniverseFormContainer';
import { api, QUERY_KEY } from '../utils/api';
import {
  editReadReplica,
  getAsyncCluster,
  getAsyncFormData,
  getUserIntent
} from '../utils/helpers';
import { getPlacements } from '../fields/PlacementsField/placementHelper';

interface EditReadReplicaProps {
  uuid: string;
}

export const EditReadReplica: FC<EditReadReplicaProps> = ({ uuid }) => {
  const { t } = useTranslation();
  const [contextState, contextMethods] = useContext(UniverseFormContext);

  const { isLoading, data: universe } = useQuery(
    [QUERY_KEY.fetchUniverse, uuid],
    () => api.fetchUniverse(uuid),
    {
      onSuccess: (resp) => {
        contextMethods.initializeForm({
          universeConfigureTemplate: resp.universeDetails,
          clusterType: ClusterType.ASYNC,
          mode: ClusterModes.EDIT
        });
      },
      onError: (err) => {
        console.log(err);
      }
    }
  );

  const onSubmit = (formData: UniverseFormData) => {
    const configurePayload: UniverseConfigure = {
      ...contextState.universeConfigureTemplate,
      clusterOperation: ClusterModes.EDIT,
      currentClusterType: ClusterType.ASYNC,
      rootCA: universe?.universeDetails.rootCA,
      allowGeoPartitioning: false,
      userAZSelected: true,
      resetAZConfig: false,
      ybcSoftwareVersion: '',
      expectedUniverseVersion: universe?.version,
      clusters: [
        {
          ...getAsyncCluster(contextState.universeConfigureTemplate),
          userIntent: {
            ...getUserIntent({ formData })
          },
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

    editReadReplica(configurePayload);
  };

  if (isLoading || contextState.isLoading) return <>Loading .... </>;

  if (!universe) return null;

  //get async form data and intitalize the form
  const initialFormData = getAsyncFormData(universe.universeDetails);

  if (universe?.universeDetails)
    return (
      <UniverseForm
        defaultFormData={initialFormData}
        title={
          <>
            {universe?.name}
            <span>
              {' '}
              <i className="fa fa-chevron-right"></i> {t('universeForm.configReadReplica')}{' '}
            </span>
          </>
        }
        onFormSubmit={(data: UniverseFormData) => onSubmit(data)}
        onCancel={() => console.log('cancelled')}
      />
    );
  else return <></>;
};
