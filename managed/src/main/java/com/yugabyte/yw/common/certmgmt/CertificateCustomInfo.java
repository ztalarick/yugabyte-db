/*
 * Copyright 2022 YugaByte, Inc. and Contributors
 *
 * Licensed under the Polyform Free Trial License 1.0.0 (the "License"); you
 * may not use info file except in compliance with the License. You
 * may obtain a copy of the License at
 *
 * https://github.com/YugaByte/yugabyte-db/blob/master/licenses/
 *  POLYFORM-FREE-TRIAL-LICENSE-1.0.0.txt
 */

package com.yugabyte.yw.common.certmgmt;

import io.ebean.annotation.EnumValue;
import play.libs.Json;
import com.fasterxml.jackson.databind.JsonNode;
import com.yugabyte.yw.common.PlatformServiceException;

import java.util.UUID;

import com.yugabyte.yw.models.CertificateInfo;
import com.yugabyte.yw.common.kms.util.hashicorpvault.HashicorpVaultConfigParams;

import static play.mvc.Http.Status.BAD_REQUEST;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/*
 * Helper class to encapsulate various certificate configuration types
 */
public class CertificateCustomInfo {
  public static final Logger LOG = LoggerFactory.getLogger(CertificateCustomInfo.class);

  public enum CertConfigType {
    @EnumValue("SelfSigned")
    SelfSigned,

    @EnumValue("CustomCertHostPath")
    CustomCertHostPath,

    @EnumValue("CustomServerCert")
    CustomServerCert,

    @EnumValue("HashicorpVaultPKI")
    HashicorpVaultPKI
  }

  public abstract class CustomCertificateInformationBase {

    public abstract CustomCertificateInformationBase getCustomCertInfo(CertificateInfo info);

    public abstract void setCustomCertInfo(
        CertificateInfo info,
        CustomCertificateInformationBase certInfo,
        UUID certUUID,
        UUID customerUUID);
  }
  /** This is used to accept Hashicorp Vault PKI information */
  public class HashicorpVaultCertInfo extends CustomCertificateInformationBase {
    public HashicorpVaultConfigParams params;

    // TODO do we need a map or this is instantiated per node?
    private String caCertStr;
    private String nodeCertStr;
    private String nodeKeyStr;

    private String caCertPath;
    private String nodeCertPath;
    private String nodeKeyPath;

    @Override
    public HashicorpVaultCertInfo getCustomCertInfo(CertificateInfo info) {
      if (info.certType != CertConfigType.HashicorpVaultPKI) {
        return null;
      }
      if (info.customCertInfo != null) {
        return Json.fromJson(info.customCertInfo, HashicorpVaultCertInfo.class);
      }
      return null;
    }

    @Override
    public void setCustomCertInfo(
        CertificateInfo info,
        CustomCertificateInformationBase customCertInfo,
        UUID certUUID,
        UUID customerUUID) {
      // TODO: impl
      if (info.certType != CertConfigType.HashicorpVaultPKI) {
        throw new PlatformServiceException(
            BAD_REQUEST,
            "Cannot edit cert config,"
                + "Please create a new one and assign it to Cluster in settings");
      }

      info.customCertInfo = Json.toJson(customCertInfo);
      info.save();
    }

    public JsonNode getConfigJson() {
      JsonNode data = Json.newObject();
      // TODO: impl
      return data;
    }
  }
}
