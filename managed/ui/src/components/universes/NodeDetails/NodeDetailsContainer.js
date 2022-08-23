// Copyright YugaByte Inc.

import { NodeDetails } from '../../universes';
import { connect } from 'react-redux';
import {
  fetchUniverseMetadata,
  getUniversePerNodeStatus,
  getUniversePerNodeStatusResponse,
  getUniversePerNodeAllowedActions,
  getUniversePerNodeAllowedActionsResponse,
  getUniversePerNodeMetrics,
  getUniversePerNodeMetricsResponse,
  getMasterLeader,
  getMasterLeaderResponse,
  resetMasterLeader
} from '../../../actions/universe';
import {
  getNodeInstancesForProvider,
  getNodeInstancesForReadReplicaProvider,
  getNodesInstancesForProviderResponse,
  getNodesInstancesForReadReplicaProviderResponse
} from '../../../actions/cloud';
import {
  fetchCustomerTasks,
  fetchCustomerTasksSuccess,
  fetchCustomerTasksFailure
} from '../../../actions/tasks';

function mapStateToProps(state) {
  console.log('NodeDetailsContainer State', state);
  return {
    universe: state.universe,
    customer: state.customer,
    providers: state.cloud.providers,
    selectedNodeName: state.universe.getNodeNameWithAction?.nodeName,
    selectedNodeAction: state.universe.getNodeNameWithAction?.actionType
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    getMasterLeader: (uuid) => {
      dispatch(getMasterLeader(uuid)).then((response) => {
        dispatch(getMasterLeaderResponse(response.payload));
      });
    },

    resetMasterLeader: () => {
      dispatch(resetMasterLeader());
    },

    fetchCustomerTasks: () => {
      return dispatch(fetchCustomerTasks()).then((response) => {
        if (!response.error) {
          return dispatch(fetchCustomerTasksSuccess(response.payload));
        } else {
          return dispatch(fetchCustomerTasksFailure(response.payload));
        }
      });
    },

    /**
     * Get per-node status for a universe.
     *
     * uuid: UUID of the universe to get the per-node status of.
     */
    getUniversePerNodeStatus: (uuid) => {
      dispatch(getUniversePerNodeStatus(uuid)).then((perNodeResponse) => {
        dispatch(getUniversePerNodeStatusResponse(perNodeResponse.payload));
      });
    },

    selectedNodeAllowedActions: (uuid, nodeName) => {
      dispatch(getUniversePerNodeAllowedActions(uuid, nodeName)).then((actionResponse) => {
        dispatch(getUniversePerNodeAllowedActionsResponse(actionResponse.payload));
      });
    },

    getUniversePerNodeMetrics: (uuid) => {
      dispatch(getUniversePerNodeMetrics(uuid)).then((perNodeResponse) => {
        dispatch(getUniversePerNodeMetricsResponse(perNodeResponse.payload));
      });
    },

    fetchNodeListByProvider: (pUUID) => {
      dispatch(getNodeInstancesForProvider(pUUID)).then((response) => {
        dispatch(getNodesInstancesForProviderResponse(response.payload));
      });
    },

    fetchUniverseMetadata: () => {
      dispatch(fetchUniverseMetadata());
    },

    fetchNodeListByReplicaProvider: (pUUID) => {
      dispatch(getNodeInstancesForReadReplicaProvider(pUUID)).then((response) => {
        dispatch(getNodesInstancesForReadReplicaProviderResponse(response.payload));
      });
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NodeDetails);
