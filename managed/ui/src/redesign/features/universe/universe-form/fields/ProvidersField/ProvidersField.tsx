import React, { ChangeEvent, ReactElement } from 'react';
import _ from 'lodash';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { Controller, useFormContext } from 'react-hook-form';
import { Box } from '@material-ui/core';
import { YBLabel, YBAutoComplete } from '../../../../../components';
import { api, QUERY_KEY } from '../../utils/api';
import { UniverseFormData, Provider, DEFAULT_CLOUD_CONFIG } from '../../utils/dto';
import { PROVIDER_FIELD, ACCESS_KEY_FIELD } from '../../utils/constants';

interface ProvidersFieldProps {
  disabled?: boolean;
}

// simplified provider object with bare minimum fields needed in UI
export type ProviderMin = Pick<Provider, 'uuid' | 'code'>;
const getOptionLabel = (option: Record<string, string>): string => option.name;

export const ProvidersField = ({ disabled }: ProvidersFieldProps): ReactElement => {
  const { control, setValue } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();
  const { data, isLoading } = useQuery(QUERY_KEY.getProvidersList, api.getProvidersList);

  //sort by provider code and name
  const providersList = _.sortBy(data || [], 'code', 'name');

  const handleChange = (e: ChangeEvent<{}>, option: any) => {
    if (option) {
      const { code, uuid } = option;
      setValue(PROVIDER_FIELD, { code, uuid }, { shouldValidate: true });

      //Reset fields on provider change
      setValue(ACCESS_KEY_FIELD, null, { shouldValidate: true });
    } else {
      setValue(PROVIDER_FIELD, DEFAULT_CLOUD_CONFIG.provider, { shouldValidate: true });
    }
  };

  return (
    <Box display="flex" width="100%" flexDirection={'row'}>
      <Controller
        name={PROVIDER_FIELD}
        control={control}
        render={({ field, fieldState }) => {
          const value =
            providersList.find((provider) => provider.uuid === field.value?.uuid) || null;
          return (
            <>
              <YBLabel>{t('universeForm.cloudConfig.providerField')}</YBLabel>
              <Box flex={1}>
                <YBAutoComplete
                  loading={isLoading}
                  value={(value as unknown) as Record<string, string>}
                  options={(providersList as unknown) as Record<string, string>[]}
                  groupBy={(option: Record<string, string>) => option.code} //group by code for easy navigation
                  getOptionLabel={getOptionLabel}
                  onChange={handleChange}
                  disabled={disabled}
                  ybInputProps={{
                    error: !!fieldState.error,
                    helperText: fieldState.error?.message
                  }}
                />
              </Box>
            </>
          );
        }}
      />
    </Box>
  );
};
