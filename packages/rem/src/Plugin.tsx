import React from 'react';
import {AuthorityRule, RequestOptions} from './interface';
import type {UploadRequestOption as RcCustomRequestOptions} from 'rc-upload/lib/interface';


export type PermissionType = {
    checkAuthority?: (authority: string | string[] | AuthorityRule | undefined) => boolean;
    errorPage?: React.ReactNode;
};

export type ConstantsType = {
    DEFAULT_VALUE?: string | '-';
};

export interface IPlugin {

    permission?: PermissionType;

    request?: <T>(options: RequestOptions) => Promise<T>;

    uploadFile?: (options: RcCustomRequestOptions) => void;

    constants?: ConstantsType;
}

