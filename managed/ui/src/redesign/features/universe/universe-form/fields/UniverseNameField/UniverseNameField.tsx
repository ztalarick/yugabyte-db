import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { Box } from '@material-ui/core';
import { YBInputField, YBLabel } from '../../../../../components';
import { UniverseFormData } from '../../utils/dto';
import { UNIVERSE_NAME_FIELD } from '../../utils/constants';
interface UniverseNameFieldProps {
  disabled?: boolean;
}

export const UniverseNameField = ({ disabled }: UniverseNameFieldProps): ReactElement => {
  const { control } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();

  return (
    <Box display="flex" width="100%">
      <YBLabel>{t('universeForm.cloudConfig.universeName')}</YBLabel>
      <Box flex={1}>
        <YBInputField
          control={control}
          name={UNIVERSE_NAME_FIELD}
          fullWidth
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
