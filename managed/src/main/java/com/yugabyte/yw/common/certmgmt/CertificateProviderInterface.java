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

import java.util.Date;
import java.util.UUID;

import com.yugabyte.yw.models.CertificateInfo;

/** TODO */
public interface CertificateProviderInterface {
  /*
    public UUID createRootCA(String nodePrefix, UUID customerUUID, String storagePath);

    public CertificateDetails createSignedCertificate( UUID rootCA, String storagePath,
    String username, Date certStart, Date certExpiry, String certFileName, String certKeyName);

    public CertificateDetails createNodeToNodeCertificate( UUID rootCA, String storagePath,
    String username, Date certStart, Date certExpiry);

    public CertificateDetails createClientToNodeCertificate( UUID rootCA, String storagePath,
    String username, Date certStart, Date certExpiry);
  */

  public String getCertPEM(CertificateInfo cert);

  public String getKeyPEM(CertificateInfo cert);
}
