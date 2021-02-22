import React from 'react';
import { BaseFieldType, IRequest } from '../../interface';
import useRequest from '../../hooks/useRequest';
import { Form, Select } from 'antd';
import { SelectProps } from 'antd/lib/select';
import { transformTarget } from '../../utils/transforms';
import rem from '../../rem';


interface ExSelectProps extends IRequest, SelectProps<any>, BaseFieldType {
  suffix?: string,
  fieldNames?: { value?: string, label?: string }
}

export default function ExSelect(props: ExSelectProps) {

  const { suffix, fieldNames, formItemProps, request, options, valueEnum, read, readValue, ...other } = props;

  const { dataSource } = useRequest(props.request);

  const params: any = other;

  params.options = transformTarget({ dataSource, options, valueEnum }, fieldNames);

  const content = <Select {...params} />;

  const defaultValue = rem.constants.DEFAULT_VALUE;

  function formatReadValue() {
    const value = readValue?.toString().split(',').map((value: string, i: number) => {
      const find = params.options?.find((item: any) => item.value.toString() === value?.toString());
      return `${i > 0 ? '，' : ''}${find?.label || ''}`;
    });

    return value && value[0] && value[0].length > 0 ? value : readValue || defaultValue;
  }

  return read
    ? readValue
      ? formatReadValue()
      : <span>{defaultValue}</span>
    : formItemProps
      ? <Form.Item {...formItemProps}>{content}</Form.Item>
      : content;
}
