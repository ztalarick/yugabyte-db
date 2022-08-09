import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import { Box, Typography, MenuItem } from '@material-ui/core';
import { YBButton, YBSelect, YBInput, YBLabel, YBCheckbox } from '../../../../../components';
import { useGetAllZones, useGetUnusedZones, useNodePlacements } from './placementHelper';
import { Placement, UniverseFormData } from '../../utils/dto';
import {
  TOTAL_NODES_FIELD,
  REPLICATION_FACTOR_FIELD,
  PLACEMENTS_FIELD
} from '../../utils/constants';
interface PlacementsFieldProps {
  disabled: boolean;
}

export type PlacementWithId = Placement & { id: any };

export const PlacementsField = ({ disabled }: PlacementsFieldProps): ReactElement => {
  const { control, setValue, getValues } = useFormContext<UniverseFormData>();
  const { t } = useTranslation();
  const replicationFactor = useWatch({ name: REPLICATION_FACTOR_FIELD });

  //custom hooks
  const allZones = useGetAllZones(); //returns all AZ
  const unUsedZones = useGetUnusedZones(allZones); //return unused AZ
  const { isLoading } = useNodePlacements(); // Places Nodes

  const { fields, update, append } = useFieldArray({
    control,
    name: PLACEMENTS_FIELD
  });

  const renderHeader = (
    <Box flex={1} mt={2} display="flex" flexDirection="row">
      <Box flex={2}>
        <YBLabel>{t('universeForm.cloudConfig.azNameLabel')}</YBLabel>
      </Box>
      <Box flexShrink={1} width="150px">
        <YBLabel>{t('universeForm.cloudConfig.azNodesLabel')}</YBLabel>
      </Box>
      <Box flexShrink={1} width="100px">
        <YBLabel>{t('universeForm.cloudConfig.preferredAZLabel')}</YBLabel>
      </Box>
    </Box>
  );

  const handleAZChange = (oldAz: Placement, azName: string, index: any) => {
    const selectedZone = allZones.find((az: any) => az.name === azName);
    const updateAz = { ...oldAz, ...selectedZone };
    update(index, updateAz);
  };

  //validates numNodesINAZ >= TotalNodes
  const validateNodeCount = (index: number, newValue: number) => {
    const initialCount = 0;
    const totalNodesinAz = fields
      .map((e) => e.numNodesInAZ)
      .reduce((prev, cur) => prev + cur, initialCount);
    return totalNodesinAz - fields[index].numNodesInAZ + newValue >= getValues(TOTAL_NODES_FIELD);
  };

  const renderPlacements = () => {
    return fields.map((field: PlacementWithId, index: number) => {
      const numNodesLabel = `${PLACEMENTS_FIELD}.${index}.numNodesInAZ` as any;
      const prefferedAZLabel = `${PLACEMENTS_FIELD}.${index}.isAffinitized` as any;

      return (
        <Box flex={1} display="flex" mt={1} flexDirection="row" key={field.id}>
          <Box flex={2} mr={0.5}>
            <YBSelect
              fullWidth
              disabled={false}
              value={field.name}
              onChange={(e) => {
                console.log(e.target.value);
                handleAZChange(field, e.target.value, index);
              }}
            >
              {[field, ...unUsedZones].map((az) => (
                <MenuItem key={az.name} value={az.name}>
                  {az.name}
                </MenuItem>
              ))}
            </YBSelect>
          </Box>
          <Box flexShrink={1} width="150px" mr={0.5}>
            <YBInput
              type="number"
              fullWidth
              disabled={false}
              inputProps={{
                min: 1
              }}
              value={field.numNodesInAZ}
              onChange={(e) => {
                if (validateNodeCount(index, Number(e.target.value)))
                  setValue(numNodesLabel, Number(e.target.value));
              }}
            />
          </Box>
          <Box flexShrink={1} display="flex" alignItems="center" width="100px">
            <YBCheckbox
              size="medium"
              name={prefferedAZLabel}
              onChange={(e) => {
                setValue(prefferedAZLabel, e.target.checked);
              }}
              defaultChecked={field.isAffinitized}
              value={field.isAffinitized}
              label=""
            />
          </Box>
        </Box>
      );
    });
  };

  if (fields.length) {
    return (
      <Box display="flex" width="50%" flexDirection="column">
        <Typography variant="h5">{t('universeForm.cloudConfig.nodePlacementTitle')}</Typography>
        {renderHeader}
        {renderPlacements()}
        {unUsedZones.length > 0 && fields.length < replicationFactor && (
          <Box display="flex" justifyContent={'flex-end'} mr={0.5} mt={1}>
            <YBButton
              style={{ width: '150px' }}
              variant="primary"
              onClick={() => append({ ...unUsedZones[0], numNodesInAZ: 1, replicationFactor: 1 })}
            >
              {t('universeForm.cloudConfig.addZoneButton')}
            </YBButton>
          </Box>
        )}
      </Box>
    );
  }

  if (isLoading) return <>Loading..</>;
  return <></>;
};
