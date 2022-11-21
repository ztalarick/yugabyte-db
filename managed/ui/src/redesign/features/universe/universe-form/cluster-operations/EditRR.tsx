import React, { FC, useContext } from 'react';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { UniverseForm } from '../UniverseForm';
import { ClusterType, DEFAULT_FORM_DATA, UniverseFormData, ClusterModes } from '../utils/dto';
import { UniverseFormContext } from '../UniverseFormContainer';
import { api, QUERY_KEY } from '../utils/api';
import { getFormData } from '../utils/helpers';

interface EditReadReplicaProps {
  uuid: string;
}

export const EditReadReplica: FC<EditReadReplicaProps> = ({ uuid }) => {
  const { t } = useTranslation();
  const [state, formMethods] = useContext(UniverseFormContext);

  const { isLoading, data: universe } = useQuery(
    [QUERY_KEY.fetchUniverse, uuid],
    () => api.fetchUniverse(uuid),
    {
      onSuccess: (resp) => {
        formMethods.initializeForm({
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
    console.log(formData);
  };

  if (isLoading || state.isLoading) return <>Loading .... </>;

  if (universe?.universeDetails)
    return (
      <UniverseForm
        defaultFormData={{
          ...DEFAULT_FORM_DATA,
          ...getFormData(universe.universeDetails, ClusterType.ASYNC)
        }}
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
