import React from 'react';
import { Form, Switch } from 'antd';
import type { BaseFieldType } from '../../interface';

type ExSwitchProps = BaseFieldType;

export default function ExSwitch(props: ExSwitchProps) {
  const { readonly, readonlyValue, formItemProps, valueEnum, ...other } = props;

  if (readonly) {
    return <span>{readonlyValue ? '是' : '否'}</span>;
  }

  return formItemProps ? (
    <Form.Item valuePropName="checked" {...formItemProps}>
      <Switch {...other} />
    </Form.Item>
  ) : (
    <Switch {...other} />
  );
}
