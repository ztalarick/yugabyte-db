import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { YBInputField, YBLabel } from '../../../../../../components';
import { UniverseFormData } from '../../../utils/dto';
import { AWS_ARN_STRING_FIELD } from '../../../utils/constants';

interface ARNFieldProps {
  disabled?: boolean;
}

export const ARNField = ({ disabled }: ARNFieldProps): ReactElement => {
  const { control } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();

  return (
    <Box display="flex" width="100%">
      <YBLabel>{t('universeForm.advancedConfig.instanceProfileARN')}</YBLabel>
      <Box flex={1}>
        <YBInputField
          control={control}
          name={AWS_ARN_STRING_FIELD}
          fullWidth
          disabled={disabled}
          inputProps={{
            'data-testid': 'awsArnString'
          }}
        />
      </Box>
    </Box>
  );
};

//show only for aws provider
