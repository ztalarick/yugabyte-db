import React, { ReactElement, useContext } from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Typography } from '@material-ui/core';
import { CloudType, ClusterType, ClusterModes } from '../../utils/dto';
import { UniverseFormContext } from '../../UniverseFormContainer';
import { PROVIDER_FIELD } from '../../utils/constants';
import { HelmOverridesField } from '../../fields';

interface HelmOverridesProps {}

export const HelmOverrides = (_: HelmOverridesProps): ReactElement | null => {
  const { t } = useTranslation();

  //form context
  const { mode, clusterType } = useContext(UniverseFormContext)[0];
  const isPrimary = clusterType === ClusterType.PRIMARY;
  const isCreateMode = mode === ClusterModes.CREATE; //Form is in create mode
  const isCreatePrimary = isPrimary && isCreateMode;

  //field data
  const provider = useWatch({ name: PROVIDER_FIELD });

  if (isCreatePrimary && provider?.code === CloudType.kubernetes)
    return (
      <Box>
        <Box mt={2}>
          <Typography variant="h4">{t('universeForm.helmOverrides.title')}</Typography>
        </Box>
        <Box>
          <Grid container lg={6}>
            <HelmOverridesField disabled={false} />
          </Grid>
        </Box>
      </Box>
    );

  return null;
};
