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

package com.yugabyte.yw.common.certmgmt;

import static play.mvc.Http.Status.BAD_REQUEST;

import java.security.cert.X509Certificate;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import com.google.api.client.util.Strings;
import com.yugabyte.yw.commissioner.tasks.subtasks.AnsibleConfigureServers;
import com.yugabyte.yw.commissioner.tasks.subtasks.UniverseSetTlsParams;
import com.yugabyte.yw.common.PlatformServiceException;
import com.yugabyte.yw.common.certmgmt.providers.CertificateProviderInterface;
import com.yugabyte.yw.common.certmgmt.providers.CertificateSelfSigned;
import com.yugabyte.yw.common.certmgmt.providers.VaultPKI;
import com.yugabyte.yw.common.kms.util.hashicorpvault.HashicorpVaultConfigParams;
import com.yugabyte.yw.forms.TlsToggleParams;
import com.yugabyte.yw.forms.UniverseDefinitionTaskParams;
import com.yugabyte.yw.forms.UniverseDefinitionTaskParams.UserIntent;
import com.yugabyte.yw.models.CertificateInfo;

import org.apache.commons.lang3.tuple.Pair;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class EncryptionAtTransitUtil {
  public static final Logger LOG = LoggerFactory.getLogger(EncryptionAtTransitUtil.class);

  public static CertificateProviderInterface getCertificateProviderInstance(CertificateInfo info) {
    CertificateProviderInterface certProvider = null;
    try {
      switch (info.certType) {
        case HashicorpVaultPKI:
          certProvider = VaultPKI.getVaultPKIInstance(info);
          break;
        case SelfSigned:
          certProvider = new CertificateSelfSigned(info);
          break;
        default:
          throw new PlatformServiceException(
              BAD_REQUEST, "Certificate config type mismatch in createClientCertificate");
      }
    } catch (Exception e) {
      String message = "Cannot create certificate. " + e.toString();
      throw new PlatformServiceException(BAD_REQUEST, message);
    }
    LOG.info("Returning from getCertificateProviderInstance type is: {}", info.certType.toString());
    return certProvider;
  }

  public static void fetchLatestCertForHashicorpPKI(CertificateInfo info, String storagePath) {
    UUID custUUID = info.customerUUID;
    CertificateProviderInterface provider = getCertificateProviderInstance(info);
    provider.dumpCACertBundle(storagePath, custUUID);
  }

  public static UUID createHashicorpCAConfig(
      UUID customerUUID, String label, String storagePath, HashicorpVaultConfigParams hcVaultParams)
      throws Exception {
    if (Strings.isNullOrEmpty(hcVaultParams.vaultAddr)
        || Strings.isNullOrEmpty(hcVaultParams.vaultToken)
        || Strings.isNullOrEmpty(hcVaultParams.engine)
        || Strings.isNullOrEmpty(hcVaultParams.mountPath)
        || Strings.isNullOrEmpty(hcVaultParams.role)) {
      throw new PlatformServiceException(
          BAD_REQUEST, "Hashicorp Vault parameters provided are not valid");
    }

    UUID rootCA_UUID = UUID.randomUUID();

    VaultPKI pkiObj = VaultPKI.validateVaultConfigParams(hcVaultParams);
    Pair<String, String> paths = pkiObj.dumpCACertBundle(storagePath, customerUUID);

    return CertificateHelper.CreateConfigInfoDBEntry(
        rootCA_UUID,
        customerUUID,
        label,
        pkiObj.generateRootCertificate(null, 4, null),
        paths.getKey(),
        null,
        hcVaultParams);
  }

  public static void editEATHashicorpConfig(
      UUID caCertUUID, UUID customerUUID, String storagePath, HashicorpVaultConfigParams params) {

    try {
      CertificateInfo rootCertConfigInfo = CertificateInfo.get(caCertUUID);
      VaultPKI pkiObj = VaultPKI.validateVaultConfigParams(params);

      Pair<String, String> certPath = pkiObj.dumpCACertBundle(storagePath, customerUUID);
      List<X509Certificate> x509CACerts =
          CertificateHelper.getX509CertificateCertObject(certPath.getLeft());
      Pair<Date, Date> dates = CertificateHelper.extractDatesFromCertBundle(x509CACerts);
      LOG.info("Updating table with ca certificate: {}", certPath.getKey());
      rootCertConfigInfo.update(dates.getLeft(), dates.getRight(), certPath.getKey(), params);
    } catch (Exception e) {
      throw new PlatformServiceException(
          BAD_REQUEST, "Error occured while attempting to change certificate config");
    }
  }

  public static boolean isRootCARequired(UserIntent userIntent, boolean rootAndClientRootCASame) {
    return isRootCARequired(
        userIntent.enableNodeToNodeEncrypt,
        userIntent.enableClientToNodeEncrypt,
        rootAndClientRootCASame);
  }

  public static boolean isRootCARequired(UniverseDefinitionTaskParams taskParams) {
    UserIntent userIntent = taskParams.getPrimaryCluster().userIntent;
    return isRootCARequired(
        userIntent.enableNodeToNodeEncrypt,
        userIntent.enableClientToNodeEncrypt,
        taskParams.rootAndClientRootCASame);
  }

  public static boolean isRootCARequired(AnsibleConfigureServers.Params taskParams) {
    return isRootCARequired(
        taskParams.enableNodeToNodeEncrypt,
        taskParams.enableClientToNodeEncrypt,
        taskParams.rootAndClientRootCASame);
  }

  public static boolean isRootCARequired(UniverseSetTlsParams.Params taskParams) {
    return isRootCARequired(
        taskParams.enableNodeToNodeEncrypt,
        taskParams.enableClientToNodeEncrypt,
        taskParams.rootAndClientRootCASame);
  }

  public static boolean isRootCARequired(TlsToggleParams taskParams) {
    return isRootCARequired(
        taskParams.enableNodeToNodeEncrypt,
        taskParams.enableClientToNodeEncrypt,
        taskParams.rootAndClientRootCASame);
  }

  public static boolean isRootCARequired(
      boolean enableNodeToNodeEncrypt,
      boolean enableClientToNodeEncrypt,
      boolean rootAndClientRootCASame) {
    return enableNodeToNodeEncrypt || (rootAndClientRootCASame && enableClientToNodeEncrypt);
  }

  public static boolean isClientRootCARequired(
    UserIntent userIntent, boolean rootAndClientRootCASame) {
  return isClientRootCARequired(
      userIntent.enableNodeToNodeEncrypt,
      userIntent.enableClientToNodeEncrypt,
      rootAndClientRootCASame);
}

  public static boolean isClientRootCARequired(UniverseDefinitionTaskParams taskParams) {
    UserIntent userIntent = taskParams.getPrimaryCluster().userIntent;
    return isClientRootCARequired(
        userIntent.enableNodeToNodeEncrypt,
        userIntent.enableClientToNodeEncrypt,
        taskParams.rootAndClientRootCASame);
  }

  public static boolean isClientRootCARequired(AnsibleConfigureServers.Params taskParams) {
    return isClientRootCARequired(
        taskParams.enableNodeToNodeEncrypt,
        taskParams.enableClientToNodeEncrypt,
        taskParams.rootAndClientRootCASame);
  }

  public static boolean isClientRootCARequired(UniverseSetTlsParams.Params taskParams) {
    return isClientRootCARequired(
        taskParams.enableNodeToNodeEncrypt,
        taskParams.enableClientToNodeEncrypt,
        taskParams.rootAndClientRootCASame);
  }

  public static boolean isClientRootCARequired(TlsToggleParams taskParams) {
    return isClientRootCARequired(
        taskParams.enableNodeToNodeEncrypt,
        taskParams.enableClientToNodeEncrypt,
        taskParams.rootAndClientRootCASame);
  }

  public static boolean isClientRootCARequired(
      boolean enableNodeToNodeEncrypt,
      boolean enableClientToNodeEncrypt,
      boolean rootAndClientRootCASame) {
    return !rootAndClientRootCASame && enableClientToNodeEncrypt;
  }
}
