import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { api } from '../../utils/api';
import { Box, Typography } from '@material-ui/core';
import { YBModal, YBCheckbox, YBLabel, YBInputField } from '../../../../../components';
import { transitToUniverse } from '../../utils/helpers';
import { UniverseConfigure, ClusterType } from '../../utils/dto';
import { UPDATE_ACTIONS } from '../EditUniverse';

interface RNModalProps {
  open: boolean;
  onClose: () => void;
  universeData: UniverseConfigure;
}

type ResizeFormValues = {
  timeDelay: number;
};

const defaultValues: ResizeFormValues = {
  timeDelay: 180
};

export const ResizeNodeModal: FC<RNModalProps> = ({ open, onClose, universeData }) => {
  const [isResizeConfirmed, setResizeConfirm] = useState(false);
  const { t } = useTranslation();
  const { handleSubmit, control } = useForm<ResizeFormValues>({
    defaultValues
  });

  const submitResizeForm = async (finalPayload: any, uuid: string) => {
    try {
      await api.resizeNodes(finalPayload, uuid);
    } catch (e) {
      console.log(e);
    } finally {
      transitToUniverse(uuid);
    }
  };

  const handleFormSubmit = handleSubmit((formValues) => {
    const primaryCluster = universeData?.clusters?.find(
      (c) => c.clusterType === ClusterType.PRIMARY
    );
    if (primaryCluster && universeData) {
      let payload = {
        clusters: [primaryCluster],
        ybSoftwareVersion: primaryCluster?.userIntent.ybSoftwareVersion,
        universeUUID: universeData?.universeUUID,
        upgradeOption: 'Rolling',
        taskType: 'Resize_Node',
        nodePrefix: universeData?.nodePrefix,
        sleepAfterMasterRestartMillis: formValues.timeDelay * 1000,
        sleepAfterTServerRestartMillis: formValues.timeDelay * 1000
      };
      universeData?.universeUUID && submitResizeForm(payload, universeData.universeUUID);
    }
  });

  const confirmResizeCheckBox = () => {
    return (
      <YBCheckbox
        size="medium"
        onChange={(e) => setResizeConfirm(e.target.checked)}
        defaultChecked={isResizeConfirmed}
        value={isResizeConfirmed}
        label={t('universeForm.resizeNodeModal.confirmResizeCheckbox')}
      />
    );
  };

  return (
    <YBModal
      title={t('universeForm.resizeNodeModal.modalTitle')}
      open={open}
      onClose={onClose}
      size="xs"
      cancelLabel={t('universeForm.resizeNodeModal.cancelLabel')}
      submitLabel={t('universeForm.resizeNodeModal.confirmLabel')}
      buttonProps={{
        primary: {
          disabled: !isResizeConfirmed
          // showSpinner: isLoadingCreateMutation
        }
      }}
      dialogContentProps={{ style: { paddingTop: 20 } }}
      onSubmit={handleFormSubmit}
      overrideHeight={220}
      overrideWidth={600}
      titleSeparator
      actionsInfo={confirmResizeCheckBox()}
    >
      <Box display="flex" width="100%">
        {universeData?.updateOptions?.includes(UPDATE_ACTIONS.SMART_RESIZE_NON_RESTART) ? (
          <Typography variant="body2">
            {t('universeForm.resizeNodeModal.modalDescription')}
          </Typography>
        ) : (
          <>
            <YBLabel>{t('universeForm.resizeNodeModal.timeDelayLabel')}</YBLabel>
            <Box flex={1} ml={0.5}>
              <YBInputField
                control={control}
                type="number"
                name="timeDelay"
                fullWidth
                // disabled={disabled}
                inputProps={{
                  autoFocus: true,
                  'data-testid': 'timeDelay'
                }}
              />
            </Box>
          </>
        )}
      </Box>
    </YBModal>
  );
};
