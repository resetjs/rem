import type { RequestOptions } from './interface';
import React from 'react';
import type { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import { Result } from 'antd';
import umiRequest from 'umi-request';
import type { AuthorityRule } from './interface';

type PermissionType = {
  checkAuthority: (authority: string | string[] | AuthorityRule | undefined) => boolean;
  errorPage: React.ReactNode;
};

type ConstantsType = {
  DEFAULT_VALUE: string | '-';
};

export interface RemConfig {
  permission?: PermissionType;

  request?: <T>(options: RequestOptions) => Promise<T>;

  uploadFile?: (options: RcCustomRequestOptions) => void;

  constants?: ConstantsType;
}

class Rem {
  constants: ConstantsType = {
    DEFAULT_VALUE: '-',
  };

  permission: PermissionType = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    checkAuthority: (authority?: string | string[] | AuthorityRule | undefined) => {
      return true;
    },
    errorPage: (
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
      />
    ),
  };

  request<T>(options: RequestOptions): Promise<T> {
    const { url, ...other } = options;
    return umiRequest(url, other);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  uploadFile(options: RcCustomRequestOptions): void {}

  applyPlugins(config: RemConfig) {
    const { constants, permission, request, uploadFile } = config;
    if (constants) this.constants = constants;
    if (permission) this.permission = permission;
    if (request) this.request = request;
    if (uploadFile) this.uploadFile = uploadFile;
  }
}

const rem = new Rem();
export default rem;
