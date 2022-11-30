import React, { useContext, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider } from 'react-hook-form';
import { Typography, Grid, Box } from '@material-ui/core';
import { YBButton } from '../../../components';
import {
  AdvancedConfiguration,
  CloudConfiguration,
  GFlags,
  HelmOverrides,
  InstanceConfiguration,
  UserTags
} from './sections';
import { UniverseFormData, ClusterType, ClusterModes } from './utils/dto';
import { useFormMainStyles } from './universeMainStyle';
import { UniverseFormContext } from './UniverseFormContainer';

interface UniverseFormProps {
  defaultFormData: UniverseFormData;
  title: React.ReactNode;
  onFormSubmit: (data: UniverseFormData) => void;
  onCancel: () => void;
  onClusterTypeChange?: (data: UniverseFormData) => void;
}

export const UniverseForm: FC<UniverseFormProps> = ({
  defaultFormData,
  title,
  onFormSubmit,
  onCancel,
  onClusterTypeChange
}) => {
  const classes = useFormMainStyles();
  const { t } = useTranslation();

  //context state
  const { clusterType, mode } = useContext(UniverseFormContext)[0];
  const isPrimary = clusterType === ClusterType.PRIMARY;

  //init form
  const formMethods = useForm<UniverseFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultFormData,
    shouldFocusError: true
  });
  const {
    getValues,
    formState: { isValid },
    trigger
  } = formMethods;

  //methods
  const triggerValidation = () => trigger(undefined, { shouldFocus: true }); //Trigger validation and focus on fields with errors , undefined = validate all fields

  const onSubmit = (formData: UniverseFormData) =>
    isValid ? onFormSubmit(formData) : triggerValidation(); //submit only if the form is valid or else validate

  return (
    <Box className={classes.mainConatiner}>
      <FormProvider {...formMethods}>
        <form key={clusterType} onSubmit={formMethods.handleSubmit(onSubmit)}>
          <Box className={classes.formHeader}>
            <Typography variant="h3">{title}</Typography>
          </Box>
          <Box className={classes.formContainer}>
            <CloudConfiguration />
            <InstanceConfiguration />
            <AdvancedConfiguration />
            <GFlags />
            <UserTags />
            <HelmOverrides />
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
                  <YBButton variant="secondary" size="large" onClick={() => onCancel()}>
                    {t('common.cancel')}
                  </YBButton>
                  &nbsp;
                  {mode === ClusterModes.CREATE && onClusterTypeChange && (
                    <YBButton
                      variant="secondary"
                      size="large"
                      onClick={() => {
                        // Validate form before switching from primary to async
                        isPrimary && !isValid
                          ? triggerValidation()
                          : onClusterTypeChange(getValues());
                      }}
                    >
                      {isPrimary
                        ? t('universeForm.actions.configureRR')
                        : t('universeForm.actions.backPrimary')}
                    </YBButton>
                  )}
                  &nbsp;
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
