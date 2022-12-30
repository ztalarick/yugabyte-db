package com.yugabyte.yw.forms;

import static play.mvc.Http.Status.BAD_REQUEST;

import com.yugabyte.yw.common.PlatformServiceException;
import net.logstash.logback.encoder.org.apache.commons.lang3.StringUtils;
import play.data.validation.Constraints;

public class DatabaseUserDropFormData {

  @Constraints.Required() public String username;
  @Constraints.Required() public String dbName;

  public void validation() {
    if (StringUtils.isEmpty(username)) {
      throw new PlatformServiceException(BAD_REQUEST, "Need to provide username.");
    }

    if (StringUtils.isEmpty(dbName)) {
      throw new PlatformServiceException(BAD_REQUEST, "Need to provide dbName.");
    }
  }
}
