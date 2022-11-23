import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@material-ui/core';
import { useWatch, useFormContext } from 'react-hook-form';
import { useSectionStyles } from '../../universeMainStyle';
import { GFlagsField } from '../../fields';
import { ClusterModes, ClusterType, UniverseFormData } from '../../utils/dto';
import { UniverseFormContext } from '../../UniverseFormContainer';
import { SOFTWARE_VERSION_FIELD, GFLAGS_FIELD } from '../../utils/constants';

interface GflagsProps {}

export const GFlags: FC<GflagsProps> = () => {
  const classes = useSectionStyles();
  const { t } = useTranslation();

  //form context
  const { mode, clusterType } = useContext(UniverseFormContext)[0];
  const isPrimary = clusterType === ClusterType.PRIMARY;
  const isEditMode = mode === ClusterModes.EDIT; //Form is in edit mode
  const isEditPrimary = isEditMode && isPrimary; //Editing Primary Cluster

  //form Data
  const { control } = useFormContext<Partial<UniverseFormData>>();
  const dbVersion = useWatch({ name: SOFTWARE_VERSION_FIELD });

  if (!isPrimary) return null;

  return (
    <Box className={classes.sectionContainer}>
      <Typography variant="h4">{t('universeForm.gFlags.title')}</Typography>
      <Box display="flex" width="100%" mt={2}>
        <GFlagsField
          dbVersion={dbVersion}
          fieldPath={GFLAGS_FIELD}
          control={control}
          editMode={false}
          isReadOnly={isEditPrimary}
        />
      </Box>
    </Box>
  );
};
