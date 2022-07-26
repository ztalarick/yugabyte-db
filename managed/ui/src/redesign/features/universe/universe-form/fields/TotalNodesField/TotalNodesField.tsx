import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext, useWatch } from 'react-hook-form';
import { Box } from '@material-ui/core';
import { YBInputField, YBLabel } from '../../../../../components';
import { UniverseFormData } from '../../utils/dto';
import { TOTAL_NODES_FIELD, AUTO_PLACEMENT_FIELD } from '../../utils/constants';

interface TotalNodesFieldProps {
  disabled?: boolean;
}

export const TotalNodesField = ({ disabled }: TotalNodesFieldProps): ReactElement => {
  const { control } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();

  const autoPlacement = useWatch({ name: AUTO_PLACEMENT_FIELD });

  return (
    <Box display="flex" width="100%">
      <YBLabel>{t('universeForm.cloudConfig.totalNodesField')}</YBLabel>
      <Box width="100px">
        <YBInputField
          control={control}
          name={TOTAL_NODES_FIELD}
          fullWidth
          type="number"
          disabled={!autoPlacement ? true : disabled}
          inputProps={{
            'data-testid': 'InputTotalNodes'
          }}
        />
      </Box>
    </Box>
  );
};
