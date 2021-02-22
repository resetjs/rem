import React from 'react';
import { Drawer } from 'antd';
import { DrawerProps } from 'antd/lib/drawer';

export interface ExDrawerProps extends DrawerProps {
  onCancel: (key: string) => void
  children?: React.ReactNode;
  openid: string
}

export default function ExDrawer(props: ExDrawerProps) {
  const { visible = false, maskClosable = true, title, width = 700, openid, onCancel, ...other } = props;

  return (
    <Drawer
      placement='right'
      maskClosable={maskClosable}
      destroyOnClose
      visible={visible}
      onClose={() => onCancel(openid)}
      width={width}
      title={title}
      {...other}
    >
      {props.children}
    </Drawer>
  );
}
