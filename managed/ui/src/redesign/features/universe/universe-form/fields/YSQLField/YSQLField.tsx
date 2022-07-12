import React, { ReactElement } from 'react';
import { Box, Grid } from '@material-ui/core';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { UniverseFormData } from '../../utils/dto';
import { YBLabel, YBHelper, YBPasswordField, YBToggleField } from '../../../../../components';

interface YSQLFieldProps {
  disabled: boolean;
}

const YSQL_FIELD_NAME = 'instanceConfig.enableYSQL';
const YSQL_AUTH_FIELD_NAME = 'instanceConfig.enableYSQLAuth';

export const YSQLField = ({ disabled }: YSQLFieldProps): ReactElement => {
  const { control } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();

  const ysqlEnabled = useWatch({ name: YSQL_FIELD_NAME });
  const ysqlAuthEnabled = useWatch({ name: YSQL_AUTH_FIELD_NAME });

  return (
    <Box display="flex" width="100%" flexDirection="column">
      <Box display="flex">
        <YBLabel>{t('universeForm.instanceConfig.enableYSQL')}</YBLabel>
        <Box flex={1}>
          <YBToggleField
            name={YSQL_FIELD_NAME}
            inputProps={{
              'data-testid': 'YSQL'
            }}
            control={control}
            disabled={disabled}
          />
          <YBHelper>{t('universeForm.instanceConfig.enableYSQLHelper')}</YBHelper>
        </Box>
      </Box>

      {ysqlEnabled && (
        <Box mt={1}>
          <Box display="flex">
            <YBLabel>{t('universeForm.instanceConfig.enableYSQLAuth')}</YBLabel>
            <Box flex={1}>
              <YBToggleField
                name={YSQL_AUTH_FIELD_NAME}
                inputProps={{
                  'data-testid': 'YSQLAuth'
                }}
                control={control}
                disabled={disabled}
              />
              <YBHelper>{t('universeForm.instanceConfig.enableYSQLAuthHelper')}</YBHelper>
            </Box>
          </Box>

          {ysqlAuthEnabled && (
            <Box display="flex">
              <Grid container spacing={3}>
                <Grid item sm={12} lg={6}>
                  <Box display="flex">
                    <YBLabel>{t('universeForm.instanceConfig.YSQLAuthPassword')}</YBLabel>
                    <Box flex={1}>
                      <YBPasswordField
                        name="instanceConfig.ysqlPassword"
                        control={control}
                        fullWidth
                        inputProps={{
                          autoComplete: 'new-password',
                          'data-testid': 'InputYsqlPassword'
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
                        name="instanceConfig.ysqlConfirmPassword"
                        control={control}
                        fullWidth
                        inputProps={{
                          autoComplete: 'new-password',
                          'data-testid': 'InputConfirmYsqlPassword'
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
