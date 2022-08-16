package com.yugabyte.yw.common.cdc.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import java.util.List;

@ApiModel(description = "Response for deleting a CDC stream")
public final class CdcStreamDeleteResponse {
  private final List<String> notFoundStreamIds;

  public CdcStreamDeleteResponse(List<String> notFoundStreamIds) {
    this.notFoundStreamIds = notFoundStreamIds;
  }

  @ApiModelProperty(value = "List of stream IDs that were not found")
  public List<String> getNotFoundStreamIds() {
    return notFoundStreamIds;
  }
}
