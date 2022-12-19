import React, { FC, useContext } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useWatch } from 'react-hook-form';
import { Box, Grid, Typography } from '@material-ui/core';
import {
  InstanceTypeField,
  InstanceTypeMasterField,
  VolumeInfoField,
  VolumeInfoMasterField,
  DedicatedNodesField
} from '../../fields';
import { YBLabel } from '../../../../../../components';
import { UniverseFormContext } from '../../../UniverseFormContainer';
import { CloudType, ClusterModes, ClusterType, MasterPlacementType } from '../../../utils/dto';
import { PROVIDER_FIELD, MASTERS_PLACEMENT_FIELD } from '../../../utils/constants';
import { useSectionStyles } from '../../../universeMainStyle';

export const InstanceConfiguration: FC = () => {
  const classes = useSectionStyles();
  const { t } = useTranslation();

  //Feature flags
  const featureFlags = useSelector((state: any) => state.featureFlags);
  const isDedicatedNodesEnabled =
    featureFlags.test.enableDedicatedNodes || featureFlags.released.enableDedicatedNodes;

  //form context
  const { mode, clusterType, newUniverse } = useContext(UniverseFormContext)[0];
  const isPrimary = clusterType === ClusterType.PRIMARY;
  const isCreateMode = mode === ClusterModes.CREATE; //Form is in edit mode
  const isCreatePrimary = isCreateMode && isPrimary; //Creating Primary Cluster
  const isCreateRR = !newUniverse && isCreateMode && !isPrimary; //Adding Async Cluster to an existing Universe

  //field data
  const provider = useWatch({ name: PROVIDER_FIELD });
  const masterPlacement = useWatch({ name: MASTERS_PLACEMENT_FIELD });

  return (
    <Box className={classes.sectionContainer} data-testid="instance-config-section">
      <Typography className={classes.sectionHeaderFont}>
        {t('universeForm.instanceConfig.title')}
      </Typography>
      <Box width="100%" display="flex" flexDirection="column" justifyContent="center">
        <Box mt={4}>
          <Grid container spacing={3}>
            <Grid lg={6} item container>
              <Box bgcolor="#FFFFFF" border="1px solid #E5E5E6" borderRadius="8px" width="100%">
                <Box m={2}>
                  <YBLabel dataTestId="UniverseNameField-Label">
                    {t('universeForm.cloudConfig.universeName')}
                  </YBLabel>
                  <InstanceTypeField />
                  <VolumeInfoField
                    isEditMode={!isCreateMode}
                    isPrimary={isPrimary}
                    disableIops={!isCreatePrimary && !isCreateRR}
                    disableThroughput={!isCreatePrimary && !isCreateRR}
                    disableStorageType={!isCreatePrimary && !isCreateRR}
                    disableVolumeSize={false}
                    disableNumVolumes={!isCreateMode && provider?.code === CloudType.kubernetes}
                  />
                </Box>
              </Box>
            </Grid>
            {masterPlacement === MasterPlacementType.DEDICATED && (
              <Grid lg={6} item container>
                <Box bgcolor="#FFFFFF" border="1px solid #E5E5E6" borderRadius="8px" width="100%">
                  <Box m={2}>
                    <YBLabel dataTestId="UniverseNameField-Label">
                      {t('universeForm.cloudConfig.universeName')}
                    </YBLabel>
                    <InstanceTypeMasterField />
                    <VolumeInfoMasterField
                      isEditMode={!isCreateMode}
                      isPrimary={isPrimary}
                      disableIops={!isCreatePrimary && !isCreateRR}
                      disableThroughput={!isCreatePrimary && !isCreateRR}
                      disableStorageType={!isCreatePrimary && !isCreateRR}
                      disableVolumeSize={false}
                      disableNumVolumes={!isCreateMode && provider?.code === CloudType.kubernetes}
                    />
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>

        <Box mt={2}>
          <Grid container spacing={3}>
            {/* <Grid lg={6} item container>
              <VolumeInfoField
                isEditMode={!isCreateMode}
                isPrimary={isPrimary}
                disableIops={!isCreatePrimary && !isCreateRR}
                disableThroughput={!isCreatePrimary && !isCreateRR}
                disableStorageType={!isCreatePrimary && !isCreateRR}
                disableVolumeSize={false}
                disableNumVolumes={!isCreateMode && provider?.code === CloudType.kubernetes}
              />
            </Grid> */}
            {/* {masterPlacement === MasterPlacementType.DEDICATED && (
              <Grid lg={6} item container>
                <VolumeInfoMasterField
                  isEditMode={!isCreateMode}
                  isPrimary={isPrimary}
                  disableIops={!isCreatePrimary && !isCreateRR}
                  disableThroughput={!isCreatePrimary && !isCreateRR}
                  disableStorageType={!isCreatePrimary && !isCreateRR}
                  disableVolumeSize={false}
                  disableNumVolumes={!isCreateMode && provider?.code === CloudType.kubernetes}
                />
              </Grid>
            )} */}
          </Grid>
        </Box>

        {isCreatePrimary && isDedicatedNodesEnabled && (
          <Box mt={2}>
            <Grid container>
              <Grid lg={6} item container>
                <DedicatedNodesField disabled={false} />
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Box>
  );
};
