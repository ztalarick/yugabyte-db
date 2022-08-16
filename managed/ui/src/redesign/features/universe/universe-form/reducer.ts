import { clusterModes, UniverseConfigure } from './utils/dto';

export interface UniverseFormContextState {
  mode: clusterModes;
  isPrimary?: boolean;
  UniverseConfigureData?: UniverseConfigure | null;
}

export const initialState: UniverseFormContextState = {
  mode: clusterModes.NEW_PRIMARY,
  isPrimary: true,
  UniverseConfigureData: null
};

//custom form methods wrapped for form
export const createFormMethods = (state: UniverseFormContextState) => ({
  setUniverseConfigureData: (data: UniverseConfigure): UniverseFormContextState => ({
    ...state,
    UniverseConfigureData: data
  })
});
