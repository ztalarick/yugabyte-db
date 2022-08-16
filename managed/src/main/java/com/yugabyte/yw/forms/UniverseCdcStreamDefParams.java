package com.yugabyte.yw.forms;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import play.data.validation.Constraints;

@ApiModel(description = "Parameters for creating a CDC stream")
public class UniverseCdcStreamDefParams extends AbstractTaskParams {
  // The databaseName for the CDC stream
  @Constraints.Required()
  @ApiModelProperty(value = "The name of the database for the CDC stream")
  public String databaseName;
}
