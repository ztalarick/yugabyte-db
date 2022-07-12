import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext, ValidateResult } from 'react-hook-form';
import { Box } from '@material-ui/core';
import { YBInputField, YBLabel } from '../../../../../components';
import { api } from '../../../../../helpers/api';
import { UniverseFormData } from '../../utils/dto';
interface UniverseNameFieldProps {
  disabled?: boolean;
}

const FIELD_NAME = 'cloudConfig.universeName';

export const UniverseNameField = ({ disabled }: UniverseNameFieldProps): ReactElement => {
  const { control } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();

  const validateUniverseName = async (value_: unknown): Promise<ValidateResult> => {
    const value = value_ as string;
    if (disabled) return true; // don't validate disabled field
    if (!value) return t('common.requiredField') as string;
    try {
      const universeList = await api.findUniverseByName(value);
      return universeList?.length
        ? (t('universeForm.cloudConfig.universeNameInUse') as string)
        : true;
    } catch (error) {
      // skip exceptions happened due to canceling previous request
      return !api.isRequestCancelError(error) ? true : (t('common.genericFailure') as string);
    }
  };

  return (
    <Box display="flex" width="100%">
      <YBLabel>{t('universeForm.cloudConfig.universeName')}</YBLabel>
      <Box flex={1}>
        <YBInputField
          control={control}
          name={FIELD_NAME}
          fullWidth
          rules={{ validate: validateUniverseName }}
          disabled={disabled}
          inputProps={{
            autoFocus: true,
            'data-testid': 'InputUniverseName'
          }}
        />
      </Box>
    </Box>
  );
};
