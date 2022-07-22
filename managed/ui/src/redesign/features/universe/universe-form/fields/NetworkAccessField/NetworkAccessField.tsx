import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { UniverseFormData } from '../../utils/dto';
import { YBLabel, YBHelper, YBToggleField } from '../../../../../components';

interface NetworkAccessFieldProps {
  disabled: boolean;
}

const NETWORK_ACCESS_FIELD_NAME = 'advancedConfig.enableExposingService';

export const NetworkAccessField = ({ disabled }: NetworkAccessFieldProps): ReactElement => {
  const { control } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();

  return (
    <Box display="flex" width="100%">
      <YBLabel>{t('universeForm.advancedConfig.enableNetworkAccess')}</YBLabel>
      <Box flex={1}>
        <YBToggleField
          name={NETWORK_ACCESS_FIELD_NAME}
          inputProps={{
            'data-testid': 'enableNetworkAccess'
          }}
          control={control}
          disabled={disabled}
        />
        <YBHelper>{t('universeForm.advancedConfig.enableNetworkAccessHelper')}</YBHelper>
      </Box>
    </Box>
  );
};

//shown only for k8s
