import React, { createContext, FC } from 'react';
import { clusterModes, UniverseConfigure, ClusterType, ClusterModes } from './utils/dto';
import { useFormMainStyles } from './universeMainStyle';
import { Typography, Grid, Box } from '@material-ui/core';
import { useMethods } from 'react-use';
import { useTranslation } from 'react-i18next';
// import { useParams, useLocation } from 'react-router-dom';
import { RouteComponentProps } from 'react-router-dom';
import { CreateUniverse } from './CreateUniverse';
import { EditUniverse } from './EditUniverse';

interface UniverseFormContextState {
  clusterType: ClusterType;
  isPrimary?: boolean;
  UniverseConfigureData?: UniverseConfigure | null;
  FormData?: UniverseConfigure | null;
  mode: ClusterModes;
}

const initialState: UniverseFormContextState = {
  clusterType: ClusterType.PRIMARY,
  isPrimary: true,
  UniverseConfigureData: null,
  FormData: null,
  mode: ClusterModes.CREATE
};

const createFormMethods = (state: UniverseFormContextState) => ({
  setUniverseConfigureData: (data: UniverseConfigure): UniverseFormContextState => ({
    ...state,
    UniverseConfigureData: data
  }),
  toggleClusterType: (type: ClusterType) => ({
    ...state,
    clusterType: type === ClusterType.PRIMARY ? ClusterType.ASYNC : ClusterType.PRIMARY
  })
});

export const UniverseFormContext = createContext<any>(initialState);
export type FormContextMethods = ReturnType<typeof createFormMethods>;
interface UniverseFormContainerProps {
  mode: ClusterModes;
  pathname: string;
  uuid: string;
  clusterType: string;
}

export const UniverseFormContainer: FC<RouteComponentProps<{}, UniverseFormContainerProps>> = ({
  location,
  params
}) => {
  const classes = useFormMainStyles();
  const { t } = useTranslation();

  const universeContextData = useMethods(createFormMethods, initialState);

  return (
    <Box className={classes.mainConatiner}>
      <UniverseFormContext.Provider value={universeContextData}>
        {location.pathname === '/universe/new' && <CreateUniverse />}
        {params.mode === ClusterModes.EDIT && params.clusterType == ClusterType.PRIMARY && (
          <EditUniverse />
        )}
      </UniverseFormContext.Provider>
    </Box>
  );
};
