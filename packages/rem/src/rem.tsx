import {ConstantsType, IPlugin, PermissionType} from "./Plugin";
import {RequestOptions} from "./interface";
import {Result} from "antd";
import React, {createContext} from "react";


//  权限相关的, 用于判断全局权限的结果

const permission = {
    checkAuthority: (authority: any) => {
        return true;
    },
    errorPage: (
        <Result
            status="403"
            title="403"
            subTitle="Sorry, you are not authorized to access this page."
        />
    ),
}

function setPermission(uPermissionType: PermissionType) {
    const {checkAuthority, errorPage} = uPermissionType
    if (checkAuthority) {
        permission.checkAuthority = checkAuthority
    }
    if (errorPage) {
        permission.errorPage = errorPage as JSX.Element
    }
}


//  全局请求
// eslint-disable-next-line import/no-mutable-exports
let request = (options: RequestOptions) => {
    const {url, ...rest} = options;
    return fetch(url, rest);
}


//  上传
const uploadFile = (...params: any) => {
    console.log(params)
}

//  常量集
const constants: ConstantsType = {
    DEFAULT_VALUE: '-',
}

function setConstants(uConstantsType: ConstantsType) {
    const {DEFAULT_VALUE} = uConstantsType
    if (DEFAULT_VALUE) constants.DEFAULT_VALUE = DEFAULT_VALUE
}

// eslint-disable-next-line import/no-mutable-exports
let PopupContext: React.Context<{
    trigger: (component: React.ReactNode, handleCallback: Function) => void;
}>;

let WrapperContext: React.Context<{
    //  监听当前所在模块的下一步操作
    setOnClickNextListener: (listener: Function) => void
    //  获取当前所在模块数据集
    getCurrent: () => any
    //  设置当前所在模块数据集
    setCurrent: (value: any) => void
    //  获取Wrapper所有模块数据集 tips:如果模块间有重复的数据属性, 以最后的模块的为准, 请保证全局的唯一性
    getAll: () => any
    //  获取Wrapper某个模块的数据集
    get: (key: string) => any
}>;


function createRem(pluginOpts?: IPlugin) {

    if (pluginOpts?.constants) {
        setConstants(pluginOpts.constants)
    }

    if (pluginOpts?.constants) {
        setConstants(pluginOpts.constants)
    }

    if (pluginOpts?.permission) {
        setPermission(pluginOpts.permission)
    }

    if (pluginOpts?.request) {
        request = pluginOpts.request
    }

    // @ts-ignore
    PopupContext = createContext({})

    // @ts-ignore
    WrapperContext = createContext({})
}

export {
    permission,
    uploadFile,
    constants,
    PopupContext,
    WrapperContext,
    request
}

export default createRem

