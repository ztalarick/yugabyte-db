// Copyright (c) YugaByte, Inc.

import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';
import {
  getPrimaryCluster,
  getReadOnlyCluster,
  isKubernetesUniverse,
  getUniverseNodeCount,
  getUniverseDedicatedNodeCount
} from '../../../utils/UniverseUtils';
import { YBWidget } from '../../panels';
import '../UniverseDisplayPanel/UniverseDisplayPanel.scss';
import { FlexContainer, FlexGrow, FlexShrink } from '../../common/flexbox/YBFlexBox';

export default class ClusterInfoPanel extends Component {
  static propTypes = {
    type: PropTypes.oneOf(['primary', 'read-replica']).isRequired
  };

  render() {
    const {
      type,
      isDedicatedNodes,
      universeInfo,
      insecure,
      universeInfo: {
        universeDetails,
        universeDetails: { clusters }
      }
    } = this.props;
    let cluster = null;
    // const nodeCount = getUniverseNodeCount(universeDetails.nodeDetailsSet, cluster);
    const isItKubernetesUniverse = isKubernetesUniverse(universeInfo);

    const colocatedNodesCount = getUniverseNodeCount(universeDetails.nodeDetailsSet, cluster);
    const dedicatedNodesCount = isDedicatedNodes
      ? getUniverseDedicatedNodeCount(universeDetails.nodeDetailsSet, cluster)
      : null;
    const nodeCount = {
      numTserverNodes: isDedicatedNodes ? dedicatedNodesCount.numTserverNodes : colocatedNodesCount,
      numMasterNodes: isDedicatedNodes ? dedicatedNodesCount.numMasterNodes : 0
    };

    if (type === 'primary') {
      cluster = getPrimaryCluster(clusters);
    } else if (type === 'read-replica') {
      cluster = getReadOnlyCluster(clusters);
    }
    const userIntent = cluster && cluster.userIntent;

    return (
      <YBWidget
        className={'overview-widget-cluster-primary'}
        headerLeft={'Primary Cluster'}
        body={
          <FlexContainer direction={'row'}>
            <FlexGrow className={'cluster-metadata-container'}>
              {/* <span className={'cluster-metadata-container'}> */}
              {isDedicatedNodes && (
                <Row className={'cluster-metadata-header'}>
                  <Col lg={10} md={6} sm={6} xs={6}>
                    <span>{'TServer'}</span>
                  </Col>
                </Row>
              )}
              <Row className={'cluster-metadata'}>
                <Col lg={6} md={6} sm={6} xs={6}>
                  <span className={'cluster-metadata__label'}>
                    {pluralize(isItKubernetesUniverse ? 'Pod' : 'Node', nodeCount.numTserverNodes)}
                  </span>
                </Col>
                <Col lg={6} md={6} sm={6} xs={6}>
                  <span className={'cluster-metadata__count cluster-metadata__align'}>
                    {nodeCount.numTserverNodes}
                  </span>
                </Col>
              </Row>
              {!insecure && (
                <Row className={'cluster-metadata'}>
                  <Col lg={6} md={6} sm={6} xs={6}>
                    <span className={'cluster-metadata__label'}>{'Instance Type:'}</span>
                  </Col>
                  <Col lg={6} md={6} sm={6} xs={6}>
                    <span className="cluster-metadata__align">
                      {userIntent && userIntent.instanceType}
                    </span>
                  </Col>
                </Row>
              )}
              <Row className={'cluster-metadata'}>
                <Col lg={8} md={6} sm={6} xs={6}>
                  <span className={'cluster-metadata__label'}>{'Replication Factor:'}</span>
                </Col>
                <Col lg={4} md={6} sm={6} xs={6} className="order-last order-sm-first">
                  <span className="cluster-metadata__align">
                    &nbsp;{userIntent.replicationFactor}
                  </span>
                </Col>
              </Row>
              {/* </span> */}
            </FlexGrow>
            {isDedicatedNodes && (
              <>
                <FlexShrink className={'cluster-metadat-divider'}></FlexShrink>
                <FlexGrow className={'cluster-metadata-container'}>
                  <Row className={'cluster-metadata-header'}>
                    <Col lg={10} md={6} sm={6} xs={6}>
                      <span>{'Master'}</span>
                    </Col>
                  </Row>
                  <Row className={'cluster-metadata'}>
                    <Col lg={6} md={6} sm={6} xs={6}>
                      <span className={'cluster-metadata__label'}>
                        {pluralize(
                          isItKubernetesUniverse ? 'Pod' : 'Node',
                          nodeCount.numMasterNodes
                        )}
                      </span>
                    </Col>
                    <Col lg={6} md={6} sm={6} xs={6}>
                      <span className={'cluster-metadata__count cluster-metadata__align'}>
                        {nodeCount.numMasterNodes}
                      </span>
                    </Col>
                  </Row>
                  {!insecure && (
                    <Row className={'cluster-metadata'}>
                      <Col lg={6} md={6} sm={6} xs={6}>
                        <span className={'cluster-metadata__label'}>{'Instance Type:'}</span>
                      </Col>
                      <Col lg={6} md={6} sm={6} xs={6}>
                        <span className="cluster-metadata__align">
                          {userIntent && userIntent.masterInstanceType}
                        </span>
                      </Col>
                    </Row>
                  )}
                  {/* </span> */}
                </FlexGrow>
              </>
            )}
          </FlexContainer>
        }
      />
    );
  }
}
