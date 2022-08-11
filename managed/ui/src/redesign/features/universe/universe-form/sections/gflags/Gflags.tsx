import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@material-ui/core';
import { useWatch, useFormContext } from 'react-hook-form';
import { useSectionStyles } from '../../universeMainStyle';
import { GFlagsField } from '../../fields';
import { UniverseFormData } from '../../utils/dto';
import { SOFTWARE_VERSION_FIELD, GFLAGS_FIELD } from '../../utils/constants';

interface GflagsProps {}

export const GFlags: FC<GflagsProps> = () => {
  const classes = useSectionStyles();
  const { t } = useTranslation();
  const { control } = useFormContext<Partial<UniverseFormData>>();
  const dbVersion = useWatch({ name: SOFTWARE_VERSION_FIELD });

  return (
    <Box className={classes.sectionContainer}>
      <Typography variant="h5">{t('universeForm.gFlags.title')}</Typography>
      <Box display="flex" width="100%" mt={2}>
        <GFlagsField
          dbVersion={dbVersion}
          fieldPath={GFLAGS_FIELD}
          control={control}
          editMode={false}
          isReadOnly={false}
        />
      </Box>
    </Box>
  );
};
