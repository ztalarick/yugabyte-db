import React, { ReactElement, useState, useContext } from 'react';
import { Box, Grid } from '@material-ui/core';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useFormMainStyles } from '../../universeMainStyle';
import { UniverseFormData } from '../../utils/dto';
import { YBButton } from '../../../../../components';
import { UniverseFormContext } from '../../UniverseFormContainer';
import { UNIVERSE_OVERRIDES_FIELD, AZ_OVERRIDES_FIELD } from '../../utils/constants';
import { HelmOverridesModal } from './HelmOverridesModal';

interface HelmOverridesFieldProps {
  disabled: boolean;
}

export const HelmOverridesField = ({ disabled }: HelmOverridesFieldProps): ReactElement => {
  const [showOverridesModal, setShowOverridesModal] = useState(false);

  const { setValue } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();
  const classes = useFormMainStyles();

  const { universeConfigureTemplate } = useContext(UniverseFormContext)[0];

  //field data
  const azOverrides = useWatch({ name: AZ_OVERRIDES_FIELD });
  const universeOverrides = useWatch({ name: UNIVERSE_OVERRIDES_FIELD });

  //helper methods
  const handleClose = () => setShowOverridesModal(false);

  const handleSubmit = (universeOverrides: string, azOverrides: Record<string, string>) => {
    setValue(UNIVERSE_OVERRIDES_FIELD, universeOverrides);
    setValue(AZ_OVERRIDES_FIELD, azOverrides);
  };

  return (
    <Grid container direction="column">
      {showOverridesModal && (
        <HelmOverridesModal
          initialValues={{ azOverrides, universeOverrides }}
          open={showOverridesModal}
          onClose={handleClose}
          onSubmit={handleSubmit}
          universeConfigureTemplate={universeConfigureTemplate}
        />
      )}
      <Box mt={2}>
        <YBButton
          className={classes.formButtons}
          disabled={disabled}
          variant="primary"
          onClick={() => setShowOverridesModal(true)}
        >
          <span className="fa fa-plus" />
          {t('universeForm.helmOverrides.addK8sOverrides')}
        </YBButton>
      </Box>
    </Grid>
  );
};
