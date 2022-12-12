import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { UniverseFormData } from '../../../utils/dto';
import { YBLabel, YBHelper, YBToggleField } from '../../../../../../components';
import { IPV6_FIELD } from '../../../utils/constants';

interface IPV6FieldProps {
  disabled: boolean;
}

export const IPV6Field = ({ disabled }: IPV6FieldProps): ReactElement => {
  const { control } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();

  return (
    <Box display="flex" width="100%">
      <YBLabel>{t('universeForm.advancedConfig.enableIPV6')}</YBLabel>
      <Box flex={1}>
        <YBToggleField
          name={IPV6_FIELD}
          inputProps={{
            'data-testid': 'enableIPV6'
          }}
          control={control}
          disabled={disabled}
        />
        <YBHelper>{t('universeForm.advancedConfig.enableIPV6Helper')}</YBHelper>
      </Box>
    </Box>
  );
};

//shown only for k8s
