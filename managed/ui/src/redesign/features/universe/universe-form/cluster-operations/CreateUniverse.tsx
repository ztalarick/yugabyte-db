import React, { FC, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { UniverseForm } from '../UniverseForm';
import { ClusterType, ClusterModes, DEFAULT_FORM_DATA, UniverseFormData } from '../utils/dto';
import { UniverseFormContext } from '../UniverseFormContainer';
import { createUniverse } from '../utils/helpers';
import { useUpdateEffect } from 'react-use';

interface CreateUniverseProps {}

export const CreateUniverse: FC<CreateUniverseProps> = () => {
  const { t } = useTranslation();
  const [state, formMethods] = useContext(UniverseFormContext);
  const { isLoading, PrimaryFormData, AsyncFormData, clusterType } = state;
  const featureFlags = useSelector((state: any) => state.featureFlags);

  const onSubmit = (formData: UniverseFormData) => {
    createUniverse({ formData, universeContextData: state, featureFlags });
  };

  useEffect(() => {
    formMethods.initializeForm({
      clusterType: ClusterType.PRIMARY,
      mode: ClusterModes.CREATE
    });
  }, []);

  useUpdateEffect(() => {
    formMethods.toggleClusterType(ClusterType.ASYNC);
  }, [PrimaryFormData]);

  useUpdateEffect(() => {
    formMethods.toggleClusterType(ClusterType.PRIMARY);
  }, [AsyncFormData]);

  useUpdateEffect(() => {
    formMethods.setLoader(false);
  }, [clusterType]);

  if (isLoading) return <>Loading .... </>;

  if (state.clusterType === ClusterType.PRIMARY)
    return (
      <UniverseForm
        defaultFormData={PrimaryFormData ?? DEFAULT_FORM_DATA}
        title={t('universeForm.createUniverse')}
        onFormSubmit={(data: UniverseFormData) => onSubmit(data)}
        onCancel={() => console.log('cancelled')}
        onClusterTypeChange={(data: UniverseFormData) => {
          formMethods.setLoader(true);
          formMethods.setPrimaryFormData(data);
        }}
        key={ClusterType.PRIMARY}
      />
    );
  else
    return (
      <UniverseForm
        defaultFormData={AsyncFormData ?? PrimaryFormData}
        title={t('universeForm.configReadReplica')}
        onFormSubmit={(data: UniverseFormData) => console.log(data)}
        onCancel={() => console.log('cancelled')}
        onClusterTypeChange={(data: UniverseFormData) => {
          formMethods.setLoader(true);
          formMethods.setAsyncFormData(data);
        }}
        key={ClusterType.ASYNC}
      />
    );
};
