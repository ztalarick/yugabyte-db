import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext, useController } from 'react-hook-form';
import { ButtonGroup, Box } from '@material-ui/core';
import { YBButton, YBLabel } from '../../../../../components';
import { UniverseFormData } from '../../utils/dto';

interface ReplicationFactorProps {
  disabled?: boolean;
}

const REPLICATION_FACTORS = [1, 3, 5, 7];
const FIELD_NAME = 'cloudConfig.replicationFactor';

export const ReplicationFactor = ({ disabled }: ReplicationFactorProps): ReactElement => {
  const { setValue } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();
  const {
    field: { value }
  } = useController({
    name: FIELD_NAME
  });

  const handleSelect = (val: number) => {
    setValue(FIELD_NAME, val);
  };

  return (
    <Box width="100%" display="flex">
      <YBLabel>{t('universeForm.cloudConfig.replicationField')}</YBLabel>
      <Box flex={1}>
        <ButtonGroup variant="contained" color="default">
          {REPLICATION_FACTORS.map((fact) => {
            return (
              <YBButton
                key={fact}
                variant={fact === value ? 'primary' : undefined}
                onClick={() => handleSelect(fact)}
              >
                {fact}
              </YBButton>
            );
          })}
        </ButtonGroup>
      </Box>
    </Box>
  );
};
