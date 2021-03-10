import React, { useEffect, useState } from 'react';
import { Form, Table, Transfer } from 'antd';
import type { TransferProps } from 'antd/lib/transfer';
import difference from 'lodash/difference';
import type { ColumnsType } from 'antd/lib/table/interface';
import type { BaseFieldType, IRequest } from '../../interface';
import useRequest from '../../hooks/useRequest';
import getRem from '../../rem';

export interface ExTransferProps<T = any> extends TransferProps<T>, IRequest, BaseFieldType {
  onChange: (nextTargetKeys: string[]) => void;
  formProps?: any;
  mode?: 'tree';
  fieldNames?: { label?: string; value?: string; children?: string };
  columns?: ColumnsType;
}

export default function ExTransfer(props: ExTransferProps) {
  const { style, mode, read, readValue, formItemProps, fieldNames, columns } = props;

  const { dataSource } = useRequest(props.request);

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [targetKeys, setTargetKeys] = useState<string[]>([]);

  const defaultValue = getRem().constants.DEFAULT_VALUE;

  const [formatReadValue, setFormatReadValue] = useState<string | undefined>(defaultValue);

  useEffect(() => {
    setTargetKeys(props.targetKeys || []);
  }, [props.targetKeys]);

  const transferDataSource: any[] = [];

  function flatten(list: any[]) {
    list?.forEach((item) => {
      transferDataSource.push(item);
      flatten(item.children);
    });
  }

  flatten(dataSource);

  const params = {
    titles: ['未选择', '已选择'],
    showSearch: true,
    dataSource: transferDataSource,
    listStyle: { height: 540, width: 300 },
    render: (item: any) => item.label,
    rowKey: (item: any) => item.value,
    targetKeys,
    style,
    onChange: (nextTargetKeys: string[]) => {
      setTargetKeys(nextTargetKeys);
      if (props.onChange) props.onChange(nextTargetKeys);
    },
    selectedKeys,
    onSelectChange: (sourceSelectedKeys: string[], targetSelectedKeys: string[]) =>
      setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]),
  };

  const content =
    mode === 'tree' ? (
      <Transfer {...params}>
        {({
          direction,
          filteredItems,
          onItemSelect,
          onItemSelectAll,
          selectedKeys: listSelectedKeys,
        }) => {
          const tableProps: any = {};
          const rowSelection = {
            getCheckboxProps: (item: any) => {
              return { disabled: item.disabled };
            },
            onSelectAll(selected: any, selectedRows: any) {
              const treeSelectedKeys = selectedRows
                .filter((item: any) => !item.disabled)
                .map((item: { key: string }) => item.key);
              const diffKeys = selected
                ? difference(treeSelectedKeys, listSelectedKeys)
                : difference(listSelectedKeys, treeSelectedKeys);
              onItemSelectAll(diffKeys, selected);
            },
            onSelect(item: { key: string }, selected: boolean) {
              onItemSelect(item.key, selected);
            },
            selectedRowKeys: listSelectedKeys,
          };

          if (direction === 'left') {
            tableProps.dataSource = filteredItems;
            tableProps.expandable = {
              defaultExpandAllRows: true,
            };
          } else if (direction === 'right') {
            tableProps.dataSource = filteredItems.map((item: any) => {
              const { children, ...other } = item;
              return other;
            });
          }

          return (
            <Table
              {...tableProps}
              bordered={false}
              showHeader={false}
              rowSelection={rowSelection}
              columns={columns || [{ dataIndex: 'label' }]}
              size="small"
              rowKey={'value'}
              onRow={({ key, disabled: itemDisabled }) => ({
                onClick: () => {
                  if (itemDisabled) return;
                  onItemSelect(key, !listSelectedKeys.includes(key));
                },
              })}
            />
          );
        }}
      </Transfer>
    ) : (
      <Transfer {...params} />
    );

  useEffect(() => {
    if (readValue && readValue.length > 0) {
      const arr: string[] = [];
      readValue?.forEach((key: string) => {
        transferDataSource.forEach((item: any) => {
          const label = item[fieldNames?.label || 'label'];
          const value = item[fieldNames?.value || 'value'];
          if (value === key) arr.push(label);
        });
      });
      setFormatReadValue(arr.join(', '));
    }
  }, [readValue]);

  if (read) {
    return readValue ? <span>{formatReadValue}</span> : <span>{defaultValue}</span>;
  }

  return formItemProps ? <Form.Item {...formItemProps}>{content}</Form.Item> : content;
}
