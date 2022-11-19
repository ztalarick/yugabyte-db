import React, { createContext, FC } from 'react';
import { UniverseConfigure, ClusterType, ClusterModes, UniverseFormData } from './utils/dto';
import { useFormMainStyles } from './universeMainStyle';
import { Box } from '@material-ui/core';
import { useMethods } from 'react-use';
import { RouteComponentProps } from 'react-router-dom';
import {
  CreateUniverse,
  CreateReadReplica,
  EditUniverse,
  EditReadReplica
} from './cluster-operations';

export interface UniverseFormContextState {
  clusterType: ClusterType;
  UniverseConfigureData: UniverseConfigure | null;
  PrimaryFormData?: UniverseFormData | null;
  AsyncFormData?: UniverseFormData | null;
  mode: ClusterModes;
  isLoading: boolean; // To safeguard against bad defaults
}

const initialState: UniverseFormContextState = {
  clusterType: ClusterType.PRIMARY,
  UniverseConfigureData: null,
  PrimaryFormData: null,
  AsyncFormData: null,
  mode: ClusterModes.CREATE,
  isLoading: true
};

//Avoiding using global state since we are using react-query
const createFormMethods = (state: UniverseFormContextState) => ({
  setUniverseConfigureData: (data: UniverseConfigure): UniverseFormContextState => ({
    ...state,
    UniverseConfigureData: data,
    isLoading: false
  }),
  //This method will be used only in case of Create Primary Cluster + Read Replica flow
  setPrimaryFormData: (data: UniverseFormData): UniverseFormContextState => ({
    ...state,
    PrimaryFormData: data
  }),
  setAsyncFormData: (data: UniverseFormData): UniverseFormContextState => ({
    ...state,
    AsyncFormData: data
  }),
  toggleClusterType: (type: ClusterType): UniverseFormContextState => ({
    ...state,
    clusterType: type
  }),
  initializeForm: (data: Partial<UniverseFormContextState>): UniverseFormContextState => ({
    ...state,
    ...data,
    isLoading: false
  }),
  setLoader: (val: boolean): UniverseFormContextState => ({
    ...state,
    isLoading: val
  }),
  reset: (): UniverseFormContextState => initialState
});

export const UniverseFormContext = createContext<any>(initialState);
export type FormContextMethods = ReturnType<typeof createFormMethods>;
interface UniverseFormContainerProps {
  mode: string;
  pathname: string;
  uuid: string;
  clusterType: string;
}

export const UniverseFormContainer: FC<RouteComponentProps<{}, UniverseFormContainerProps>> = ({
  location,
  params
}) => {
  const classes = useFormMainStyles();
  const { clusterType: CLUSTER_TYPE, mode: MODE, uuid } = params;

  //route has it in lower case & enum has it in upper case
  const mode = MODE?.toUpperCase();
  const clusterType = CLUSTER_TYPE?.toUpperCase();

  const universeContextData = useMethods(createFormMethods, initialState);

  const switchInternalRoutes = () => {
    //Create Primary + RR
    if (location.pathname === '/universe/new') return <CreateUniverse />;
    //NEW ASYNC
    else if (mode === ClusterModes.CREATE && clusterType === ClusterType.ASYNC)
      return <CreateReadReplica uuid={uuid} />;
    //EDIT PRIMARY
    else if (mode === ClusterModes.EDIT && clusterType === ClusterType.PRIMARY)
      return <EditUniverse uuid={uuid} />;
    //EDIT ASYNC
    else if (mode === ClusterModes.EDIT && clusterType === ClusterType.ASYNC)
      return <EditReadReplica uuid={uuid} />;
    //Page not found
    else return <div>Page not found</div>;
  };

  return (
    <Box className={classes.mainConatiner}>
      <UniverseFormContext.Provider value={universeContextData}>
        {switchInternalRoutes()}
      </UniverseFormContext.Provider>
    </Box>
  );
};
