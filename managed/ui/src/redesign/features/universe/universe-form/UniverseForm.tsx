import React, { FC } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Typography, Grid, Box } from '@material-ui/core';
import { YBButton } from '../../../components';
import {
  AdvancedConfiguration,
  CloudConfiguration,
  GFlags,
  InstanceConfiguration,
  UserTags
} from './sections';
import { UniverseFormData, clusterModes } from './utils/dto';
import { useFormMainStyles } from './universeMainStyle';

interface UniverseFormProps {
  defaultFormData: UniverseFormData;
  mode: clusterModes;
  title: string;
}

export const UniverseForm: FC<UniverseFormProps> = ({ defaultFormData, mode, title }) => {
  const classes = useFormMainStyles();
  const formMethods = useForm<UniverseFormData>({
    mode: 'onChange',
    defaultValues: defaultFormData
  });

  const onSubmit = (data: UniverseFormData) => console.log(data);

  return (
    <div className={classes.mainConatiner}>
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <div className={classes.formHeader}>
            <Typography variant="h4">{title}</Typography>
          </div>
          <div className={classes.formContainer}>
            <CloudConfiguration />
            <InstanceConfiguration />
            <AdvancedConfiguration />
            <GFlags />
            <UserTags />
          </div>
          <div className={classes.formFooter}>
            <Grid container alignItems="center">
              <Grid item lg={6}>
                <Box width="100%" display="flex" justifyContent="center" alignItems="center">
                  Placeholder to Paint Cost estimation
                </Box>
              </Grid>
              <Grid item lg={6}>
                <Box width="100%" display="flex" justifyContent="flex-end">
                  <YBButton variant="primary" size="large" type="submit">
                    Create
                  </YBButton>
                </Box>
              </Grid>
            </Grid>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
