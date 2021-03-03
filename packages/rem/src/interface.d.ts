import type React from 'react';
import type { FormItemProps } from 'antd/lib/form';

interface RequestOptions {
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
  value: React.ReactText;
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

export type {
  BaseFieldType,
  AuthorityRule,
  IAuthority,
  RequestOptions,
  IRequest,
  ProFieldRequestListData,
  IValueEnum,
  RequestResponse,
};
