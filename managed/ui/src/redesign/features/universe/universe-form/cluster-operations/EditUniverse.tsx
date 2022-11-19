import React, { FC, useContext } from 'react';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { UniverseForm } from '../UniverseForm';
import { ClusterType, DEFAULT_FORM_DATA, UniverseFormData, ClusterModes } from '../utils/dto';
import { UniverseFormContext } from '../UniverseFormContainer';
import { api, QUERY_KEY } from '../utils/api';
import { getFormData } from '../utils/helpers';

interface EditUniverseProps {
  uuid: string;
}

export const EditUniverse: FC<EditUniverseProps> = ({ uuid }) => {
  const { t } = useTranslation();
  const [state, formMethods] = useContext(UniverseFormContext);

  const { isLoading, data: universe } = useQuery(
    [QUERY_KEY.fetchUniverse, uuid],
    () => api.fetchUniverse(uuid),
    {
      onSuccess: (resp) => {
        formMethods.initializeForm({
          UniverseConfigureData: resp.universeDetails,
          clusterType: ClusterType.PRIMARY,
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

  const renderTitle = (
    <>
      {universe?.name}
      <span>
        {' '}
        <i className="fa fa-chevron-right"></i> {t('universeForm.editUniverse')}{' '}
      </span>
    </>
  );
  if (universe?.universeDetails)
    return (
      <UniverseForm
        defaultFormData={{
          ...DEFAULT_FORM_DATA,
          ...getFormData(universe.universeDetails, ClusterType.PRIMARY)
        }}
        title={renderTitle}
        onFormSubmit={onSubmit}
        onCancel={() => console.log('cancelled')}
      />
    );
  else return <></>;
};
