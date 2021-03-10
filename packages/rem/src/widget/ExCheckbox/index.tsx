import React from 'react';
import { Checkbox, Form } from 'antd';
import type { CheckboxGroupProps } from 'antd/lib/checkbox';
import useRequest from '../../hooks/useRequest';
import { transformTarget } from '../../utils/transforms';
import getRemfrom '../../rem';
import type { BaseFieldType, IRequest } from '../../interface';

export interface ExCheckboxProps extends IRequest, BaseFieldType, CheckboxGroupProps {
  fieldNames?: { label?: string; value?: string; children?: string };
  showCheckAll?: boolean;
}

export default function ExCheckbox(props: ExCheckboxProps) {
  const {
    showCheckAll,
    read,
    readValue,
    formItemProps,
    fieldNames,
    options,
    valueEnum,
    ...other
  } = props;

  const { dataSource } = useRequest(props.request);

  const list = transformTarget({ dataSource, options, valueEnum }, fieldNames);

  if (read) {
    if (readValue && readValue.length > 0) {
      return readValue
        .map((item: string) => {
          const find = list.find((child) => item.toString() === child.value.toString());
          return find.label;
        })
        .join(',');
    }
    return <span>{getRem().constants.DEFAULT_VALUE}</span>;
  }

  return formItemProps ? (
    <Form.Item {...formItemProps}>
      <Checkbox.Group options={list} {...other} />
    </Form.Item>
  ) : (
    <Checkbox.Group options={list} {...other} />
  );
}
