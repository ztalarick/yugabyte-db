import React, { FC } from 'react';
import pluralize from 'pluralize';
import { useTranslation } from 'react-i18next';
import { Box, Typography, makeStyles, Theme } from '@material-ui/core';
import { YBModal } from '../../../../../components';
import { getPrimaryCluster } from '../../utils/helpers';
import { Cluster, UniverseDetails } from '../../utils/dto';

const useStyles = makeStyles((theme: Theme) => ({
  greyText: {
    color: '#8d8f9a'
  },
  regionBox: {
    borderRadius: theme.spacing[0.75],
    padding: theme.spacing(1.5, 2),
    backgroundColor: '#f7f7f7'
  }
}));

interface FMModalProps {
  open: boolean;
  oldConfigData: UniverseDetails;
  newConfigData: UniverseDetails;
  onClose: () => void;
  onSubmit: () => void;
}

export const FullMoveModal: FC<FMModalProps> = ({
  open,
  oldConfigData,
  newConfigData,
  onClose,
  onSubmit
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const oldPrimaryCluster = getPrimaryCluster(oldConfigData);
  const newPrimaryCluster = getPrimaryCluster(newConfigData);

  const renderConfig = (cluster: Cluster, isNew: boolean) => {
    const { userIntent, placementInfo } = cluster;
    console.log(placementInfo);
    return (
      <Box
        display="flex"
        flexDirection="column"
        flex={1}
        p={1}
        className={!isNew ? classes.greyText : undefined}
      >
        <Typography variant="h5">
          {isNew ? t('universeForm.new') : t('universeForm.current')}
        </Typography>
        <Box mt={2} display="inline-block" width="100%">
          <b>{userIntent?.instanceType}</b>&nbsp;type
          <br />
          <b>{userIntent?.deviceInfo?.numVolumes}Gb</b>{' '}
          {pluralize('volume', userIntent?.deviceInfo?.numVolumes)} of &nbsp;
          {t('universeForm.perInstance')}
          <b>{userIntent?.deviceInfo?.volumeSize}Gb</b> {t('universeForm.perInstance')}
        </Box>
        <Box mt={1} display="flex" flexDirection="column">
          {placementInfo?.cloudList[0].regionList?.map((region) => (
            <Box
              display="flex"
              key={region.code}
              mt={1}
              flexDirection="column"
              className={classes.regionBox}
            >
              <Typography variant="h5">{region.code}</Typography>
              <Box pl={2}>
                {region.azList.map((az) => (
                  <Typography key={az.name} variant="body2">
                    {az.name} - {az.numNodesInAZ} {pluralize('node', az.numNodesInAZ)}{' '}
                  </Typography>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <YBModal
      title={t('universeForm.fullMoveModal.modalTitle')}
      open={open}
      onClose={onClose}
      size="sm"
      cancelLabel={t('common.cancel')}
      submitLabel={t('common.proceed')}
      onSubmit={onSubmit}
      overrideHeight="auto"
      titleSeparator
    >
      <Box display="flex" width="100%" flexDirection="column">
        <Box>
          <Typography variant="body2">
            {t('universeForm.fullMoveModal.modalDescription')}
          </Typography>
        </Box>
        <Box mt={2} display="flex" flexDirection="row">
          {oldPrimaryCluster && renderConfig(oldPrimaryCluster, false)}
          {newPrimaryCluster && renderConfig(newPrimaryCluster, true)}
        </Box>
        <Box mt={2} display="flex" flexDirection="row">
          <Typography variant="body2">{t('universeForm.fullMoveModal.likeToProceed')}</Typography>
        </Box>
      </Box>
    </YBModal>
  );
};
