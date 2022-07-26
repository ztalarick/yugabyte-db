import React, { FC, ChangeEvent } from 'react';
import { Box } from '@material-ui/core';
import { Controller, useFormContext } from 'react-hook-form';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { api, QUERY_KEY } from '../../../../../helpers/api';

import { UniverseFormData } from '../../utils/dto';
import { YBLabel, YBAutoComplete } from '../../../../../components';
import { ROOT_CERT_FIELD } from '../../utils/constants';

const getOptionLabel = (option: Record<string, string>): string => option.label ?? '';
const renderOption = (option: Record<string, string>): string => option.label;

interface RootCertificateFieldProps {
  disabled: boolean;
}

export const RootCertificateField: FC<RootCertificateFieldProps> = () => {
  const { control, setValue } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();

  //fetch data
  const { data: certificates = [], isLoading } = useQuery(
    QUERY_KEY.getCertificates,
    api.getCertificates
  );

  const handleChange = (e: ChangeEvent<{}>, option: any) => {
    setValue(ROOT_CERT_FIELD, option?.uuid);
  };

  return (
    <Controller
      name={ROOT_CERT_FIELD}
      control={control}
      render={({ field, fieldState }) => {
        const value = certificates.find((i) => i.uuid === field.value) ?? '';
        return (
          <Box display="flex" width="100%">
            <YBLabel>{t('universeForm.instanceConfig.rootCertificate')}</YBLabel>
            <Box flex={1}>
              <YBAutoComplete
                loading={isLoading}
                options={(certificates as unknown) as Record<string, string>[]}
                getOptionLabel={getOptionLabel}
                renderOption={renderOption}
                onChange={handleChange}
                value={(value as unknown) as never}
                ybInputProps={{
                  placeholder: t('universeForm.instanceConfig.rootCertificatePlaceHolder'),
                  error: !!fieldState.error,
                  helperText: fieldState.error?.message
                }}
              />
            </Box>
          </Box>
        );
      }}
    />
  );
};
