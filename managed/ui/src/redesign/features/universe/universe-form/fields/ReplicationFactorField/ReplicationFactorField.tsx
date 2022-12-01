import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext, useController } from 'react-hook-form';
import { ButtonGroup, Box } from '@material-ui/core';
import { YBButton, YBLabel } from '../../../../../components';
import { UniverseFormData } from '../../utils/dto';
import { REPLICATION_FACTOR_FIELD } from '../../utils/constants';

interface ReplicationFactorProps {
  disabled?: boolean;
}

const REPLICATION_FACTORS = [1, 3, 5, 7];

export const ReplicationFactor = ({ disabled }: ReplicationFactorProps): ReactElement => {
  const { setValue } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();
  const {
    field: { value }
  } = useController({
    name: REPLICATION_FACTOR_FIELD
  });

  const handleSelect = (val: number) => {
    setValue(REPLICATION_FACTOR_FIELD, val);
  };

  return (
    <Box width="100%" display="flex">
      <YBLabel>{t('universeForm.cloudConfig.replicationField')}</YBLabel>
      <Box flex={1}>
        <ButtonGroup variant="contained" color="default">
          {REPLICATION_FACTORS.map((factor) => {
            return (
              <YBButton
                key={factor}
                disabled={factor !== value && disabled}
                variant={factor === value ? 'primary' : 'secondary'}
                onClick={(e: any) => {
                  if (disabled) e.preventDefault();
                  else handleSelect(factor);
                }}
              >
                {factor}
              </YBButton>
            );
          })}
        </ButtonGroup>
      </Box>
    </Box>
  );
};
