import React, { FC } from 'react';
import { Box, Typography } from '@material-ui/core';
import { useSectionStyles } from '../../universeMainStyle';

interface GflagsProps {}

export const GFlags: FC<GflagsProps> = () => {
  const classes = useSectionStyles();
  return (
    <Box className={classes.sectionContainer}>
      <Typography variant="h5">G-Flags</Typography>
    </Box>
  );
};
