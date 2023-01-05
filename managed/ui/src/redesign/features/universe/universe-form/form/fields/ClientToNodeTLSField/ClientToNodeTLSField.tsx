import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { Box } from '@material-ui/core';
import { YBLabel, YBHelper, YBToggleField, YBTooltip } from '../../../../../../components';
import { UniverseFormData } from '../../../utils/dto';
import { CLIENT_TO_NODE_ENCRYPT_FIELD } from '../../../utils/constants';
import { useFormFieldStyles } from '../../../universeMainStyle';
import InfoMessage from '../../../../../../assets/info-message.svg';

interface ClientToNodeTLSFieldProps {
  disabled: boolean;
}

export const ClientToNodeTLSField = ({ disabled }: ClientToNodeTLSFieldProps): ReactElement => {
  const { control } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();
  const classes = useFormFieldStyles();
  const clientToNodeTooltipTitle = t(
    'universeForm.securityConfig.encryptionSettings.enableClientToNodeTLSHelper'
  );

  return (
    <Box display="flex" width="100%" data-testid="ClientToNodeTLSField-Container">
      {/* <Box flex={1}> */}
      <YBToggleField
        name={CLIENT_TO_NODE_ENCRYPT_FIELD}
        inputProps={{
          'data-testid': 'ClientToNodeTLSField-Toggle'
        }}
        control={control}
        disabled={disabled}
      />
      <Box flex={1}>
        <YBLabel dataTestId="ClientToNodeTLSField-Label" width="185px">
          {t('universeForm.securityConfig.encryptionSettings.enableClientToNodeTLS')}
          &nbsp;
          <YBTooltip title={clientToNodeTooltipTitle} className={classes.tooltipText}>
            <img alt="Info" src={InfoMessage} />
          </YBTooltip>
        </YBLabel>
      </Box>
    </Box>
  );
};

//shown only for aws, gcp, azu, on-pre, k8s
//disabled for non primary cluster
