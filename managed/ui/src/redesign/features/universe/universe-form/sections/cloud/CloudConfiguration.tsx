import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Grid } from '@material-ui/core';
import { useSectionStyles } from '../../universeMainStyle';
import {
  UniverseNameField,
  ProvidersField,
  RegionsField,
  ReplicationFactor,
  TotalNodesField
} from '../../fields';

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
            <Grid lg={6} item container>
              <UniverseNameField disabled={false} />
            </Grid>
          </Grid>
        </Box>
        <Box mt={2}>
          <Grid container>
            <Grid lg={6} item container>
              <ProvidersField disabled={false} />
            </Grid>
          </Grid>
        </Box>
        <Box mt={2}>
          <Grid container>
            <Grid lg={6} item container>
              <RegionsField disabled={false} />
            </Grid>
          </Grid>
        </Box>
        <Box mt={2}>
          <Grid container justifyContent="flex-start" alignItems="flex-end" spacing={3}>
            <Grid lg={2} item>
              <TotalNodesField disabled={false} />
            </Grid>
            <Grid lg={4} item>
              <ReplicationFactor disabled={false} />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};
