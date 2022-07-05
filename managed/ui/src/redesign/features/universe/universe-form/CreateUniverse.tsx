import React, { FC } from 'react';
import { UniverseForm } from './UniverseForm';
import { RouteComponentProps } from 'react-router-dom';
import { DEFAULT_FORM_DATA, clusterModes } from './utils/dto';

interface CreateUniverseProps {}

export const CreateUniverse: FC<RouteComponentProps<{}, CreateUniverseProps>> = (props) => {
  const isPrimary = props?.location?.pathname === '/universe/new';

  return (
    <UniverseForm
      defaultFormData={DEFAULT_FORM_DATA}
      mode={isPrimary ? clusterModes.NEW_PRIMARY : clusterModes.NEW_ASYNC}
      title={isPrimary ? 'Create Universe' : 'Universe Name >> Configure Read Replica'}
    />
  );
};
