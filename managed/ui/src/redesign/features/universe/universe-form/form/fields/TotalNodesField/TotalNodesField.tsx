import React, { ReactElement } from 'react';
import { useUpdateEffect } from 'react-use';
import { useTranslation } from 'react-i18next';
import { useFormContext, useWatch } from 'react-hook-form';
import { Box, Grid, Typography, makeStyles } from '@material-ui/core';
import { YBInputField, YBLabel, YBTooltip } from '../../../../../../components';
import { UniverseFormData, CloudType, MasterPlacementType } from '../../../utils/dto';
import {
  TOTAL_NODES_FIELD,
  MASTER_TOTAL_NODES_FIELD,
  REPLICATION_FACTOR_FIELD,
  PLACEMENTS_FIELD,
  PROVIDER_FIELD,
  MASTERS_PLACEMENT_FIELD
} from '../../../utils/constants';
import { useSectionStyles } from '../../../universeMainStyle';

interface TotalNodesFieldProps {
  disabled?: boolean;
  isAsync: boolean;
}

const TOOLTIP_TITLE =
  'Select this option if you plan to use this universe for \
  multi-tenancy use cases -or- you expect to create Databases \
  with a very large number of tables';

export const TotalNodesField = ({ disabled, isAsync }: TotalNodesFieldProps): ReactElement => {
  const { control, setValue, getValues } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();
  const classes = useSectionStyles();

  //watchers
  const provider = useWatch({ name: PROVIDER_FIELD });
  const replicationFactor = useWatch({ name: REPLICATION_FACTOR_FIELD });
  // const masterPlacement = useWatch({ name: MASTERS_PLACEMENT_FIELD });
  const masterPlacement = getValues(MASTERS_PLACEMENT_FIELD);
  const placements = useWatch({ name: PLACEMENTS_FIELD });
  const currentTotalNodes = getValues(TOTAL_NODES_FIELD);

  console.log('masterPlacement123', masterPlacement);
  //set TotalNodes to RF Value when totalNodes < RF
  useUpdateEffect(() => {
    if (replicationFactor > currentTotalNodes) setValue(TOTAL_NODES_FIELD, replicationFactor);
  }, [replicationFactor]);

  //set Total Nodes to TotalNodesInAZ Value in placements
  useUpdateEffect(() => {
    if (placements && placements.length) {
      const initalCount = 0;
      const totalNodesinAz = placements
        .map((e: any) => e.numNodesInAZ)
        .reduce((prev: any, curr: any) => Number(prev) + Number(curr), initalCount);
      if (totalNodesinAz >= replicationFactor) setValue(TOTAL_NODES_FIELD, totalNodesinAz);
    }
  }, [placements]);

  const dedicatedNodesElement = (
    <Box>
      <Box display="flex" flexDirection="row" justifyContent="center">
        <Box mt={2}>
          <Typography className={classes.labelFont}>
            {/* className={classes.subsectionHeaderFont} */}
            {t('universeForm.tserver')}
          </Typography>
        </Box>
        <Box width="80px" ml={2}>
          <YBInputField
            control={control}
            name={TOTAL_NODES_FIELD}
            // fullWidth
            type="number"
            disabled={disabled}
            inputProps={{
              'data-testid': 'TotalNodesField-Input',
              min: replicationFactor
            }}
          />
        </Box>

        <Box mt={2} ml={2}>
          <Typography className={classes.labelFont}>{t('universeForm.master')}</Typography>
        </Box>
        <Box width="80px" ml={2}>
          <YBTooltip title={TOOLTIP_TITLE}>
            <span>
              <YBInputField
                control={control}
                name={MASTER_TOTAL_NODES_FIELD}
                // fullWidth
                type="number"
                disabled={true}
                value={replicationFactor}
                inputProps={{
                  'data-testid': 'TotalNodesFieldMaster-Input'
                }}
              ></YBInputField>
            </span>
          </YBTooltip>
        </Box>
      </Box>
    </Box>
  );

  const colocatedNodesElement = (
    <Box>
      <Box display="flex" flexDirection="row" justifyContent="center">
        <Box width="80px">
          <YBInputField
            control={control}
            name={TOTAL_NODES_FIELD}
            // fullWidth
            type="number"
            disabled={disabled}
            inputProps={{
              'data-testid': 'TotalNodesField-Input',
              min: replicationFactor
            }}
          />
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box display="flex" width="100%" data-testid="TotalNodesField-Container">
      <YBLabel dataTestId="TotalNodesField-Label">
        {provider?.code === CloudType.kubernetes
          ? t('universeForm.cloudConfig.totalPodsField')
          : t('universeForm.cloudConfig.totalNodesField')}
      </YBLabel>
      {masterPlacement === MasterPlacementType.COLOCATED
        ? colocatedNodesElement
        : dedicatedNodesElement}
    </Box>
  );
};
