import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext, useWatch } from 'react-hook-form';
import { useQuery } from 'react-query';
import { Box, Grid, MenuItem } from '@material-ui/core';
import { YBLabel, YBSelect } from '../../../../../../components';
import { api, QUERY_KEY } from '../../../utils/api';
import {
  getThroughputByStorageType,
  getStorageTypeOptions,
  getIopsByStorageType
} from './VolumeInfoFieldHelper';
import {
  StorageType,
  UniverseFormData,
  CloudType,
  VolumeType,
  MasterPlacementType
} from '../../../utils/dto';
import {
  DEVICE_INFO_FIELD,
  INSTANCE_TYPE_MASTER_FIELD,
  DEVICE_INFO_MASTER_FIELD,
  PROVIDER_FIELD,
  INSTANCE_TYPE_FIELD,
  MASTERS_PLACEMENT_FIELD
} from '../../../utils/constants';

interface StorageTypeFieldProps {
  disableStorageType: boolean;
}

export const StorageTypeField: FC<StorageTypeFieldProps> = ({ disableStorageType }) => {
  const { t } = useTranslation();
  const fieldValue = useWatch({ name: DEVICE_INFO_FIELD });
  const masterFieldValue = useWatch({ name: DEVICE_INFO_MASTER_FIELD });
  const masterPlacement = useWatch({ name: MASTERS_PLACEMENT_FIELD });
  const provider = useWatch({ name: PROVIDER_FIELD });
  const instanceType = useWatch({ name: INSTANCE_TYPE_FIELD });
  const masterInstanceType = useWatch({ name: INSTANCE_TYPE_MASTER_FIELD });
  const { setValue } = useFormContext<UniverseFormData>();

  //field actions
  const onStorageTypeChanged = (storageType: StorageType) => {
    const throughput = getThroughputByStorageType(storageType);
    const diskIops = getIopsByStorageType(storageType);
    setValue(DEVICE_INFO_FIELD, { ...fieldValue, throughput, diskIops, storageType });
    if (masterPlacement === MasterPlacementType.DEDICATED) {
      setValue(DEVICE_INFO_MASTER_FIELD, {
        ...masterFieldValue,
        throughput,
        diskIops,
        storageType
      });
    }
  };

  //get instance details
  const { data: instanceTypes } = useQuery(
    [QUERY_KEY.getInstanceTypes, provider?.uuid],
    () => api.getInstanceTypes(provider?.uuid),
    { enabled: !!provider?.uuid }
  );

  const instance = instanceTypes?.find((item) => item.instanceTypeCode === instanceType);
  const masterInstance = instanceTypes?.find(
    (item) => item.instanceTypeCode === masterInstanceType
  );
  if (!instance) return null;

  const { volumeDetailsList } = instance.instanceTypeDetails;
  const { volumeType } = volumeDetailsList[0];

  const masterVolumeDetailsList = masterInstance?.instanceTypeDetails;
  const masterVolumeType = masterVolumeDetailsList?.[0];

  const storageType = fieldValue.storageType;

  const renderStorageType = () => {
    if (
      [CloudType.gcp, CloudType.azu].includes(provider?.code) ||
      ((volumeType === VolumeType.EBS || masterVolumeType === VolumeType.EBS) &&
        provider?.code === CloudType.aws)
    )
      return (
        <Box display="flex">
          <YBLabel dataTestId="VolumeInfoFieldDedicated-StorageTypeLabel">
            {provider?.code === CloudType.aws
              ? t('universeForm.instanceConfig.ebs')
              : t('universeForm.instanceConfig.ssd')}
          </YBLabel>
          <Box flex={1}>
            <YBSelect
              fullWidth
              disabled={disableStorageType}
              value={storageType}
              inputProps={{
                min: 1,
                'data-testid': 'VolumeInfoFieldDedicated-StorageTypeSelect'
              }}
              onChange={(event) =>
                onStorageTypeChanged((event?.target.value as unknown) as StorageType)
              }
            >
              {getStorageTypeOptions(provider?.code).map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </YBSelect>
          </Box>
        </Box>
      );

    return null;
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item lg={6} sm={12}>
          <Box mt={masterPlacement === MasterPlacementType.DEDICATED ? 2 : 0}>
            {renderStorageType()}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
