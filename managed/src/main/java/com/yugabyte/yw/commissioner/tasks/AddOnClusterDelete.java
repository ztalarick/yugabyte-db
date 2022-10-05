/*
 * Copyright 2022 YugaByte, Inc. and Contributors
 *
 * Licensed under the Polyform Free Trial License 1.0.0 (the "License"); you
 * may not use this file except in compliance with the License. You
 * may obtain a copy of the License at
 *
 *     https://github.com/YugaByte/yugabyte-db/blob/master/licenses/POLYFORM-FREE-TRIAL-LICENSE-1.0.0.txt
 */
package com.yugabyte.yw.commissioner.tasks;

import com.yugabyte.yw.commissioner.BaseTaskDependencies;
import com.yugabyte.yw.commissioner.UserTaskDetails.SubTaskGroupType;
import com.yugabyte.yw.forms.UniverseDefinitionTaskParams;
import com.yugabyte.yw.forms.UniverseDefinitionTaskParams.Cluster;
import com.yugabyte.yw.models.Universe;
import com.yugabyte.yw.models.helpers.NodeDetails;
import java.util.Collection;
import java.util.UUID;
import javax.inject.Inject;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class AddOnClusterDelete extends UniverseDefinitionTaskBase {

  @Inject
  protected AddOnClusterDelete(BaseTaskDependencies baseTaskDependencies) {
    super(baseTaskDependencies);
  }

  public static class Params extends UniverseDefinitionTaskParams {

    public UUID clusterUUID;
    public Boolean isForceDelete = false;
  }

  public Params params() {
    return (Params) taskParams;
  }

  @Override
  public void run() {
    log.info("Started {} task for uuid={}", getName(), params().universeUUID);

    try {

      Universe universe = null;
      if (params().isForceDelete) {
        universe = forceLockUniverseForUpdate(-1 /* expectedUniverseVersion */);
      } else {
        universe = lockUniverseForUpdate(params().expectedUniverseVersion);
      }

      Cluster clusterToDelete =
          universe
              .getUniverseDetails()
              .getAddOnClusters()
              .stream()
              .filter(c -> c.uuid.equals(params().clusterUUID))
              .findFirst()
              .orElse(null);

      if (clusterToDelete == null) {
        String msg =
            "Unable to delete add-on cluster from universe \""
                + universe.name
                + "\" as it doesn't have any add-on clusters.";
        log.error(msg);
        throw new RuntimeException(msg);
      }

      // Stop the health checks
      preTaskActions();

      Collection<NodeDetails> nodesToBeRemoved = universe.getNodesInCluster(clusterToDelete.uuid);

      // Set the node states to Removing.
      createSetNodeStateTasks(nodesToBeRemoved, NodeDetails.NodeState.Terminating)
          .setSubTaskGroupType(SubTaskGroupType.RemovingUnusedServers);
      createDestroyServerTasks(
              universe,
              nodesToBeRemoved,
              params().isForceDelete,
              true /* deleteNodeFromDB */,
              true /* deleteRootVolumes */)
          .setSubTaskGroupType(SubTaskGroupType.RemovingUnusedServers);

      // Remove the cluster entry from the universe db entry.
      createDeleteClusterFromUniverseTask(params().clusterUUID)
          .setSubTaskGroupType(SubTaskGroupType.RemovingUnusedServers);

      // Update the swamper target file.
      createSwamperTargetUpdateTask(false /* removeFile */);

      // Marks the update of this universe as a success only if all the tasks before it succeeded.
      createMarkUniverseUpdateSuccessTasks()
          .setSubTaskGroupType(SubTaskGroupType.ConfigureUniverse);

      // Run all the tasks.
      getRunnableTask().runSubTasks();

    } catch (Throwable t) {
      log.error("Error executing task {} with error='{}'.", getName(), t.getMessage(), t);
      throw t;
    } finally {
      // Mark the update of the universe as done. This will allow future edits/updates to the
      // universe to happen.
      unlockUniverseForUpdate();
    }
    log.info("Finished {} task.", getName());
  }
}
