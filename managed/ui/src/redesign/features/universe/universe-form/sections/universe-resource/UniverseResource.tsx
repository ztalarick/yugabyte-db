import React, { FC } from 'react';
import pluralize from 'pluralize';
import { Box, makeStyles, Theme } from '@material-ui/core';
import { YBCost, Multiplier } from '../../../../../components';
import { UniverseResource } from '../../utils/dto';

interface ResourceCountProps {
  size: any;
  kind?: string;
  unit?: string;
  pluralizeKind?: boolean;
  pluralizeUnit?: boolean;
}

interface UniverseResourceProps {
  data: UniverseResource;
}

const useStyles = makeStyles((theme: Theme) => ({
  resourceCountContainer: {
    marginRight: theme.spacing(4),
    minWidth: '70px',
    textAlign: 'left'
  },

  resourceCountSize: {
    fontSize: theme.spacing(4),
    fontWeight: 500,
    color: theme.palette.ybacolors.darkBlue,
    textOverflow: 'ellipsis',
    display: 'inline-block'
  },

  resourceCountUnit: {
    fontSize: theme.spacing(1.75),
    fontWeight: 400,
    color: theme.palette.ybacolors.darkBlue
  },

  resourceCountKind: {
    fontSize: theme.spacing(1.75),
    fontWeight: 300,
    color: '#333'
  },

  fullOpacity: {
    opacity: 1
  },

  halfOpacity: {
    opacity: 0.5
  }
}));

export const ResourceCount: FC<ResourceCountProps> = ({
  size,
  kind,
  unit,
  pluralizeKind,
  pluralizeUnit
}) => {
  const classes = useStyles();
  return (
    <Box className={classes.resourceCountContainer}>
      <div className={classes.resourceCountSize}>
        {size}
        <span className={classes.resourceCountUnit}>
          {pluralizeUnit && size > 0 && unit ? pluralize(unit, size) : unit}
        </span>
      </div>
      <div className={classes.resourceCountKind}>
        {pluralizeKind && size > 0 && kind ? pluralize(kind, size) : kind}
      </div>
    </Box>
  );
};

export const UniverseResourceContainer: FC<UniverseResourceProps> = ({ data }) => {
  const { numCores, memSizeGB, volumeSizeGB, volumeCount, pricePerHour, pricingKnown } = data || {};
  const classes = useStyles();
  const renderCost = () => {
    if (Number(pricePerHour > 0)) {
      const costPerDay = (
        <YBCost value={pricePerHour} multiplier={Multiplier.DAY} isPricingKnown={pricingKnown} />
      );
      const costPerMonth = (
        <YBCost value={pricePerHour} multiplier={Multiplier.MONTH} isPricingKnown={pricingKnown} />
      );
      return (
        <>
          <ResourceCount size={costPerDay} kind="/day" />
          <ResourceCount size={costPerMonth} kind="/month" />
        </>
      );
    } else return null;
  };

  return (
    <Box
      display={'flex'}
      width="100%"
      flexDirection={'row'}
      justifyContent="center"
      className={data ? classes.fullOpacity : classes.halfOpacity}
    >
      <ResourceCount size={numCores || 0} kind="Core" pluralizeKind />
      <ResourceCount size={memSizeGB || 0} unit="GB" kind="Memory" />
      <ResourceCount size={volumeSizeGB || 0} unit="GB" kind="Storage" />
      <ResourceCount size={volumeCount || 0} kind="Volume" pluralizeKind />
      {renderCost()}
    </Box>
  );
};
