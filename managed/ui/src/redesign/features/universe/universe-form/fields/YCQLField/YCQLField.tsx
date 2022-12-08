import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateEffect } from 'react-use';
import { Box, Grid } from '@material-ui/core';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  YBLabel,
  YBHelper,
  YBPasswordField,
  YBToggleField,
  YBTooltip
} from '../../../../../components';
import { UniverseFormData } from '../../utils/dto';
import {
  YCQL_AUTH_FIELD,
  YCQL_FIELD,
  YCQL_PASSWORD_FIELD,
  YCQL_CONFIRM_PASSWORD_FIELD,
  PASSWORD_REGEX,
  YSQL_FIELD
} from '../../utils/constants';
interface YCQLFieldProps {
  disabled: boolean;
  isAuthEnforced?: boolean;
}

export const YCQLField = ({ disabled, isAuthEnforced }: YCQLFieldProps): ReactElement => {
  const {
    control,
    setValue,
    formState: { errors }
  } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();

  const ycqlEnabled = useWatch({ name: YCQL_FIELD });
  const ysqlEnabled = useWatch({ name: YSQL_FIELD });
  const ycqlAuthEnabled = useWatch({ name: YCQL_AUTH_FIELD });
  const ycqlPassword = useWatch({ name: YCQL_PASSWORD_FIELD });

  //ycqlAuthEnabled cannot be true if ycqlEnabled is false
  useUpdateEffect(() => {
    if (['false', false].includes(ycqlEnabled)) setValue(YCQL_AUTH_FIELD, false);
  }, [ycqlEnabled]);

  return (
    <Box display="flex" width="100%" flexDirection="column">
      <Box display="flex">
        <YBLabel>{t('universeForm.instanceConfig.enableYCQL')}</YBLabel>
        <Box flex={1}>
          <YBTooltip
            title={
              !ysqlEnabled ? (t('universeForm.instanceConfig.enableYsqlOrYcql') as string) : ''
            }
            placement="top-start"
          >
            <div>
              <YBToggleField
                name={YCQL_FIELD}
                inputProps={{
                  'data-testid': 'YCQL'
                }}
                control={control}
                disabled={disabled || !ysqlEnabled}
              />
              <YBHelper>{t('universeForm.instanceConfig.enableYCQLHelper')}</YBHelper>
            </div>
          </YBTooltip>
        </Box>
      </Box>

      {ycqlEnabled && (
        <Box mt={1}>
          {!isAuthEnforced && (
            <Box display="flex">
              <YBLabel>{t('universeForm.instanceConfig.enableYCQLAuth')}</YBLabel>
              <Box flex={1}>
                <YBToggleField
                  name={YCQL_AUTH_FIELD}
                  inputProps={{
                    'data-testid': 'YCQLAuth'
                  }}
                  control={control}
                  disabled={disabled}
                />
                <YBHelper>{t('universeForm.instanceConfig.enableYCQLAuthHelper')}</YBHelper>
              </Box>
            </Box>
          )}

          {ycqlAuthEnabled && !disabled && (
            <Box display="flex">
              <Grid container spacing={3}>
                <Grid item sm={12} lg={6}>
                  <Box display="flex">
                    <YBLabel>{t('universeForm.instanceConfig.ycqlAuthPassword')}</YBLabel>
                    <Box flex={1}>
                      <YBPasswordField
                        name={YCQL_PASSWORD_FIELD}
                        control={control}
                        rules={{
                          required:
                            !disabled && ycqlAuthEnabled
                              ? (t('universeForm.validation.required', {
                                  field: t('universeForm.instanceConfig.ycqlAuthPassword')
                                }) as string)
                              : '',
                          pattern: {
                            value: PASSWORD_REGEX,
                            message: t('universeForm.validation.passwordStrength')
                          }
                        }}
                        fullWidth
                        inputProps={{
                          autoComplete: 'new-password',
                          'data-testid': 'InputYcqlPassword'
                        }}
                        error={!!errors?.instanceConfig?.ycqlPassword}
                        helperText={errors?.instanceConfig?.ycqlPassword?.message}
                      />
                    </Box>
                  </Box>
                </Grid>
                <Grid item sm={12} lg={6}>
                  <Box display="flex">
                    <YBLabel>{t('universeForm.instanceConfig.confirmPassword')}</YBLabel>
                    <Box flex={1}>
                      <YBPasswordField
                        name={YCQL_CONFIRM_PASSWORD_FIELD}
                        control={control}
                        rules={{
                          validate: {
                            passwordMatch: (value) =>
                              (ycqlAuthEnabled && value === ycqlPassword) ||
                              (t('universeForm.validation.confirmPassword') as string)
                          },
                          deps: [YCQL_PASSWORD_FIELD, YCQL_AUTH_FIELD]
                        }}
                        fullWidth
                        inputProps={{
                          autoComplete: 'new-password',
                          'data-testid': 'InputConfirmYcqlPassword'
                        }}
                        error={!!errors?.instanceConfig?.ycqlConfirmPassword}
                        helperText={errors?.instanceConfig?.ycqlConfirmPassword?.message}
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
