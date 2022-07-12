import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { YBInputField, YBLabel } from '../../../../../components';
import { UniverseFormData } from '../../utils/dto';

interface YBCFieldProps {
  disabled?: boolean;
}

export const YBCField = ({ disabled }: YBCFieldProps): ReactElement => {
  const { control } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();

  return (
    <Box display="flex" width="100%">
      <YBLabel>{t('universeForm.advancedConfig.ybcPackagePath')}</YBLabel>
      <Box flex={1}>
        <YBInputField
          control={control}
          name={'advancedConfig.ybcPackagePath'}
          fullWidth
          disabled={disabled}
          inputProps={{
            autoFocus: true,
            'data-testid': 'ybcPackage'
          }}
        />
      </Box>
    </Box>
  );
};

//show if enableYbc feature flag enabled
