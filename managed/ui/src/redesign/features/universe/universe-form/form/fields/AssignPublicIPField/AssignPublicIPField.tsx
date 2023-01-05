import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { Box, Typography, makeStyles } from '@material-ui/core';
import { YBHelper, YBLabel, YBToggleField, YBTooltip } from '../../../../../../components';
import { UniverseFormData } from '../../../utils/dto';
import { ASSIGN_PUBLIC_IP_FIELD } from '../../../utils/constants';
import { useFormFieldStyles } from '../../../universeMainStyle';
import InfoMessage from '../../../../../../assets/info-message.svg';

interface AssignPublicIPFieldProps {
  disabled: boolean;
}

export const AssignPublicIPField = ({ disabled }: AssignPublicIPFieldProps): ReactElement => {
  const { control } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();
  const classes = useFormFieldStyles();
  const tooltipTitle = t('universeForm.instanceConfig.assignPublicIPHelper');

  return (
    <Box width="100%" data-testid="AssignPublicIPField-Container" mt={2} justifyContent="center">
      <Box bgcolor="#FFFFFF" border="1px solid #E5E5E6" borderRadius="8px" maxWidth="708px">
        <Box display="flex" flexDirection="row" ml={2} mt={2} mb={2}>
          <Box justifyContent="center">
            <YBToggleField
              name={ASSIGN_PUBLIC_IP_FIELD}
              inputProps={{
                'data-testid': 'AssignPublicIPField-Toggle'
              }}
              control={control}
              disabled={disabled}
            />
          </Box>

          <YBLabel dataTestId="AssignPublicIPField-Label">
            {t('universeForm.instanceConfig.assignPublicIP')}
            &nbsp;
            <YBTooltip title={tooltipTitle} className={classes.tooltipText}>
              <img alt="Info" src={InfoMessage} />
            </YBTooltip>
          </YBLabel>
        </Box>
      </Box>
    </Box>
  );
};

//shown only for aws, gcp, azu
//disabled for non primary cluster
