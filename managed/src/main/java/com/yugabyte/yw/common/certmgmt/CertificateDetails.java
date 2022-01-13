package com.yugabyte.yw.common.certmgmt;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CertificateDetails {
  @JsonProperty(CertificateHelper.CLIENT_CERT)
  String crt;

  @JsonProperty(CertificateHelper.CLIENT_KEY)
  String key;

  // TODO: remove this method after code restructure
  public String getCertInfo() {
    return crt;
  }

  public String getKeyInfo() {
    return key;
  }
}
