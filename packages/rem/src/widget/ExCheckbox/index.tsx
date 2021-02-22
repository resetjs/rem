import React from 'react';
import { Checkbox, Form } from 'antd';
import { CheckboxGroupProps } from 'antd/lib/checkbox';
import useRequest from '../../hooks/useRequest';
import { transformTarget } from '../../utils/transforms';
import rem from '../../rem';
import {BaseFieldType, IRequest } from '../../interface';

export interface ExCheckboxProps extends IRequest, BaseFieldType, CheckboxGroupProps {
  fieldNames?: { label?: string, value?: string, children?: string }
  showCheckAll?: boolean
}

export default function ExCheckbox(props: ExCheckboxProps) {

  const { showCheckAll, read, readValue, formItemProps, fieldNames, options, valueEnum, ...other } = props;

  const { dataSource } = useRequest(props.request);

  const list = transformTarget({ dataSource, options, valueEnum }, fieldNames);

  return read
    ? readValue && readValue.length > 0
      ? readValue.map((item: string) => {
        const find = list.find(find => item.toString() === find.value.toString());
        if (find) {
          return find.label;
        }
      }).join(',')
      : <span>{rem.constants.DEFAULT_VALUE}</span>
    : formItemProps ?
      <Form.Item {...formItemProps}>
        <Checkbox.Group options={list} {...other} />
      </Form.Item>
      : <Checkbox.Group options={list} {...other} />;

}
