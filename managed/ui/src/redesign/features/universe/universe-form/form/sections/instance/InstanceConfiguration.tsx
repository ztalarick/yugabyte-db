import React, { FC, useContext } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useFormContext, useWatch } from 'react-hook-form';
import { Box, Grid, Typography } from '@material-ui/core';
import { InstanceTypeField, VolumeInfoField, StorageTypeField } from '../../fields';
import { YBLabel } from '../../../../../../components';
import { UniverseFormContext } from '../../../UniverseFormContainer';
import { CloudType, ClusterModes, ClusterType, MasterPlacementType } from '../../../utils/dto';
import {
  PROVIDER_FIELD,
  MASTERS_PLACEMENT_FIELD,
  DEVICE_INFO_FIELD
} from '../../../utils/constants';
import { useSectionStyles } from '../../../universeMainStyle';
import { UniverseFormData } from '../../../utils/dto';

export const InstanceConfiguration: FC = () => {
  const classes = useSectionStyles();
  const { t } = useTranslation();

  //Feature flags
  const featureFlags = useSelector((state: any) => state.featureFlags);
  const isDedicatedNodesEnabled =
    featureFlags.test.enableDedicatedNodes || featureFlags.released.enableDedicatedNodes;
  const { getValues } = useFormContext<UniverseFormData>();

  //form context
  const { mode, clusterType, newUniverse } = useContext(UniverseFormContext)[0];
  const isPrimary = clusterType === ClusterType.PRIMARY;
  const isAsync = clusterType === ClusterType.ASYNC;
  const isCreateMode = mode === ClusterModes.CREATE; //Form is in edit mode
  const isCreatePrimary = isCreateMode && isPrimary; //Creating Primary Cluster
  const isCreateRR = !newUniverse && isCreateMode && !isPrimary; //Adding Async Cluster to an existing Universe

  //field data
  const provider = useWatch({ name: PROVIDER_FIELD });
  const fieldValue = useWatch({ name: DEVICE_INFO_FIELD });
  const masterPlacement = isAsync
    ? getValues(MASTERS_PLACEMENT_FIELD)
    : useWatch({ name: MASTERS_PLACEMENT_FIELD });
  console.log('Instance Configuration', masterPlacement);

  const instanceAndVolumeElement = () => {
    return (
      <Box width="100%">
        <InstanceTypeField />
        <VolumeInfoField
          isEditMode={!isCreateMode}
          isPrimary={isPrimary}
          disableVolumeSize={false}
          disableNumVolumes={!isCreateMode && provider?.code === CloudType.kubernetes}
          disableStorageType={!isCreatePrimary && !isCreateRR}
          disableIops={!isCreatePrimary && !isCreateRR}
          disableThroughput={!isCreatePrimary && !isCreateRR}
        />
      </Box>
    );
  };
  const dedicatedInstanceElement = () => {
    return (
      <Box bgcolor="#FFFFFF" border="1px solid #E5E5E6" borderRadius="8px" width="100%">
        <Box m={2}>
          <Typography className={classes.subsectionHeaderFont}>
            {t('universeForm.tserver')}
          </Typography>
          {instanceAndVolumeElement()}
        </Box>
      </Box>
    );
  };
  return (
    <Box className={classes.sectionContainer} data-testid="instance-config-section">
      <Typography className={classes.sectionHeaderFont}>
        {t('universeForm.instanceConfig.title')}
      </Typography>
      <Box width="100%" display="flex" flexDirection="column" justifyContent="center">
        <Box mt={4}>
          <Grid container spacing={3}>
            <Grid lg={6} item container>
              {masterPlacement === MasterPlacementType.COLOCATED
                ? instanceAndVolumeElement()
                : dedicatedInstanceElement()}
            </Grid>
            {masterPlacement === MasterPlacementType.DEDICATED && (
              <Grid lg={6} item container>
                <Box bgcolor="#FFFFFF" border="1px solid #E5E5E6" borderRadius="8px" width="100%">
                  <Box m={2}>
                    <Typography className={classes.subsectionHeaderFont}>
                      {t('universeForm.master')}
                      &nbsp;
                      <span className="fa fa-info-circle" />
                    </Typography>
                    <InstanceTypeField isDedicatedMaster={true} />
                    <VolumeInfoField
                      isEditMode={!isCreateMode}
                      isPrimary={isPrimary}
                      disableVolumeSize={false}
                      disableNumVolumes={!isCreateMode && provider?.code === CloudType.kubernetes}
                      disableStorageType={!isCreatePrimary && !isCreateRR}
                      disableIops={!isCreatePrimary && !isCreateRR}
                      disableThroughput={!isCreatePrimary && !isCreateRR}
                      isDedicatedMaster={true}
                    />
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
          {fieldValue &&
            provider?.code === CloudType.gcp &&
            masterPlacement === MasterPlacementType.DEDICATED && (
              <Box width="50%">
                <StorageTypeField disableStorageType={!isCreatePrimary && !isCreateRR} />
              </Box>
            )}
        </Box>
      </Box>
    </Box>
  );
};
