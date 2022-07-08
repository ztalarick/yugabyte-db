import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@material-ui/core';
import { useSectionStyles } from '../../universeMainStyle';

interface CloudConfigProps {}

export const CloudConfiguration: FC<CloudConfigProps> = () => {
  const classes = useSectionStyles();
  const { t } = useTranslation();
  return (
    <Box className={classes.sectionContainer}>
      <Typography variant="h5">{t('universeForm.cloudConfig.title')}</Typography>
      <Box
        width="100%"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Typography>Placeholder to add all fields</Typography>
      </Box>
    </Box>
  );
};
