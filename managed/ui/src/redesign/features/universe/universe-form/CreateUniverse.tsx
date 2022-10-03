import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { UniverseForm } from './UniverseForm';
import { ClusterType, DEFAULT_FORM_DATA, UniverseFormData } from './utils/dto';
import { UniverseFormContext } from './UniverseFormContainer';

interface CreateUniverseProps {}

export const CreateUniverse: FC<CreateUniverseProps> = (props) => {
  const { t } = useTranslation();
  const [state, formMethods] = useContext(UniverseFormContext);

  if (state.clusterType === ClusterType.PRIMARY)
    return (
      <UniverseForm
        defaultFormData={DEFAULT_FORM_DATA}
        title={t('universeForm.createUniverse')}
        onFormSubmit={(data: UniverseFormData) => console.log(data)}
        onCancel={() => console.log('cancelled')}
        onClusterTypeChange={(data: UniverseFormData, type: ClusterType) => {
          console.log(data, type);
          formMethods.toggleClusterType(type);
        }}
      />
    );
  else
    return (
      <UniverseForm
        defaultFormData={DEFAULT_FORM_DATA}
        title={t('universeForm.configReadReplica')}
        onFormSubmit={(data: UniverseFormData) => console.log(data)}
        onCancel={() => console.log('cancelled')}
        onClusterTypeChange={(data: UniverseFormData, type: ClusterType) => {
          console.log(data, type);
          formMethods.toggleClusterType(type);
        }}
      />
    );
};
