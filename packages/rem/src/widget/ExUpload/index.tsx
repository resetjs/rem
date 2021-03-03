import React from 'react';
import { Form, Image, Space } from 'antd';
import type { UploadProps } from 'antd/lib/upload';
import UploadButton from '../ExUpload/UploadButton';
import rem from '../../rem';
import type { BaseFieldType } from '../../interface';

import './index.less';

export function formatUploadValue(values: string | string[]) {
  if (Array.isArray(values)) {
    return values.map((url, position) =>
      typeof url === 'string'
        ? { uid: position, name: url.substring(url.lastIndexOf('/') + 1), status: 'done', url }
        : url,
    );
  }
  return [
    { uid: '-1', name: values.substring(values.lastIndexOf('/') + 1), status: 'done', url: values },
  ];
}

export function parseUploadValue(values: any | string[]) {
  if (values && Array.isArray(values)) {
    return values
      .filter((item) => item.status && item.status === 'done')
      .map((item) => item.url || item.response)
      .join(',');
  }
  return values?.status === 'done' ? values.url || values.response : values;
}

export declare type UploadMode = 'file' | 'image' | 'video' | 'voice';

export interface ExUploadProps extends BaseFieldType {
  mode?: UploadMode; // 图片/文件
  max?: number; // 总数
  maxSize?: number; // 能上传的最大值 / 单位 M
  //  onChangeFileList?: Function; // 监听fileList改变, 还是 onChange
  formItemProps?: any;
  extraText?: string;
  extraHint?: string;
  hideFileList?: boolean | undefined; // 是否显示文件列表
}

export interface ExTransferProps extends UploadProps, ExUploadProps {
  children?: JSX.Element;
}

function normFile(e: any) {
  return Array.isArray(e) ? e : e && e.fileList;
}

export default function ExUpload(props: ExTransferProps) {
  const { formItemProps, type, read, readValue, style, className, ...other } = props;

  const formItemContent = (
    <Form.Item
      {...formItemProps}
      getValueFromEvent={normFile}
      valuePropName="fileList"
      label={type === 'drag' ? null : formItemProps?.label}
    >
      <UploadButton type={type} {...other} />
    </Form.Item>
  );

  if (read) {
    return readValue ? (
      <Space>
        {readValue?.split(',').map((url: string) => (
          <Image key={url} className={className} style={style} src={url} />
        ))}
      </Space>
    ) : (
      <span>{rem.constants.DEFAULT_VALUE}</span>
    );
  }

  const formItemRender =
    type === 'drag' ? (
      <Form.Item key={formItemProps.label} label={formItemProps.label}>
        {formItemContent}
      </Form.Item>
    ) : (
      formItemContent
    );

  return formItemProps ? (
    formItemRender
  ) : (
    <UploadButton type={type} className={className} style={style} {...other} />
  );
}
