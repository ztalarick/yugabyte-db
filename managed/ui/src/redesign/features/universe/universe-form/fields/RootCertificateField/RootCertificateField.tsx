import React, { FC, ChangeEvent, useContext } from 'react';
import { Box } from '@material-ui/core';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { api, QUERY_KEY } from '../../../../../helpers/api';

import { CloudType, UniverseFormData, clusterModes } from '../../utils/dto';
import { YBLabel, YBAutoComplete } from '../../../../../components';
import { PROVIDER_FIELD, ROOT_CERT_FIELD } from '../../utils/constants';
import { UniverseFormContext } from '../../UniverseForm';
import { useFormFieldStyles } from '../../universeMainStyle';

const getOptionLabel = (option: Record<string, string>): string => option.label ?? '';
interface RootCertificateFieldProps {
  disabled: boolean;
}

export const RootCertificateField: FC<RootCertificateFieldProps> = ({ disabled }) => {
  const { control, setValue } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();
  const classes = useFormFieldStyles();

  //form context
  const { mode } = useContext(UniverseFormContext)[0];

  //provider data
  const provider = useWatch({ name: PROVIDER_FIELD });

  //fetch data
  const { data: certificates = [], isLoading } = useQuery(
    QUERY_KEY.getCertificates,
    api.getCertificates
  );

  const handleChange = (e: ChangeEvent<{}>, option: any) => {
    setValue(ROOT_CERT_FIELD, option?.uuid);
  };

  const renderOption = (option: Record<string, string>): React.ReactNode => {
    let isDisabled = false;

    if (option?.certType === 'CustomCertHostPath') {
      if (mode === clusterModes.NEW_PRIMARY) {
        isDisabled = provider?.code !== CloudType.onprem;
      } else {
        isDisabled = provider?.code === CloudType.onprem;
      }
    }

    if (isDisabled)
      return (
        <Box
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          className={classes.itemDisabled}
        >
          {option.label}
        </Box>
      );
    else return <Box>{option.label}</Box>;
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
                disabled={disabled}
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
