import React, { FC } from 'react';
import { Box, makeStyles } from '@material-ui/core';

const useYBLabelStyles = makeStyles((theme) => ({
  container: {
    width: '150px',
    alignItems: 'center',
    display: 'flex',
    fontSize: '13px',
    fontWeight: 500,
    fontFamily: 'Inter',
    color: theme.palette.ybacolors.labelBackground,
    fontStyle: 'normal'
  }
}));

interface YBLabelProps {
  dataTestId?: string;
}

export const YBLabel: FC<YBLabelProps> = ({ children, dataTestId }) => {
  const classes = useYBLabelStyles();
  return (
    <Box className={classes.container} data-testid={dataTestId}>
      {children}
    </Box>
  );
};
