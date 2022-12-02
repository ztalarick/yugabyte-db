import React, { FC, useContext, useState } from 'react';
import _ from 'lodash';
import { useQuery } from 'react-query';
import { browserHistory } from 'react-router';
import { api, QUERY_KEY } from '../utils/api';
import { UniverseForm } from '../UniverseForm';
import { UniverseFormContext } from '../UniverseFormContainer';
import { YBLoading } from '../../../../../components/common/indicators';
import { getPlacements } from '../fields/PlacementsField/PlacementsFieldHelper';
import {
  editReadReplica,
  getAsyncCluster,
  getAsyncFormData,
  getUserIntent
} from '../utils/helpers';
import {
  ClusterType,
  UniverseFormData,
  ClusterModes,
  UniverseConfigure,
  CloudType
} from '../utils/dto';
import { DeleteClusterModal } from './action-modals/DeleteClusterModal';

interface EditReadReplicaProps {
  uuid: string;
}

export const EditReadReplica: FC<EditReadReplicaProps> = ({ uuid }) => {
  const [contextState, contextMethods] = useContext(UniverseFormContext);

  const [showDeleteRRModal, setShowDeleteRRModal] = useState(false);

  const { isLoading, data: universe } = useQuery(
    [QUERY_KEY.fetchUniverse, uuid],
    () => api.fetchUniverse(uuid),
    {
      onSuccess: (resp) => {
        contextMethods.initializeForm({
          universeConfigureTemplate: _.cloneDeep(resp.universeDetails),
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
      expectedUniverseVersion: universe?.version,
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

    editReadReplica(configurePayload);
  };

  const onCancel = () => {
    browserHistory.goBack();
  };

  if (isLoading || contextState.isLoading) return <YBLoading />;

  if (!universe) return null;

  //get async form data and intitalize the form
  const initialFormData = getAsyncFormData(universe.universeDetails);

  if (universe?.universeDetails)
    return (
      <>
        {showDeleteRRModal && (
          <DeleteClusterModal
            open={showDeleteRRModal}
            onClose={() => setShowDeleteRRModal(false)}
            universeData={universe.universeDetails}
          />
        )}
        <UniverseForm
          defaultFormData={initialFormData}
          onFormSubmit={(data: UniverseFormData) => onSubmit(data)}
          onCancel={onCancel}
          onDeleteRR={() => setShowDeleteRRModal(true)}
        />
      </>
    );
  else return <></>;
};
