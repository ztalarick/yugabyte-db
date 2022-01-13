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

import java.util.UUID;

import com.yugabyte.yw.models.CertificateInfo;
import com.yugabyte.yw.common.kms.util.hashicorpvault.HashicorpVaultConfigParam;
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
    HashicorpVaultConfigParam params;

    // TODO do we need a map or this is instantiated per node?
    private String caCert;
    private String nodeCert;
    private String nodeKey;

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
        CustomCertificateInformationBase certInfo,
        UUID certUUID,
        UUID customerUUID) {
      // TODO: move check editable in this class
      info.checkEditable(certUUID, customerUUID);
      info.customCertInfo = Json.toJson(certInfo);
      info.save();
    }

    public JsonNode getConfigJson() {
      JsonNode data = Json.newObject();
      // TODO: impl
      return data;
    }
  }
}
