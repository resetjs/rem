import React, {useEffect, useRef, useState} from 'react';
import type {ProFormProps} from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';
import {Form} from 'antd';
import useHandle from '../../hooks/useHandle';
import type {FormField, RequestOptions} from '../../interface';
import Factory from '../../utils/factory';
import {formatToArray, formatUploadValue, parseCol, parseUploadValue} from '../../utils/transforms';
import type {FloatActionType} from '../../layouts/FloatLayout';
import isArray from 'lodash/isArray';
import type {FormWrapperProps} from "./components/Wrapper";
import FormWrapper from "./components/Wrapper";

import './index.less';

export interface ExFormProps extends ProFormProps {
    openid: string
    // 表单成员
    formFields?: FormField[];
    // 表单容器关闭回调
    onClose?: (key: string) => void;
    //  表单提交
    onSubmit: (values: any) => RequestOptions | void
    //  点击下一步按钮回调
    onNext: (values: any, index: number) => RequestOptions | void
    // 表单提交成功回调
    onSubmitCallback?: (res: any, options: any) => void;
    //  表单提交回调
    handleCallback?: (res: any, openid?: string) => void;
    //  外边传进来的数据
    selectedData?: any
    //  控制打开当前页面其他表单回调
    floatAction?: FloatActionType;
    //  form 样式
    style: React.CSSProperties;
}

type FormFieldType = Record<string, FormField>;

const ExForm = (props: ExFormProps & FormWrapperProps) => {

    const {
        openid,
        className,
        style,
        read,
        form: userForm,
        initialValues,
        mode,
        modeProps,
        formFields,
        onSubmit,
        onSubmitCallback,
        handleCallback,
        onClose,
        layout,
        visible,
        fragments,
        onNext
    } = props;

    const validGroups =
        fragments?.filter((item) => !item.hasOwnProperty('show') || item.show) || [];

    const {isLoading, onHandle} = useHandle();
    const fieldsRef = useRef<FormFieldType>({});
    const [current, setCurrent] = useState(0);
    const [form] = Form.useForm();

    let formLayout = mode === 'page' ? 'vertical' : layout || 'horizontal';
    if (read) formLayout = 'horizontal';

    const formProps: ProFormProps = {
        form: userForm || form,
        submitter: false,
        scrollToFirstError: true,
        layout: formLayout,
        className,
        style: validGroups[current]?.style || style || {width: mode === 'page' ? '640px' : '100%'},
        validateMessages: {required: '此项为必填项'},
        ...(formLayout === 'horizontal' ? parseCol(4, 20) : parseCol(24, 24)),
    };

    useEffect(() => {
        if ((mode === 'page' || visible) && !read) {
            const temp: any = {};
            if (validGroups.length > 0) {
                validGroups.forEach((item: any) => {
                    if (item.children && isArray(item.children)) {
                        item.children.forEach((childItem: any) => {
                            temp[childItem.key] = childItem;
                        });
                    }
                });
            } else if (formFields && formFields.length > 0) {
                formFields.forEach((item) => {
                    temp[item.key] = item;
                });
            }
            fieldsRef.current = temp;
            formProps.form?.resetFields();
            if (initialValues) {
                Object.keys(initialValues).forEach((key) => {
                    if (fieldsRef.current.hasOwnProperty(key)) {
                        const field = fieldsRef.current[key];
                        const value = initialValues[key];

                        if (field.componentName === 'Upload') {
                            initialValues[key] = formatUploadValue(value);
                        } else if (
                            (field.componentName === 'Select' && field.componentProps?.mode === 'multiple') ||
                            field.componentName === 'Cascader'
                        ) {
                            initialValues[key] = formatToArray(value);
                        }
                    }
                });

                formProps.form?.setFieldsValue(initialValues);
            }
        }
    }, [visible, initialValues, read]);

    const transformSubmitValues = (values: any) => {
        const temp = values
        Object.keys(fieldsRef.current).forEach((key) => {
            const field = fieldsRef.current[key];
            if (typeof field.transform === 'function') {
                temp[key] = field.transform(values[key]);
            } else if (field.componentName === 'Upload' && !field.transform) {
                temp[key] = parseUploadValue(values[key]);
            }
        });
        return temp;
    };

    const handleSubmit = () => {
        formProps.form
            ?.validateFields()
            .then(transformSubmitValues)
            .then(onSubmit)
            .then(res => {
                if (res && res.url) return onHandle(res)
                return res
            })
            .then((res) => {
                handleCallback?.(res, openid);
                onClose?.(openid);
                onSubmitCallback?.(res, {reset});
            })
            .catch((err) => {
                console.log('------------------form err---------------');
                console.log(err);
            });
    };

    function reset() {
        setCurrent(0);
        formProps.form?.resetFields();
    }

    const handleNext = (index: number) => {
        const keys = validGroups[index]?.children?.map((child) => child.key);
        return formProps.form?.validateFields(keys).then(values => onNext?.(values, index))
    }

    const renderFields = (list: FormField[] = [], position: number) => {
        return Factory.createFormFields(list, {
            read,
            initialValues,
            hidden: position !== current,
            labelCol: formProps.labelCol,
            wrapperCol: formProps.wrapperCol,
        });
    };

    const onValuesChange = async (changedValues: any, allValues: any) => {
        const element = formFields?.find(
            (item: any) => item.key === Object.keys(changedValues).toString(),
        );
        if (element?.dependencies) {
            formProps?.form?.resetFields(element.dependencies);
        }
        formProps?.onValuesChange?.(
            transformSubmitValues(changedValues),
            transformSubmitValues(allValues),
        );
    };

    const footer = (dom: React.ReactNode) => (
        <Form.Item
            wrapperCol={{
                span: 24,
                offset: formLayout === 'vertical' ? 0 : props.labelCol?.span || 4,
            }}
        >
            {dom}
        </Form.Item>
    )

    return (
        <FormWrapper mode={mode}
                     onChange={setCurrent}
                     modeProps={modeProps}
                     fragments={fragments}
                     confirmLoading={isLoading}
                     footer={footer}
                     onNext={handleNext}
                     onOk={handleSubmit}
                     onClose={onClose}>
            <ProForm {...formProps} onValuesChange={onValuesChange} name={openid || 'ExForm'}>
                {validGroups.length > 0
                    ? validGroups.map((item, position) =>
                        item.render && current === position
                            ? item.render
                            : renderFields(item.children, position),
                    )
                    : renderFields(formFields, 0)}
            </ProForm>
        </FormWrapper>
    )

};

export default ExForm;
