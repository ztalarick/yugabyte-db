import React, { FC, useContext } from 'react';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Grid } from '@material-ui/core';
import { useSectionStyles } from '../../universeMainStyle';
import {
  UniverseNameField,
  PlacementsField,
  ProvidersField,
  RegionsField,
  ReplicationFactor,
  TotalNodesField,
  DefaultRegionField
} from '../../fields';
import { UniverseFormContext } from '../../UniverseFormContainer';
import { ClusterModes, ClusterType } from '../../utils/dto';
import { getPrimaryCluster } from '../../utils/helpers';

interface CloudConfigProps {}

export const CloudConfiguration: FC<CloudConfigProps> = () => {
  const classes = useSectionStyles();
  const { t } = useTranslation();

  //feature flagging
  const featureFlags = useSelector((state: any) => state.featureFlags);
  const isGeoPartitionEnabled =
    featureFlags.test.enableGeoPartitioning || featureFlags.released.enableGeoPartitioning;

  //form context
  const { mode, clusterType, universeConfigureTemplate } = useContext(UniverseFormContext)[0];
  const isPrimary = clusterType === ClusterType.PRIMARY;
  const isEditMode = mode === ClusterModes.EDIT; //Form is in edit mode
  const isCreatePrimary = !isEditMode && isPrimary; //Creating Primary Cluster
  const isEditPrimary = isEditMode && isPrimary; //Editing Primary Cluster

  //For async cluster creation show providers based on primary clusters provider type
  const primaryProviderCode = !isPrimary
    ? _.get(getPrimaryCluster(universeConfigureTemplate), 'userIntent.providerType', null)
    : null;

  return (
    <Box className={classes.sectionContainer}>
      <Grid container spacing={3}>
        <Grid item lg={6}>
          <Box mb={4}>
            <Typography variant="h4">{t('universeForm.cloudConfig.title')}</Typography>
          </Box>
          {isPrimary && (
            <Box mt={1}>
              <UniverseNameField disabled={isEditPrimary} />
            </Box>
          )}
          <Box mt={1}>
            <ProvidersField disabled={isEditMode} filterByProvider={primaryProviderCode} />
          </Box>
          <Box mt={1}>
            <RegionsField disabled={false} />
          </Box>
          <Box mt={1} flexDirection={'row'} display="flex" alignItems="center">
            <TotalNodesField disabled={false} />
            <ReplicationFactor disabled={isEditMode} />
          </Box>
          {isCreatePrimary && isGeoPartitionEnabled && (
            <Box mt={2} display="flex" flexDirection="column">
              <DefaultRegionField />
            </Box>
          )}
        </Grid>
        <Grid item lg={6}>
          <PlacementsField disabled={false} />
        </Grid>
      </Grid>
    </Box>
  );
};
