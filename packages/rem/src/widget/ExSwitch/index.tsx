import React from 'react';
import { Form, Switch } from 'antd';
import { BaseFieldType } from '../../interface';

interface ExSwitchProps extends BaseFieldType {

}

export default function ExSwitch(props: ExSwitchProps) {

  const { read, readValue, formItemProps, valueEnum, ...other } = props;

  return read
    ? <span>{readValue ? '是' : '否'}</span>
    : formItemProps
      ? <Form.Item valuePropName='checked' {...formItemProps}><Switch {...other} /></Form.Item>
      : <Switch {...other} />;
}
