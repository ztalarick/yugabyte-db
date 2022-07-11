import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Grid } from '@material-ui/core';
import { useSectionStyles } from '../../universeMainStyle';
import { UniverseNameField, ProvidersField, RegionsField, ReplicationFactor } from '../../fields';

interface CloudConfigProps {}

export const CloudConfiguration: FC<CloudConfigProps> = () => {
  const classes = useSectionStyles();
  const { t } = useTranslation();
  return (
    <Box className={classes.sectionContainer}>
      <Typography variant="h5">{t('universeForm.cloudConfig.title')}</Typography>
      <Box width="100%" display="flex" flexDirection="column" justifyContent="center">
        <Box mt={2}>
          <Grid container>
            <Grid lg={6} item>
              <UniverseNameField disabled={false} />
            </Grid>
          </Grid>
        </Box>
        <Box mt={2}>
          <Grid container>
            <Grid lg={6} item>
              <ProvidersField disabled={false} />
            </Grid>
          </Grid>
        </Box>
        <Box mt={2}>
          <Grid container>
            <Grid lg={6} item>
              <RegionsField disabled={false} />
            </Grid>
          </Grid>
        </Box>
        <Box mt={2}>
          <Grid container>
            <Grid lg={6} item>
              <ReplicationFactor disabled={false} />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};
