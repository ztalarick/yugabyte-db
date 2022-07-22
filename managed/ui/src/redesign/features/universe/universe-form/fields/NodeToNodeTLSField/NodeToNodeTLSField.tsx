import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { UniverseFormData } from '../../utils/dto';
import { YBLabel, YBHelper, YBToggleField } from '../../../../../components';

interface NodeToNodeTLSFieldProps {
  disabled: boolean;
}

const NODE_NODE_TLS_FIELD_NAME = 'instanceConfig.enableNodeToNodeEncrypt';

export const NodeToNodeTLSField = ({ disabled }: NodeToNodeTLSFieldProps): ReactElement => {
  const { control } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();

  return (
    <Box display="flex" width="100%">
      <YBLabel>{t('universeForm.instanceConfig.enableNodeToNodeTLS')}</YBLabel>
      <Box flex={1}>
        <YBToggleField
          name={NODE_NODE_TLS_FIELD_NAME}
          inputProps={{
            'data-testid': 'NodeToNodeTLS'
          }}
          control={control}
          disabled={disabled}
        />
        <YBHelper>{t('universeForm.instanceConfig.enableNodeToNodeTLSHelper')}</YBHelper>
      </Box>
    </Box>
  );
};

//shown only for aws, gcp, azu, on-pre, k8s
//disabled for non primary cluster
