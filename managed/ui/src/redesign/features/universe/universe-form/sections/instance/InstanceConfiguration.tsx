import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@material-ui/core';
import { useSectionStyles } from '../../universeMainStyle';
import {
  AssignPublicIPField,
  ClientToNodeTLSField,
  EncryptionAtRestField,
  InstanceTypeField,
  KMSConfigField,
  NodeToNodeTLSField,
  RootCertificateField,
  TimeSyncField,
  VolumeInfoField,
  YEDISField,
  YCQLField,
  YSQLField
} from '../../fields';

interface InstanceConfigProps {}

export const InstanceConfiguration: FC<InstanceConfigProps> = () => {
  const classes = useSectionStyles();
  const { t } = useTranslation();
  return (
    <Box className={classes.sectionContainer}>
      <Typography variant="h5">{t('universeForm.instanceConfig.title')}</Typography>
      <Box width="100%" display="flex" flexDirection="column" justifyContent="center">
        <Box mt={4}>
          <InstanceTypeField></InstanceTypeField>
        </Box>
        <Box mt={1}>
          <VolumeInfoField></VolumeInfoField>
        </Box>

        <Box mt={4}>
          <AssignPublicIPField disabled={false}></AssignPublicIPField>
        </Box>

        <Box mt={2}>
          <TimeSyncField disabled={false}></TimeSyncField>
        </Box>

        <Box mt={6}>
          <EncryptionAtRestField disabled={false}></EncryptionAtRestField>
        </Box>

        <Box mt={1}>
          <KMSConfigField disabled={false}></KMSConfigField>
        </Box>

        <Box mt={6}>
          <YSQLField disabled={false}></YSQLField>
        </Box>

        <Box mt={6}>
          <YCQLField disabled={false}></YCQLField>
        </Box>

        <Box mt={6}>
          <YEDISField disabled={false}></YEDISField>
        </Box>

        <Box mt={2}>
          <NodeToNodeTLSField disabled={false}></NodeToNodeTLSField>
        </Box>

        <Box mt={6}>
          <ClientToNodeTLSField disabled={false}></ClientToNodeTLSField>
        </Box>

        <Box mt={1} mb={4}>
          <RootCertificateField disabled={false}></RootCertificateField>
        </Box>
      </Box>
    </Box>
  );
};
