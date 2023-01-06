import React, { FC, useContext } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useFormContext, useWatch } from 'react-hook-form';
import { Box, Grid, Typography } from '@material-ui/core';
import { InstanceTypeField, VolumeInfoField, StorageTypeField } from '../../fields';
import { YBLabel } from '../../../../../../components';
import { UniverseFormContext } from '../../../UniverseFormContainer';
import { CloudType, ClusterModes, ClusterType, MasterPlacementMode } from '../../../utils/dto';
import {
  PROVIDER_FIELD,
  MASTER_PLACEMENT_FIELD,
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
  const deviceInfo = useWatch({ name: DEVICE_INFO_FIELD });
  const masterPlacement = isAsync
    ? getValues(MASTER_PLACEMENT_FIELD)
    : useWatch({ name: MASTER_PLACEMENT_FIELD });

  const instanceAndVolumeElement = (isDedicatedMaster: boolean) => {
    return (
      <Box width={masterPlacement === MasterPlacementMode.DEDICATED ? '100%' : '605px'}>
        <InstanceTypeField isDedicatedMaster={isDedicatedMaster} />
        <VolumeInfoField
          isEditMode={!isCreateMode}
          isPrimary={isPrimary}
          disableVolumeSize={false}
          disableNumVolumes={!isCreateMode && provider?.code === CloudType.kubernetes}
          disableStorageType={!isCreatePrimary && !isCreateRR}
          disableIops={!isCreatePrimary && !isCreateRR}
          disableThroughput={!isCreatePrimary && !isCreateRR}
          isDedicatedMaster={isDedicatedMaster}
        />
      </Box>
    );
  };
  const instanceElementWrapper = (instanceLabel: string, isDedicatedMaster: boolean) => {
    return (
      <Box
        bgcolor="#FFFFFF"
        border="1px solid #E5E5E6"
        width="605px"
        borderRadius="8px"
        mr={2}
        flexShrink={1}
      >
        <Box m={2}>
          <Typography className={classes.subsectionHeaderFont}>{t(instanceLabel)}</Typography>
          {instanceAndVolumeElement(isDedicatedMaster)}
        </Box>
      </Box>
    );
  };

  return (
    <Box className={classes.sectionContainer} data-testid="instance-config-section">
      <Typography className={classes.sectionHeaderFont}>
        {t('universeForm.instanceConfig.title')}
      </Typography>
      <Box width="100%" display="flex" flexDirection="column" justifyContent="center" mt={4}>
        <Box flex={1} display="flex" flexDirection="row">
          {masterPlacement === MasterPlacementMode.COLOCATED
            ? instanceAndVolumeElement(false)
            : instanceElementWrapper('universeForm.tserver', false)}
          {masterPlacement === MasterPlacementMode.DEDICATED &&
            instanceElementWrapper('universeForm.master', true)}
        </Box>
        {deviceInfo &&
          provider?.code === CloudType.gcp &&
          masterPlacement === MasterPlacementMode.DEDICATED && (
            <Box width="50%">
              <StorageTypeField disableStorageType={!isCreatePrimary && !isCreateRR} />
            </Box>
          )}
      </Box>
    </Box>
  );
};
