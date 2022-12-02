import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, makeStyles, Theme } from '@material-ui/core';
import { YBModal, YBButton } from '../../../../../components';
import { getPrimaryCluster } from '../../utils/helpers';
import { UniverseDetails } from '../../utils/dto';

const useStyles = makeStyles((theme: Theme) => ({
  greyText: {
    color: '#8d8f9a'
  }
}));

interface SRModalProps {
  open: boolean;
  oldConfigData: UniverseDetails;
  newConfigData: UniverseDetails;
  onClose: () => void;
  handleSmartResize: () => void;
  handleFullMove: () => void;
}

export const SmartResizeModal: FC<SRModalProps> = ({
  open,
  onClose,
  oldConfigData,
  newConfigData,
  handleSmartResize,
  handleFullMove
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const oldIntent = getPrimaryCluster(oldConfigData)?.userIntent;
  const newIntent = getPrimaryCluster(newConfigData)?.userIntent;
  const isVolumeChanged = oldIntent?.deviceInfo?.volumeSize !== newIntent?.deviceInfo?.volumeSize;

  return (
    <YBModal
      title={t('universeForm.fullMoveModal.modalTitle')}
      open={open}
      onClose={onClose}
      size="sm"
      cancelLabel={t('common.cancel')}
      submitLabel={t('universeForm.fullMoveModal.submitLabel')}
      buttonProps={{
        primary: {
          //   disabled: true
          // showSpinner: isLoadingCreateMutation
        }
      }}
      dialogContentProps={{ style: { paddingTop: 20 } }}
      onSubmit={handleFullMove}
      titleSeparator
      actionsInfo={
        <YBButton variant="primary" onClick={handleSmartResize}>
          {t('universeForm.smartResizeModal.buttonLabel')}
        </YBButton>
      }
    >
      <Box display="flex" width="100%" flexDirection="column">
        <Box>
          <Typography variant="body2">
            {t('universeForm.smartResizeModal.modalDescription', {
              value: isVolumeChanged ? 'and volume size' : ''
            })}
          </Typography>
        </Box>
        <Box mt={2} display="flex" width="100%" flexDirection="row">
          <Box flex={1} className={classes.greyText} p={1}>
            <Typography variant="h5">{t('universeForm.current')}</Typography>
            <Box mt={2} display="inline-block" width="100%">
              <b>{oldIntent?.instanceType}</b>&nbsp;{t('universeForm.perInstanceType')}
              <br />
              <b>{oldIntent?.deviceInfo?.volumeSize}Gb</b>&nbsp;{t('universeForm.perInstance')}
            </Box>
          </Box>
          <Box flex={1} p={1}>
            <Typography variant="h5">{t('universeForm.new')}</Typography>
            <Box mt={2} display="inline-block" width="100%">
              <b>{newIntent?.instanceType}</b>&nbsp;{t('universeForm.perInstanceType')}
              <br />
              <b>{newIntent?.deviceInfo?.volumeSize}Gb</b>&nbsp;{t('universeForm.perInstance')}
            </Box>
          </Box>
        </Box>
      </Box>
    </YBModal>
  );
};
