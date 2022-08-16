package com.yugabyte.yw.common.cdc.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import java.util.Map;

@ApiModel(description = "CDC stream definition")
public final class CdcStream {
  @ApiModelProperty(value = "The ID of the CDC stream")
  private final String streamId;

  @ApiModelProperty(value = "The options for the stream")
  private final Map<String, String> options;

  @ApiModelProperty(value = "The database name for the stream")
  private final String namespaceId;

  public CdcStream(String streamId, Map<String, String> options, String namespaceId) {
    this.streamId = streamId;
    this.options = options;
    this.namespaceId = namespaceId;
  }

  public String getStreamId() {
    return streamId;
  }

  public Map<String, String> getOptions() {
    return options;
  }

  public String getNamespaceId() {
    return namespaceId;
  }
}
