import { ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import React from 'react';
import { Input } from 'antd';
import type { BaseFieldType } from '../../interface';
import {constants} from '../../rem';

interface ExInputTextProps extends BaseFieldType {
  type?: 'Text' | 'TextArea';
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export default function ExInputText(props: ExInputTextProps) {
  const { readonly, readonlyValue, formItemProps, valueEnum, type, prefix, suffix, ...other } = props;

  let content;
  if (type === 'TextArea') {
    content = formItemProps ? (
      <ProFormTextArea {...formItemProps} fieldProps={other} />
    ) : (
      <Input.TextArea {...other} />
    );
  } else {
    content = formItemProps ? (
      <ProFormText {...formItemProps} fieldProps={{ prefix, suffix, ...other }} />
    ) : (
      <Input prefix={prefix} suffix={suffix} {...other} />
    );
  }

  return readonly ? (
    <>
      {readonlyValue ? (
        <div
          style={{
            width: '95%',
            overflow: 'auto',
            wordWrap: 'break-word',
            overflowWrap: 'anywhere'
          }}
        >
          {typeof suffix === 'string' && prefix}
          {readonlyValue}
          {typeof suffix === 'string' && suffix}
        </div>
      ) : (
        constants.DEFAULT_VALUE
      )}
    </>
  ) : (
    content
  );
}
