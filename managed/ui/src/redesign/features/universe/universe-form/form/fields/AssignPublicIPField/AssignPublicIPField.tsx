import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { Box } from '@material-ui/core';
import { YBHelper, YBLabel, YBToggleField } from '../../../../../../components';
import { UniverseFormData } from '../../../utils/dto';
import { ASSIGN_PUBLIC_IP_FIELD } from '../../../utils/constants';

interface AssignPublicIPFieldProps {
  disabled: boolean;
}

export const AssignPublicIPField = ({ disabled }: AssignPublicIPFieldProps): ReactElement => {
  const { control } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();

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
          </YBLabel>
        </Box>
      </Box>

      {/* <Box flex={1}> */}

      {/* <YBHelper dataTestId="AssignPublicIPField-Helper">
          {t('universeForm.instanceConfig.assignPublicIPHelper')}
        </YBHelper> */}
      {/* </Box> */}
    </Box>
  );
};

//shown only for aws, gcp, azu
//disabled for non primary cluster
