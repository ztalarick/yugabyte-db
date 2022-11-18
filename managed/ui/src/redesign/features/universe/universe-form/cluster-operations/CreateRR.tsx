import React, { FC, useContext } from 'react';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { UniverseForm } from '../UniverseForm';
import { ClusterType, DEFAULT_FORM_DATA, UniverseFormData, ClusterModes } from '../utils/dto';
import { UniverseFormContext } from '../UniverseFormContainer';
import { api, QUERY_KEY } from '../utils/api';

interface CreateReadReplicaProps {
  uuid: string;
}

export const CreateReadReplica: FC<CreateReadReplicaProps> = (props) => {
  const { t } = useTranslation();
  const [state, formMethods] = useContext(UniverseFormContext);
  const { uuid } = props;

  const { isLoading, data: universe } = useQuery(
    [QUERY_KEY.fetchUniverse, uuid],
    () => api.fetchUniverse(uuid),
    {
      onSuccess: (resp) => {
        //Transform it to form schema
        //initialize form
        formMethods.initializeForm({
          UniverseConfigureData: resp.universeDetails,
          clusterType: ClusterType.ASYNC,
          mode: ClusterModes.CREATE
        });
      }
    }
  );

  const onSubmit = (formData: UniverseFormData) => {
    console.log(formData);
  };

  if (isLoading || state.isLoading) return <>Loading .... </>;
  return (
    <UniverseForm
      defaultFormData={DEFAULT_FORM_DATA}
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
};
