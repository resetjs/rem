import React from 'react';
import type { CascaderProps } from 'antd/lib/cascader';
import { Cascader, Form } from 'antd';
import useRequest from '../../hooks/useRequest';
import type { BaseFieldType, IRequest } from '../../interface';
import getRemfrom '../../rem';

export interface ExCascaderProps extends CascaderProps, IRequest, BaseFieldType {}

export default function ExCascader(props: ExCascaderProps) {
  const { formItemProps, options, read, readValue, ...other } = props;

  const { dataSource } = useRequest(props.request);

  const params = other;

  if (props.request) {
    // @ts-ignore
    params.options = dataSource;
  } else if (options) {
    // @ts-ignore
    params.options = options;
  }

  function formatReadValue() {
    //  这里涉及要多层级遍历, 暂时不做遍历
    return readValue;
  }

  const content = <Cascader {...params} />;

  if (read) {
    return readValue ? formatReadValue() : <span>{getRem().constants.DEFAULT_VALUE}</span>;
  }

  return formItemProps ? <Form.Item {...formItemProps}>{content}</Form.Item> : content;
}
