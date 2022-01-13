// Copyright (c) YugaByte, Inc.

package com.yugabyte.yw.common.certmgmt;

import static play.mvc.Http.Status.BAD_REQUEST;
import static play.mvc.Http.Status.INTERNAL_SERVER_ERROR;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringReader;
import java.io.StringWriter;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.Security;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import com.yugabyte.yw.commissioner.tasks.subtasks.AnsibleConfigureServers;
import com.yugabyte.yw.commissioner.tasks.subtasks.UniverseSetTlsParams;
import com.yugabyte.yw.common.PlatformServiceException;
import com.yugabyte.yw.common.certmgmt.CertificateCustomInfo.CertConfigType;
import com.yugabyte.yw.common.kms.util.hashicorpvault.VaultPKI;
import com.yugabyte.yw.forms.CertificateParams;
import com.yugabyte.yw.forms.TlsToggleParams;
import com.yugabyte.yw.forms.UniverseDefinitionTaskParams;
import com.yugabyte.yw.forms.UniverseDefinitionTaskParams.UserIntent;
import com.yugabyte.yw.models.CertificateInfo;
import com.yugabyte.yw.models.helpers.CommonUtils;

import org.bouncycastle.asn1.x500.RDN;
import org.bouncycastle.asn1.x500.X500Name;
import org.bouncycastle.asn1.x500.style.BCStyle;
import org.bouncycastle.cert.jcajce.JcaX509CertificateHolder;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.openssl.jcajce.JcaPEMWriter;
import org.bouncycastle.util.io.pem.PemObject;
import org.bouncycastle.util.io.pem.PemReader;
import org.flywaydb.play.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.ebean.annotation.EnumValue;
import play.libs.Json;

/** Helper class for Certificates */
public class CertificateHelper {

  public static final Logger LOG = LoggerFactory.getLogger(CertificateHelper.class);

  public static final String CLIENT_CERT = "yugabytedb.crt";
  public static final String CLIENT_KEY = "yugabytedb.key";
  public static final String DEFAULT_CLIENT = "yugabyte";
  public static final String CERT_PATH = "%s/certs/%s/%s";
  public static final String ROOT_CERT = "root.crt";
  public static final String SERVER_CERT = "server.crt";
  public static final String SERVER_KEY = "server.key.pem";
  public static final String CLIENT_NODE_SUFFIX = "-client";

  public static final String SIGNATURE_ALGO = "SHA256withRSA";
  public static final Integer CERT_EXPIRY_IN_YEARS = 4;

  public enum CertificateType {
    @EnumValue("ROOT_CA_CERT")
    ROOT_CA_CERT,

    @EnumValue("CLIENT_CA_CERT")
    CLIENT_CA_CERT,

    @EnumValue("USER_NODE_CERT")
    USER_NODE_CERT,

    @EnumValue("USER_CLIENT_CERT")
    USER_CLIENT_CERT
  }

  public static UUID createRootCA(String nodePrefix, UUID customerUUID, String storagePath) {
    LOG.info(
        "_YD:Creating root certificate for {} from: {}",
        nodePrefix,
        CommonUtils.GetStackTraceHere());
    try {
      // Default the cert label with node prefix.
      // If cert with the label already exists append number
      String certLabel = nodePrefix;
      CertConfigType certType = CertConfigType.SelfSigned;
      List<CertificateInfo> certificateInfoList =
          CertificateInfo.getWhereLabelStartsWith(nodePrefix, certType);
      if (!certificateInfoList.isEmpty()) {
        certificateInfoList.sort(Comparator.comparing(a -> a.label, Comparator.reverseOrder()));
        String[] labelArray = certificateInfoList.get(0).label.split("~");
        int lastCount = 0;
        try {
          lastCount = Integer.parseInt(labelArray[labelArray.length - 1]);
        } catch (NumberFormatException ignored) {
        }
        certLabel = nodePrefix + "~" + (++lastCount);
      }

      UUID rootCA_UUID = UUID.randomUUID();
      KeyPair keyPair = getKeyPairObject();

      CertificateSelfSigned obj = new CertificateSelfSigned(rootCA_UUID);
      X509Certificate x509 = obj.rootCertificateBuilder(certLabel, CERT_EXPIRY_IN_YEARS, keyPair);
      Date certStart = x509.getNotBefore();
      Date certExpiry = x509.getNotAfter();

      String certPath =
          String.format(
              CERT_PATH + "/ca.%s", storagePath, customerUUID.toString(), rootCA_UUID, ROOT_CERT);
      writeCertBundleToCertPath(Collections.singletonList(x509), certPath);

      String keyPath =
          String.format(CERT_PATH + "/ca.key.pem", storagePath, customerUUID, rootCA_UUID);
      writeKeyFileContentToKeyPath(keyPair.getPrivate(), keyPath);

      LOG.info(
          "Generated self signed cert label {} uuid {} of type {} for customer {} at paths {}, {}",
          certLabel,
          rootCA_UUID,
          certType,
          customerUUID,
          certPath,
          keyPath);

      CertificateInfo cert =
          CertificateInfo.create(
              rootCA_UUID,
              customerUUID,
              certLabel,
              certStart,
              certExpiry,
              keyPath,
              certPath,
              certType);

      LOG.info("Created Root CA for universe {}.", certLabel);
      return cert.uuid;
    } catch (Exception e) {
      LOG.error("Unable to create RootCA for universe {}", nodePrefix, e);
      return null;
    }
  }

  public static UUID createClientRootCA(String nodePrefix, UUID customerUUID, String storagePath) {
    LOG.info("_YD:Creating a client root certificate for {}", nodePrefix);
    return createRootCA(nodePrefix + CLIENT_NODE_SUFFIX, customerUUID, storagePath);
  }

  public static CertificateDetails createSignedCertificate(
      UUID rootCA,
      String storagePath,
      String username,
      Date certStart,
      Date certExpiry,
      String certFileName,
      String certKeyName) {
    LOG.info(
        "Creating signed certificate signed by root CA {} and user {} at path {}",
        rootCA,
        username,
        storagePath);
    LOG.info("Called from: {}", CommonUtils.GetStackTraceHere());
    try {
      // Add the security provider in case createSignedCertificate was never called.
      KeyPair clientKeyPair = CertificateHelper.getKeyPairObject();

      Calendar cal = Calendar.getInstance();
      if (certStart == null) {
        certStart = cal.getTime();
      }
      if (certExpiry == null) {
        cal.add(Calendar.YEAR, CERT_EXPIRY_IN_YEARS);
        certExpiry = cal.getTime();
      }

      CertificateInfo certInfo = CertificateInfo.get(rootCA);
      if (certInfo.privateKey == null) {
        throw new PlatformServiceException(BAD_REQUEST, "Keyfile cannot be null!");
      }
      // The first entry will be the certificate that needs to sign the necessary certificate.
      X509Certificate cer =
          CertificateHelper.getX509CertificateCertObject(
                  FileUtils.readFileToString(new File(certInfo.certificate)))
              .get(0);
      X500Name subject = new JcaX509CertificateHolder(cer).getSubject();
      PrivateKey pk = null;
      try {
        pk =
            CertificateHelper.getPrivateKey(
                FileUtils.readFileToString(new File(certInfo.privateKey)));
      } catch (Exception e) {
        LOG.error(
            "Unable to create client CA for username {} using root CA {}", username, rootCA, e);
        throw new PlatformServiceException(BAD_REQUEST, "Could not create client cert.");
      }

      CertificateSelfSigned obj = new CertificateSelfSigned(rootCA);
      X509Certificate clientCert =
          obj.certificateBuilderWithSigning(
              username, subject, certStart, certExpiry, clientKeyPair, cer, pk);
      LOG.info("Created Client CA for username {} signed by root CA {}.", username, rootCA);

      certStart = clientCert.getNotBefore();
      certExpiry = clientCert.getNotAfter();

      return DumpNewCertsToFile(
          storagePath, certFileName, certKeyName, clientCert, clientKeyPair.getPrivate());

    } catch (Exception e) {
      LOG.error("Unable to create client CA for username {} using root CA {}", username, rootCA, e);
      throw new PlatformServiceException(INTERNAL_SERVER_ERROR, "Could not create client cert.");
    }
  }

  public static CertificateDetails DumpNewCertsToFile(
      String storagePath,
      String certFileName,
      String certKeyName,
      X509Certificate clientCert,
      PrivateKey pKey)
      throws IOException {
    JcaPEMWriter clientCertWriter = null;
    JcaPEMWriter clientKeyWriter = null;
    CertificateDetails certificateDetails = new CertificateDetails();

    try {
      if (storagePath != null) {
        // get file path write it there
        String clientCertPath = String.format("%s/%s", storagePath, certFileName);
        String clientKeyPath = String.format("%s/%s", storagePath, certKeyName);
        writeCertFileContentToCertPath(clientCert, clientCertPath);
        writeKeyFileContentToKeyPath(pKey, clientKeyPath);
      } else {
        // storagePath is null, not dumping it to file but returning it.
        StringWriter certWriter = new StringWriter();
        StringWriter keyWriter = new StringWriter();
        clientCertWriter = new JcaPEMWriter(certWriter);
        clientKeyWriter = new JcaPEMWriter(keyWriter);
        clientCertWriter.writeObject(clientCert);
        clientCertWriter.flush();
        clientKeyWriter.writeObject(pKey);
        clientKeyWriter.flush();
        certificateDetails.crt = certWriter.toString();
        certificateDetails.key = keyWriter.toString();
      }
    } finally {
      if (clientCertWriter != null) {
        clientCertWriter.close();
      }
      if (clientKeyWriter != null) {
        clientKeyWriter.close();
      }
    }
    return certificateDetails;
  }

  public static CertificateDetails createClientCertificate(
      UUID rootCA, String storagePath, String username, Date certStart, Date certExpiry) {
    LOG.info("__YD:Creating client certificate for {}", username);

    CertificateInfo rootCertConfigInfo = CertificateInfo.get(rootCA);
    switch (rootCertConfigInfo.certType) {
      case HashicorpVaultPKI:
        {
          try {
            CertificateProviderInterface certProvider =
                VaultPKI.getVaultPKIInstance(rootCertConfigInfo);
            return certProvider.createCertificate(
                storagePath,
                username,
                certStart,
                certExpiry,
                CertificateHelper.CLIENT_CERT,
                CertificateHelper.CLIENT_KEY);
          } catch (Exception e) {
            String message = "Cannot create certificate. " + e.toString();
            throw new PlatformServiceException(BAD_REQUEST, message);
          }
        }
      default:
        return createSignedCertificate(
            rootCA, storagePath, username, certStart, certExpiry, CLIENT_CERT, CLIENT_KEY);
    }
  }

  public static CertificateDetails createServerCertificate(
      UUID rootCA,
      String storagePath,
      String username,
      Date certStart,
      Date certExpiry,
      String certFileName,
      String certKeyName) {
    LOG.info("__YD:Creating server certificate for {}", username);

    CertificateInfo rootCertConfigInfo = CertificateInfo.get(rootCA);
    switch (rootCertConfigInfo.certType) {
      case HashicorpVaultPKI:
        {
          try {
            CertificateProviderInterface certProvider =
                VaultPKI.getVaultPKIInstance(rootCertConfigInfo);
            return certProvider.createCertificate(
                storagePath, username, certStart, certExpiry, certFileName, certKeyName);
          } catch (Exception e) {
            String message = "Cannot create certificate. " + e.toString();
            throw new PlatformServiceException(BAD_REQUEST, message);
          }
        }
      default:
        // CertificateProviderInterface obj = new CertificateSelfSigned(rootCA);
        return createSignedCertificate(
            rootCA, storagePath, username, certStart, certExpiry, certFileName, certKeyName);
    }
  }

  public static UUID uploadRootCA(
      String label,
      UUID customerUUID,
      String storagePath,
      String certContent,
      String keyContent,
      Date certStart,
      Date certExpiry,
      CertConfigType certType,
      CertificateParams.CustomCertPathParams customCertPathParams,
      CertificateParams.CustomServerCertParams customSrvCertParams) {
    LOG.debug("uploadRootCA: Label: {}, customerUUID: {}", label, customerUUID.toString());
    try {
      if (certContent == null) {
        throw new PlatformServiceException(BAD_REQUEST, "Certfile can't be null");
      }
      UUID rootCA_UUID = UUID.randomUUID();
      String keyPath = null;
      CertificateInfo.CustomServerCertInfo customServerCertInfo = null;
      List<X509Certificate> x509CACerts = getX509CertificateCertObject(certContent);

      // Set certStart and certExpiry from X509Certificate if provided null
      if (certType == CertConfigType.CustomCertHostPath) {
        if (certStart == null || certStart.getTime() == 0) {
          long certStartTimestamp = 0L;
          for (X509Certificate cert : x509CACerts) {
            if (cert.getNotBefore().getTime() > certStartTimestamp) {
              certStartTimestamp = cert.getNotBefore().getTime();
            }
          }
          certStart = new Date(certStartTimestamp);
        }
        if (certExpiry == null || certExpiry.getTime() == 0) {
          long certExpiryTimestamp = Long.MAX_VALUE;
          for (X509Certificate cert : x509CACerts) {
            if (cert.getNotAfter().getTime() < certExpiryTimestamp) {
              certExpiryTimestamp = cert.getNotAfter().getTime();
            }
          }
          certExpiry = new Date(certExpiryTimestamp);
        }
      }

      // Verify the uploaded cert is a verified cert chain.
      verifyCertValidity(x509CACerts);
      if (certType == CertConfigType.SelfSigned) {
        // The first entry in the file should be the cert we want to use for generating server
        // certs.
        verifyCertSignatureAndOrder(x509CACerts, keyContent);
        keyPath =
            String.format(
                "%s/certs/%s/%s/ca.key.pem",
                storagePath, customerUUID.toString(), rootCA_UUID.toString());
      } else if (certType == CertConfigType.CustomServerCert) {
        // Verify the upload Server Cert is a verified cert chain.
        List<X509Certificate> x509ServerCertificates =
            getX509CertificateCertObject(customSrvCertParams.serverCertContent);
        // Verify that the uploaded server cert was signed by the uploaded CA cert
        List<X509Certificate> combinedArrayList = new ArrayList<>(x509ServerCertificates);
        combinedArrayList.addAll(x509CACerts);
        verifyCertValidity(combinedArrayList);
        // The first entry in the file should be the cert we want to use for generating server
        // certs.
        verifyCertSignatureAndOrder(x509ServerCertificates, customSrvCertParams.serverKeyContent);
        String serverCertPath =
            String.format(
                "%s/certs/%s/%s/%s",
                storagePath, customerUUID.toString(), rootCA_UUID.toString(), SERVER_CERT);
        String serverKeyPath =
            String.format(
                "%s/certs/%s/%s/%s",
                storagePath, customerUUID.toString(), rootCA_UUID.toString(), SERVER_KEY);
        writeCertBundleToCertPath(x509ServerCertificates, serverCertPath);
        writeKeyFileContentToKeyPath(
            getPrivateKey(customSrvCertParams.serverKeyContent), serverKeyPath);
        customServerCertInfo =
            new CertificateInfo.CustomServerCertInfo(serverCertPath, serverKeyPath);
      } else if (certType == CertConfigType.HashicorpVaultPKI) {
        // Not applicable
      }
      String certPath =
          String.format(
              "%s/certs/%s/%s/ca.%s",
              storagePath, customerUUID.toString(), rootCA_UUID.toString(), ROOT_CERT);

      writeCertBundleToCertPath(getX509CertificateCertObject(certContent), certPath);

      CertificateInfo cert;
      switch (certType) {
        case SelfSigned:
          {
            writeKeyFileContentToKeyPath(getPrivateKey(keyContent), keyPath);
            cert =
                CertificateInfo.create(
                    rootCA_UUID,
                    customerUUID,
                    label,
                    certStart,
                    certExpiry,
                    keyPath,
                    certPath,
                    certType);
            break;
          }
        case CustomCertHostPath:
          {
            cert =
                CertificateInfo.create(
                    rootCA_UUID,
                    customerUUID,
                    label,
                    certStart,
                    certExpiry,
                    certPath,
                    customCertPathParams);
            break;
          }
        case CustomServerCert:
          {
            cert =
                CertificateInfo.create(
                    rootCA_UUID,
                    customerUUID,
                    label,
                    certStart,
                    certExpiry,
                    certPath,
                    customServerCertInfo);
            break;
          }
        case HashicorpVaultPKI:
          {
            // not applicable
          }
        default:
          {
            throw new PlatformServiceException(BAD_REQUEST, "certType should be valid.");
          }
      }
      LOG.info(
          "Uploaded cert label {} (uuid {}) of type {} at paths"
              + " '{}', '{}' with custom cert info {}",
          label,
          rootCA_UUID,
          certType,
          certPath,
          String.valueOf(keyPath),
          Json.toJson(customCertPathParams));
      return cert.uuid;
    } catch (IOException | NoSuchAlgorithmException e) {
      LOG.error(
          "uploadRootCA: Could not generate checksum for cert {} for customer {}",
          label,
          customerUUID.toString());
      throw new PlatformServiceException(
          INTERNAL_SERVER_ERROR, "uploadRootCA: Checksum generation failed.");
    }
  }

  public static String getCertPEMFileContents(UUID rootCA) {
    CertificateInfo cert = CertificateInfo.get(rootCA);
    String certPEM = FileUtils.readFileToString(new File(cert.certificate));
    return certPEM;
  }

  public static String getCertPEM(UUID rootCA) {
    String certPEM = getCertPEMFileContents(rootCA);
    certPEM = Base64.getEncoder().encodeToString(certPEM.getBytes());
    return certPEM;
  }

  public static String getCertPEM(CertificateInfo cert) {
    String certPEM = FileUtils.readFileToString(new File(cert.certificate));
    certPEM = Base64.getEncoder().encodeToString(certPEM.getBytes());
    return certPEM;
  }

  public static String getKeyPEM(CertificateInfo cert) {
    String privateKeyPEM = FileUtils.readFileToString(new File(cert.privateKey));
    privateKeyPEM = Base64.getEncoder().encodeToString(privateKeyPEM.getBytes());
    return privateKeyPEM;
  }

  public static String getKeyPEM(UUID rootCA) {
    CertificateInfo cert = CertificateInfo.get(rootCA);
    String privateKeyPEM = FileUtils.readFileToString(new File(cert.privateKey));
    privateKeyPEM = Base64.getEncoder().encodeToString(privateKeyPEM.getBytes());
    return privateKeyPEM;
  }

  public static String getClientCertFile(UUID rootCA) {
    CertificateInfo cert = CertificateInfo.get(rootCA);
    File certFile = new File(cert.certificate);
    String path = certFile.getParentFile().toString();
    return String.format("%s/%s", path, CLIENT_CERT);
  }

  public static String getClientKeyFile(UUID rootCA) {
    CertificateInfo cert = CertificateInfo.get(rootCA);
    File certFile = new File(cert.certificate);
    String path = certFile.getParentFile().toString();
    return String.format("%s/%s", path, CLIENT_KEY);
  }

  public static boolean areCertsDiff(UUID cert1, UUID cert2) {
    try {
      CertificateInfo cer1 = CertificateInfo.get(cert1);
      CertificateInfo cer2 = CertificateInfo.get(cert2);
      FileInputStream is1 = new FileInputStream(new File(cer1.certificate));
      FileInputStream is2 = new FileInputStream(new File(cer2.certificate));
      CertificateFactory fact = CertificateFactory.getInstance("X.509");
      X509Certificate certObj1 = (X509Certificate) fact.generateCertificate(is1);
      X509Certificate certObj2 = (X509Certificate) fact.generateCertificate(is2);
      return !certObj2.equals(certObj1);
    } catch (IOException | CertificateException e) {
      LOG.error("Unable to read certs {}: {}", cert1.toString(), cert2.toString());
      throw new RuntimeException("Could not read certs to compare. " + e);
    }
  }

  public static boolean arePathsSame(UUID cert1, UUID cert2) {
    CertificateInfo cer1 = CertificateInfo.get(cert1);
    CertificateInfo cer2 = CertificateInfo.get(cert2);
    return (cer1.getCustomCertPathParams()
            .nodeCertPath
            .equals(cer2.getCustomCertPathParams().nodeCertPath)
        || cer1.getCustomCertPathParams()
            .nodeKeyPath
            .equals(cer2.getCustomCertPathParams().nodeKeyPath));
  }

  public static void createChecksums() {
    List<CertificateInfo> certs = CertificateInfo.getAllNoChecksum();
    for (CertificateInfo cert : certs) {
      try {
        cert.setChecksum();
      } catch (IOException | NoSuchAlgorithmException e) {
        // Log error, but don't cause it to error out.
        LOG.error("Could not generate checksum for cert: {}", cert.certificate);
      }
    }
  }

  @SuppressWarnings("unchecked")
  public static List<X509Certificate> getX509CertificateCertObject(String certContent) {
    try {
      InputStream in = null;
      byte[] certEntryBytes = certContent.getBytes();
      in = new ByteArrayInputStream(certEntryBytes);
      CertificateFactory certFactory = CertificateFactory.getInstance("X.509");
      return (List<X509Certificate>) (List<?>) certFactory.generateCertificates(in);
    } catch (CertificateException e) {
      LOG.error(e.getMessage());
      throw new RuntimeException("Unable to get cert Object");
    }
  }

  public static String getCertificateProperties(X509Certificate cert) {

    String san = "";
    try {
      san = cert.getSubjectAlternativeNames().toString();
    } catch (Exception e) {
      san = "exception";
    }
    String ret =
        "cert info: "
            + System.lineSeparator()
            + "\t dn: "
            + cert.getIssuerDN().toString()
            + System.lineSeparator()
            + "\t subject : "
            + cert.getSubjectDN().toString()
            + System.lineSeparator()
            + "\t ip_san : "
            + san
            + System.lineSeparator()
            + "\t beforeDate: "
            + cert.getNotBefore().toString()
            + System.lineSeparator()
            + "\t AfterDate: "
            + cert.getNotAfter().toString()
            + System.lineSeparator()
            + "\t serial:"
            + cert.getSerialNumber();
    return ret;
  }

  public static X509Certificate convertStringToX509Cert(String certificate) throws Exception {
    java.security.Security.addProvider(new BouncyCastleProvider());

    certificate = certificate.replace("\\n", "");
    certificate = certificate.replaceAll("^\"+|\"+$", "");
    certificate = certificate.replace("-----BEGIN CERTIFICATE-----", "");
    certificate = certificate.replace("-----END CERTIFICATE-----", "");

    byte[] certificateData = Base64.getMimeDecoder().decode(certificate);
    CertificateFactory cf = CertificateFactory.getInstance("X509");
    return (X509Certificate) cf.generateCertificate(new ByteArrayInputStream(certificateData));
  }

  public static PrivateKey convertStringToPrivateKey(String strKey) throws Exception {

    java.security.Security.addProvider(new BouncyCastleProvider());

    strKey = strKey.replace(System.lineSeparator(), "");
    strKey = strKey.replaceAll("^\"+|\"+$", "");
    strKey = strKey.replace("-----BEGIN PRIVATE KEY-----", "");
    strKey = strKey.replace("-----END PRIVATE KEY-----", "");
    strKey = strKey.replace("-----BEGIN RSA PRIVATE KEY-----", "");
    strKey = strKey.replace("-----END RSA PRIVATE KEY-----", "");
    System.out.println("Private key:" + strKey);

    byte[] decoded = Base64.getMimeDecoder().decode(strKey);

    PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(decoded);
    KeyFactory kf = KeyFactory.getInstance("RSA");
    return kf.generatePrivate(spec);
  }

  public static PrivateKey getPrivateKey(String keyContent) {
    try (PemReader pemReader = new PemReader(new StringReader(new String(keyContent)))) {
      PemObject pemObject = pemReader.readPemObject();
      byte[] bytes = pemObject.getContent();
      PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(bytes);
      KeyFactory kf = KeyFactory.getInstance("RSA");
      return kf.generatePrivate(spec);
    } catch (Exception e) {
      LOG.error(e.getMessage());
      throw new RuntimeException("Unable to get Private Key");
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
    return isRootCARequired(userIntent, taskParams.rootAndClientRootCASame);
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
    return isClientRootCARequired(userIntent, taskParams.rootAndClientRootCASame);
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

  public static void writeCertFileContentToCertPath(X509Certificate cert, String certPath) {
    File certFile = new File(certPath);
    try (JcaPEMWriter certWriter = new JcaPEMWriter(new FileWriter(certFile))) {
      certWriter.writeObject(cert);
      certWriter.flush();
    } catch (Exception e) {
      LOG.error(e.getMessage());
      throw new RuntimeException("Save certificate failed.");
    }
  }

  public static void writeKeyFileContentToKeyPath(PrivateKey keyContent, String keyPath) {
    File keyFile = new File(keyPath);
    try (JcaPEMWriter keyWriter = new JcaPEMWriter(new FileWriter(keyFile))) {
      keyWriter.writeObject(keyContent);
      keyWriter.flush();
    } catch (Exception e) {
      LOG.error(e.getMessage());
      throw new RuntimeException("Save privateKey failed.");
    }
  }

  public static void writeCertBundleToCertPath(List<X509Certificate> certs, String certPath) {
    File certfile = new File(certPath);
    // Create directory to store the certFile.
    certfile.getParentFile().mkdirs();
    try (JcaPEMWriter certWriter = new JcaPEMWriter(new FileWriter(certfile))) {
      for (X509Certificate cert : certs) {
        certWriter.writeObject(cert);
        certWriter.flush();
      }
    } catch (Exception e) {
      LOG.error(e.getMessage());
      throw new RuntimeException("Save certContent failed.");
    }
  }

  public static KeyPair getKeyPairObject() {
    try {
      // Add the security provider in case it was never called.
      Security.addProvider(new BouncyCastleProvider());
      KeyPairGenerator keypairGen = KeyPairGenerator.getInstance("RSA");
      keypairGen.initialize(2048);
      return keypairGen.generateKeyPair();
    } catch (Exception e) {
      LOG.error(e.getMessage());
    }
    return null;
  }

  private static boolean verifySignature(X509Certificate cert, String key) {
    try {
      // Add the security provider in case verifySignature was never called.
      getKeyPairObject();
      RSAPrivateKey privKey = (RSAPrivateKey) getPrivateKey(key);
      RSAPublicKey publicKey = (RSAPublicKey) cert.getPublicKey();
      return privKey.getModulus().toString().equals(publicKey.getModulus().toString());
    } catch (Exception e) {
      LOG.error("Cert or key is invalid." + e.getMessage());
    }
    return false;
  }

  // Verify that each certificate in the root chain has been signed by
  // another cert present in the uploaded file.
  private static void verifyCertValidity(List<X509Certificate> certs) {
    certs
        .stream()
        .forEach(
            cert -> {
              if (!certs
                  .stream()
                  .anyMatch(potentialRootCert -> verifyCertValidity(cert, potentialRootCert))) {
                X500Name x500Name = new X500Name(cert.getSubjectX500Principal().getName());
                RDN cn = x500Name.getRDNs(BCStyle.CN)[0];
                throw new PlatformServiceException(
                    BAD_REQUEST,
                    "Certificate with CN = "
                        + cn.getFirst().getValue()
                        + " has no associated root");
              }
              verifyCertDateValidity(cert);
            });
  }

  // Verify that certificate is currently valid and valid for 1 day
  private static void verifyCertDateValidity(X509Certificate cert) {
    Calendar cal = Calendar.getInstance();
    cal.add(Calendar.DATE, 1);
    Date oneDayAfterToday = cal.getTime();
    try {
      cert.checkValidity();
      cert.checkValidity(oneDayAfterToday);
    } catch (Exception e) {
      X500Name x500Name = new X500Name(cert.getSubjectX500Principal().getName());
      RDN cn = x500Name.getRDNs(BCStyle.CN)[0];
      throw new PlatformServiceException(
          BAD_REQUEST,
          "Certificate with CN = " + cn.getFirst().getValue() + " has invalid start/end dates.");
    }
  }

  private static boolean verifyCertValidity(
      X509Certificate cert, X509Certificate potentialRootCert) {
    try {
      cert.verify(potentialRootCert.getPublicKey());
      return true;
    } catch (Exception exp) {
      // Exception means the verify failed.
      return false;
    }
  }

  private static boolean verifyCertSignatureAndOrder(
      List<X509Certificate> x509Certificates, String keyContent) {
    if (!verifySignature(x509Certificates.get(0), keyContent)) {
      // If the first certificate is not the right one, maybe the user has entered the
      // certificates in the wrong order. Check and update the customer with the right
      // message.
      x509Certificates
          .stream()
          .forEach(
              x509Certificate -> {
                if (verifySignature(x509Certificate, keyContent)) {
                  X500Name x500Name =
                      new X500Name(x509Certificate.getSubjectX500Principal().getName());
                  RDN cn = x500Name.getRDNs(BCStyle.CN)[0];
                  throw new PlatformServiceException(
                      BAD_REQUEST,
                      "Certificate with CN = "
                          + cn.getFirst().getValue()
                          + "should be the first entry in the file.");
                }
              });
      throw new PlatformServiceException(BAD_REQUEST, "Certificate and key don't match.");
    }
    return true;
  }
}
