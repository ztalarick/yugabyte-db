import React, { FC, ChangeEvent } from 'react';
import { Box } from '@material-ui/core';
import { Controller, useFormContext } from 'react-hook-form';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { api, QUERY_KEY } from '../../../../../helpers/api';

import { UniverseFormData } from '../../utils/dto';
import { YBLabel, YBAutoComplete } from '../../../../../components';

const getOptionLabel = (option: Record<string, string>): string => option.label ?? '';
const renderOption = (option: Record<string, string>): string => option.label;

interface RootCertificateFieldProps {
  disabled: boolean;
}

const FIELD_NAME = 'instanceConfig.rootCA';

export const RootCertificateField: FC<RootCertificateFieldProps> = () => {
  const { setValue } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();

  //fetch data
  const { data: certificates = [] } = useQuery(QUERY_KEY.getCertificates, api.getCertificates);

  const handleChange = (e: ChangeEvent<{}>, option: any) => {
    setValue(FIELD_NAME, option.uuid);
  };

  return (
    <Controller
      name={FIELD_NAME}
      render={({ field }) => {
        const value = certificates.find((i) => i.uuid === field.value) ?? '';
        return (
          <Box display="flex" width="100%">
            <YBLabel>{t('universeForm.instanceConfig.kmsConfig')}</YBLabel>
            <Box flex={1}>
              <YBAutoComplete
                options={(certificates as unknown) as Record<string, string>[]}
                getOptionLabel={getOptionLabel}
                renderOption={renderOption}
                onChange={handleChange}
                ybInputProps={{
                  placeholder: t('universeForm.instanceConfig.rootCertificatePlaceHolder')
                }}
                value={(value as unknown) as never}
              />
            </Box>
          </Box>
        );
      }}
    />
  );
};
