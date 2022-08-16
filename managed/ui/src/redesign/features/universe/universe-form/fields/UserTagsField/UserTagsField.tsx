import React, { ReactElement } from 'react';
import { useFormContext, useFieldArray, FieldArrayPath } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Box, Grid, IconButton } from '@material-ui/core';
import { UniverseFormData, InstanceTags } from '../../utils/dto';
import { YBButton, YBInputField } from '../../../../../components';
import { USER_TAGS_FIELD } from '../../utils/constants';
import { ReactComponent as CloseIcon } from '../../../../../assets/close.svg';

interface UserTagsFieldProps {}

export const UserTagsField = (_: UserTagsFieldProps): ReactElement => {
  const { t } = useTranslation();

  const { control } = useFormContext<UniverseFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: USER_TAGS_FIELD
  });

  return (
    <Grid container direction="column">
      <Box display="flex" flexDirection="column">
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
    </Grid>
  );
};
