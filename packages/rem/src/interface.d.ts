import React from 'react';
import { FormItemProps } from 'antd/lib/form';

interface RequestOptions {
  url: string;
  method: string;
  data?: any;
  params?: any;
  callback?: (res: any) => ProFieldRequestListData[] | any
  trigger?: any
  message?: { success?: string, failure?: string }
}

interface ResponseResult {
  code: number
  message: string
  data: any
  localizedMessageParameters: { [key: string]: string; }
}

interface CommonResult {
  status?: number
}

interface IRequest {
  request?: RequestOptions
}

interface ProFieldRequestListData {
  label: React.ReactNode;
  value: React.ReactText;
  children?: ProFieldRequestListData[];

  [key: string]: any;
}

interface IValueEnum {
  [key: string]:
    | React.ReactNode
    | {
    text: React.ReactNode;
    status: 'Success' | 'Error' | 'Processing' | 'Warning' | 'Default';
  };
}

interface AuthorityRule {
  targets: string | string[] | undefined,
  rule?: {
    match?: 'one' | 'all',
    [name: string]: any,
  }
}

interface IAuthority {
  authority?: string | string[] | AuthorityRule
}

interface BaseFieldType {
  read?: boolean
  readValue?: any
  formItemProps?: FormItemProps
  valueEnum?: IValueEnum
}

export type {
  BaseFieldType,
  AuthorityRule,
  IAuthority,
  RequestOptions,
  ResponseResult,
  CommonResult,
  IRequest,
  ProFieldRequestListData,
  IValueEnum,
};
