import React, { ReactElement } from 'react';
import { Box, Grid } from '@material-ui/core';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { UniverseFormData } from '../../utils/dto';
import { YBLabel, YBHelper, YBPasswordField, YBToggleField } from '../../../../../components';
import {
  YSQL_FIELD,
  YSQL_AUTH_FIELD,
  YSQL_PASSWORD_FIELD,
  YSQL_CONFIRM_PASSWORD_FIELD
} from '../../utils/constants';
interface YSQLFieldProps {
  disabled: boolean;
}

export const YSQLField = ({ disabled }: YSQLFieldProps): ReactElement => {
  const {
    control,
    formState: { errors }
  } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();

  const ysqlEnabled = useWatch({ name: YSQL_FIELD });
  const ysqlAuthEnabled = useWatch({ name: YSQL_AUTH_FIELD });

  return (
    <Box display="flex" width="100%" flexDirection="column">
      <Box display="flex">
        <YBLabel>{t('universeForm.instanceConfig.enableYSQL')}</YBLabel>
        <Box flex={1}>
          <YBToggleField
            name={YSQL_FIELD}
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
                name={YSQL_AUTH_FIELD}
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
                        name={YSQL_PASSWORD_FIELD}
                        control={control}
                        fullWidth
                        inputProps={{
                          autoComplete: 'new-password',
                          'data-testid': 'InputYsqlPassword'
                        }}
                        error={!!errors?.instanceConfig?.ysqlPassword}
                        helperText={errors?.instanceConfig?.ysqlPassword?.message}
                      />
                    </Box>
                  </Box>
                </Grid>
                <Grid item sm={12} lg={6}>
                  <Box display="flex">
                    <YBLabel>{t('universeForm.instanceConfig.confirmPassword')}</YBLabel>
                    <Box flex={1}>
                      <YBPasswordField
                        name={YSQL_CONFIRM_PASSWORD_FIELD}
                        control={control}
                        fullWidth
                        inputProps={{
                          autoComplete: 'new-password',
                          'data-testid': 'InputConfirmYsqlPassword'
                        }}
                        error={!!errors?.instanceConfig?.ysqlConfirmPassword}
                        helperText={errors?.instanceConfig?.ysqlConfirmPassword?.message}
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

//shown only for aws, gcp, azu, on-pre, k8s
//disabled for non primary cluster
