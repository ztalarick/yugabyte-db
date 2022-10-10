import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useWatch } from 'react-hook-form';
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
import {
  PROVIDER_FIELD,
  EAR_FIELD,
  CLIENT_TO_NODE_ENCRYPT_FIELD,
  NODE_TO_NODE_ENCRYPT_FIELD,
  ACCESS_KEY_FIELD
} from '../../utils/constants';
import { AccessKey, CloudType, ClusterModes, ClusterType } from '../../utils/dto';
import { UniverseFormContext } from '../../UniverseFormContainer';

interface InstanceConfigProps {}

export const InstanceConfiguration: FC<InstanceConfigProps> = () => {
  const classes = useSectionStyles();
  const { t } = useTranslation();

  //form context
  const { isPrimary, mode, clusterType } = useContext(UniverseFormContext)[0];
  // const isFieldReadOnly = mode === clusterModes.EDIT_PRIMARY;
  const isFieldReadOnly = mode === ClusterModes.EDIT && clusterType === ClusterType.PRIMARY;

  //field data
  const provider = useWatch({ name: PROVIDER_FIELD });
  const earEnabled = useWatch({ name: EAR_FIELD });
  const clientNodeTLSEnabled = useWatch({ name: CLIENT_TO_NODE_ENCRYPT_FIELD });
  const nodeNodeTLSEnabled = useWatch({ name: NODE_TO_NODE_ENCRYPT_FIELD });

  //access key info
  const currentAccessKey = useWatch({ name: ACCESS_KEY_FIELD });
  const accessKeys = useSelector((state: any) => state.cloud.accessKeys);
  const currentAccessKeyInfo = accessKeys.data.find(
    (key: AccessKey) =>
      key.idKey.providerUUID === provider?.uuid && key.idKey.keyCode === currentAccessKey
  );

  return (
    <Box className={classes.sectionContainer}>
      <Typography variant="h4">{t('universeForm.instanceConfig.title')}</Typography>
      <Box width="100%" display="flex" flexDirection="column" justifyContent="center">
        <Box mt={4}>
          <Grid container>
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

        {[CloudType.aws, CloudType.gcp, CloudType.azu].includes(provider?.code) && (
          <>
            <Box mt={4}>
              <Grid container>
                <Grid lg={6} item container>
                  <AssignPublicIPField disabled={isFieldReadOnly || !isPrimary} />
                </Grid>
              </Grid>
            </Box>

            {currentAccessKeyInfo?.keyInfo?.showSetUpChrony === false && (
              <Box mt={2}>
                <Grid container>
                  <Grid lg={6} item container>
                    <TimeSyncField disabled={isFieldReadOnly} />
                  </Grid>
                </Grid>
              </Box>
            )}
          </>
        )}

        {[
          CloudType.aws,
          CloudType.gcp,
          CloudType.azu,
          CloudType.onprem,
          CloudType.kubernetes
        ].includes(provider?.code) && (
          <>
            <Box mt={6}>
              <Grid container>
                <Grid lg={6} item container>
                  <EncryptionAtRestField disabled={isFieldReadOnly || !isPrimary} />
                </Grid>
              </Grid>
            </Box>

            {earEnabled && (
              <Box mt={1}>
                <Grid container spacing={3}>
                  <Grid lg={6} item container>
                    <KMSConfigField disabled={isFieldReadOnly} />
                  </Grid>
                </Grid>
              </Box>
            )}

            <Box mt={6}>
              <YSQLField disabled={isFieldReadOnly || !isPrimary} />
            </Box>

            <Box mt={6}>
              <YCQLField disabled={isFieldReadOnly || !isPrimary} />
            </Box>

            <Box mt={6}>
              <Grid container>
                <Grid lg={6} item container>
                  <YEDISField disabled={isFieldReadOnly || !isPrimary} />
                </Grid>
              </Grid>
            </Box>

            <Box mt={6}>
              <Grid container>
                <Grid lg={6} item container>
                  <NodeToNodeTLSField disabled={isFieldReadOnly || !isPrimary} />
                </Grid>
              </Grid>
            </Box>

            <Box mt={2}>
              <Grid container>
                <Grid lg={6} item container>
                  <ClientToNodeTLSField disabled={isFieldReadOnly || !isPrimary} />
                </Grid>
              </Grid>
            </Box>

            {(clientNodeTLSEnabled || nodeNodeTLSEnabled) && (
              <Box mt={1} mb={4}>
                <Grid container spacing={3}>
                  <Grid lg={6} item container>
                    <RootCertificateField disabled={!isPrimary} />
                  </Grid>
                </Grid>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};
