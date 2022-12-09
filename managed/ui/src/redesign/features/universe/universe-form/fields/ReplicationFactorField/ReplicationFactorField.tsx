import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext, useController } from 'react-hook-form';
import { ButtonGroup, Box, makeStyles, Theme } from '@material-ui/core';
import { YBButton, YBLabel } from '../../../../../components';
import { UniverseFormData } from '../../utils/dto';
import { REPLICATION_FACTOR_FIELD } from '../../utils/constants';
import { themeVariables } from '../../../../../theme/variables';

interface ReplicationFactorProps {
  disabled?: boolean;
  isPrimary: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  rfButton: {
    height: themeVariables.inputHeight,
    borderWidth: '0.5px !important'
  }
}));

const PRIMARY_RF = [1, 3, 5, 7];
const ASYNC_RF = [1, 2, 3, 4, 5, 6, 7];

export const ReplicationFactor = ({
  disabled,
  isPrimary
}: ReplicationFactorProps): ReactElement => {
  const { setValue } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();
  const classes = useStyles();
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
          {(isPrimary ? PRIMARY_RF : ASYNC_RF).map((factor) => {
            return (
              <YBButton
                key={factor}
                className={classes.rfButton}
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
