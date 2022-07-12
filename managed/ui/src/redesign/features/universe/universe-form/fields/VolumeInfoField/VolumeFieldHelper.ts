import { CloudType, DeviceInfo, InstanceType, StorageType } from '../../utils/dto';

export interface StorageTypeOption {
  value: StorageType;
  label: string;
}

export const DEFAULT_STORAGE_TYPES = {
  [CloudType.aws]: StorageType.GP2,
  [CloudType.gcp]: StorageType.Scratch,
  [CloudType.azu]: StorageType.Premium_LRS
};

export const AWS_STORAGE_TYPE_OPTIONS: StorageTypeOption[] = [
  { value: StorageType.IO1, label: 'IO1' },
  { value: StorageType.GP2, label: 'GP2' },
  { value: StorageType.GP3, label: 'GP3' }
];

export const GCP_STORAGE_TYPE_OPTIONS: StorageTypeOption[] = [
  { value: StorageType.Scratch, label: 'Local Scratch' },
  { value: StorageType.Persistent, label: 'Persistent' }
];

export const AZURE_STORAGE_TYPE_OPTIONS: StorageTypeOption[] = [
  { value: StorageType.StandardSSD_LRS, label: 'Standard' },
  { value: StorageType.Premium_LRS, label: 'Premium' },
  { value: StorageType.UltraSSD_LRS, label: 'Ultra' }
];

export const getStorageTypeOptions = (providerCode?: CloudType): StorageTypeOption[] => {
  switch (providerCode) {
    case CloudType.aws:
      return AWS_STORAGE_TYPE_OPTIONS;
    case CloudType.gcp:
      return GCP_STORAGE_TYPE_OPTIONS;
    case CloudType.azu:
      return AZURE_STORAGE_TYPE_OPTIONS;
    default:
      return [];
  }
};

export const getDeviceInfoFromInstance = (instance: InstanceType): DeviceInfo | null => {
  if (instance.instanceTypeDetails.volumeDetailsList.length) {
    const { volumeDetailsList } = instance.instanceTypeDetails;

    return {
      numVolumes: volumeDetailsList.length,
      volumeSize: volumeDetailsList[0].volumeSizeGB,
      diskIops: null,
      throughput: null,
      storageClass: 'standard',
      storageType: DEFAULT_STORAGE_TYPES[instance.providerCode] ?? null,
      mountPoints:
        instance.providerCode === CloudType.onprem
          ? volumeDetailsList.flatMap((item) => item.mountPath).join(',')
          : null
    };
  } else {
    return null;
  }
};
