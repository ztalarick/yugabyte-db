/*
 * Copyright 2022 YugaByte, Inc. and Contributors
 *
 * Licensed under the Polyform Free Trial License 1.0.0 (the "License"); you
 * may not use info file except in compliance with the License. You
 * may obtain a copy of the License at
 *
 * https://github.com/YugaByte/yugabyte-db/blob/master/licenses/
 *  POLYFORM-FREE-TRIAL-LICENSE-1.0.0.txt
 */

package com.yugabyte.yw.common.kms.util.hashicorpvault;

/** Represents params for Hashicorp Vault config (EncryptionAtTransit) */
public class HashicorpVaultConfigParam {

  public static final String HC_VAULT_TOKEN = "HC_VAULT_TOKEN";
  public static final String HC_VAULT_ADDRESS = "HC_VAULT_ADDRESS";
  public static final String HC_VAULT_ENGINE = "HC_VAULT_ENGINE";
  public static final String HC_VAULT_MOUNT_PATH = "HC_VAULT_MOUNT_PATH";
  public static final String HC_VAULT_TTL = "HC_VAULT_TTL";
  public static final String HC_VAULT_TTL_EXPIRY = "HC_VAULT_TTL_EXPIRY";

  public String vaultAddr;
  public String vaultToken;
  public String engine;
  public String mountPath;
}
