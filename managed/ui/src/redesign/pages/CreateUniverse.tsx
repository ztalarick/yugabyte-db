import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { UniverseForm } from '../features/universe/universe-form/UniverseForm';
import { RouteComponentProps } from 'react-router-dom';
import { DEFAULT_FORM_DATA, clusterModes } from '../features/universe/universe-form/utils/dto';

interface CreateUniverseProps {}

export const CreateUniverse: FC<RouteComponentProps<{}, CreateUniverseProps>> = (props) => {
  const { t } = useTranslation();
  const isPrimary = props?.location?.pathname === '/universe/new';

  return (
    <UniverseForm
      defaultFormData={DEFAULT_FORM_DATA}
      mode={isPrimary ? clusterModes.NEW_PRIMARY : clusterModes.NEW_ASYNC}
      title={
        isPrimary
          ? t('universeForm.createUniverse')
          : `Universe Name >> ${t('universeForm.configReadReplica')}`
      }
    />
  );
};
