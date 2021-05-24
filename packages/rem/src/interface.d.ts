import type React from 'react';
import type { FormItemProps } from 'antd/lib/form';
import {NamePath} from "rc-field-form/es/interface";
import {ProCoreActionType} from "@ant-design/pro-utils/lib/typing";
import {FloatActionType} from "./layouts/FloatLayout";
import {ProColumns} from "@ant-design/pro-table";
import {SearchTransformKeyFn} from "@ant-design/pro-utils";

type RequestOptions = {
  url: string;
  method: string;
  data?: any;
  params?: any;
  callback?: (res: any) => ProFieldRequestListData[] | any;
  trigger?: any;
}

interface IRequest {
  request?: RequestOptions;
}

interface ProFieldRequestListData {
  label: React.ReactNode;
  value: React.ReactText | Boolean;
  children?: ProFieldRequestListData[];

  [key: string]: any;
}

type IValueEnum = Record<
  string,
  | React.ReactNode
  | {
      text: React.ReactNode;
      status: 'Success' | 'Error' | 'Processing' | 'Warning' | 'Default';
    }
>;

interface AuthorityRule {
  targets: string | string[] | undefined;
  rule?: {
    match?: 'one' | 'all';
    [name: string]: any;
  };
}

interface IAuthority {
  authority?: string | string[] | AuthorityRule | undefined;
}

interface BaseFieldType {
  read?: boolean;
  readValue?: any;
  formItemProps?: FormItemProps;
  valueEnum?: IValueEnum;
}

interface Field<T = any> extends IRequest, IAuthority {
  //  组件唯一表示
  key: string;

  //  组件类型
  componentName?:
      | 'Input'
      | 'TextArea'
      | 'DatePicker'
      | 'Transfer'
      | 'TimePicker'
      | 'DateTimePicker'
      | 'DateRangePicker'
      | 'DateTimeRangePicker'
      | 'Checkbox'
      | 'Radio'
      | 'Switch'
      | 'Rate'
      | 'Slider'
      | 'Select'
      | 'InputPassword'
      | 'TreeSelect'
      | 'InputNumber'
      | 'Cascader'
      | 'Upload'
      | 'Popconfirm'
      | 'Button'
      | 'Link';

  //  组件扩展字段
  componentProps?: any;

  //  是否显示成员
  show?: true | boolean;

  // 依赖字段，所依赖字段改变置空当前值
  dependencies?: NamePath[];

  //  组件数据集, valueEnum类型(仅适用于选择组件)
  valueEnum?: IValueEnum;

  //  组件数据集, 数组类型(仅适用于选择组件)
  options?: ProFieldRequestListData[];

  //  初始化组件值, 仅当输入内容, 选项内容有效
  value?: string | number;

  //  组件内容
  content?: React.ReactNode;

  // 自定义组件
  render?: (
      dom: React.ReactNode,
      entity?: T | undefined,
      action?: ProCoreActionType,
      floatAction?: FloatActionType,
  ) => React.ReactNode;
}

interface TableField<T = any, K = any> extends Field<T> {
  //  组件展示内容, 表单形式为名称, 表格形式为标题
  label?: string | React.ReactNode;

  componentProps?: (
      entity: T,
      onHandle: (params: RequestOptions) => Promise<K>,
      action?: ProCoreActionType,
      floatAction?: FloatActionType,
  ) => any;

  //  操作项对应浮动层组件属性
  bindingProps?: any;

  //  操作项对应浮动层组件
  binding?: any;

  // ProColumns props
  columnsProps?: ProColumns<T>;

  //  常用columnsProps下的字段, 抽取出来
  search?: false | { transform: SearchTransformKeyFn };
}

interface FormField extends Field {
  //  组件展示内容, 表单形式为名称, 表格形式为标题
  label?: string | React.ReactNode;

  //  是否为必填字段
  required?: boolean;

  //  组件分组, 默认包裹 <ProForm.Group /> 组件
  //  children?: FormField[]

  // 对应 <Form.Item /> 扩展字段
  formItemProps?: FormItemProps;

  // 表单组件是否为只读类型
  read?: boolean;

  //  扩展组件, 默认在右边
  extra?: React.ReactNode;

  // 自定义组件
  render?: (dom: React.ReactNode, opts?: CreateOptions) => React.ReactNode;

  // 转换参数, 如不需要转换, 则传递 false
  transform?: (data: any) => any | false;
}

export type {
  Field,
  TableField,
  FormField,
  BaseFieldType,
  AuthorityRule,
  IAuthority,
  RequestOptions,
  IRequest,
  ProFieldRequestListData,
  IValueEnum,
  RequestResponse,
};
