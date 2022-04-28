package com.yugabyte.yw.models.helpers;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import org.apache.commons.io.IOUtils;

import play.Environment;

public class FileUtils {

  public static String readResource(String filePath, Environment environment) {
    if (filePath == null || filePath.isEmpty()) {
      throw new IllegalArgumentException("File path can't be null or empty");
    }
    String fileContent;
    try (InputStream inputStream = environment.resourceAsStream(filePath)) {
      fileContent = IOUtils.toString(inputStream, StandardCharsets.UTF_8);
    } catch (IOException e) {
      throw new RuntimeException("Unable to read file " + filePath, e);
    }

    return fileContent;
  }
}
