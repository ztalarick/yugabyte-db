// Copyright (c) Yugabyte, Inc.

package com.yugabyte.yw.forms;

import com.yugabyte.yw.common.certmgmt.CertificateCustomInfo.CertConfigType;
import com.yugabyte.yw.common.kms.util.hashicorpvault.HashicorpVaultConfigParam;
import play.data.validation.Constraints;

/**
 * This class will be used by the API and UI Form Elements to validate constraints for the custom
 * certificate Data.
 */
public class CertificateParams {
  @Constraints.Required() public String label;

  @Constraints.Required() public long certStart;

  @Constraints.Required() public long certExpiry;

  @Constraints.Required() public String certContent;

  public String keyContent;

  public CertConfigType certType = CertConfigType.SelfSigned;

  /**
   * This is used for params for custom cert path information (on prem) provided by user while
   * creating custom cert entry.
   */
  public static class CustomCertPathParams {
    public String nodeCertPath;
    public String nodeKeyPath;
    public String rootCertPath;
    public String clientCertPath;
    public String clientKeyPath;
  }

  public CustomCertPathParams customCertPathParams;

  /** This is used for accepting custom server certificates for Node-to-client communication. */
  public static class CustomServerCertParams {
    public String serverCertContent;
    public String serverKeyContent;
  }

  public CustomServerCertParams customSrvCertParams;

  public HashicorpVaultConfigParam hcVaultCertParams;
}
