import React, { FC } from 'react';
import { Box, Typography } from '@material-ui/core';
import { useSectionStyles } from '../../universeMainStyle';

interface UserTagsProps {}

export const UserTags: FC<UserTagsProps> = () => {
  const classes = useSectionStyles();
  return (
    <Box className={classes.sectionContainer} borderBottom="0px">
      <Typography variant="h5">User Tags</Typography>
    </Box>
  );
};
