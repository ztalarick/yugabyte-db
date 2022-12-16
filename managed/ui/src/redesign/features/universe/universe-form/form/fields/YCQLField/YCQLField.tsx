import React, { ReactElement } from 'react';
import { useUpdateEffect } from 'react-use';
import { useTranslation } from 'react-i18next';
import { useFormContext, useWatch } from 'react-hook-form';
import { Box, Grid } from '@material-ui/core';
import {
  YBLabel,
  YBHelper,
  YBPasswordField,
  YBToggleField,
  YBTooltip
} from '../../../../../../components';
import { UniverseFormData } from '../../../utils/dto';
import {
  YCQL_AUTH_FIELD,
  YCQL_FIELD,
  YCQL_PASSWORD_FIELD,
  YCQL_CONFIRM_PASSWORD_FIELD,
  PASSWORD_REGEX,
  YSQL_FIELD
} from '../../../utils/constants';
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

  //watchers
  const ycqlEnabled = useWatch({ name: YCQL_FIELD });
  const ysqlEnabled = useWatch({ name: YSQL_FIELD });
  const ycqlAuthEnabled = useWatch({ name: YCQL_AUTH_FIELD });
  const ycqlPassword = useWatch({ name: YCQL_PASSWORD_FIELD });

  //ycqlAuthEnabled cannot be true if ycqlEnabled is false
  useUpdateEffect(() => {
    if (['false', false].includes(ycqlEnabled)) setValue(YCQL_AUTH_FIELD, false);
  }, [ycqlEnabled]);

  return (
    <Box display="flex" width="100%" flexDirection="column" data-testid="YCQLField-Container">
      <Box display="flex" flexDirection="row">
        {/* <Box flex={1}> */}
        <YBTooltip
          title={
            !ysqlEnabled
              ? (t('universeForm.securityConfig.authSettings.enableYsqlOrYcql') as string)
              : ''
          }
          placement="top-start"
        >
          <div>
            <YBToggleField
              name={YCQL_FIELD}
              inputProps={{
                'data-testid': 'YCQLField-EnableToggle'
              }}
              control={control}
              disabled={disabled || !ysqlEnabled}
            />
            {/* <YBHelper dataTestId="YCQLField-EnableHelper">
              {t('universeForm.instanceConfig.enableYCQLHelper')}
            </YBHelper> */}
          </div>
        </YBTooltip>
        <YBLabel dataTestId="YCQLField-EnableLabel">
          {t('universeForm.securityConfig.authSettings.enableYCQL')}
        </YBLabel>
        {/* </Box> */}
      </Box>

      {ycqlEnabled && (
        <Box mt={3}>
          {!isAuthEnforced && (
            <Box display="flex" flexDirection="row">
              {/* <Box flex={1}> */}
              <YBToggleField
                name={YCQL_AUTH_FIELD}
                inputProps={{
                  'data-testid': 'YCQLField-AuthToggle'
                }}
                control={control}
                disabled={disabled}
              />
              <YBLabel dataTestId="YCQLField-AuthLabel">
                {t('universeForm.securityConfig.authSettings.enableYCQLAuth')}
              </YBLabel>
              {/* <YBHelper dataTestId="YCQLField-AuthHelper">
                  {t('universeForm.instanceConfig.enableYCQLAuthHelper')}
                </YBHelper> */}
              {/* </Box> */}
            </Box>
          )}

          {ycqlAuthEnabled && !disabled && (
            <Box display="flex" flexDirection="column" mt={3}>
              <Box display="flex">
                <YBLabel dataTestId="YCQLField-PasswordLabel">
                  {t('universeForm.securityConfig.authSettings.ycqlAuthPassword')}
                </YBLabel>
                <Box flex={1} paddingRight="120px">
                  <YBPasswordField
                    name={YCQL_PASSWORD_FIELD}
                    control={control}
                    rules={{
                      required:
                        !disabled && ycqlAuthEnabled
                          ? (t('universeForm.validation.required', {
                              field: t('universeForm.securityConfig.authSettings.ycqlAuthPassword')
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
                      'data-testid': 'YCQLField-PasswordLabelInput'
                    }}
                    error={!!errors?.instanceConfig?.ycqlPassword}
                    helperText={errors?.instanceConfig?.ycqlPassword?.message}
                  />
                </Box>
              </Box>
              <Box display="flex" mt={2}>
                <YBLabel dataTestId="YCQLField-ConfirmPasswordLabel">
                  {t('universeForm.securityConfig.authSettings.confirmPassword')}
                </YBLabel>
                <Box flex={1} paddingRight="120px">
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
                      'data-testid': 'YCQLField-ConfirmPasswordInput'
                    }}
                    error={!!errors?.instanceConfig?.ycqlConfirmPassword}
                    helperText={errors?.instanceConfig?.ycqlConfirmPassword?.message}
                  />
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

//shown only for aws, gcp, azu, on-pre, k8s
//disabled for non primary cluster
