import React from 'react';
import { Empty, Modal } from 'antd';
import type { ModalProps } from 'antd/lib/modal';

export interface ExModalProps extends ModalProps {
  children?: React.ReactNode;
  openid?: string;
  onClose?: () => void;
  empty?: boolean;
}

export default function ExModal(props: ExModalProps) {
  const { confirmLoading, onClose, empty } = props;

  return (
    <Modal
      destroyOnClose={true}
      maskClosable={false}
      onCancel={onClose}
      confirmLoading={confirmLoading}
      {...props}
    >
      {props.children}
      {empty && <Empty />}
    </Modal>
  );
}
