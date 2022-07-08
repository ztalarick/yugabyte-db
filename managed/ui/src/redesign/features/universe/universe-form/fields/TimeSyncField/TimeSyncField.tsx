import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { CloudType, UniverseFormData } from '../../utils/dto';
import { YBLabel, YBHelper, YBToggleField } from '../../../../../components';

interface TimeSyncFieldProps {
  disabled: boolean;
}

// const PROVIDER_FIELD_NAME = 'instanceConfig.provider';
const PROVIDER_FRIENDLY_NAME = {
  [CloudType.aws]: 'AWS',
  [CloudType.gcp]: 'GCP',
  [CloudType.azu]: 'Azure'
};

export const TimeSyncField = ({ disabled }: TimeSyncFieldProps): ReactElement => {
  const { control } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();

  //   const provider = useWatch({name: PROVIDER_FIELD_NAME});
  const provider = {
    uuid: '08c0ba0e-3558-40fc-94e5-a87a627de8c5',
    code: CloudType.aws
  };

  const stringMap = { provider: PROVIDER_FRIENDLY_NAME[provider.code] };

  return (
    <Box display="flex" width="100%">
      <YBLabel>{t('universeForm.instanceConfig.useTimeSync', stringMap)}</YBLabel>
      <Box flex={1}>
        <YBToggleField
          name={'instanceConfig.useTimeSync'}
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
