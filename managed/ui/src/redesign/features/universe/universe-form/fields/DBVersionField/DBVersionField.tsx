import React, { ChangeEvent, ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { api, QUERY_KEY } from '../../../../../helpers/api';
import { YBLabel, YBAutoComplete } from '../../../../../components';
import { DEFAULT_ADVANCED_CONFIG, UniverseFormData } from '../../utils/dto';
import { sortVersionStrings } from './DBVersionHelper';

interface DBVersionFieldProps {
  disabled?: boolean;
}

const getOptionLabel = (option: Record<string, string>): string => option.label ?? '';
const renderOption = (option: Record<string, string>): string => option.label;

const DB_VERSION_FIELD_NAME = 'advancedConfig.ybSoftwareVersion';
const PROVIDER_FIELD_NAME = 'cloudConfig.provider';

const transformData = (data: string[]) => {
  return data.map((item) => ({
    label: item,
    value: item
  }));
};

export const DBVersionField = ({ disabled }: DBVersionFieldProps): ReactElement => {
  const { control, setValue, getValues } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();
  const provider = useWatch({ name: PROVIDER_FIELD_NAME });

  const { data, isLoading } = useQuery(
    [QUERY_KEY.getDBVersionsByProvider, provider?.uuid],
    () => api.getDBVersionsByProvider(provider?.uuid),
    {
      enabled: !!provider?.uuid,
      onSuccess: (data) => {
        //pre-select first available db version
        const sorted: Record<string, string>[] = sortVersionStrings(data);
        if (!getValues(DB_VERSION_FIELD_NAME) && sorted.length) {
          setValue(DB_VERSION_FIELD_NAME, sorted[0].value, { shouldValidate: true });
        }
      },
      select: transformData
    }
  );

  const handleChange = (e: ChangeEvent<{}>, option: any) => {
    setValue(DB_VERSION_FIELD_NAME, option?.value ?? DEFAULT_ADVANCED_CONFIG.ybSoftwareVersion, {
      shouldValidate: true
    });
  };

  const dbVersions: Record<string, string>[] = data ? sortVersionStrings(data) : [];

  return (
    <Controller
      name={DB_VERSION_FIELD_NAME}
      control={control}
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
