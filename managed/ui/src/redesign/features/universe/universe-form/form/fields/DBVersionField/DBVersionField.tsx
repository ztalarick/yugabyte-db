import React, { ChangeEvent, ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { api, QUERY_KEY } from '../../../utils/api';
import { YBLabel, YBAutoComplete } from '../../../../../../components';
import { DEFAULT_ADVANCED_CONFIG, UniverseFormData } from '../../../utils/dto';
import { sortVersionStrings } from './DBVersionHelper';
import { SOFTWARE_VERSION_FIELD, PROVIDER_FIELD } from '../../../utils/constants';

interface DBVersionFieldProps {
  disabled?: boolean;
}

const getOptionLabel = (option: Record<string, string>): string => option.label ?? '';
const renderOption = (option: Record<string, string>): string => option.label;

const transformData = (data: string[]) => {
  return data.map((item) => ({
    label: item,
    value: item
  }));
};

export const DBVersionField = ({ disabled }: DBVersionFieldProps): ReactElement => {
  const { control, setValue, getValues } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();
  const provider = useWatch({ name: PROVIDER_FIELD });

  const { data, isLoading } = useQuery(
    [QUERY_KEY.getDBVersionsByProvider, provider?.uuid],
    () => api.getDBVersionsByProvider(provider?.uuid),
    {
      enabled: !!provider?.uuid,
      onSuccess: (data) => {
        //pre-select first available db version
        const sorted: Record<string, string>[] = sortVersionStrings(data);
        if (!getValues(SOFTWARE_VERSION_FIELD) && sorted.length) {
          setValue(SOFTWARE_VERSION_FIELD, sorted[0].value, { shouldValidate: true });
        }
      },
      select: transformData
    }
  );

  const handleChange = (e: ChangeEvent<{}>, option: any) => {
    setValue(SOFTWARE_VERSION_FIELD, option?.value ?? DEFAULT_ADVANCED_CONFIG.ybSoftwareVersion, {
      shouldValidate: true
    });
  };

  const dbVersions: Record<string, string>[] = data ? sortVersionStrings(data) : [];

  return (
    <Controller
      name={SOFTWARE_VERSION_FIELD}
      control={control}
      rules={{
        required: !disabled
          ? (t('universeForm.validation.required', {
              field: t('universeForm.advancedConfig.dbVersion')
            }) as string)
          : ''
      }}
      render={({ field, fieldState }) => {
        const value = dbVersions.find((item) => item.value === field.value) ?? '';
        return (
          <Box display="flex" width="100%">
            <YBLabel>{t('universeForm.advancedConfig.dbVersion')}</YBLabel>
            <Box flex={1}>
              <YBAutoComplete
                disabled={disabled}
                loading={isLoading}
                options={(dbVersions as unknown) as Record<string, string>[]}
                getOptionLabel={getOptionLabel}
                renderOption={renderOption}
                onChange={handleChange}
                value={(value as unknown) as never}
                ybInputProps={{
                  error: !!fieldState.error,
                  helperText: fieldState.error?.message
                }}
              />
            </Box>
          </Box>
        );
      }}
    />
  );
};
