import React from 'react';
import { Form, TreeSelect } from 'antd';
import type { TreeSelectProps } from 'antd/lib/tree-select';
import type { BaseFieldType, IRequest } from '../../interface';
import useRequest from '../../hooks/useRequest';
import { transformDatas } from '../../utils/transforms';
import getRem from '../../rem';

export interface ExTreeSelectProps<T = any> extends TreeSelectProps<any>, IRequest, BaseFieldType {
  options: [];
  mode?: 'multiple';
  formProps?: any;
  rowKey?: string;
  fieldNames?: { label?: string; value?: string; children?: string };
  renderField?: (field: T) => React.ReactNode;
}

export default function ExTreeSelect(props: ExTreeSelectProps) {
  const {
    options,
    valueEnum,
    read,
    readValue,
    request,
    mode,
    formItemProps,
    rowKey,
    treeData,
    renderField,
    fieldNames,
    ...other
  } = props;

  const { dataSource } = useRequest(props?.request);

  const params = {
    dropdownStyle: { maxHeight: 400, overflow: 'auto' },
    showSearch: true,
    showCheckedStrategy: TreeSelect.SHOW_PARENT,
    treeNodeFilterProp: 'title',
    allowClear: true,
    treeDefaultExpandAll: true,
    multiple: mode === 'multiple',
    placeholder: '请选择',
  };

  const childrenKey = fieldNames?.children || 'children';
  const valueKey = fieldNames?.value || 'value';
  const labelKey = fieldNames?.label || 'label';

  const getElement = (data: any[], id: string): any => {
    let element;
    for (let i = 0; i < data.length; i += 1) {
      const item = data[i];
      if (item[valueKey] === id) {
        element = item;
        break;
      }
      if (item[childrenKey]?.length) {
        const temp = getElement(item[childrenKey], id);
        if (temp) {
          element = temp;
          break;
        }
      }
    }
    return element;
  };

  const list = fieldNames ? transformDatas(dataSource || options || treeData, fieldNames) : [];

  const content = <TreeSelect {...params} {...other} treeData={list} />;

  if (read) {
    return readValue ? (
      readValue
        .toString()
        .split(',')
        .map((value: string, i: number) => {
          const element = getElement(list, value);
          return (
            (
              <span>
                {i > 0 && '，'}
                {element?.[labelKey]}
              </span>
            ) || ''
          );
        })
    ) : (
      <span>{getRem().constants.DEFAULT_VALUE}</span>
    );
  }

  return formItemProps ? <Form.Item {...formItemProps}>{content}</Form.Item> : content;
}
