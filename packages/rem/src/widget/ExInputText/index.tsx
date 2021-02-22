import { ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import React from 'react';
import { Input } from 'antd';
import { BaseFieldType } from '../../interface';
import rem from '../../rem';


interface ExInputTextProps extends BaseFieldType {
  type?: 'Text' | 'TextArea'
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

export default function ExInputText(props: ExInputTextProps) {

  const { read, readValue, formItemProps, valueEnum, type, prefix, suffix, ...other } = props;

  const content = (type === 'TextArea')
    ? formItemProps
      ? <ProFormTextArea {...formItemProps} fieldProps={other} />
      : <Input.TextArea {...other} />
    : formItemProps
      ? <ProFormText {...formItemProps} fieldProps={{ prefix, suffix, ...other }} />
      : <Input prefix={prefix} suffix={suffix} {...other} />;

  return read ? <>{readValue ?
    <div>{typeof suffix === 'string' && prefix}{readValue}{typeof suffix === 'string' && suffix}</div> : rem.constants.DEFAULT_VALUE}</> : content;
}
