import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { UniverseFormData } from '../../utils/dto';
import { YBButton } from '../../../../../components';

interface PlacementsFieldProps {
  disabled: boolean;
}

export const PlacementsField = ({ disabled }: PlacementsFieldProps): ReactElement => {
  const { control } = useFormContext<UniverseFormData>();
  const { fields } = useFieldArray({
    control,
    name: 'cloudConfig.placements'
  });
  // const { t } = useTranslation();

  const PlacementRow = (key: any): ReactElement => {
    return (
      <Box display="flex" width="100%" flexDirection="row" key={key}>
        {key}
      </Box>
    );
  };

  return (
    <Box display="flex" width="100%" flexDirection={'column'}>
      {fields.map((index) => (
        <PlacementRow key={index} />
      ))}
      <YBButton variant="primary">Add Zone</YBButton>
    </Box>
  );
};
