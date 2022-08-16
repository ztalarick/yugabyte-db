package com.yugabyte.yw.forms;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import java.util.UUID;
import play.data.validation.Constraints;

@ApiModel(description = "Parameters for creating an AddOn VM")
public class UniverseAddOnTaskParams extends AbstractTaskParams {
  // The universe against which this operation is being executed.
  @ApiModelProperty(value = "Associated universe UUID")
  public UUID universeUUID;

  // The purpose for the addon service.
  @Constraints.Required()
  @ApiModelProperty(value = "The purpose of the addon service")
  public String purpose;

  // Cloud Instance Type that the user wants
  @Constraints.Required()
  @ApiModelProperty(value = "The instance type for the add on service")
  public String instanceType;
}
