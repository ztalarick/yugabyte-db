import React, { ReactElement } from 'react';
import { Box, MenuItem } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useFormContext, useWatch } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { YBLabel, YBSelectField } from '../../../../../../components';
import { AccessKey, UniverseFormData } from '../../../utils/dto';
import { useUpdateEffect } from 'react-use';
import { ACCESS_KEY_FIELD, PROVIDER_FIELD } from '../../../utils/constants';

interface AccessKeysFieldProps {
  disabled?: boolean;
}

export const AccessKeysField = ({ disabled }: AccessKeysFieldProps): ReactElement => {
  const { control, setValue } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();
  const provider = useWatch({ name: PROVIDER_FIELD });
  const fieldVal = useWatch({ name: ACCESS_KEY_FIELD });

  //all access keys
  const allAccessKeys = useSelector((state: any) => state.cloud.accessKeys);

  //filter by provider
  const accessKeys = allAccessKeys.data.filter(
    (item: AccessKey) => item?.idKey?.providerUUID === provider?.uuid
  );

  useUpdateEffect(() => {
    const defaultVal = accessKeys[0]?.idKey.keyCode;
    if (accessKeys.length && provider?.uuid && !fieldVal) {
      setValue(ACCESS_KEY_FIELD, defaultVal, { shouldValidate: true });
    }
  }, [provider?.uuid, accessKeys]);

  return (
    <Box display="flex" width="100%">
      <YBLabel>{t('universeForm.advancedConfig.accessKey')}</YBLabel>
      <Box flex={1}>
        <YBSelectField
          rules={{
            required: !disabled
              ? (t('universeForm.validation.required', {
                  field: t('universeForm.advancedConfig.accessKey')
                }) as string)
              : ''
          }}
          name={ACCESS_KEY_FIELD}
          control={control}
          fullWidth
          disabled={disabled}
        >
          {accessKeys.map((item: AccessKey) => (
            <MenuItem key={item.idKey.keyCode} value={item.idKey.keyCode}>
              {item.idKey.keyCode}
            </MenuItem>
          ))}
        </YBSelectField>
      </Box>
    </Box>
  );
};

//show if not k8s provider
