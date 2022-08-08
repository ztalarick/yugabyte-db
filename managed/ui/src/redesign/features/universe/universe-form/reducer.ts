import { clusterModes, UniverseConfigure } from './utils/dto';

interface FormContextState {
  mode: clusterModes;
  isPrimary?: boolean;
  UniverseConfigureData?: UniverseConfigure | null;
}

export const initialState: FormContextState = {
  mode: clusterModes.NEW_PRIMARY,
  isPrimary: true,
  UniverseConfigureData: null
};

//custom form methods wrapped for form
export const createFormMethods = (state: FormContextState) => ({
  setUniverseConfigureData: (data: UniverseConfigure): FormContextState => ({
    ...state,
    UniverseConfigureData: data
  })
});
