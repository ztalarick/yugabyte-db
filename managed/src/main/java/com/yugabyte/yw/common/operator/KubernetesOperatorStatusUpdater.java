// Copyright (c) YugaByte, Inc.

package com.yugabyte.yw.common.operator;

import com.yugabyte.yw.models.Universe;
import io.fabric8.kubernetes.api.model.Event;
import io.fabric8.kubernetes.api.model.EventBuilder;
import io.fabric8.kubernetes.api.model.KubernetesResourceList;
import io.fabric8.kubernetes.api.model.ObjectReference;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.dsl.MixedOperation;
import io.fabric8.kubernetes.client.dsl.Resource;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import play.Logger;

public class KubernetesOperatorStatusUpdater {

  public static String CRD_NAME = "ybuniverses.operator.yugabyte.io";

  public static MixedOperation<YBUniverse, KubernetesResourceList<YBUniverse>, Resource<YBUniverse>>
      client;

  public static KubernetesClient kubernetesClient;

  private static Map<String, YBUniverse> nameToResource = new HashMap<>();

  public static void addToMap(String universeName, YBUniverse resource) {
    nameToResource.put(universeName, resource);
  }

  public static void removeFromMap(String universeName) {
    if (nameToResource.containsKey(universeName)) {
      nameToResource.remove(universeName);
    }
  }

  public static void updateStatus(Universe u, String status) {
    try {
      String universeName = u.getName();
      if (nameToResource.containsKey(universeName)) {
        YBUniverse ybUniverse = nameToResource.get(universeName);
        if (ybUniverse == null) {
          Logger.error("YBUniverse {} no longer exists", universeName);
          return;
        }
        YBUniverseStatus ybUniverseStatus = new YBUniverseStatus();
        ybUniverseStatus.setUniverseStatus(status);
        Logger.info("Universe status is: {}", status);
        ybUniverse.setStatus(ybUniverseStatus);
        client
            .inNamespace(ybUniverse.getMetadata().getNamespace())
            .resource(ybUniverse)
            .replaceStatus();

        doKubernetesEventUpdate(universeName, status);

      } else {
        Logger.info("No universe with that name found in map");
      }
    } catch (Exception e) {
      Logger.error("Failed to update status: ", e);
    }
  }

  public static void doKubernetesEventUpdate(String universeName, String status) {
    try {
      if (nameToResource.containsKey(universeName)) {
        YBUniverse ybUniverse = nameToResource.get(universeName);
        if (ybUniverse == null) {
          Logger.error("YBUniverse {} no longer exists", universeName);
          return;
        }
        // Kubernetes Event update
        ObjectReference obj = new ObjectReference();
        obj.setName(ybUniverse.getMetadata().getName());
        obj.setNamespace(ybUniverse.getMetadata().getNamespace());
        String namespace =
            kubernetesClient.getNamespace() != null ? kubernetesClient.getNamespace() : "default";
        kubernetesClient
            .v1()
            .events()
            .inNamespace(namespace)
            .createOrReplace(
                new EventBuilder()
                    .withNewMetadata()
                    .withNamespace(ybUniverse.getMetadata().getNamespace())
                    .withName(ybUniverse.getMetadata().getName())
                    .endMetadata()
                    .withType("Normal")
                    .withReason("Status")
                    .withMessage(status)
                    .withLastTimestamp(DateTimeFormatter.ISO_INSTANT.format(Instant.now()))
                    .withInvolvedObject(obj)
                    .build());
      } else {
        Logger.info("No universe with that name found in map");
      }
    } catch (Exception e) {
      Logger.error("Failed to update Kubernetes status: ", e);
    }
  }
}
