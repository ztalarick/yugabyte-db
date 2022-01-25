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

package com.yugabyte.yw.common.certmgmt.providers;

import com.yugabyte.yw.common.kms.util.hashicorpvault.HashicorpVaultConfigParams;
import com.yugabyte.yw.common.kms.util.hashicorpvault.VaultAccessor;

import static play.mvc.Http.Status.BAD_REQUEST;
import java.util.List;

import java.security.KeyPair;
import java.security.PrivateKey;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import com.yugabyte.yw.common.certmgmt.CertificateCustomInfo.CertConfigType;
import com.yugabyte.yw.common.PlatformServiceException;
import com.yugabyte.yw.common.certmgmt.CertificateDetails;
import com.yugabyte.yw.common.certmgmt.CertificateHelper;
import com.yugabyte.yw.models.CertificateInfo;
import com.yugabyte.yw.models.helpers.CommonUtils;

import org.apache.commons.validator.routines.InetAddressValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.commons.lang3.tuple.ImmutablePair;

import io.ebean.annotation.EnumValue;

/*
 * Wrapper over Vault.logical for PKI operations
 */
public class VaultPKI extends CertificateProviderInterface {
  public static final Logger LOG = LoggerFactory.getLogger(VaultPKI.class);

  public enum VaultOperationsForCert {
    @EnumValue("issue")
    ISSUE,

    @EnumValue("certObj")
    CERT,

    @EnumValue("cacert")
    CA_CERT,

    @EnumValue("crl")
    CRL;

    public String toString() {
      switch (this) {
        case ISSUE:
          return "issue";
        case CA_CERT:
          return "ca";
        case CERT:
          return "cert";
        case CRL:
          return "crl";
        default:
          return null;
      }
    }
  }

  HashicorpVaultConfigParams params;
  VaultAccessor vAccessor;

  private String curCaCertificateStr;
  private String curCertificateStr;
  private String curKeyStr;

  public VaultPKI(UUID pCACertUUID) {
    super(CertConfigType.HashicorpVaultPKI, pCACertUUID);
    curCaCertificateStr = "";
    curCertificateStr = "";
    curKeyStr = "";
  }

  public VaultPKI(UUID pCACertUUID, VaultAccessor vObj, HashicorpVaultConfigParams configInfo) {
    super(CertConfigType.HashicorpVaultPKI, pCACertUUID);
    vAccessor = vObj;
    params = configInfo;

    curCaCertificateStr = "";
    curCertificateStr = "";
    curKeyStr = "";
  }

  public static VaultPKI getVaultPKIInstance(CertificateInfo rootCertConfigInfo) throws Exception {
    // LOG.info("Called from: {}", CommonUtils.GetStackTraceHere());

    HashicorpVaultConfigParams hcConfigInfo = rootCertConfigInfo.getCustomHCPKICertInfo();
    return getVaultPKIInstance(rootCertConfigInfo.uuid, hcConfigInfo);
  }

  public static VaultPKI getVaultPKIInstance(UUID uuid, HashicorpVaultConfigParams configInfo)
      throws Exception {
    LOG.info("Creating vault with : {} ", configInfo.toString());
    VaultAccessor vObj =
        VaultAccessor.buildVaultAccessor(configInfo.vaultAddr, configInfo.vaultToken);
    VaultPKI obj = new VaultPKI(uuid, vObj, configInfo);
    return obj;
  }

  @Override
  public X509Certificate generateRootCertificate(
      String certLabel, int certExpiryInYears, KeyPair keyPair) throws Exception {
    LOG.debug("Called generateRootCertificate for: {}", certLabel);
    // LOG.info("Called from: {}", CommonUtils.GetStackTraceHere());

    return getCACertificateFromVault();
  }

  @Override
  public CertificateDetails createCertificate(
      String storagePath,
      String username,
      Date certStart,
      Date certExpiry,
      String certFileName,
      String newCertKeyStrName) {
    LOG.info("__YD:Creating certificate for {}, CA:", username, caCertUUID.toString());
    LOG.info("Called from: {}", CommonUtils.GetStackTraceHere());

    InetAddressValidator ipAddressValidator = InetAddressValidator.getInstance();
    final Map<String, Object> input = new HashMap<>();

    input.put("common_name", username);
    if (ipAddressValidator.isValid(username)) input.put("ip_sans", username);
    // input.put("private_key_format", "pkcs8");
    // TODO set cert duration

    try {
      String path = params.mountPath + VaultOperationsForCert.ISSUE.toString() + "/" + params.role;
      Map<String, String> result = vAccessor.writeAt(path, input);

      // String certSerial = result.get("serial_number");

      // fetch certificate
      String newCertPemStr = result.get("certificate");
      curCertificateStr = newCertPemStr;
      X509Certificate certObj = CertificateHelper.convertStringToX509Cert(newCertPemStr);
      // fetch key
      String newCertKeyStr = result.get("private_key");
      curKeyStr = newCertKeyStr;
      PrivateKey pKeyObj = CertificateHelper.convertStringToPrivateKey(newCertKeyStr);
      // fetch issue ca cert
      String issuingCAStr = result.get("issuing_ca");
      curCaCertificateStr = issuingCAStr;
      X509Certificate issueCAcert = CertificateHelper.convertStringToX509Cert(issuingCAStr);

      LOG.debug("Issue CA is:: {}", CertificateHelper.getCertificateProperties(issueCAcert));
      LOG.debug("Certificate is:: {}", CertificateHelper.getCertificateProperties(certObj));

      certObj.verify(issueCAcert.getPublicKey(), "BC");

      // for client certificate: later it is read using CertificateHelper.getClientCertFile
      return CertificateHelper.dumpNewCertsToFile(
          storagePath, certFileName, newCertKeyStrName, certObj, pKeyObj);

    } catch (Exception e) {
      LOG.error("Unable to create certificate for {} using rootCA {}", username, caCertUUID, e);
      throw new RuntimeException("Unable to get certificate from hashicorp Vault");
    }
  }

  @Override
  public Pair<String, String> dumpCACertBundle(String storagePath, UUID customerUUID) {
    try {
      String certPath = CertificateHelper.getCACertPath(storagePath, customerUUID, caCertUUID);

      List<X509Certificate> list = new ArrayList<X509Certificate>();
      list.add(getCACertificateFromVault());

      CertificateHelper.writeCertBundleToCertPath(list, certPath);
      CertificateInfo rootCertConfigInfo = CertificateInfo.get(caCertUUID);

      Pair<Date, Date> dates = CertificateHelper.extractDatesFromCertBundle(list);
      rootCertConfigInfo.update(dates.getKey(), dates.getValue(), certPath, params);

      if (!CertificateInfo.isCertificateValid(caCertUUID)) {
        String errMsg =
            String.format(
                "The certificate %s needs info. Update the cert and retry.",
                rootCertConfigInfo.label);
        LOG.error(errMsg);
        throw new PlatformServiceException(BAD_REQUEST, errMsg);
      }

      return new ImmutablePair<>(certPath, "");

    } catch (Exception e) {
      throw new RuntimeException("Hashicorp: Failed to extract Root CA Certificate");
    }
  }

  public X509Certificate getCACertificateFromVault() throws Exception {
    LOG.info("__YD:getting CA certificate for {}", caCertUUID.toString());

    String path =
        params.mountPath
            + VaultOperationsForCert.CERT.toString()
            + "/"
            + VaultOperationsForCert.CA_CERT.toString();

    // TODO: return ca_chain
    String caCert = vAccessor.readAt(path, "certificate");
    curCaCertificateStr = caCert;

    return CertificateHelper.convertStringToX509Cert(caCert);
  }

  public String getCACertificate() throws Exception {

    if (curCaCertificateStr.equals("")) getCACertificateFromVault();
    return curCaCertificateStr;
  }

  // @Override
  public String getCertPEM() {
    return curCertificateStr;
  }

  // @Override
  public String getKeyPEM() {
    return curKeyStr;
  }
}
