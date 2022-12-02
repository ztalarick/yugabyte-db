import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@material-ui/core';
import { useForm } from 'react-hook-form';
import { api } from '../../utils/api';
import { YBModal, YBCheckbox, YBInputField } from '../../../../../components';
import { getAsyncCluster, getUniverseName, transitToUniverse } from '../../utils/helpers';
import { UniverseDetails } from '../../utils/dto';

interface DeleteClusterModalProps {
  open: boolean;
  universeData: UniverseDetails;
  onClose: () => void;
}

type DeleteClusterFormValues = {
  universeName: string | null;
};

const DEFAULT_VALUES: DeleteClusterFormValues = {
  universeName: null
};

export const DeleteClusterModal: FC<DeleteClusterModalProps> = ({
  open,
  universeData,
  onClose
}) => {
  const [forceDelete, setForceDelete] = useState<boolean>(false);
  const { t } = useTranslation();
  const universeName = getUniverseName(universeData);

  //init form
  const {
    handleSubmit,
    control,
    formState: { isValid }
  } = useForm<DeleteClusterFormValues>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
    reValidateMode: 'onChange'
  });

  const handleFormSubmit = handleSubmit(async () => {
    const universeUUID = universeData.universeUUID;
    const asyncCluster = getAsyncCluster(universeData);
    const clusterUUID = asyncCluster?.uuid;

    if (clusterUUID) {
      try {
        await api.deleteCluster(clusterUUID, universeUUID, forceDelete);
      } catch (e) {
        console.log(e);
      } finally {
        transitToUniverse(universeUUID);
      }
    }
  });

  const forceDeleteCheckBox = () => {
    return (
      <YBCheckbox
        size="medium"
        onChange={(e) => setForceDelete(e.target.checked)}
        defaultChecked={forceDelete}
        value={forceDelete}
        label={t('universeForm.deleteClusterModal.forceDeleteCheckbox')}
      />
    );
  };

  return (
    <YBModal
      title={t('universeForm.deleteClusterModal.modalTitle', { universeName })}
      open={open}
      overrideHeight={300}
      titleSeparator
      size="sm"
      cancelLabel={t('common.no')}
      submitLabel={t('common.yes')}
      onClose={onClose}
      onSubmit={handleFormSubmit}
      actionsInfo={forceDeleteCheckBox()}
      buttonProps={{
        primary: {
          disabled: !isValid
        }
      }}
      dialogContentProps={{ style: { paddingTop: 20 } }}
    >
      <Box display="flex" width="100%" flexDirection="column">
        <Box>
          <Typography variant="body2">
            {t('universeForm.deleteClusterModal.deleteRRMessage')}
          </Typography>
        </Box>
        <Box mt={2.5}>
          <Typography variant="body1">
            {t('universeForm.deleteClusterModal.enterUniverseName')}
          </Typography>
          <Box>
            <YBInputField
              control={control}
              placeholder={universeName}
              rules={{
                validate: {
                  universeNameMatch: (value) => value === universeName
                }
              }}
              name="universeName"
              fullWidth
              inputProps={{
                autoFocus: true,
                'data-testid': 'deleteRR-universename'
              }}
            />
          </Box>
        </Box>
      </Box>
    </YBModal>
  );
};
