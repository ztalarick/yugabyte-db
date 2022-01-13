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

import java.math.BigInteger;
import java.security.KeyPair;
import java.security.PrivateKey;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import com.yugabyte.yw.common.certmgmt.CertificateCustomInfo.CertConfigType;

import org.apache.commons.validator.routines.InetAddressValidator;
import org.bouncycastle.asn1.DERSequence;
import org.bouncycastle.asn1.x500.X500Name;
import org.bouncycastle.asn1.x500.X500NameBuilder;
import org.bouncycastle.asn1.x500.style.BCStyle;
import org.bouncycastle.asn1.x509.BasicConstraints;
import org.bouncycastle.asn1.x509.Extension;
import org.bouncycastle.asn1.x509.GeneralName;
import org.bouncycastle.asn1.x509.GeneralNames;
import org.bouncycastle.asn1.x509.KeyUsage;
import org.bouncycastle.cert.X509CertificateHolder;
import org.bouncycastle.cert.X509v3CertificateBuilder;
import org.bouncycastle.cert.jcajce.JcaX509CertificateConverter;
import org.bouncycastle.cert.jcajce.JcaX509ExtensionUtils;
import org.bouncycastle.cert.jcajce.JcaX509v3CertificateBuilder;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.operator.ContentSigner;
import org.bouncycastle.operator.jcajce.JcaContentSignerBuilder;
import org.bouncycastle.pkcs.PKCS10CertificationRequest;
import org.bouncycastle.pkcs.PKCS10CertificationRequestBuilder;
import org.bouncycastle.pkcs.jcajce.JcaPKCS10CertificationRequestBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** */
public class CertificateSelfSigned extends CertificateProviderInterface {
  public static final Logger LOG = LoggerFactory.getLogger(CertificateSelfSigned.class);

  public CertificateSelfSigned(UUID pCACertUUID) {
    super(CertConfigType.SelfSigned, pCACertUUID);
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
    return CertificateHelper.createSignedCertificate(
        caCertUUID, storagePath, username, certStart, certExpiry, certFileName, certKeyName);
  }

  public X509Certificate rootCertificateBuilder(
      String certLabel, int certExpiryInYears, KeyPair keyPair) throws Exception {
    LOG.debug("Called rootCertificateBuilder for: {}", certLabel);
    Calendar cal = Calendar.getInstance();
    Date certStart = cal.getTime();
    cal.add(Calendar.YEAR, certExpiryInYears);
    Date certExpiry = cal.getTime();

    X500Name subject =
        new X500NameBuilder(BCStyle.INSTANCE)
            .addRDN(BCStyle.CN, certLabel)
            .addRDN(BCStyle.O, "example.com")
            .build();
    BigInteger serial = BigInteger.valueOf(System.currentTimeMillis());
    X509v3CertificateBuilder certGen =
        new JcaX509v3CertificateBuilder(
            subject, serial, certStart, certExpiry, subject, keyPair.getPublic());
    BasicConstraints basicConstraints = new BasicConstraints(1);
    KeyUsage keyUsage =
        new KeyUsage(
            KeyUsage.digitalSignature
                | KeyUsage.nonRepudiation
                | KeyUsage.keyEncipherment
                | KeyUsage.keyCertSign);

    certGen.addExtension(Extension.basicConstraints, true, basicConstraints.toASN1Primitive());
    certGen.addExtension(Extension.keyUsage, true, keyUsage.toASN1Primitive());
    ContentSigner signer =
        new JcaContentSignerBuilder(CertificateHelper.SIGNATURE_ALGO).build(keyPair.getPrivate());
    X509CertificateHolder holder = certGen.build(signer);
    JcaX509CertificateConverter converter = new JcaX509CertificateConverter();
    converter.setProvider(new BouncyCastleProvider());
    X509Certificate x509 = converter.getCertificate(holder);
    return x509;
  }

  public X509Certificate certificateBuilderWithSigning(
      String username,
      X500Name subject,
      Date certStart,
      Date certExpiry,
      KeyPair clientKeyPair,
      X509Certificate caCert,
      PrivateKey pk)
      throws Exception {
    LOG.debug("Called certificateBuilderWithSigning for: {}, {}", username, subject);
    X500Name clientCertSubject = new X500Name(String.format("CN=%s", username));
    BigInteger clientSerial = BigInteger.valueOf(System.currentTimeMillis());
    PKCS10CertificationRequestBuilder p10Builder =
        new JcaPKCS10CertificationRequestBuilder(clientCertSubject, clientKeyPair.getPublic());
    ContentSigner csrContentSigner =
        new JcaContentSignerBuilder(CertificateHelper.SIGNATURE_ALGO).build(pk);
    PKCS10CertificationRequest csr = p10Builder.build(csrContentSigner);

    KeyUsage keyUsage =
        new KeyUsage(
            KeyUsage.digitalSignature
                | KeyUsage.nonRepudiation
                | KeyUsage.keyEncipherment
                | KeyUsage.keyCertSign);

    X509v3CertificateBuilder clientCertBuilder =
        new X509v3CertificateBuilder(
            subject,
            clientSerial,
            certStart,
            certExpiry,
            csr.getSubject(),
            csr.getSubjectPublicKeyInfo());
    JcaX509ExtensionUtils clientCertExtUtils = new JcaX509ExtensionUtils();
    clientCertBuilder.addExtension(
        Extension.basicConstraints, true, new BasicConstraints(false).toASN1Primitive());
    clientCertBuilder.addExtension(
        Extension.authorityKeyIdentifier,
        false,
        clientCertExtUtils.createAuthorityKeyIdentifier(caCert));
    clientCertBuilder.addExtension(
        Extension.subjectKeyIdentifier,
        false,
        clientCertExtUtils.createSubjectKeyIdentifier(csr.getSubjectPublicKeyInfo()));
    clientCertBuilder.addExtension(Extension.keyUsage, false, keyUsage.toASN1Primitive());

    InetAddressValidator ipAddressValidator = InetAddressValidator.getInstance();
    if (ipAddressValidator.isValid(username)) {
      List<GeneralName> altNames = new ArrayList<>();
      altNames.add(new GeneralName(GeneralName.iPAddress, username));
      GeneralNames subjectAltNames =
          GeneralNames.getInstance(new DERSequence(altNames.toArray(new GeneralName[] {})));
      clientCertBuilder.addExtension(Extension.subjectAlternativeName, false, subjectAltNames);
    }

    X509CertificateHolder clientCertHolder = clientCertBuilder.build(csrContentSigner);
    X509Certificate clientCert =
        new JcaX509CertificateConverter()
            .setProvider(new BouncyCastleProvider())
            .getCertificate(clientCertHolder);

    clientCert.verify(caCert.getPublicKey(), "BC");

    return clientCert;
  }
}
