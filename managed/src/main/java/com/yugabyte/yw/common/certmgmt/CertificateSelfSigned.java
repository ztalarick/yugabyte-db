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

import com.yugabyte.yw.models.CertificateInfo;

/** */
public class CertificateSelfSigned implements CertificateProviderInterface {
  // TODO: impl
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
