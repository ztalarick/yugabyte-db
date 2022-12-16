import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext, useWatch } from 'react-hook-form';
import { Box, Grid } from '@material-ui/core';
import { YBLabel, YBHelper, YBToggle } from '../../../../../../components';
import { UniverseFormData, ExposingServiceTypes } from '../../../utils/dto';
import { EXPOSING_SERVICE_FIELD } from '../../../utils/constants';

interface NetworkAccessFieldProps {
  disabled: boolean;
}

export const NetworkAccessField = ({ disabled }: NetworkAccessFieldProps): ReactElement => {
  const { setValue } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();
  //watchers
  const exposingServiceValue = useWatch({ name: EXPOSING_SERVICE_FIELD });

  const handleChange = (event: any) => {
    setValue(
      EXPOSING_SERVICE_FIELD,
      event.target.checked ? ExposingServiceTypes.EXPOSED : ExposingServiceTypes.UNEXPOSED
    );
  };

  return (
    <Box display="flex" width="100%" data-testid="DBVersionField-Container">
      <Grid container alignItems="center">
        <Grid item sm={8} lg={4}>
          <YBLabel dataTestId="NetworkAccessField-Label">
            {t('universeForm.advancedConfig.enableNetworkAccess')}
          </YBLabel>
        </Grid>
        <Grid item sm={12} lg={8}>
          <YBToggle
            inputProps={{
              'data-testid': 'NetworkAccessField-Toggle'
            }}
            disabled={disabled}
            onChange={handleChange}
            checked={exposingServiceValue === ExposingServiceTypes.EXPOSED}
          />
          <YBHelper dataTestId="NetworkAccessField-Helper">
            {t('universeForm.advancedConfig.enableNetworkAccessHelper')}
          </YBHelper>
        </Grid>
      </Grid>
    </Box>
  );
};

//shown only for k8s
