import { ProFormDigit } from '@ant-design/pro-form';
import React from 'react';
import { InputNumber } from 'antd';
import type { InputNumberProps } from 'antd/lib/input-number';
import getRem from '../../rem';
import type { BaseFieldType } from '../../interface';

interface ExInputNumberProps extends BaseFieldType, InputNumberProps {}

export default function ExInputNumber(props: ExInputNumberProps) {
  const { read, readValue, formItemProps, ...other } = props;

  const content = formItemProps ? (
    <ProFormDigit {...formItemProps} fieldProps={other} />
  ) : (
    <InputNumber {...other} />
  );

  return read ? (
    <>{readValue ? other.formatter?.(readValue) || readValue : getRem().constants.DEFAULT_VALUE}</>
  ) : (
    content
  );
}
