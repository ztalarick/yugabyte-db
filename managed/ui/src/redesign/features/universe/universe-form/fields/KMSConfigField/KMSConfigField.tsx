import React, { FC, ChangeEvent } from 'react';
import { Box } from '@material-ui/core';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { api, QUERY_KEY } from '../../utils/api';
import { DEFAULT_INSTANCE_CONFIG, UniverseFormData } from '../../utils/dto';
import { KmsConfig } from '../../../../../helpers/dtos';
import { YBLabel, YBAutoComplete } from '../../../../../components';
import { KMS_CONFIG_FIELD, EAR_FIELD } from '../../utils/constants';

const renderOption = (op: Record<string, string>): string => {
  const option = (op as unknown) as KmsConfig;
  return option.metadata.name;
};

const getOptionLabel = (op: Record<string, string>): string => {
  const option = (op as unknown) as KmsConfig;
  return option?.metadata?.name ?? '';
};

interface KMSConfigFieldProps {
  disabled?: boolean;
}

export const KMSConfigField: FC<KMSConfigFieldProps> = ({ disabled }) => {
  const { setValue, control } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();

  //field data
  const encryptionEnabled = useWatch({ name: EAR_FIELD });

  //fetch data
  const { data, isLoading } = useQuery(QUERY_KEY.getKMSConfigs, api.getKMSConfigs);
  let kmsConfigs: KmsConfig[] = data || [];

  const handleChange = (e: ChangeEvent<{}>, option: any) => {
    setValue(KMS_CONFIG_FIELD, option?.metadata?.configUUID ?? DEFAULT_INSTANCE_CONFIG.kmsConfig, {
      shouldValidate: true
    });
  };

  return (
    <Controller
      name={KMS_CONFIG_FIELD}
      control={control}
      rules={{
        required:
          !disabled && encryptionEnabled
            ? (t('universeForm.validation.required', {
                field: t('universeForm.instanceConfig.kmsConfig')
              }) as string)
            : ''
      }}
      render={({ field, fieldState }) => {
        const value = kmsConfigs.find((i) => i.metadata.configUUID === field.value) ?? '';
        return (
          <Box display="flex" width="100%">
            <YBLabel>{t('universeForm.instanceConfig.kmsConfig')}</YBLabel>
            <Box flex={1}>
              <YBAutoComplete
                disabled={disabled}
                loading={isLoading}
                options={(kmsConfigs as unknown) as Record<string, string>[]}
                ybInputProps={{
                  placeholder: t('universeForm.instanceConfig.kmsConfigPlaceHolder'),
                  error: !!fieldState.error,
                  helperText: fieldState.error?.message,
                  InputProps: { autoFocus: true }
                }}
                ref={field.ref}
                getOptionLabel={getOptionLabel}
                renderOption={renderOption}
                onChange={handleChange}
                value={(value as unknown) as never}
              />
            </Box>
          </Box>
        );
      }}
    />
  );
};

//TODO - Filter HC Vault data based on feature flag -> HCVault
//show only if Encryption at rest enabled
