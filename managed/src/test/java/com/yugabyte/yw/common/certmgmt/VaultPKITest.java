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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.security.PublicKey;
import java.security.cert.X509Certificate;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import com.yugabyte.yw.common.FakeDBApplication;
import com.yugabyte.yw.common.TestUtils;
import com.yugabyte.yw.common.certmgmt.providers.CertificateProviderInterface;
import com.yugabyte.yw.common.certmgmt.providers.VaultPKI;
import com.yugabyte.yw.common.certmgmt.providers.VaultPKI.VaultOperationsForCert;
import com.yugabyte.yw.common.kms.util.hashicorpvault.HashicorpVaultConfigParams;
import com.yugabyte.yw.common.kms.util.hashicorpvault.VaultAccessor;
import com.yugabyte.yw.common.kms.util.hashicorpvault.VaultEARServiceUtilTest;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// @RunWith(MockitoJUnitRunner.class)
public class VaultPKITest extends FakeDBApplication {
  protected static final Logger LOG = LoggerFactory.getLogger(VaultPKITest.class);

  boolean MOCK_RUN;

  HashicorpVaultConfigParams params;

  UUID caUUID = UUID.randomUUID();
  UUID customerUUID = UUID.randomUUID();

  String username;
  String certPath;
  String certKeyPath;

  @Before
  public void setUp() {

    // MOCK_RUN = VaultEARServiceUtilTest.MOCK_RUN;
    MOCK_RUN = true;

    params = new HashicorpVaultConfigParams();
    params.vaultAddr = VaultEARServiceUtilTest.vaultAddr;
    params.vaultToken = VaultEARServiceUtilTest.vaultToken;
    params.engine = "pki";
    params.mountPath = "p3jan/";
    params.role = "example-dot-com";

    username = "127.0.0.1";
    certPath = username + ".pem";
    certKeyPath = username + ".key";
  }

  @Test
  public void TestPathCreation() {
    String oPath = "pki/cert/ca";
    String path =
        "pki/"
            + VaultOperationsForCert.CERT.toString()
            + "/"
            + VaultOperationsForCert.CA_CERT.toString();
    assertEquals(oPath, path);
  }

  @Test
  public void TestCertificateGenerationMock() throws Exception {
    if (MOCK_RUN == false) return;

    Map<String, String> result = new HashMap<String, String>();
    result.put("serial_number", TestUtils.readResource("hashicorp/pki/ca.pem"));
    result.put("certificate", TestUtils.readResource("hashicorp/pki/client.pem"));
    result.put("private_key", TestUtils.readResource("hashicorp/pki/client.key"));
    result.put("issuing_ca", TestUtils.readResource("hashicorp/pki/issuing_ca.pem"));

    VaultAccessor vAccessor = mock(VaultAccessor.class);
    when(vAccessor.writeAt(any(), any())).thenReturn(result);

    VaultPKI pkiObj = new VaultPKI(caUUID, vAccessor, params);

    CertificateDetails cDetails =
        pkiObj.createCertificate(null, username, new Date(), new Date(), certPath, certKeyPath);

    X509Certificate cert = CertificateHelper.convertStringToX509Cert(cDetails.getCertInfo());
    LOG.info(CertificateHelper.getCertificateProperties(cert));

    assertEquals("CN=" + username, cert.getSubjectDN().toString());
    assertTrue(cert.getSubjectAlternativeNames().toString().contains(username));
  }

  @Test
  public void TestCertificateGeneration() throws Exception {

    if (MOCK_RUN == true) return;

    // Simulates CertificateController.getClientCert
    CertificateProviderInterface certProvider = VaultPKI.getVaultPKIInstance(caUUID, params);
    CertificateDetails cDetails =
        certProvider.createCertificate(null, username, null, null, certPath, certKeyPath);

    // LOG.info("Client Cert is: {}", cDetails.getCertInfo());
    // LOG.info("Client Cert key is: {}", cDetails.getKeyInfo());
    // assertTrue(false);

    // X509Certificate cert = CertificateHelper.convertStringToX509Cert(cDetails.getCertInfo());
    X509Certificate cert = CertificateHelper.convertStringToX509Cert(cDetails.crt);

    LOG.info(CertificateHelper.getCertificateProperties(cert));

    assertEquals("CN=" + username, cert.getSubjectDN().toString());
    assertTrue(cert.getSubjectAlternativeNames().toString().contains(username));

    // verify using issue_ca
    X509Certificate caCert =
        CertificateHelper.convertStringToX509Cert(((VaultPKI) certProvider).getCACertificate());
    PublicKey k = caCert.getPublicKey();
    cert.verify(k, "BC");

    // verify by fetching ca from mountPath.
    caCert = ((VaultPKI) certProvider).getCACertificateFromVault();
    assertNotEquals("", caCert);
    k = caCert.getPublicKey();
    cert.verify(k, "BC");
  }

  @Test
  public void TestCertificateDates() throws Exception {

    if (MOCK_RUN == true) return;

    Date certStart = Calendar.getInstance().getTime();
    Calendar calEnd = Calendar.getInstance();
    calEnd.add(Calendar.YEAR, CertificateHelper.CERT_EXPIRY_IN_YEARS);
    Date certExpiry = calEnd.getTime();

    CertificateProviderInterface certProvider = VaultPKI.getVaultPKIInstance(caUUID, params);
    CertificateDetails cDetails =
        certProvider.createCertificate(
            null, username, certStart, certExpiry, certPath, certKeyPath);
    X509Certificate cert = CertificateHelper.convertStringToX509Cert(cDetails.crt);
    LOG.info("Start Date: {} and {}", certStart.toString(), cert.getNotBefore());
    // assertTrue(certStart.equals(cert.getNotBefore()));
    // assertTrue(certEnd.equals(cert.getNotAfter()));

  }
}
