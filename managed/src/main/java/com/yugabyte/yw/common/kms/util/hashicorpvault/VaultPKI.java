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

import com.yugabyte.yw.common.certmgmt.CertificateProviderInterface;
import com.yugabyte.yw.models.CertificateInfo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: move vault directory out of KMS
//  => mv common/kms/util/hashicorpvault common/hashicorpvault
/*
 * Wrapper over Vault.logical for PKI operations
 */
public class VaultPKI implements CertificateProviderInterface {
  public static final Logger LOG = LoggerFactory.getLogger(VaultPKI.class);

  String mountPath;
  VaultAccessor vAccessor;

  public VaultPKI(VaultAccessor vaultAccessor, String mPath) {
    mountPath = mPath;
    vAccessor = vaultAccessor;
  }

  public String getCACertificate() {
    // TODO:
    String certString;
    // vault read -field=certificate  <PKI_PATH>/cert/ca
    return "";
  }

  public String getCertificate() {
    // TODO:
    String certString;
    // vault read -field=certificate  <PKI_PATH>/cert/ca
    return "";
  }

  @Override
  public String getCertPEM(CertificateInfo cert) {
    // TODO: impl
    return "";
  }

  @Override
  public String getKeyPEM(CertificateInfo cert) {
    // TODO: impl
    return "";
  }
}
