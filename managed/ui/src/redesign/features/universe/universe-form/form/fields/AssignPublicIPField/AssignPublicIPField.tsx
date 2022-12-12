import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { UniverseFormData } from '../../../utils/dto';
import { YBHelper, YBLabel, YBToggleField } from '../../../../../../components';
import { ASSIGN_PUBLIC_IP_FIELD } from '../../../utils/constants';

interface AssignPublicIPFieldProps {
  disabled: boolean;
}

export const AssignPublicIPField = ({ disabled }: AssignPublicIPFieldProps): ReactElement => {
  const { control } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();

  return (
    <Box display="flex" width="100%">
      <YBLabel>{t('universeForm.instanceConfig.assignPublicIP')}</YBLabel>
      <Box flex={1}>
        <YBToggleField
          name={ASSIGN_PUBLIC_IP_FIELD}
          inputProps={{
            'data-testid': 'ToggleUseVPC'
          }}
          control={control}
          disabled={disabled}
        />
        <YBHelper>{t('universeForm.instanceConfig.assignPublicIPHelper')}</YBHelper>
      </Box>
    </Box>
  );
};

//shown only for aws, gcp, azu
//disabled for non primary cluster
