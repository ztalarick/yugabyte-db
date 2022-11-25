import React, { FC, useContext } from 'react';
import _ from 'lodash';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { browserHistory } from 'react-router';
import { UniverseForm } from '../UniverseForm';
import {
  ClusterType,
  UniverseFormData,
  ClusterModes,
  UniverseConfigure,
  CloudType,
  NodeDetails,
  NodeState
} from '../utils/dto';
import { UniverseFormContext } from '../UniverseFormContainer';
import { api, QUERY_KEY } from '../utils/api';
import {
  createReadReplica,
  filterFormDataByClusterType,
  getAsyncCluster,
  getPrimaryFormData,
  getUserIntent
} from '../utils/helpers';
import { getPlacements } from '../fields/PlacementsField/PlacementsFieldHelper';

interface CreateReadReplicaProps {
  uuid: string;
}

export const CreateReadReplica: FC<CreateReadReplicaProps> = (props) => {
  const { t } = useTranslation();
  const [contextState, contextMethods] = useContext(UniverseFormContext);
  const { uuid } = props;

  const { isLoading, data: universe } = useQuery(
    [QUERY_KEY.fetchUniverse, uuid],
    () => api.fetchUniverse(uuid),
    {
      onSuccess: (resp) => {
        //initialize form
        contextMethods.initializeForm({
          universeConfigureTemplate: _.cloneDeep(resp.universeDetails),
          clusterType: ClusterType.ASYNC,
          mode: ClusterModes.CREATE
        });
      }
    }
  );

  const onSubmit = (formData: UniverseFormData) => {
    const configurePayload: UniverseConfigure = {
      ...contextState.universeConfigureTemplate,
      clusterOperation: ClusterModes.CREATE,
      currentClusterType: ClusterType.ASYNC,
      expectedUniverseVersion: universe?.version,
      nodeDetailsSet: contextState.universeConfigureTemplate.nodeDetailsSet.filter(
        (node: NodeDetails) => node.state === NodeState.ToBeAdded
      ),
      clusters: [
        {
          ...getAsyncCluster(contextState.universeConfigureTemplate),
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

    createReadReplica(configurePayload);
  };

  const onCancel = () => {
    browserHistory.goBack();
  };

  if (isLoading || contextState.isLoading) return <>Loading .... </>;

  if (!universe) return null;

  //get primary form data, filter only async form fields and intitalize the form
  const primaryFormData = getPrimaryFormData(universe.universeDetails);
  const initialFormData = filterFormDataByClusterType(primaryFormData, ClusterType.ASYNC);

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
      onCancel={onCancel}
    />
  );
};
