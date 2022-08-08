import React, { FC, useContext } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useWatch } from 'react-hook-form';
import { Box, Grid, Typography } from '@material-ui/core';
import { useSectionStyles } from '../../universeMainStyle';
import {
  AccessKeysField,
  ARNField,
  DBVersionField,
  DeploymentPortsField,
  IPV6Field,
  NetworkAccessField,
  SystemDField,
  YBCField
} from '../../fields';
import { PROVIDER_FIELD } from '../../utils/constants';
import { CloudType, clusterModes } from '../../utils/dto';
import { UniverseFormContext } from '../../UniverseForm';

interface AdvancedConfigProps {}

export const AdvancedConfiguration: FC<AdvancedConfigProps> = () => {
  const classes = useSectionStyles();
  const { t } = useTranslation();

  //feature flagging
  const featureFlags = useSelector((state: any) => state.featureFlags);
  const isYBCEnabled = featureFlags.test.enableYbc || featureFlags.released.enableYbc;

  //form context
  const { isPrimary, mode } = useContext(UniverseFormContext)[0];
  const isFieldReadOnly = mode === clusterModes.EDIT_PRIMARY;
  const isDbVersionReadOnly = mode !== clusterModes.NEW_PRIMARY;

  //field data
  const provider = useWatch({ name: PROVIDER_FIELD });

  if (!provider?.code) return null;

  return (
    <Box className={classes.sectionContainer}>
      <Typography variant="h5">{t('universeForm.advancedConfig.title')}</Typography>
      <Box width="100%" display="flex" flexDirection="column" justifyContent="center">
        <Box mt={2}>
          <Grid container spacing={3}>
            <Grid lg={6} item container>
              <DBVersionField disabled={isDbVersionReadOnly} />
            </Grid>

            {provider.code !== CloudType.kubernetes && (
              <Grid lg={6} item container>
                <AccessKeysField disabled={isFieldReadOnly} />
              </Grid>
            )}
          </Grid>
        </Box>

        {isYBCEnabled && (
          <Box mt={2}>
            <Grid container spacing={3}>
              <Grid lg={6} item container>
                <YBCField disabled={isFieldReadOnly} />
              </Grid>
            </Grid>
          </Box>
        )}

        {provider.code === CloudType.aws && (
          <Box mt={2}>
            <Grid container spacing={3}>
              <Grid lg={6} item container>
                <ARNField disabled={isFieldReadOnly} />
              </Grid>
            </Grid>
          </Box>
        )}

        {provider.code === CloudType.kubernetes && (
          <>
            <Box mt={2}>
              <Grid container>
                <Grid lg={6} item container>
                  <IPV6Field disabled={isFieldReadOnly || !isPrimary} />
                </Grid>
              </Grid>
            </Box>

            <Box mt={2}>
              <Grid container>
                <Grid lg={6} item container>
                  <NetworkAccessField disabled={isFieldReadOnly || !isPrimary} />
                </Grid>
              </Grid>
            </Box>
          </>
        )}

        <Box mt={2}>
          <Grid container>
            <Grid lg={6} item container>
              <SystemDField disabled={isFieldReadOnly || !isPrimary} />
            </Grid>
          </Grid>
        </Box>

        {provider.code !== CloudType.kubernetes && (
          <Box mt={2}>
            <Grid container>
              <Grid lg={6} item container>
                <DeploymentPortsField disabled={isFieldReadOnly || !isPrimary} />
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Box>
  );
};
