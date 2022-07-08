import React, { FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useQuery } from 'react-query';
import { Box, Grid, MenuItem } from '@material-ui/core';
import { useUpdateEffect } from 'react-use';
import { CloudType, StorageType, UniverseFormData } from '../../utils/dto';
import { api, QUERY_KEY } from '../../../../../helpers/api';
import { YBInput, YBLabel, YBSelect } from '../../../../../components';
import { getStorageTypeOptions, getDeviceInfoFromInstance } from './helper';

const DEFAULT_IOPS_IO1 = 1000;
const DEFAULT_IOPS_GP3 = 3000;
const DEFAULT_THROUGHPUT_GP3 = 125;

const FIELD_NAME = 'instanceConfig.deviceInfo';

export const VolumeInfoField: FC = () => {
  const { control, setValue } = useFormContext<UniverseFormData>();

  const fieldValue = useWatch({ name: FIELD_NAME });
  const instanceType = useWatch({ name: 'instanceConfig.instanceType' });
  //   const provider = useWatch({name: PROVIDER_FIELD_NAME});
  const provider = {
    uuid: '08c0ba0e-3558-40fc-94e5-a87a627de8c5',
    code: CloudType.aws
  };

  const { data: instanceTypes } = useQuery(
    [QUERY_KEY.getInstanceTypes, provider?.uuid],
    () => api.getInstanceTypes(provider?.uuid),
    { enabled: !!provider?.uuid }
  );

  useUpdateEffect(() => {
    const instance = instanceTypes?.find((item) => item.instanceTypeCode === instanceType);
    setValue(FIELD_NAME, instance ? getDeviceInfoFromInstance(instance) : null);
  }, [instanceType]);

  return (
    <Controller
      control={control}
      name={FIELD_NAME}
      render={({ field }) => (
        <>
          {fieldValue && (
            <Grid container>
              <YBLabel>Volume Info</YBLabel>

              <Box display="flex" flexDirection="column">
                <Grid container>
                  <Grid item lg={6}>
                    <Box display="flex" mr={4}>
                      <YBInput
                        type="number"
                        // don't allow changing volumes number for onprem provider
                        disabled={provider?.code === CloudType.onprem}
                        inputProps={{
                          min: 1
                        }}
                        onBlur={field.onBlur}
                        value={fieldValue.numVolumes}
                        onChange={(event) => {
                          const numVolumes = Number(event.target.value.replace(/\D/g, ''));
                          if (numVolumes > 0) field.onChange({ ...fieldValue, numVolumes });
                        }}
                      />
                      <Box
                        display="flex"
                        alignItems="center"
                        px={1}
                        className="device-info-field__x-symbol"
                      />
                      <YBInput
                        type="number"
                        // don't allow changing volume size for GCP or onprem providers
                        disabled={[CloudType.gcp, CloudType.onprem].includes(provider?.code)}
                        inputProps={{
                          min: 1
                        }}
                        onBlur={field.onBlur}
                        value={fieldValue.volumeSize}
                        onChange={(event) => {
                          const volumeSize = Number(event.target.value.replace(/\D/g, ''));
                          if (volumeSize > 0) field.onChange({ ...fieldValue, volumeSize });
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item lg={6}>
                    {fieldValue.storageType && (
                      <Box display="flex">
                        <YBLabel>
                          {provider?.code === CloudType.aws ? 'EBS Type' : 'Storage Type (SSD)'}
                        </YBLabel>

                        <YBSelect
                          disabled={false}
                          value={fieldValue.storageType}
                          onBlur={field.onBlur}
                          onChange={(e) => {
                            const storageType = e.target.value;
                            if (storageType === StorageType.IO1) {
                              field.onChange({
                                ...fieldValue,
                                diskIops: DEFAULT_IOPS_IO1,
                                throughput: null,
                                storageType
                              });
                            } else if (storageType === StorageType.GP3) {
                              field.onChange({
                                ...fieldValue,
                                diskIops: DEFAULT_IOPS_GP3,
                                throughput: DEFAULT_THROUGHPUT_GP3,
                                storageType
                              });
                            } else {
                              field.onChange({
                                ...fieldValue,
                                diskIops: null,
                                throughput: null,
                                storageType
                              });
                            }
                          }}
                        >
                          {getStorageTypeOptions(provider?.code).map((item) => (
                            <MenuItem key={item.value} value={item.value}>
                              {item.label}
                            </MenuItem>
                          ))}
                        </YBSelect>
                      </Box>
                    )}
                  </Grid>
                </Grid>

                <Grid container>
                  {fieldValue.storageType && (
                    <Box display="flex">
                      <Grid item lg={6}>
                        {(fieldValue.storageType === StorageType.IO1 ||
                          fieldValue.storageType === StorageType.GP3) && (
                          <Box display="flex">
                            <YBLabel>Provisioned IOPS</YBLabel>
                            <YBInput
                              type="number"
                              inputProps={{
                                min: 1
                              }}
                              onBlur={field.onBlur}
                              value={
                                fieldValue.diskIops ||
                                (fieldValue.storageType === StorageType.IO1
                                  ? DEFAULT_IOPS_IO1
                                  : DEFAULT_IOPS_GP3)
                              }
                              onChange={(event) => {
                                const diskIops = Number(event.target.value.replace(/\D/g, ''));
                                field.onChange({ ...fieldValue, diskIops });
                              }}
                            />
                          </Box>
                        )}
                      </Grid>

                      <Grid item lg={6}>
                        {fieldValue.storageType === StorageType.GP3 && (
                          <Box display="flex">
                            <YBLabel> Provisioned Throughput</YBLabel>
                            <YBInput
                              type="number"
                              inputProps={{
                                min: 1
                              }}
                              onBlur={field.onBlur}
                              value={fieldValue.throughput || DEFAULT_THROUGHPUT_GP3}
                              onChange={(event) => {
                                const throughput = Number(event.target.value.replace(/\D/g, ''));
                                field.onChange({ ...fieldValue, throughput });
                              }}
                            />
                          </Box>
                        )}
                      </Grid>
                    </Box>
                  )}
                </Grid>
              </Box>
            </Grid>
          )}
        </>
      )}
    />
  );
};
