import { makeStyles } from '@material-ui/core';

export const useFormMainStyles = makeStyles((theme) => ({
  mainConatiner: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3, 0)
  },

  formHeader: {
    marginLeft: theme.spacing(3),
    position: 'fixed',
    top: 0,
    display: 'flex',
    alignItems: 'center',
    height: theme.spacing(7.5), // top navbar height
    zIndex: 1030
  },

  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: 'auto',
    padding: theme.spacing(0, 3),
    width: '100%'
  },

  formFooter: {
    display: 'flex',
    width: '100%',
    padding: theme.spacing(0, 3),
    background: '#f6f6f5'
  }
}));

export const useSectionStyles = makeStyles((theme) => ({
  sectionContainer: {
    display: 'flex',
    padding: theme.spacing(2, 0),
    flexDirection: 'column',
    borderBottom: '1px solid #e5e5e9'
  }
}));

export const useFormFieldStyles = makeStyles(() => ({
  itemDisabled: {
    cursor: 'not-allowed',
    opacity: 0.5
  }
}));
