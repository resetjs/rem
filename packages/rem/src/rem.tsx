import type {AuthorityRule, RequestOptions} from './interface';
import React from 'react';
import type {UploadRequestOption as RcCustomRequestOptions} from 'rc-upload/lib/interface';
import {Result} from 'antd';
import request from 'umi-request';

const umiRequest = request;

type PermissionType = {
    checkAuthority: (authority: string | string[] | AuthorityRule | undefined) => boolean;
    errorPage: React.ReactNode;
};

type ConstantsType = {
    DEFAULT_VALUE: string | '-';
};

export interface RemConfig {
    permission: PermissionType;

    request: <T>(options: RequestOptions) => Promise<T>;

    uploadFile: (options: RcCustomRequestOptions) => void;

    constants: ConstantsType;
}

const defaultConfig: RemConfig = {

    constants: {
        DEFAULT_VALUE: '-',
    },

    permission: {
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
    },

    request: (options: RequestOptions) => {
        const {url, ...other} = options;
        return umiRequest(url, other);
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    uploadFile(options: RcCustomRequestOptions) {
    }
}


class Rem {

    static instance = new Rem(defaultConfig)

    constants!: ConstantsType
    request!: (<T>(options: RequestOptions) => Promise<T>)
    permission!: PermissionType;
    uploadFile!: ((options: RcCustomRequestOptions<any>) => void)

    protected constructor(config: RemConfig) {
        this.setPlugins(config)
    }

    static applyPlugins(config: RemConfig) {
        this.instance.setPlugins(config)
    }

    setPlugins(config: RemConfig) {
        const {constants, permission, request: configRequest, uploadFile} = config;
        if (constants) this.constants = constants;
        if (permission) this.permission = permission;
        if (configRequest) this.request = configRequest;
        if (uploadFile) this.uploadFile = uploadFile;
    }
}

export {Rem}

export default () => Rem.instance

