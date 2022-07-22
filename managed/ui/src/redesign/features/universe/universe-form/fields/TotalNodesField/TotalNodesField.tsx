import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { Box } from '@material-ui/core';
import { YBInputField, YBLabel } from '../../../../../components';
import { UniverseFormData } from '../../utils/dto';

interface TotalNodesFieldProps {
  disabled?: boolean;
}

const TOTAL_NODES_FIELD_NAME = 'cloudConfig.totalNodes';

export const TotalNodesField = ({ disabled }: TotalNodesFieldProps): ReactElement => {
  const { control } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();

  return (
    <Box display="flex" width="100%">
      <YBLabel>{t('universeForm.cloudConfig.totalNodesField')}</YBLabel>
      <Box flex={1}>
        <YBInputField
          control={control}
          name={TOTAL_NODES_FIELD_NAME}
          fullWidth
          type="number"
          disabled={disabled}
          inputProps={{
            autoFocus: true,
            'data-testid': 'InputTotalNodes'
          }}
        />
      </Box>
    </Box>
  );
};
