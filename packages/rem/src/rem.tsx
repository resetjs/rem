import type { AuthorityRule, RequestOptions, ResponseResult } from './interface';
import React from 'react';
import type { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import { Result } from 'antd';
import umiRequest from 'umi-request';

export interface RemConfig {

  permission?: {
    checkAuthority: (authority: string | string[] | AuthorityRule | undefined) => boolean
    errorPage?: React.ReactNode;
  }

  request?: (options: RequestOptions) => Promise<ResponseResult>

  uploadFile?: (options: RcCustomRequestOptions) => void

  constants?: {
    DEFAULT_VALUE?: string
  }
}

class Rem {

  constants: any = {
    DEFAULT_VALUE: '-',
  };

  permission: any = {
    checkAuthority: () => {
      return true;
    },
    errorPage: <Result status='403' title='403' subTitle='Sorry, you are not authorized to access this page.' />,
  };

  request: any = (options: RequestOptions): Promise<ResponseResult> => {
    const { url, ...other } = options;
    return umiRequest(url, other);
  };

  uploadFile: any = (options: RcCustomRequestOptions) => {
  };

  applyPlugins(config?: RemConfig) {
    if (config) {
      const { constants, permission, request, uploadFile } = config;
      this.constants = constants;
      this.permission = permission;
      this.request = request;
      this.uploadFile = uploadFile;
    }
  }

}

const rem = new Rem();
export default rem;
