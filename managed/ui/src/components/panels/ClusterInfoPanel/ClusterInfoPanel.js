// Copyright (c) YugaByte, Inc.

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  getPrimaryCluster,
  getReadOnlyCluster,
  isKubernetesUniverse,
  getUniverseNodeCount
} from '../../../utils/UniverseUtils';
import { YBWidget } from '../../panels';
import pluralize from 'pluralize';
import '../UniverseDisplayPanel/UniverseDisplayPanel.scss';
import { Row, Col } from 'react-bootstrap';
import { FlexGrow } from '../../common/flexbox/YBFlexBox';

export default class ClusterInfoPanel extends Component {
  static propTypes = {
    type: PropTypes.oneOf(['primary', 'read-replica']).isRequired
  };

  render() {
    const {
      type,
      universeInfo,
      insecure,
      universeInfo: {
        universeDetails,
        universeDetails: { clusters }
      }
    } = this.props;
    let cluster = null;
    const nodeCount = getUniverseNodeCount(universeDetails.nodeDetailsSet, cluster);
    const isItKubernetesUniverse = isKubernetesUniverse(universeInfo);

    if (type === 'primary') {
      cluster = getPrimaryCluster(clusters);
    } else if (type === 'read-replica') {
      cluster = getReadOnlyCluster(clusters);
    }
    const userIntent = cluster && cluster.userIntent;
    const connectStringPanelItemsShrink = [
      {
        name: pluralize(isItKubernetesUniverse ? 'Pod' : 'Node', nodeCount),
        data: nodeCount
      },
      !insecure && { name: 'Instance Type', data: userIntent && userIntent.instanceType },
      { name: 'Replication Factor', data: userIntent.replicationFactor }
    ];

    return (
      <YBWidget
        size={1}
        className={'overview-widget-cluster-primary'}
        headerLeft={'Primary Cluster'}
        body={
          <FlexGrow className={'cluster-metadata-container'}>
            <Row className={'cluster-metadata'}>
              <Col lg={8}>
                <span className={'cluster-metadata__label'}>
                  {pluralize(isItKubernetesUniverse ? 'Pod' : 'Node', nodeCount)}
                </span>
              </Col>
              <Col lg={4}>
                <span className={'cluster-metadata__count'}>{nodeCount}</span>
              </Col>
            </Row>
            {!insecure && (
              <Row className={'cluster-metadata'}>
                <Col lg={6}>
                  <span className={'cluster-metadata__label'}>{'Instance Type'}</span>
                </Col>
                <Col lg={6}>
                  <span>{userIntent && userIntent.instanceType}</span>
                </Col>
              </Row>
            )}
            <Row className={'cluster-metadata'}>
              <Col lg={8}>
                <span className={'cluster-metadata__label'}>{'Replication Factor'}</span>
              </Col>
              <Col lg={4}>
                <span>{userIntent.replicationFactor}</span>
              </Col>
            </Row>
          </FlexGrow>
        }
      />
    );
  }
}
