import React from 'react';
import type { BaseFieldType, IRequest } from '../../interface';
import useRequest from '../../hooks/useRequest';
import { Form, Select } from 'antd';
import type { SelectProps } from 'antd/lib/select';
import { transformTarget } from '../../utils/transforms';
import {constants} from '../../rem';

interface ExSelectProps extends IRequest, SelectProps<any>, BaseFieldType {
  suffix?: string;
  fieldNames?: { value?: string; label?: string };
}

export default function ExSelect(props: ExSelectProps) {
  const {
    suffix,
    fieldNames,
    formItemProps,
    request,
    options,
    valueEnum,
    readonly,
    readonlyValue,
    ...other
  } = props;

  const { dataSource } = useRequest(props.request);

  const params: any = other;

  params.options = transformTarget({ dataSource, options, valueEnum }, fieldNames);

  const content = <Select {...params} />;

  const defaultValue = constants.DEFAULT_VALUE;

  function formatReadValue() {
    const value = readonlyValue
      ?.toString()
      .split(',')
      .map((item: string, i: number) => {
        const find = params.options?.find(
          (child: any) => child.value.toString() === item.toString(),
        );
        return `${i > 0 ? '，' : ''}${find?.label || ''}`;
      });

    return value && value[0] && value[0].length > 0 ? value : readonlyValue || defaultValue;
  }

  if (readonly) {
    return readonlyValue ? formatReadValue() : <span>{defaultValue}</span>;
  }

  return formItemProps ? <Form.Item {...formItemProps}>{content}</Form.Item> : content;
}
