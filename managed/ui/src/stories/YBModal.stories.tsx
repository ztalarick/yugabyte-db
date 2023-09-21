// storybook stories don't need i18n, so turning off corresponding eslint rule
/* eslint-disable react/jsx-no-literals */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@material-ui/core';
import { YBCheckbox } from '../redesign/components';
import { YBButton } from '../redesign/components';
import {
  YBModal,
  YBSidePanel,
  YBModalProps,
  YBSidePanelProps
} from '../redesign/components/YBModal/YBModal';

export default {
  title: 'Components/YBModal',
  component: YBModal,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: { type: 'text' }
    }
  }
} as Meta;
type Story = StoryObj<YBModalProps>;
type PanelStory = StoryObj<YBSidePanelProps>;

export const Basic: Story = (args: YBModalProps) => (
  <YBModal {...args}>
    <Box>
      <p>
        YBModal component requires a <code>size</code>
        prop to determine the correct height and width. The height and width are fixed and will
        scroll on overflow.
      </p>
      <p>
        YBModalProps extends Material UI&apos;s DialogProps, so most of the props will be exactly
        the same.
      </p>
    </Box>
  </YBModal>
);

Basic.args = {
  title: 'Simple Modal Title',
  size: 'sm',
  open: true
};

export const Confirmation: Story = (args: YBModalProps) => (
  <YBModal {...args} title={args.title}>
    <Box>
      <p>This modal has a submit and cancel button.</p>
    </Box>
  </YBModal>
);

Confirmation.args = {
  title: 'Confirmation Modal',
  size: 'xs',
  titleSeparator: true,
  submitLabel: 'Submit',
  cancelLabel: 'Cancel',
  actionsInfo: <YBCheckbox label={'More action information'} />,
  open: true
};

export const SidePanel: PanelStory = (args: YBSidePanelProps) => (
  <YBSidePanel {...args}>
    <Box>
      <p>This modal opens from the right side and scrolls on overflow.</p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
        cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
        cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
        cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
        cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
        cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
        cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
        cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
        cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
        cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
        cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
        cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
        cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
    </Box>
  </YBSidePanel>
);

SidePanel.args = {
  title: 'Side Panel Modal',
  submitLabel: 'Save',
  cancelLabel: 'Cancel',
  open: true
};

export const SidePanelWithModal: PanelStory = (args: YBSidePanelProps) => {
  const [sideOpen, setOpen] = useState(args.open);
  const [openSecond, setSecond] = useState(false);

  return (
    <Box>
      <YBButton variant="primary" onClick={() => setOpen(true)}>
        Open Side Panel
      </YBButton>
      <YBSidePanel {...args} onClose={() => setOpen(false)} open={sideOpen}>
        <h4>This is a side panel</h4>
        <p>As an example, we can even open a modal on top of the side panel.</p>
        <YBButton variant="primary" onClick={() => setSecond(true)}>
          Open Additional Modal
        </YBButton>
        <YBModal
          title="This is a Modal"
          size="lg"
          open={openSecond}
          onClose={() => setSecond(false)}
        >
          <Box>Modal opens on top of existing Side Panel</Box>
        </YBModal>
      </YBSidePanel>
    </Box>
  );
};

SidePanelWithModal.args = {
  title: 'Side Panel Modal',
  submitLabel: 'Save',
  cancelLabel: 'Cancel',
  open: true
};
