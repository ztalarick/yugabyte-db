import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { Box } from '@material-ui/core';
import { YBLabel, YBTooltip, YBToggleField } from '../../../../../../components';
import { UniverseFormData } from '../../../utils/dto';
import { EAR_FIELD } from '../../../utils/constants';
import { useFormFieldStyles } from '../../../universeMainStyle';
import InfoMessage from '../../../../../../assets/info-message.svg';

interface EncryptionAtRestFieldProps {
  disabled: boolean;
}

export const EncryptionAtRestField = ({ disabled }: EncryptionAtRestFieldProps): ReactElement => {
  const { control } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();
  const classes = useFormFieldStyles();
  const encryptionAtRestTooltipTitle = t(
    'universeForm.securityConfig.encryptionSettings.enableEncryptionAtRestHelper'
  );

  return (
    <Box display="flex" width="100%" data-testid="EncryptionAtRestField-Container" mt={2}>
      {/* <Box flex={1}> */}
      <YBToggleField
        name={EAR_FIELD}
        inputProps={{
          'data-testid': 'EncryptionAtRestField-Toggle'
        }}
        control={control}
        disabled={disabled}
      />
      <Box flex={1}>
        <YBLabel dataTestId="EncryptionAtRestField-Label" width="185px">
          {t('universeForm.securityConfig.encryptionSettings.enableEncryptionAtRest')}
          &nbsp;
          <YBTooltip title={encryptionAtRestTooltipTitle} className={classes.tooltipText}>
            <img alt="Info" src={InfoMessage} />
          </YBTooltip>
        </YBLabel>
      </Box>
    </Box>
  );
};

//shown only for aws, gcp, azu, on-pre, k8s
//disabled for non primary cluster
