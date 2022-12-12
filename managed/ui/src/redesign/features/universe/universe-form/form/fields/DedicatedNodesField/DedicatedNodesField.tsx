import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { UniverseFormData } from '../../../utils/dto';
import { YBLabel, YBHelper, YBToggleField } from '../../../../../../components';
import { DEDICATED_NODES_FIELD } from '../../../utils/constants';

interface DedicatedNodesFieldProps {
  disabled?: boolean;
}

export const DedicatedNodesField = ({ disabled }: DedicatedNodesFieldProps): ReactElement => {
  const { control } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();

  return (
    <Box display="flex" width="100%">
      <YBLabel>{t('universeForm.instanceConfig.dedicatedNodes')}</YBLabel>
      <Box flex={1}>
        <YBToggleField
          name={DEDICATED_NODES_FIELD}
          inputProps={{
            'data-testid': 'dedicatedNodes'
          }}
          control={control}
          disabled={disabled}
        />
        <YBHelper>{t('universeForm.instanceConfig.dedicatedNodesHelper')}</YBHelper>
      </Box>
    </Box>
  );
};
