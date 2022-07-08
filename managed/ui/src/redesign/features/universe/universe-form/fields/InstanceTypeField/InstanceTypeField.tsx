import React, { ChangeEvent, FC } from 'react';
import pluralize from 'pluralize';
import _ from 'lodash';
import { Box } from '@material-ui/core';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { api, QUERY_KEY } from '../../../../../helpers/api';
import { CloudType, InstanceType, UniverseFormData } from '../../utils/dto';
import { YBLabel, YBAutoComplete } from '../../../../../components';

export const AZURE_INSTANCE_TYPE_GROUPS = {
  'B-Series': /^standard_b.+/i,
  'D-Series': /^standard_d.+/i,
  'E-Series': /^standard_e.+/i,
  'F-Series': /^standard_f.+/i,
  'GS-Series': /^standard_gs.+/i,
  'H-Series': /^standard_h.+/i,
  'L-Series': /^standard_l.+/i,
  'M-Series': /^standard_m.+/i,
  'N-Series': /^standard_n.+/i,
  'P-Series': /^standard_p.+/i
};
const DEFAULT_INSTANCE_TYPES = {
  [CloudType.aws]: 'c5.large',
  [CloudType.gcp]: 'n1-standard-1',
  [CloudType.kubernetes]: 'small'
};

const FIELD_NAME = 'instanceConfig.instanceType';
// const PROVIDER_FIELD_NAME = 'instanceConfig.provider';

const sortAndGroup = (data?: InstanceType[], cloud?: CloudType): InstanceType[] => {
  if (!data) return [];

  const getGroupName = (instanceTypeCode: string): string => {
    switch (cloud) {
      case CloudType.aws:
        return instanceTypeCode.split('.')[0]; // c5.large --> c5
      case CloudType.gcp:
        return instanceTypeCode.split('-')[0]; // n1-standard-1 --> n1
      case CloudType.azu:
        for (const [groupName, regexp] of Object.entries(AZURE_INSTANCE_TYPE_GROUPS)) {
          if (regexp.test(instanceTypeCode)) return groupName;
        }
        return 'Other';
      default:
        return '';
    }
  };

  // add categories
  const result: InstanceType[] = data.map((item) => {
    const groupName = getGroupName(item.instanceTypeCode);
    return {
      ...item,
      groupName
    };
  });

  // sort by group names and label
  return _.sortBy(result, ['groupName', 'label']);
};

const getOptionLabel = (op: Record<string, string>): string => {
  if (op) {
    const option = (op as unknown) as InstanceType;
    let result = option.instanceTypeCode;
    if (option.numCores && option.memSizeGB) {
      const cores = pluralize('core', option.numCores, true);
      result = `${option.instanceTypeCode} (${cores}, ${option.memSizeGB}GB RAM)`;
    }
    return result;
  }
  return '';
};

const renderOption = (option: Record<string, string>) => {
  return <>{getOptionLabel(option)}</>;
};

export const InstanceTypeField: FC = () => {
  const { getValues, setValue } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();

  console.log(useWatch());

  //   const provider = useWatch({name: PROVIDER_FIELD_NAME});
  const provider = {
    uuid: '08c0ba0e-3558-40fc-94e5-a87a627de8c5',
    code: CloudType.aws
  };

  const handleChange = (e: ChangeEvent<{}>, option: any) => {
    setValue(FIELD_NAME, option.instanceTypeCode);
  };

  const { data } = useQuery(
    [QUERY_KEY.getInstanceTypes, provider?.uuid],
    () => api.getInstanceTypes(provider?.uuid),
    {
      enabled: !!provider?.uuid,
      onSuccess: (data) => {
        // preselect default instance or pick first item from the instance types list
        if (!getValues(FIELD_NAME) && provider?.code && data.length) {
          const defaultInstanceType =
            DEFAULT_INSTANCE_TYPES[provider.code] || data[0].instanceTypeCode;
          setValue(FIELD_NAME, defaultInstanceType); // intentionally omit validation as field wasn't changed by user
        }
      }
    }
  );
  const instanceTypes = sortAndGroup(data, provider?.code);

  return (
    <Controller
      name={FIELD_NAME}
      render={({ field }) => {
        const value = instanceTypes.find((i) => i.instanceTypeCode === field.value) ?? '';
        return (
          <Box display="flex" width="100%">
            <YBLabel>{t('universeForm.instanceConfig.instanceType')}</YBLabel>
            <Box flex={1}>
              <YBAutoComplete
                value={(value as unknown) as Record<string, string>}
                options={(instanceTypes as unknown) as Record<string, string>[]}
                groupBy={(option: Record<string, string>) => option.groupName}
                getOptionLabel={getOptionLabel}
                renderOption={renderOption}
                onChange={handleChange}
              />
            </Box>
          </Box>
        );
      }}
    />
  );
};
