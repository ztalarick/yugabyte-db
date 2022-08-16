package com.yugabyte.yw.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.google.inject.Inject;
import com.yugabyte.yw.commissioner.Commissioner;
import com.yugabyte.yw.common.PlatformServiceException;
import com.yugabyte.yw.common.Util;
import com.yugabyte.yw.forms.PlatformResults;
import com.yugabyte.yw.forms.PlatformResults.YBPTask;
import com.yugabyte.yw.forms.UniverseAddOnTaskParams;
import com.yugabyte.yw.forms.UniverseDefinitionTaskParams;
import com.yugabyte.yw.forms.UniverseDefinitionTaskParams.Cluster;
import com.yugabyte.yw.models.Customer;
import com.yugabyte.yw.models.CustomerTask;
import com.yugabyte.yw.models.CustomerTask.TargetType;
import com.yugabyte.yw.models.Universe;
import com.yugabyte.yw.models.helpers.CloudSpecificInfo;
import com.yugabyte.yw.models.helpers.NodeDetails;
import com.yugabyte.yw.models.helpers.NodeDetails.NodeState;
import com.yugabyte.yw.models.helpers.PlacementInfo.PlacementAZ;
import com.yugabyte.yw.models.helpers.PlacementInfo.PlacementCloud;
import com.yugabyte.yw.models.helpers.PlacementInfo.PlacementRegion;
import com.yugabyte.yw.models.helpers.TaskType;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import play.libs.Json;
import play.mvc.Http;
import play.mvc.Result;

@Slf4j
@Api
public class UniverseAddonServicesController extends AuthenticatedController {

  private static final Logger LOG = LoggerFactory.getLogger(UniverseAddonServicesController.class);
  private final CloudUtil cloudUtil;
  private final Commissioner commissioner;

  @Inject
  public UniverseAddonServicesController(CloudUtil cloudUtil, Commissioner commissioner) {
    super();
    this.cloudUtil = cloudUtil;
    this.commissioner = commissioner;
  }

  @ApiOperation(
      value = "List Addon Services for a cluster",
      notes = "List Addon Services for a cluster",
      response = Set.class)
  public Result listAddonServices(UUID customerUUID, UUID universeUUID) throws Exception {
    Universe universe = cloudUtil.checkCloudAndValidateUniverse(customerUUID, universeUUID);

    return PlatformResults.withData(
        universe
            .getUniverseDetails()
            .nodeDetailsSet
            .stream()
            .filter(node -> node.isAddonServer)
            .collect(Collectors.toList()));
  }

  @ApiOperation(
      value = "Remove Addon Service for a cluster",
      notes = "Remove Addon Service for a cluster",
      response = YBPTask.class)
  public Result removeAddOnService(UUID customerUUID, UUID universeUUID, String addOnName) {
    Universe universe = cloudUtil.checkCloudAndValidateUniverse(customerUUID, universeUUID);

    UniverseDefinitionTaskParams details = universe.getUniverseDetails();
    boolean nodeExists =
        details
            .nodeDetailsSet
            .stream()
            .anyMatch(node -> node.isAddonServer && node.nodeName.equals(addOnName));

    if (!nodeExists) {
      log.error("Invalid addon {}. Valid nodes: {}", addOnName, details.nodeDetailsSet);
      throw new PlatformServiceException(BAD_REQUEST, "Invalid AddOn name:" + addOnName);
    }

    for (NodeDetails node : details.nodeDetailsSet) {
      if (node.isAddonServer && node.nodeName.equals(addOnName)) {
        node.state = NodeState.ToBeRemoved;
      }
    }
    universe.setUniverseDetails(details);
    universe.save();

    UniverseDefinitionTaskParams params = new UniverseDefinitionTaskParams();
    params.nodeDetailsSet = details.nodeDetailsSet;
    params.firstTry = true;
    params.universeUUID = universeUUID;
    params.clusters = details.clusters;

    TaskType taskType = TaskType.RemoveAddOn;
    UUID taskUUID = commissioner.submit(taskType, params);
    Customer customer = Customer.getOrBadRequest(customerUUID);

    CustomerTask.create(
        customer,
        universeUUID,
        taskUUID,
        TargetType.Universe,
        CustomerTask.TaskType.RemoveAddOn,
        universe.name);

    return new YBPTask(taskUUID, universeUUID).asResult();
  }

  @ApiOperation(
      value = "Create AddOn Service for a cluster",
      notes = "Create AddOn Service for a cluster",
      response = YBPTask.class)
  @ApiImplicitParams(
      @ApiImplicitParam(
          name = "UniverseAddOnTaskParams",
          required = true,
          dataType = "com.yugabyte.yw.forms.UniverseAddOnTaskParams",
          paramType = "body"))
  public Result createAddOnService(UUID customerUUID, UUID universeUUID) {
    Universe universe = cloudUtil.checkCloudAndValidateUniverse(customerUUID, universeUUID);

    UniverseAddOnTaskParams addonParams = bindCreateAddOnParameters(ctx(), request());

    if (addonParams == null) {
      throw new PlatformServiceException(BAD_REQUEST, "Invalid request body");
    }
    if (!addonParams.universeUUID.equals(universe.universeUUID)) {
      throw new PlatformServiceException(BAD_REQUEST, "Invalid request body: universeUUID");
    }
    if (addonParams.purpose == null || addonParams.purpose.isEmpty()) {
      throw new PlatformServiceException(BAD_REQUEST, "Invalid request body: purpose");
    }

    NodeDetails nodeDetails = generateNodeDetails(universe, addonParams);

    UniverseDefinitionTaskParams details = universe.getUniverseDetails();
    details.nodeDetailsSet.add(nodeDetails);
    universe.setUniverseDetails(details);
    universe.save();

    UniverseDefinitionTaskParams params = new UniverseDefinitionTaskParams();
    params.nodeDetailsSet = details.nodeDetailsSet;
    params.firstTry = true;
    params.universeUUID = universeUUID;
    params.clusters = details.clusters;

    TaskType taskType = TaskType.CreateAddOn;
    UUID taskUUID = commissioner.submit(taskType, params);
    Customer customer = Customer.getOrBadRequest(customerUUID);

    CustomerTask.create(
        customer,
        universeUUID,
        taskUUID,
        TargetType.Universe,
        CustomerTask.TaskType.CreateAddOn,
        universe.name);

    return new YBPTask(taskUUID, universeUUID).asResult();
  }

  private UniverseAddOnTaskParams bindCreateAddOnParameters(
      Http.Context ctx, Http.Request request) {
    ObjectMapper mapper = Json.mapper();
    try {
      ObjectNode formData = (ObjectNode) request.body().asJson();
      return Json.mapper().treeToValue(formData, UniverseAddOnTaskParams.class);
    } catch (JsonProcessingException exception) {
      throw new PlatformServiceException(
          BAD_REQUEST, "JsonProcessingException parsing request body: " + exception.getMessage());
    }
  }

  private NodeDetails generateNodeDetails(Universe universe, UniverseAddOnTaskParams params) {
    Cluster cluster = universe.getUniverseDetails().clusters.get(0);

    // create the node details for brand new nodes
    // look at createNodeDetailsWithPlacementIndex()
    NodeDetails nodeDetails = new NodeDetails();
    nodeDetails.placementUuid = cluster.uuid;
    nodeDetails.ybPrebuiltAmi = false;

    int maxNodeIndex = -1;
    for (NodeDetails existingNode : universe.getNodes()) {
      if (maxNodeIndex < existingNode.nodeIdx) {
        maxNodeIndex = existingNode.nodeIdx;
      }
    }

    PlacementCloud placementCloud = cluster.placementInfo.cloudList.get(0);
    PlacementRegion placementRegion = placementCloud.regionList.get(0);

    // Set the AZ and the subnet.
    PlacementAZ placementAZ = placementRegion.azList.get(0);
    nodeDetails.azUuid = placementAZ.uuid;

    nodeDetails.cloudInfo = new CloudSpecificInfo();
    nodeDetails.cloudInfo.cloud = placementCloud.code;
    nodeDetails.cloudInfo.az = placementAZ.name;
    nodeDetails.cloudInfo.subnet_id = placementAZ.subnet;
    nodeDetails.cloudInfo.secondary_subnet_id = placementAZ.secondarySubnet;
    nodeDetails.cloudInfo.assignPublicIP = cluster.userIntent.assignPublicIP;
    nodeDetails.cloudInfo.useTimeSync = cluster.userIntent.useTimeSync;
    nodeDetails.cloudInfo.region = placementRegion.code;

    // The instance type should come from the parameters and fall back to the rest
    // of the cluster if not available.
    if (params.instanceType != null && !params.instanceType.isEmpty()) {
      nodeDetails.cloudInfo.instance_type = params.instanceType;
    } else {
      nodeDetails.cloudInfo.instance_type = cluster.userIntent.instanceType;
    }

    nodeDetails.isTserver = false;
    nodeDetails.isMaster = false;
    nodeDetails.isAddonServer = true;

    nodeDetails.nodeIdx = (maxNodeIndex + 1);
    nodeDetails.nodeName =
        generateNodeNameForPurpose(universe, params.purpose, nodeDetails.nodeIdx);
    nodeDetails.nodeUuid = Util.generateNodeUUID(universe.universeUUID, nodeDetails.nodeName);

    nodeDetails.state = NodeState.ToBeAdded;
    nodeDetails.disksAreMountedByUUID = true;

    return nodeDetails;
  }

  public String generateNodeNameForPurpose(Universe universe, String purpose, int nodeIdx) {
    return universe.getUniverseDetails().nodePrefix + "-" + purpose + "-" + "n" + nodeIdx;
  }
}
