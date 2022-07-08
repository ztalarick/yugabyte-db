import React, { FC } from 'react';
import { Box, makeStyles } from '@material-ui/core';

const useYBHelperStyles = makeStyles(() => ({
  container: {
    width: 'auto',
    alignItems: 'center',
    fontSize: '11px'
  }
}));

export const YBHelper: FC = ({ children }) => {
  const classes = useYBHelperStyles();
  return <Box className={classes.container}>{children}</Box>;
};
