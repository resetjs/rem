import React from 'react';
import type { CascaderProps } from 'antd/lib/cascader';
import { Cascader, Form } from 'antd';
import useRequest from '../../hooks/useRequest';
import type { BaseFieldType, IRequest } from '../../interface';
import rem from '../../rem';

export interface ExCascaderProps extends CascaderProps, IRequest, BaseFieldType {}

export default function ExCascader(props: ExCascaderProps) {
  const { formItemProps, options, readonly, readonlyValue, ...other } = props;

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
    return readonlyValue;
  }

  const content = <Cascader {...params} />;

  if (readonly) {
    return readonlyValue ? formatReadValue() : <span>{rem().constants.DEFAULT_VALUE}</span>;
  }

  return formItemProps ? <Form.Item {...formItemProps}>{content}</Form.Item> : content;
}
