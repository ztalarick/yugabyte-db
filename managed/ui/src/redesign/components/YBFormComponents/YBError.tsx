import React, { FC } from 'react';
import { Box, makeStyles } from '@material-ui/core';

const useYBErrorStyles = makeStyles(() => ({
  container: {
    width: 'auto',
    alignItems: 'center',
    color: 'red'
  }
}));

export const YBError: FC = ({ children }) => {
  const classes = useYBErrorStyles();
  return <Box className={classes.container}>{children}</Box>;
};
