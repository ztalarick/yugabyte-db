import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext, useWatch } from 'react-hook-form';
import { Box, Typography, makeStyles } from '@material-ui/core';
import {
  RadioOrientation,
  YBRadioGroupField,
  YBLabel,
  YBTooltip
} from '../../../../../../components';
import { UniverseFormData, MasterPlacementType } from '../../../utils/dto';
import { MASTERS_PLACEMENT_FIELD } from '../../../utils/constants';

const TOOLTIP_TITLE =
  'Select this option if you plan to use this universe for \
  multi-tenancy use cases -or- you expect to create Databases \
  with a very large number of tables';

interface MasterPlacementFieldProps {
  disabled?: boolean;
}

const useStyles = makeStyles(() => ({
  tooltipText: {
    textDecoration: 'underline',
    marginLeft: '15px',
    fontSize: '11.5px',
    fontWeight: 400,
    fontFamily: 'Inter',
    color: '#67666C',
    marginTop: '2px',
    cursor: 'default'
  }
}));

export const MasterPlacementField = ({ disabled }: MasterPlacementFieldProps): ReactElement => {
  const { control, setValue } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();
  const masterPlacement = useWatch({ name: MASTERS_PLACEMENT_FIELD });
  const classes = useStyles();

  return (
    <Box display="flex" width="100%" data-testid="MasterPlacement-Container">
      <Box>
        <YBLabel dataTestId="MasterPlacement-Label">
          {'Master Placement'}
          &nbsp;
          <span className="fa fa-info-circle" />
        </YBLabel>
      </Box>
      <Box flex={1} mt={0}>
        <YBRadioGroupField
          name={MASTERS_PLACEMENT_FIELD}
          control={control}
          value={masterPlacement}
          orientation={RadioOrientation.Vertical}
          onChange={(e) => {
            setValue(MASTERS_PLACEMENT_FIELD, e.target.value);
          }}
          options={[
            {
              disabled: disabled,
              value: MasterPlacementType.COLOCATED,
              label: (
                <Box display="flex">
                  {t('universeForm.cloudConfig.colocatedMasterMode')}
                  {/* <YBTooltip title={t('network.vpc.autoRegionsTooltip')} /> */}
                </Box>
              )
            },
            {
              disabled: disabled,
              value: MasterPlacementType.DEDICATED,
              label: (
                <Box display="flex">
                  {t('universeForm.cloudConfig.dedicatedMasterMode')}
                  <YBTooltip title={TOOLTIP_TITLE} className={classes.tooltipText}>
                    <Typography display="inline">
                      {t('universeForm.cloudConfig.tooltipMasterPlacement')}
                    </Typography>
                  </YBTooltip>
                </Box>
              )
            }
          ]}
        />
      </Box>
    </Box>
  );
};
