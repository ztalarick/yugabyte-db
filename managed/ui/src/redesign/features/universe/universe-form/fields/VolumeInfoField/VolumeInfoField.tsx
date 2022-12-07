import React, { FC, useRef } from 'react';
import { Box, Grid, MenuItem } from '@material-ui/core';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { useUpdateEffect } from 'react-use';
import { CloudType, StorageType, UniverseFormData, VolumeType } from '../../utils/dto';
import { api, QUERY_KEY } from '../../utils/api';
import { YBInput, YBLabel, YBSelect } from '../../../../../components';
import {
  getStorageTypeOptions,
  getDeviceInfoFromInstance,
  getMinDiskIops,
  getMaxDiskIops,
  getIopsByStorageType,
  getThroughputByStorageType,
  GP3_DEFAULT_DISK_IOPS,
  GP3_DEFAULT_DISK_THROUGHPUT,
  GP3_MAX_THROUGHPUT,
  GP3_IOPS_TO_MAX_DISK_THROUGHPUT,
  UltraSSD_IOPS_TO_MAX_DISK_THROUGHPUT,
  UltraSSD_DISK_THROUGHPUT_CAP
} from './VolumeInfoFieldHelper';
import { PROVIDER_FIELD, DEVICE_INFO_FIELD, INSTANCE_TYPE_FIELD } from '../../utils/constants';
import { isEphemeralAwsStorageInstance } from '../InstanceTypeField/InstanceTypeFieldHelper';

interface VolumeInfoFieldProps {
  isEditMode: boolean;
  isPrimary: boolean;
  disableIops: boolean;
  disableThroughput: boolean;
  disableStorageType: boolean;
  disableVolumeSize: boolean;
  disableNumVolumes: boolean;
}

export const VolumeInfoField: FC<VolumeInfoFieldProps> = ({
  isEditMode,
  isPrimary,
  disableIops,
  disableThroughput,
  disableStorageType,
  disableVolumeSize,
  disableNumVolumes
}) => {
  const { control, setValue } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();
  const instanceTypeChanged = useRef(false);

  //field values
  const fieldValue = useWatch({ name: DEVICE_INFO_FIELD });
  const instanceType = useWatch({ name: INSTANCE_TYPE_FIELD });
  const provider = useWatch({ name: PROVIDER_FIELD });

  //get instance details
  const { data: instanceTypes } = useQuery(
    [QUERY_KEY.getInstanceTypes, provider?.uuid],
    () => api.getInstanceTypes(provider?.uuid),
    { enabled: !!provider?.uuid }
  );
  const instance = instanceTypes?.find((item) => item.instanceTypeCode === instanceType);

  //update volume info after istance changes
  useUpdateEffect(() => {
    if (!instance) return;

    let deviceInfo = getDeviceInfoFromInstance(instance);

    //retain old volume size if its edit mode or not ephemeral storage
    if (fieldValue && deviceInfo && !isEphemeralAwsStorageInstance(instance) && isEditMode) {
      deviceInfo.volumeSize = fieldValue.volumeSize;
      deviceInfo.numVolumes = fieldValue.numVolumes;
    }

    setValue(DEVICE_INFO_FIELD, deviceInfo ?? null);
  }, [instanceType]);

  //mark instance changed once only in edit mode
  useUpdateEffect(() => {
    if (isEditMode) instanceTypeChanged.current = true;
  }, [instanceType]);

  //helper
  const getThroughputByIops = (currentThroughput: number) => {
    const { diskIops, storageType } = fieldValue;
    if (storageType === StorageType.GP3) {
      if (
        (diskIops > GP3_DEFAULT_DISK_IOPS || currentThroughput > GP3_DEFAULT_DISK_THROUGHPUT) &&
        diskIops / currentThroughput < GP3_IOPS_TO_MAX_DISK_THROUGHPUT
      ) {
        return Math.min(
          GP3_MAX_THROUGHPUT,
          Math.max(diskIops / GP3_IOPS_TO_MAX_DISK_THROUGHPUT, GP3_DEFAULT_DISK_THROUGHPUT)
        );
      }
    } else if (storageType === StorageType.UltraSSD_LRS) {
      const maxThroughput = Math.min(
        diskIops / UltraSSD_IOPS_TO_MAX_DISK_THROUGHPUT,
        UltraSSD_DISK_THROUGHPUT_CAP
      );
      return Math.max(0, Math.min(maxThroughput, currentThroughput));
    }

    return currentThroughput;
  };

  //reset methods
  const resetThroughput = () => {
    const { storageType, throughput } = fieldValue;
    if ([StorageType.IO1, StorageType.GP3, StorageType.UltraSSD_LRS].includes(storageType)) {
      //resetting throughput
      const throughputVal = getThroughputByIops(Number(throughput));
      setValue(DEVICE_INFO_FIELD, { ...fieldValue, throughput: throughputVal });
    }
  };

  //field actions
  const onStorageTypeChanged = (storageType: StorageType) => {
    const throughput = getThroughputByStorageType(storageType);
    const diskIops = getIopsByStorageType(storageType);
    setValue(DEVICE_INFO_FIELD, { ...fieldValue, throughput, diskIops, storageType });
  };

  const onVolumeSizeChanged = (value: any) => {
    const { storageType, diskIops } = fieldValue;
    setValue(DEVICE_INFO_FIELD, { ...fieldValue, volumeSize: Number(value) });
    if (storageType === StorageType.UltraSSD_LRS) {
      onDiskIopsChanged(diskIops);
    }
  };

  const onDiskIopsChanged = (value: any) => {
    const { storageType, volumeSize } = fieldValue;
    const maxDiskIops = getMaxDiskIops(storageType, volumeSize);
    const minDiskIops = getMinDiskIops(storageType, volumeSize);
    const diskIops = Math.max(minDiskIops, Math.min(maxDiskIops, Number(value)));
    setValue(DEVICE_INFO_FIELD, { ...fieldValue, diskIops });
  };

  const onThroughputChange = (value: any) => {
    const throughput = getThroughputByIops(Number(value));
    setValue(DEVICE_INFO_FIELD, { ...fieldValue, throughput });
  };

  const onNumVolumesChanged = (numVolumes: any) => {
    setValue(DEVICE_INFO_FIELD, { ...fieldValue, numVolumes });
  };

  if (!instance) return null;

  const { volumeDetailsList } = instance.instanceTypeDetails;
  const { volumeType } = volumeDetailsList[0];

  if (![VolumeType.EBS, VolumeType.SSD, VolumeType.NVME].includes(volumeType)) return null;

  const fixedVolumeSize =
    [VolumeType.SSD, VolumeType.NVME].includes(volumeType) &&
    fieldValue?.storageType === StorageType.Scratch &&
    ![CloudType.kubernetes, CloudType.azu].includes(provider?.code);

  const fixedNumVolumes =
    [VolumeType.SSD, VolumeType.NVME].includes(volumeType) &&
    ![CloudType.kubernetes, CloudType.gcp, CloudType.azu].includes(provider?.code);

  const smartResizePossible =
    [CloudType.aws, CloudType.gcp, CloudType.kubernetes].includes(provider?.code) &&
    !isEphemeralAwsStorageInstance(instance) &&
    fieldValue?.storageType !== StorageType.Scratch &&
    isPrimary;

  return (
    <Controller
      control={control}
      name={DEVICE_INFO_FIELD}
      render={() => (
        <>
          {fieldValue && (
            <Box display="flex" width="100%" flexDirection="column">
              <Box>
                <Grid container spacing={2}>
                  <Grid item lg={12} xs={12}>
                    <Box display="flex">
                      <Box display="flex">
                        <YBLabel>{t('universeForm.instanceConfig.volumeInfo')}</YBLabel>
                      </Box>

                      <Box display="flex" flex={1}>
                        <Box flex={1}>
                          <YBInput
                            type="number"
                            fullWidth
                            disabled={
                              fixedNumVolumes || !instanceTypeChanged.current || disableNumVolumes
                            }
                            inputProps={{ min: 1 }}
                            value={fieldValue.numVolumes}
                            onChange={(event) => onNumVolumesChanged(event.target.value)}
                          />
                        </Box>

                        <Box display="flex" alignItems="center" px={1} flexShrink={1}>
                          x
                        </Box>

                        <Box flex={1}>
                          <YBInput
                            type="number"
                            fullWidth
                            disabled={
                              fixedVolumeSize ||
                              (!smartResizePossible && !instanceTypeChanged.current) ||
                              disableVolumeSize
                            }
                            inputProps={{ min: 1 }}
                            value={fieldValue.volumeSize}
                            onChange={(event) => onVolumeSizeChanged(event.target.value)}
                            onBlur={resetThroughput}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item lg={12} xs={12}>
                    {fieldValue.storageType && (
                      <Box display="flex">
                        <YBLabel>
                          {provider?.code === CloudType.aws
                            ? t('universeForm.instanceConfig.ebs')
                            : t('universeForm.instanceConfig.ssd')}
                        </YBLabel>
                        <Box flex={1}>
                          <YBSelect
                            fullWidth
                            disabled={disableStorageType}
                            value={fieldValue.storageType}
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
                    )}
                  </Grid>
                </Grid>
              </Box>

              {fieldValue.storageType && (
                <Box mt={1}>
                  <Grid container spacing={2}>
                    <Grid item lg={6} sm={12}>
                      {[StorageType.IO1, StorageType.GP3, StorageType.UltraSSD_LRS].includes(
                        fieldValue.storageType
                      ) && (
                        <Box display="flex">
                          <YBLabel>{t('universeForm.instanceConfig.provisionedIops')}</YBLabel>
                          <Box flex={1}>
                            <YBInput
                              type="number"
                              fullWidth
                              disabled={disableIops}
                              inputProps={{ min: 1 }}
                              value={fieldValue.diskIops}
                              onChange={(event) => onDiskIopsChanged(event.target.value)}
                              onBlur={resetThroughput}
                            />
                          </Box>
                        </Box>
                      )}
                    </Grid>

                    <Grid item lg={6} sm={12}>
                      {[StorageType.GP3, StorageType.UltraSSD_LRS].includes(
                        fieldValue.storageType
                      ) && (
                        <Box display="flex">
                          <YBLabel>
                            {' '}
                            {t('universeForm.instanceConfig.provisionedThroughput')}
                          </YBLabel>
                          <Box flex={1}>
                            <YBInput
                              type="number"
                              fullWidth
                              disabled={disableThroughput}
                              inputProps={{ min: 1 }}
                              value={fieldValue.throughput}
                              onChange={(event) => onThroughputChange(event.target.value)}
                            />
                          </Box>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          )}
        </>
      )}
    />
  );
};
