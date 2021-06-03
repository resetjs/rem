import React from 'react';
import {Form, Image, Space} from 'antd';
import type {UploadProps} from 'antd/lib/upload';
import UploadButton from '../ExUpload/UploadButton';
import rem from '../../rem';
import type {BaseFieldType} from '../../interface';

import './index.less';

export declare type UploadMode = 'file' | 'image' | 'video' | 'voice';

export interface ExUploadProps extends UploadProps, BaseFieldType {
    mode?: UploadMode; // 图片/文件
    max?: number; // 总数
    maxSize?: number; // 能上传的最大值 / 单位 M
    //  onChangeFileList?: Function; // 监听fileList改变, 还是 onChange
    formItemProps?: any;
    extraText?: string;
    extraHint?: string;
    hideFileList?: boolean | undefined; // 是否显示文件列表
}

function normFile(e: any) {
    return Array.isArray(e) ? e : e && e.fileList;
}

export default function ExUpload(props: ExUploadProps) {
    const {formItemProps, type, readonly, readonlyValue, style, className, ...other} = props;

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

    if (readonly) {
        return readonlyValue ? (
            <Space>
                {readonlyValue?.split(',').map((url: string) => (
                    <Image key={url} className={className} style={style} src={url}/>
                ))}
            </Space>
        ) : (
            <span>{rem().constants.DEFAULT_VALUE}</span>
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
