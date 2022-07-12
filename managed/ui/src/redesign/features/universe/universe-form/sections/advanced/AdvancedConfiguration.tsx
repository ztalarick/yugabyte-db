import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
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

interface AdvancedConfigProps {}

export const AdvancedConfiguration: FC<AdvancedConfigProps> = () => {
  const classes = useSectionStyles();
  const { t } = useTranslation();

  return (
    <Box className={classes.sectionContainer}>
      <Typography variant="h5">{t('universeForm.advancedConfig.title')}</Typography>
      <Box width="100%" display="flex" flexDirection="column" justifyContent="center">
        <Box mt={2}>
          <Grid container spacing={3}>
            <Grid lg={6} item container>
              <DBVersionField disabled={false} />
            </Grid>

            <Grid lg={6} item container>
              <AccessKeysField disabled={false} />
            </Grid>
          </Grid>
        </Box>

        <Box mt={2}>
          <Grid container spacing={3}>
            <Grid lg={6} item container>
              <YBCField disabled={false} />
            </Grid>
          </Grid>
        </Box>

        <Box mt={2}>
          <Grid container spacing={3}>
            <Grid lg={6} item container>
              <ARNField disabled={false} />
            </Grid>
          </Grid>
        </Box>

        <Box mt={2}>
          <Grid container>
            <Grid lg={6} item container>
              <IPV6Field disabled={false} />
            </Grid>
          </Grid>
        </Box>

        <Box mt={2}>
          <Grid container>
            <Grid lg={6} item container>
              <NetworkAccessField disabled={false} />
            </Grid>
          </Grid>
        </Box>

        <Box mt={2}>
          <Grid container>
            <Grid lg={6} item container>
              <SystemDField disabled={false} />
            </Grid>
          </Grid>
        </Box>

        <Box mt={2}>
          <Grid container>
            <Grid lg={6} item container>
              <DeploymentPortsField disabled={false} />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};
