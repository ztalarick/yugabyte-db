/*
 * Created on May 25 2023
 *
 * Copyright 2023 YugaByte, Inc. and Contributors
 */

// import { YBButton } from 'yugabyte-ui-components';
import App from 'yugabyte-test-integration/dist';
import { Component } from 'react';
import { Box } from '@material-ui/core';

export default class Test extends Component {
  render() {
    return (
      <Box ml={2}>
        {/* <YBButton variant={'primary'} showSpinner={false} size={'large'}>
          {'Troubleshoot Metrics'}
        </YBButton> */}
        <App></App>
      </Box>
    );
  }
}
