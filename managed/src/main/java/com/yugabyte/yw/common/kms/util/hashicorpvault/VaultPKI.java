/*
 * Copyright 2022 YugaByte, Inc. and Contributors
 *
 * Licensed under the Polyform Free Trial License 1.0.0 (the "License"); you
 * may not use this file except in compliance with the License. You
 * may obtain a copy of the License at
 *
 * https://github.com/YugaByte/yugabyte-db/blob/master/licenses/
 *  POLYFORM-FREE-TRIAL-LICENSE-1.0.0.txt
 */

package com.yugabyte.yw.common.kms.util.hashicorpvault;

import java.security.PrivateKey;
import java.security.cert.X509Certificate;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import com.yugabyte.yw.common.certmgmt.CertificateCustomInfo.CertConfigType;
import com.yugabyte.yw.common.certmgmt.CertificateCustomInfo.HashicorpVaultCertInfo;
import com.yugabyte.yw.common.certmgmt.CertificateDetails;
import com.yugabyte.yw.common.certmgmt.CertificateHelper;
import com.yugabyte.yw.common.certmgmt.CertificateProviderInterface;
import com.yugabyte.yw.models.CertificateInfo;

import org.apache.commons.validator.routines.InetAddressValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.ebean.annotation.EnumValue;
import play.libs.Json;

// TODO: move vault directory out of KMS
//  => mv common/kms/util/hashicorpvault common/hashicorpvault
/*
 * Wrapper over Vault.logical for PKI operations
 */
public class VaultPKI extends CertificateProviderInterface {
  public static final Logger LOG = LoggerFactory.getLogger(VaultPKI.class);

  public enum VaultOperationsForCert {
    @EnumValue("issue")
    ISSUE,

    @EnumValue("cert")
    CERT,

    @EnumValue("caCert")
    CA_CERT;

    public String toString() {
      switch (this) {
        case ISSUE:
          return "issue";
        case CA_CERT:
          return "ca";
        case CERT:
          return "cert";
        default:
          return null;
      }
    }
  }

  HashicorpVaultConfigParams params;
  VaultAccessor vAccessor;
  private String caStr;
  private String certStr;
  private String pStr;

  public VaultPKI(UUID pCACertUUID) {
    super(CertConfigType.HashicorpVaultPKI, pCACertUUID);
    caStr = "";
    certStr = "";
    pStr = "";
  }

  public VaultPKI(UUID pCACertUUID, VaultAccessor vObj, HashicorpVaultConfigParams configInfo) {
    super(CertConfigType.HashicorpVaultPKI, pCACertUUID);
    vAccessor = vObj;
    params = configInfo;

    caStr = "";
    certStr = "";
    pStr = "";
  }

  public static VaultPKI getVaultPKIInstance(CertificateInfo rootCertConfigInfo) throws Exception {
    HashicorpVaultConfigParams configInfo =
        Json.fromJson(rootCertConfigInfo.customCertInfo, HashicorpVaultCertInfo.class).params;
    return getVaultPKIInstance(rootCertConfigInfo.uuid, configInfo);
  }

  public static VaultPKI getVaultPKIInstance(UUID uuid, HashicorpVaultConfigParams configInfo)
      throws Exception {
    VaultAccessor vObj =
        VaultAccessor.buildVaultAccessor(configInfo.vaultAddr, configInfo.vaultToken);
    VaultPKI obj = new VaultPKI(uuid, vObj, configInfo);
    return obj;
  }

  @Override
  public CertificateDetails createCertificate(
      String storagePath,
      String username,
      Date certStart,
      Date certExpiry,
      String certFileName,
      String certKeyName) {
    LOG.info("__YD:Creating certificate for {}", username);
    // TODO: validate it?

    InetAddressValidator ipAddressValidator = InetAddressValidator.getInstance();
    final Map<String, Object> input = new HashMap<>();

    input.put("common_name", username);
    if (ipAddressValidator.isValid(username)) input.put("ip_sans", username);
    // input.put("private_key_format", "pkcs8");

    // TODO use buildPath
    String path = params.mountPath + VaultOperationsForCert.ISSUE.toString() + "/" + params.role;

    try {
      Map<String, String> result = vAccessor.writeAt(path, input);

      // String certSerial = result.get("serial_number");
      String certPem = result.get("certificate");
      String certKey = result.get("private_key");
      String issuing_ca = result.get("issuing_ca");

      certStr = certPem;
      pStr = certKey;
      caStr = issuing_ca;

      // TODO: this only has issuing ca, get CA_CHAIN
      // caStr = getCACertificateFromVault();

      X509Certificate cert = CertificateHelper.convertStringToX509Cert(certPem);
      PrivateKey pKey = CertificateHelper.convertStringToPrivateKey(certKey);

      LOG.debug("Vaule:: {}", CertificateHelper.getCertificateProperties(cert));

      return CertificateHelper.DumpNewCertsToFile(
          storagePath, certFileName, certKeyName, cert, pKey);

    } catch (Exception e) {
      LOG.error(
          "Unable to create certificate for username {} using root CA {}", username, caCertUUID, e);
      throw new RuntimeException("Unable to get certificate from hashicorp Vault");
    }
  }

  public X509Certificate getCACertificateFromVault() throws Exception {
    String path =
        params.mountPath
            + VaultOperationsForCert.CERT.toString()
            + "/"
            + VaultOperationsForCert.CA_CERT.toString();

    // TODO: return ca_chain
    String caCert = vAccessor.readAt(path, "certificate");
    caStr = caCert;

    return CertificateHelper.convertStringToX509Cert(caCert);
  }

  public String getCACertificate() throws Exception {
    if (caStr.equals("")) getCACertificateFromVault();
    return caStr;
  }

  // @Override
  public String getCertPEM() {
    return certStr;
  }

  // @Override
  public String getKeyPEM() {
    return pStr;
  }
}
