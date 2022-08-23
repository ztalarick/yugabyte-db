// Copyright YugaByte Inc.

import { NodeActionModal } from '../../universes';
import { connect } from 'react-redux';

import {
  getUniversePerNodeStatus,
  getUniversePerNodeStatusResponse,
  getUniversePerNodeAllowedActions,
  getUniversePerNodeAllowedActionsResponse,
  performUniverseNodeAction,
  performUniverseNodeActionResponse
} from '../../../actions/universe';

function mapStateToProps(state) {
  return {
    universe: state.universe
  };
}

const mapDispatchToProps = (dispatch) => {
  return {

    getMyNodeAllowedActions: (uuid, nodeName) => {
      dispatch(getUniversePerNodeAllowedActions(uuid, nodeName)).then((actionResponse) => {
        dispatch(getUniversePerNodeAllowedActionsResponse(actionResponse.payload));
      });
    },

    performUniverseNodeAction: (universeUUID, nodeName, actionType) => {
      return dispatch(performUniverseNodeAction(universeUUID, nodeName, actionType));
    },
    performUniverseNodeActionResponse: (payload) => {
      dispatch(performUniverseNodeActionResponse(payload));
    },
    preformGetUniversePerNodeStatus: (universeUUID) => {
      return dispatch(getUniversePerNodeStatus(universeUUID));
    },
    preformGetUniversePerNodeStatusResponse: (payload) => {
      dispatch(getUniversePerNodeStatusResponse(payload));
    },
    performGetUniversePerNodeAllowedActions: (universeUUID, nodeName) => {
      return dispatch(getUniversePerNodeAllowedActions(universeUUID, nodeName));
    },
    performGetUniversePerNodeAllowedActionsResponse: (payload) => {
      dispatch(getUniversePerNodeAllowedActionsResponse(payload));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NodeActionModal);
