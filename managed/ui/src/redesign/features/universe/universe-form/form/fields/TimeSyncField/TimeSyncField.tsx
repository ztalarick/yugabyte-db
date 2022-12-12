import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useFormContext, useWatch } from 'react-hook-form';
import { CloudType, UniverseFormData } from '../../../utils/dto';
import { YBLabel, YBHelper, YBToggleField } from '../../../../../../components';
import { TIME_SYNC_FIELD, PROVIDER_FIELD } from '../../../utils/constants';

interface TimeSyncFieldProps {
  disabled: boolean;
}

const PROVIDER_FRIENDLY_NAME = {
  [CloudType.aws]: 'AWS',
  [CloudType.gcp]: 'GCP',
  [CloudType.azu]: 'Azure'
};

export const TimeSyncField = ({ disabled }: TimeSyncFieldProps): ReactElement => {
  const { control } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();

  const provider = useWatch({ name: PROVIDER_FIELD });

  const stringMap = { provider: PROVIDER_FRIENDLY_NAME[provider?.code] };

  return (
    <Box display="flex" width="100%">
      <YBLabel>{t('universeForm.instanceConfig.useTimeSync', stringMap)}</YBLabel>
      <Box flex={1}>
        <YBToggleField
          name={TIME_SYNC_FIELD}
          inputProps={{
            'data-testid': 'useTimeSync'
          }}
          control={control}
          disabled={disabled}
        />
        <YBHelper>{t('universeForm.instanceConfig.useTimeSyncHelper', stringMap)}</YBHelper>
      </Box>
    </Box>
  );
};

//shown only for aws, gcp, azu
//show only if current access key's setupchrony = false
