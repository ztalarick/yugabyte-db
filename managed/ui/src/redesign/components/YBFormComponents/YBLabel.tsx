import React, { FC } from 'react';
import { Box, makeStyles } from '@material-ui/core';

const useYBLabelStyles = makeStyles(() => ({
  container: {
    width: '150px',
    alignItems: 'center',
    display: 'flex',
    fontSize: '13px',
    fontWeight: 500
  }
}));

export const YBLabel: FC = ({ children }) => {
  const classes = useYBLabelStyles();
  return <Box className={classes.container}>{children}</Box>;
};
