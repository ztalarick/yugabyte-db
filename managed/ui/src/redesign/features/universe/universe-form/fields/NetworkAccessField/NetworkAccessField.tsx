import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { UniverseFormData, ExposingServiceTypes } from '../../utils/dto';
import { YBLabel, YBHelper, YBToggle } from '../../../../../components';
import { EXPOSING_SERVICE_FIELD } from '../../utils/constants';

interface NetworkAccessFieldProps {
  disabled: boolean;
}

export const NetworkAccessField = ({ disabled }: NetworkAccessFieldProps): ReactElement => {
  const { setValue } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();
  const value = useWatch({ name: EXPOSING_SERVICE_FIELD });

  const handleChange = (event: any) => {
    setValue(
      EXPOSING_SERVICE_FIELD,
      event.target.checked ? ExposingServiceTypes.EXPOSED : ExposingServiceTypes.UNEXPOSED
    );
  };

  return (
    <Box display="flex" width="100%">
      <YBLabel>{t('universeForm.advancedConfig.enableNetworkAccess')}</YBLabel>
      <Box flex={1}>
        <YBToggle
          inputProps={{
            'data-testid': 'enableNetworkAccess'
          }}
          disabled={disabled}
          onChange={handleChange}
          checked={value === ExposingServiceTypes.EXPOSED}
        />
        <YBHelper>{t('universeForm.advancedConfig.enableNetworkAccessHelper')}</YBHelper>
      </Box>
    </Box>
  );
};

//shown only for k8s
