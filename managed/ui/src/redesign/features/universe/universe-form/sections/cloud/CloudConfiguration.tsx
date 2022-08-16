import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useWatch } from 'react-hook-form';
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
import { PROVIDER_FIELD, REGIONS_FIELD } from '../../utils/constants';

interface CloudConfigProps {}

export const CloudConfiguration: FC<CloudConfigProps> = () => {
  const classes = useSectionStyles();
  const { t } = useTranslation();

  const provider = useWatch({ name: PROVIDER_FIELD });
  const regionList = useWatch({ name: REGIONS_FIELD });
  //form context
  const { isPrimary, mode } = useContext(UniverseFormContext)[0];

  const isFieldReadOnly = mode === clusterModes.EDIT_PRIMARY;

  return (
    <Box className={classes.sectionContainer}>
      <Typography variant="h5">{t('universeForm.cloudConfig.title')}</Typography>
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
      </Box>
    </Box>
  );
};
