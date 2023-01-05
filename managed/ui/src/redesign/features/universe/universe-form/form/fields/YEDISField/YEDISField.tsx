import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { Box } from '@material-ui/core';
import { YBLabel, YBHelper, YBToggleField, YBTooltip } from '../../../../../../components';
import { UniverseFormData } from '../../../utils/dto';
import { YEDIS_FIELD } from '../../../utils/constants';
import { useFormFieldStyles } from '../../../universeMainStyle';
import InfoMessage from '../../../../../../assets/info-message.svg';

interface YEDISFieldProps {
  disabled: boolean;
}

export const YEDISField = ({ disabled }: YEDISFieldProps): ReactElement => {
  const { control } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();
  const classes = useFormFieldStyles();
  const YEDISTooltipTitle = t('universeForm.securityConfig.authSettings.enableYEDISHelper');

  return (
    <Box display="flex" width="100%" data-testid="YEDISField-Container">
      {/* <Box flex={1}> */}
      <YBToggleField
        name={YEDIS_FIELD}
        inputProps={{
          'data-testid': 'YEDISField-Toggle'
        }}
        control={control}
        disabled={disabled}
      />
      <Box flex={1}>
        <YBLabel dataTestId="YEDISField-Label">
          {t('universeForm.securityConfig.authSettings.enableYEDIS')}
          &nbsp;
          <YBTooltip title={YEDISTooltipTitle} className={classes.tooltipText}>
            <img alt="Info" src={InfoMessage} />
          </YBTooltip>
        </YBLabel>
      </Box>
      {/* <YBHelper dataTestId="YEDISField-Helper">
        {t('universeForm.instanceConfig.enableYEDISHelper')}
      </YBHelper> */}
      {/* </Box> */}
    </Box>
  );
};

//shown only for aws, gcp, azu, on-pre, k8s
//disabled for non primary cluster
