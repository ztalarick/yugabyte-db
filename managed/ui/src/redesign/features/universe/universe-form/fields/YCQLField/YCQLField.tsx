import React, { ReactElement } from 'react';
import { Box, Grid } from '@material-ui/core';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { UniverseFormData } from '../../utils/dto';
import { YBLabel, YBHelper, YBPasswordField, YBToggleField } from '../../../../../components';

interface YCQLFieldProps {
  disabled: boolean;
}

const YCQL_FIELD_NAME = 'instanceConfig.enableYCQL';
const YCQL_AUTH_FIELD_NAME = 'instanceConfig.enableYCQLAuth';

export const YCQLField = ({ disabled }: YCQLFieldProps): ReactElement => {
  const { control } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();

  const ycqlEnabled = useWatch({ name: YCQL_FIELD_NAME });
  const ycqlAuthEnabled = useWatch({ name: YCQL_AUTH_FIELD_NAME });

  return (
    <Box display="flex" width="100%" flexDirection="column">
      <Box display="flex">
        <YBLabel>{t('universeForm.instanceConfig.enableYCQL')}</YBLabel>
        <Box flex={1}>
          <YBToggleField
            name={YCQL_FIELD_NAME}
            inputProps={{
              'data-testid': 'YCQL'
            }}
            control={control}
            disabled={disabled}
          />
          <YBHelper>{t('universeForm.instanceConfig.enableYCQLHelper')}</YBHelper>
        </Box>
      </Box>

      {ycqlEnabled && (
        <Box mt={1}>
          <Box display="flex">
            <YBLabel>{t('universeForm.instanceConfig.enableYCQLAuth')}</YBLabel>
            <Box flex={1}>
              <YBToggleField
                name={YCQL_AUTH_FIELD_NAME}
                inputProps={{
                  'data-testid': 'YCQLAuth'
                }}
                control={control}
                disabled={disabled}
              />
              <YBHelper>{t('universeForm.instanceConfig.enableYCQLAuthHelper')}</YBHelper>
            </Box>
          </Box>

          {ycqlAuthEnabled && (
            <Box display="flex">
              <Grid container spacing={3}>
                <Grid item sm={12} lg={6}>
                  <Box display="flex">
                    <YBLabel>{t('universeForm.instanceConfig.YCQLAuthPassword')}</YBLabel>
                    <Box flex={1}>
                      <YBPasswordField
                        name="instanceConfig.ycqlPassword"
                        control={control}
                        fullWidth
                        inputProps={{
                          autoComplete: 'new-password',
                          'data-testid': 'InputYcqlPassword'
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
                <Grid item sm={12} lg={6}>
                  <Box display="flex">
                    <YBLabel>{t('universeForm.instanceConfig.confirmPassword')}</YBLabel>
                    <Box flex={1}>
                      <YBPasswordField
                        name="instanceConfig.ycqlConfirmPassword"
                        control={control}
                        fullWidth
                        inputProps={{
                          autoComplete: 'new-password',
                          'data-testid': 'InputConfirmYcqlPassword'
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};
