import React, { ReactElement, useContext } from 'react';
import { useFormContext, useFieldArray, useWatch, FieldArrayPath } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Typography, IconButton } from '@material-ui/core';
import { useSectionStyles } from '../../universeMainStyle';
import { UniverseFormData, InstanceTags } from '../../utils/dto';
import { YBButton, YBInputField } from '../../../../../components';
import { CloudType } from '../../utils/dto';
import { UniverseFormContext } from '../../UniverseForm';
import { USER_TAGS_FIELD, PROVIDER_FIELD } from '../../utils/constants';
import { ReactComponent as CloseIcon } from '../../../../../assets/close.svg';

interface UserTagsProps {}

export const UserTags = (_: UserTagsProps): ReactElement | null => {
  const classes = useSectionStyles();
  const { t } = useTranslation();

  const { control } = useFormContext<UniverseFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: USER_TAGS_FIELD
  });

  //form context
  const { isPrimary } = useContext(UniverseFormContext)[0];

  //field data
  const provider = useWatch({ name: PROVIDER_FIELD });

  if (isPrimary && [CloudType.aws, CloudType.gcp, CloudType.azu].includes(provider?.code))
    return (
      <Box>
        <Box className={classes.sectionContainer} borderBottom="0px">
          <Typography variant="h5">{t('universeForm.userTags.title')}</Typography>
        </Box>
        <Box mt={2} display="flex" flexDirection="column">
          {fields.map((field, index) => {
            return (
              <Grid container key={field.name} spacing={1} alignItems="center">
                <Grid item xs>
                  <YBInputField
                    name={`${USER_TAGS_FIELD}.${index}.name` as FieldArrayPath<InstanceTags>}
                    control={control}
                    fullWidth
                  />
                </Grid>
                <Grid item xs>
                  <YBInputField
                    name={`${USER_TAGS_FIELD}.${index}.value` as FieldArrayPath<InstanceTags>}
                    control={control}
                    fullWidth
                  />
                </Grid>
                <Grid item>
                  <IconButton color="primary" onClick={() => remove(index)}>
                    <CloseIcon />
                  </IconButton>
                </Grid>
              </Grid>
            );
          })}
        </Box>
        <Box mt={2}>
          <YBButton variant="primary" onClick={() => append({ name: '', value: '' })}>
            {t('universeForm.userTags.addRow')}
          </YBButton>
        </Box>
      </Box>
    );

  return null;
};
