import React, { FC } from 'react';
import { Box, Typography } from '@material-ui/core';
import { useSectionStyles } from '../../universeMainStyle';

interface InstanceConfigProps {}

export const InstanceConfiguration: FC<InstanceConfigProps> = () => {
  const classes = useSectionStyles();
  return (
    <Box className={classes.sectionContainer}>
      <Typography variant="h5">Instance Configuration</Typography>
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
