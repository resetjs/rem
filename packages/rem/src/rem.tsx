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

    static instance: Rem
    constants: ConstantsType
    request: (<T>(options: RequestOptions) => Promise<T>)
    permission: PermissionType;
    uploadFile: ((options: RcCustomRequestOptions<any>) => void)

    constructor(config: RemConfig) {
        this.constants = config.constants;
        this.permission = config.permission;
        this.request = config.request;
        this.uploadFile = config.uploadFile;
    }

    static applyPlugins(config: RemConfig) {
        if (!this.instance) {
            this.instance = new Rem(config);
        }
        return this.instance;
    }

}

export {Rem}

const getRem = () => {
    return Rem.instance || defaultConfig
}

export default getRem;
