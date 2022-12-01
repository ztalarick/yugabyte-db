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
import { UNIVERSE_NAME_FIELD } from './utils/constants';

interface UniverseFormProps {
  defaultFormData: UniverseFormData;
  onFormSubmit: (data: UniverseFormData) => void;
  onCancel: () => void;
  onClusterTypeChange?: (data: UniverseFormData) => void;
  submitLabel?: string;
  isNewUniverse?: boolean; // This flag is used only in new cluster creation flow
}

export const UniverseForm: FC<UniverseFormProps> = ({
  defaultFormData,
  onFormSubmit,
  onCancel,
  onClusterTypeChange,
  submitLabel,
  isNewUniverse = false
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
  const { getValues, trigger } = formMethods;

  //methods
  const triggerValidation = () => trigger(undefined, { shouldFocus: true }); //Trigger validation and focus on fields with errors , undefined = validate all fields

  const onSubmit = (formData: UniverseFormData) => onFormSubmit(formData);

  const switchClusterType = () => onClusterTypeChange && onClusterTypeChange(getValues());

  //switching from primary to RR and vice versa  (Create Primary + RR flow)
  const handleClusterChange = async () => {
    if (isPrimary) {
      // Validate primary form before switching to async
      let isValid = await triggerValidation();
      isValid && switchClusterType();
    } else {
      //switching from async to primary
      switchClusterType();
    }
  };

  const renderHeader = () => {
    return (
      <Box className={classes.formHeader}>
        <Typography className={classes.headerFont}>
          {isNewUniverse ? t('universeForm.createUniverse') : getValues(UNIVERSE_NAME_FIELD)}
        </Typography>
        {!isNewUniverse && (
          <Typography className={classes.subHeaderFont}>
            <i className="fa fa-chevron-right"></i> &nbsp;
            {isPrimary ? t('universeForm.editUniverse') : t('universeForm.configReadReplica')}
          </Typography>
        )}
        {onClusterTypeChange && (
          <>
            <Box
              flexShrink={1}
              display={'flex'}
              ml={2}
              alignItems="center"
              className={isPrimary ? classes.selectedTab : classes.disabledTab}
            >
              {t('universeForm.primaryTab')}
            </Box>
            <Box
              flexShrink={1}
              display={'flex'}
              ml={2}
              alignItems="center"
              className={!isPrimary ? classes.selectedTab : classes.disabledTab}
            >
              {t('universeForm.rrTab')}
            </Box>
          </>
        )}
      </Box>
    );
  };

  return (
    <Box className={classes.mainConatiner}>
      <FormProvider {...formMethods}>
        <form key={clusterType} onSubmit={formMethods.handleSubmit(onSubmit)}>
          {renderHeader()}
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
                    <YBButton variant="secondary" size="large" onClick={handleClusterChange}>
                      {isPrimary
                        ? t('universeForm.actions.configureRR')
                        : t('universeForm.actions.backPrimary')}
                    </YBButton>
                  )}
                  &nbsp;
                  <YBButton variant="primary" size="large" type="submit">
                    {submitLabel ? submitLabel : t('common.save')}
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
