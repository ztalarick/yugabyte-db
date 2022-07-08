import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@material-ui/core';
import { useSectionStyles } from '../../universeMainStyle';

interface UserTagsProps {}

export const UserTags: FC<UserTagsProps> = () => {
  const classes = useSectionStyles();
  const { t } = useTranslation();
  return (
    <Box className={classes.sectionContainer} borderBottom="0px">
      <Typography variant="h5">{t('universeForm.userTags.title')}</Typography>
    </Box>
  );
};
