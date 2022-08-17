import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Grid } from '@material-ui/core';
import { useSectionStyles } from '../../universeMainStyle';
import {
  UniverseNameField,
  PlacementsField,
  ProvidersField,
  RegionsField,
  ReplicationFactor,
  TotalNodesField
} from '../../fields';
import { UniverseFormContext } from '../../UniverseForm';
import { clusterModes } from '../../utils/dto';

interface CloudConfigProps {}

export const CloudConfiguration: FC<CloudConfigProps> = () => {
  const classes = useSectionStyles();
  const { t } = useTranslation();

  //form context
  const { isPrimary, mode } = useContext(UniverseFormContext)[0];

  const isFieldReadOnly = mode === clusterModes.EDIT_PRIMARY;

  return (
    <Box className={classes.sectionContainer}>
      <Grid container spacing={3}>
        <Grid item lg={6}>
          <Box mt={1} mb={4}>
            <Typography variant="h5">{t('universeForm.cloudConfig.title')}</Typography>
          </Box>
          {isPrimary && (
            <Box mt={1}>
              <UniverseNameField disabled={isFieldReadOnly} />
            </Box>
          )}
          <Box mt={1}>
            <ProvidersField disabled={false} />
          </Box>
          <Box mt={1}>
            <RegionsField disabled={false} />
          </Box>
          <Box mt={1} flexDirection={'row'} display="flex" alignItems="center">
            <TotalNodesField disabled={false} />
            <ReplicationFactor disabled={isFieldReadOnly} />
          </Box>
        </Grid>
        <Grid item lg={6}>
          <PlacementsField disabled={false} />
        </Grid>
      </Grid>
      {/* <Typography variant="h5">{t('universeForm.cloudConfig.title')}</Typography>
      <Box width="100%" display="flex" flexDirection="column" justifyContent="center">
        {isPrimary && (
          <Box mt={2}>
            <Grid container>
              <Grid lg={6} item container>
                <UniverseNameField disabled={isFieldReadOnly} />
              </Grid>
            </Grid>
          </Box>
        )}
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
          <Grid container item alignItems="center" lg={6}>
            <Grid lg={7} item>
              <ReplicationFactor disabled={isFieldReadOnly} />
            </Grid>
            <Grid lg={5} item>
              <TotalNodesField disabled={false} />
            </Grid>
          </Grid>
        </Box>
        {provider?.uuid && regionList?.length > 0 && (
          <Box mt={2} display="flex" flexDirection="column">
            <Grid container>
              <Grid lg={6} item>
                <PlacementsField disabled={false} />
              </Grid>
            </Grid>
          </Box>
        )}
      </Box> */}
    </Box>
  );
};
