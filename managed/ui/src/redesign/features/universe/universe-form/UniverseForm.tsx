import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const formMethods = useForm<UniverseFormData>({
    mode: 'onChange',
    defaultValues: defaultFormData
  });

  const onSubmit = (data: UniverseFormData) => console.log(data);

  return (
    <Box className={classes.mainConatiner}>
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <Box className={classes.formHeader}>
            <Typography variant="h4">{title}</Typography>
          </Box>
          <Box className={classes.formContainer}>
            <CloudConfiguration />
            <InstanceConfiguration />
            <AdvancedConfiguration />
            <GFlags />
            <UserTags />
          </Box>
          <Box className={classes.formFooter} mt={4}>
            <Grid container justifyContent="space-between">
              <Grid item lg={6}>
                <Box width="100%" display="flex" justifyContent="flex-start" alignItems="center">
                  Placeholder to Paint Cost estimation
                </Box>
              </Grid>
              <Grid item lg={6}>
                <Box width="100%" display="flex" justifyContent="flex-end">
                  <YBButton variant="primary" size="large" type="submit">
                    {t('common.create')}
                  </YBButton>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </form>
      </FormProvider>
    </Box>
  );
};
