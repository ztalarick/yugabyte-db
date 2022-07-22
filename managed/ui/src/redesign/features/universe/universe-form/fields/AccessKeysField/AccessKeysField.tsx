import React, { ReactElement } from 'react';
import { Box, MenuItem } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useFormContext, useWatch } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { YBLabel, YBSelectField } from '../../../../../components';
import { AccessKey, UniverseFormData } from '../../utils/dto';
import { useUpdateEffect } from 'react-use';

interface AccessKeysFieldProps {
  disabled?: boolean;
}

const ACCESS_KEYS_FIELD_NAME = 'advancedConfig.accessKeyCode';
const PROVIDER_FIELD_NAME = 'cloudConfig.provider';

export const AccessKeysField = ({ disabled }: AccessKeysFieldProps): ReactElement => {
  const { control, setValue } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();
  const provider = useWatch({ name: PROVIDER_FIELD_NAME });
  const fieldVal = useWatch({ name: ACCESS_KEYS_FIELD_NAME });

  //all access keys
  const allAccessKeys = useSelector((state: any) => state.cloud.accessKeys);

  //filter by provider
  const accessKeys = allAccessKeys.data.filter(
    (item: AccessKey) => item?.idKey?.providerUUID === provider?.uuid
  );

  useUpdateEffect(() => {
    const defaultVal = accessKeys[0]?.idKey.keyCode;
    if (accessKeys.length && provider?.uuid && defaultVal !== fieldVal) {
      setValue(ACCESS_KEYS_FIELD_NAME, defaultVal, { shouldValidate: true });
    }
  }, [provider?.uuid, accessKeys]);

  return (
    <Box display="flex" width="100%">
      <YBLabel>{t('universeForm.advancedConfig.accessKey')}</YBLabel>
      <Box flex={1}>
        <YBSelectField
          name={ACCESS_KEYS_FIELD_NAME}
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
