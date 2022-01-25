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

import java.security.KeyPair;
import java.security.cert.X509Certificate;
import java.util.Date;
import java.util.UUID;

import com.yugabyte.yw.common.certmgmt.CertificateCustomInfo;
import com.yugabyte.yw.common.certmgmt.CertificateDetails;
import com.yugabyte.yw.common.certmgmt.CertificateCustomInfo.CertConfigType;

import org.apache.commons.lang3.tuple.Pair;

/** Provides interface to manage certificates */
public abstract class CertificateProviderInterface {

  CertificateCustomInfo.CertConfigType certConfigType;
  public UUID caCertUUID;

  public CertificateProviderInterface(CertificateCustomInfo.CertConfigType type, UUID pCACertUUID) {
    certConfigType = type;
    caCertUUID = pCACertUUID;
  }

  public abstract X509Certificate generateRootCertificate(
      String certLabel, int certExpiryInYears, KeyPair keyPair) throws Exception;

  public abstract CertificateDetails createCertificate(
      String storagePath,
      String username,
      Date certStart,
      Date certExpiry,
      String certFileName,
      String certKeyName);

  public abstract Pair<String, String> dumpCACertBundle(String storagePath, UUID customerUUID);
}
