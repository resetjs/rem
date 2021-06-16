import { ProFormDigit } from '@ant-design/pro-form';
import React from 'react';
import { InputNumber } from 'antd';
import type { InputNumberProps } from 'antd/lib/input-number';
import {constants} from '../../rem';
import type { BaseFieldType } from '../../interface';

interface ExInputNumberProps extends BaseFieldType, InputNumberProps {}

export default function ExInputNumber(props: ExInputNumberProps) {
  const { readonly, readonlyValue, formItemProps, ...other } = props;

  const content = formItemProps ? (
    <ProFormDigit {...formItemProps} fieldProps={other} />
  ) : (
    <InputNumber {...other} />
  );

  return readonly ? (
    <>{readonlyValue ? other.formatter?.(readonlyValue) || readonlyValue : constants.DEFAULT_VALUE}</>
  ) : (
    content
  );
}
