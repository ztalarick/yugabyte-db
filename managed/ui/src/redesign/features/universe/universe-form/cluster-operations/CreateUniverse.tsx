import React, { FC, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { UniverseForm } from '../UniverseForm';
import { ClusterType, ClusterModes, DEFAULT_FORM_DATA, UniverseFormData } from '../utils/dto';
import { UniverseFormContext } from '../UniverseFormContainer';
import { createUniverse } from '../utils/helpers';

interface CreateUniverseProps {}

export const CreateUniverse: FC<CreateUniverseProps> = () => {
  const { t } = useTranslation();
  const [state, formMethods] = useContext(UniverseFormContext);
  const { isLoading } = state;
  const featureFlags = useSelector((state: any) => state.featureFlags);

  useEffect(() => {
    formMethods.initializeForm({
      clusterType: ClusterType.PRIMARY,
      mode: ClusterModes.CREATE
    });
  }, []);

  const onSubmit = (formData: UniverseFormData) => {
    createUniverse({ formData, universeContextData: state, featureFlags });
  };

  if (isLoading) return <>Loading .... </>;

  return (
    <UniverseForm
      defaultFormData={DEFAULT_FORM_DATA}
      title={
        state.clusterType === ClusterType.PRIMARY
          ? t('universeForm.createUniverse')
          : t('universeForm.configReadReplica')
      }
      onFormSubmit={(data: UniverseFormData) => onSubmit(data)}
      onCancel={() => console.log('cancelled')}
      isPrimaryAndRR={true}
    />
  );
};
