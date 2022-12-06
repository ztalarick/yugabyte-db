import React, { FC, useContext } from 'react';
import _ from 'lodash';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { browserHistory } from 'react-router';
import { api, QUERY_KEY } from '../utils/api';
import { UniverseForm } from '../UniverseForm';
import { UniverseFormContext } from '../UniverseFormContainer';
import { YBLoading } from '../../../../../components/common/indicators';
import { getPlacements } from '../fields/PlacementsField/PlacementsFieldHelper';
import {
  createReadReplica,
  filterFormDataByClusterType,
  getAsyncCluster,
  getPrimaryFormData,
  getUserIntent
} from '../utils/helpers';
import {
  ClusterType,
  UniverseFormData,
  ClusterModes,
  UniverseConfigure,
  CloudType,
  NodeDetails,
  NodeState
} from '../utils/dto';

interface CreateReadReplicaProps {
  uuid: string;
}

export const CreateReadReplica: FC<CreateReadReplicaProps> = (props) => {
  const { t } = useTranslation();
  const [contextState, contextMethods] = useContext(UniverseFormContext);
  const { initializeForm, setUniverseResourceTemplate } = contextMethods;
  const { uuid } = props;

  const { isLoading, data: universe } = useQuery(
    [QUERY_KEY.fetchUniverse, uuid],
    () => api.fetchUniverse(uuid),
    {
      onSuccess: async (resp) => {
        //initialize form
        initializeForm({
          universeConfigureTemplate: _.cloneDeep(resp.universeDetails),
          clusterType: ClusterType.ASYNC,
          mode: ClusterModes.CREATE
        });
        //set Universe Resource Template
        const resourceResponse = await api.universeResource(_.cloneDeep(resp.universeDetails));
        setUniverseResourceTemplate(resourceResponse);
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

  if (isLoading || contextState.isLoading) return <YBLoading />;

  if (!universe) return null;

  //get primary form data, filter only async form fields and intitalize the form
  const primaryFormData = getPrimaryFormData(universe.universeDetails);
  const initialFormData = filterFormDataByClusterType(primaryFormData, ClusterType.ASYNC);

  return (
    <UniverseForm
      defaultFormData={initialFormData}
      submitLabel={t('universeForm.actions.addRR')}
      onFormSubmit={(data: UniverseFormData) => onSubmit(data)}
      onCancel={onCancel}
    />
  );
};
