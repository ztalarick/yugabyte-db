package com.yugabyte.yw.common.cdc.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

@ApiModel(description = "Response for creating a CDC stream")
public final class CdcStreamCreateResponse {
  @ApiModelProperty(value = "The ID of the created CDC stream")
  private final String streamId;

  public CdcStreamCreateResponse(String streamId) {
    this.streamId = streamId;
  }

  public String getStreamId() {
    return streamId;
  }
}
