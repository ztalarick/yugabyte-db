import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Typography } from '@material-ui/core';
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
import { YBLabel } from '../../../../../components';

interface InstanceConfigProps {}

export const InstanceConfiguration: FC<InstanceConfigProps> = () => {
  const classes = useSectionStyles();
  const { t } = useTranslation();
  return (
    <Box className={classes.sectionContainer}>
      <Typography variant="h5">{t('universeForm.instanceConfig.title')}</Typography>
      <Box width="100%" display="flex" flexDirection="column" justifyContent="center">
        <Box mt={4}>
          <Grid container spacing={3}>
            <Grid lg={6} item container>
              <InstanceTypeField />
            </Grid>
          </Grid>
        </Box>

        <Box mt={1}>
          <Grid container>
            <Grid lg={6} item container>
              <Box display="flex">
                <YBLabel></YBLabel>
                <Box flex={1}>
                  <VolumeInfoField />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box mt={4}>
          <Grid container>
            <Grid lg={6} item container>
              <AssignPublicIPField disabled={false} />
            </Grid>
          </Grid>
        </Box>

        <Box mt={2}>
          <Grid container>
            <Grid lg={6} item container>
              <TimeSyncField disabled={false} />
            </Grid>
          </Grid>
        </Box>

        <Box mt={6}>
          <Grid container>
            <Grid lg={6} item container>
              <EncryptionAtRestField disabled={false} />
            </Grid>
          </Grid>
        </Box>

        <Box mt={1}>
          <Grid container spacing={3}>
            <Grid lg={6} item container>
              <KMSConfigField disabled={false} />
            </Grid>
          </Grid>
        </Box>

        <Box mt={6}>
          <YSQLField disabled={false} />
        </Box>

        <Box mt={6}>
          <YCQLField disabled={false} />
        </Box>

        <Box mt={6}>
          <Grid container>
            <Grid lg={6} item container>
              <YEDISField disabled={false} />
            </Grid>
          </Grid>
        </Box>

        <Box mt={2}>
          <Grid container>
            <Grid lg={6} item container>
              <NodeToNodeTLSField disabled={false} />
            </Grid>
          </Grid>
        </Box>

        <Box mt={6}>
          <Grid container>
            <Grid lg={6} item container>
              <ClientToNodeTLSField disabled={false} />
            </Grid>
          </Grid>
        </Box>

        <Box mt={1} mb={4}>
          <Grid container spacing={3}>
            <Grid lg={6} item container>
              <RootCertificateField disabled={false} />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};
