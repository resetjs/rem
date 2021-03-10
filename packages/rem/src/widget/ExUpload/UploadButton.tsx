import React, {useEffect, useState} from 'react';
import {message, Modal, Upload} from 'antd';
import {InboxOutlined, PlusOutlined} from '@ant-design/icons';
import type {UploadChangeParam} from 'antd/lib/upload';
import {RcFile, UploadFile, UploadProps} from "antd/lib/upload/interface";
import getRem from '../../rem';
import {UploadMode} from "./index";

const {Dragger} = Upload;

function getBase64(file: any) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
}

const IMAGE_ACCEPT = '.bmp, .jpg, .jpeg, .png';

interface ParamsProps extends UploadProps {
    /** 最大上传资源数 */
    max?: number;
    /** 单个资源最大内存 */
    maxSize?: number;
    extraText?: string;
    extraHint?: string;
    mode?: UploadMode;
    children?: React.ReactNode;
}

export default function UploadButton(props: ParamsProps) {
    const {type, max = 1, children, extraText, extraHint, mode, maxSize = 1024, ...other} = props;

    const [fileList, setFileList] = useState<any[]>([]);

    const [previewVisible, setPreviewVisible] = useState<boolean>(false);
    const [previewImage, setPreviewImage] = useState<any>(false);

    useEffect(() => {
        if (props.fileList && props.fileList.length > 0) {
            setFileList(props.fileList);
        }
    }, [props.fileList]);

    async function onPreview(file: UploadFile) {
        if (file.status === 'done' && file.url) {
            setPreviewImage(file.url);
            setPreviewVisible(true);
        } else if (file.type?.includes('image')) {
            const base64 = await getBase64(file.originFileObj);
            setPreviewImage(base64);
            setPreviewVisible(true);
        }
    }

    const uploadButton =
        type === 'drag' ? (
            <>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined/>
                </p>
                <p className="ant-upload-text"> {extraText} </p>
                <p className="ant-upload-hint"> {extraHint} </p>
            </>
        ) : (
            <div style={{display: 'inline-block'}}>
                <PlusOutlined style={{fontSize: 20, color: '#444'}}/>
                <div>{extraText || (mode === 'image' ? '选择图片' : '选择文件')}</div>
            </div>
        );

    function onChange(info: UploadChangeParam) {
        setFileList([...info.fileList]);
        if (props.onChange) props.onChange(info);
    }

    const beforeUpload = (file: RcFile) => {
        //  上传前文件格式校验
        if (
            mode === 'image' &&
            !(
                file.type === 'image/bmp' ||
                file.type === 'image/jpeg' ||
                file.type === 'image/jpg' ||
                file.type === 'image/png'
            )
        ) {
            message.error(`图片格式只支持${IMAGE_ACCEPT}`);
            return Promise.reject();
        }

        // 上传前文件大小校验
        if (file.size > maxSize * 1024 * 1024) {
            message.warning('文件大小已超过最大限制！');
            return Promise.reject();
        }
        return true;
    };

    const fieldProps: any = {
        onPreview,
        beforeUpload,
        customRequest: (option: any) => getRem().uploadFile(option),
        onChange,
    };

    if (mode === 'image') fieldProps.accept = IMAGE_ACCEPT;

    return (
        <>
            {type === 'drag' ? (
                <Dragger
                    {...fieldProps}
                    {...other}
                    className={fileList && fileList.length >= max ? 'hidder-drag-upload' : ''}
                >
                    {uploadButton}
                </Dragger>
            ) : (
                <Upload {...fieldProps} {...other} onChange={onChange}>
                    {fileList.length < max && (children || uploadButton)}
                </Upload>
            )}
            <Modal
                visible={previewVisible}
                title="查看图片"
                footer={null}
                onCancel={() => setPreviewVisible(false)}
            >
                <img alt="" style={{width: '100%'}} src={previewImage}/>
            </Modal>
        </>
    );
}
