import React, { FC, ChangeEvent } from 'react';
import { Box } from '@material-ui/core';
import { Controller, useFormContext } from 'react-hook-form';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { api, QUERY_KEY } from '../../../../../helpers/api';
import { UniverseFormData } from '../../utils/dto';
import { KmsConfig } from '../../../../../helpers/dtos';
import { YBLabel, YBAutoComplete } from '../../../../../components';

const renderOption = (op: Record<string, string>): string => {
  const option = (op as unknown) as KmsConfig;
  return option.metadata.name;
};

const getOptionLabel = (op: Record<string, string>): string => {
  const option = (op as unknown) as KmsConfig;
  return option?.metadata?.name ?? '';
};

interface KMSConfigFieldProps {
  disabled: boolean;
}

const FIELD_NAME = 'instanceConfig.kmsConfig';

export const KMSConfigField: FC<KMSConfigFieldProps> = ({ disabled }) => {
  const { setValue } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();

  //feature flagging
  const featureFlags = useSelector((state: any) => state.featureFlags);
  const isHCVaultEnabled = featureFlags.test.enableHCVault || featureFlags.released.enableHCVault;

  //fetch data
  const { data } = useQuery(QUERY_KEY.getKMSConfigs, api.getKMSConfigs);
  let kmsConfigs: KmsConfig[] = data || [];
  if (!isHCVaultEnabled)
    kmsConfigs = kmsConfigs.filter((config: KmsConfig) => config.metadata.provider !== 'HASHICORP');

  const handleChange = (e: ChangeEvent<{}>, option: any) => {
    console.log('op', option);
    setValue(FIELD_NAME, option.metadata.configUUID ?? '');
  };

  return (
    <Controller
      name={FIELD_NAME}
      render={({ field }) => {
        const value = kmsConfigs.find((i) => i.metadata.configUUID === field.value) ?? '';
        return (
          <Box display="flex" width="100%">
            <YBLabel>{t('universeForm.instanceConfig.kmsConfig')}</YBLabel>
            <Box flex={1}>
              <YBAutoComplete
                options={(kmsConfigs as unknown) as Record<string, string>[]}
                ybInputProps={{
                  placeholder: t('universeForm.instanceConfig.kmsConfigPlaceHolder')
                }}
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
