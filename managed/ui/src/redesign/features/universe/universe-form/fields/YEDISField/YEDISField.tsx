import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { UniverseFormData } from '../../utils/dto';
import { YBLabel, YBHelper, YBToggleField } from '../../../../../components';
import { YEDIS_FIELD } from '../../utils/constants';
interface YEDISFieldProps {
  disabled: boolean;
}

export const YEDISField = ({ disabled }: YEDISFieldProps): ReactElement => {
  const { control } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();

  return (
    <Box display="flex" width="100%">
      <YBLabel>{t('universeForm.instanceConfig.enableYEDIS')}</YBLabel>
      <Box flex={1}>
        <YBToggleField
          name={YEDIS_FIELD}
          inputProps={{
            'data-testid': 'Yedis'
          }}
          control={control}
          disabled={disabled}
        />
        <YBHelper>{t('universeForm.instanceConfig.enableYEDISHelper')}</YBHelper>
      </Box>
    </Box>
  );
};

//shown only for aws, gcp, azu, on-pre, k8s
//disabled for non primary cluster
