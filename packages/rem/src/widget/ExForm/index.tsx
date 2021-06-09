import React, {useContext, useEffect, useRef} from 'react';
import type {ProFormProps} from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';
import {Form} from 'antd';
import type {FormField} from '../../interface';
import Factory from '../../utils/factory';
import {formatToArray, formatUploadValue, parseCol, parseUploadValue} from '../../utils/transforms';

import './index.less';
import {ExWrapperContext} from "../ExWrapper";

export interface ExFormProps extends Omit<ProFormProps, "fields"> {
    // 表单成员
    fields: (FormField | FormField[])[];
    staticContext?: any
    //  只读
    readonly?: boolean;
}

type FormFieldType = Record<string, FormField>;

function ExForm(props: ExFormProps) {

    const {
        className,
        style,
        readonly,
        form: userForm,
        initialValues,
        fields,
        layout = 'vertical',
        staticContext,
        ...rest
    } = props;

    const fieldsRef = useRef<FormFieldType>({});
    const [form] = Form.useForm();

    const formProps: ProFormProps = {
        form: userForm || form,
        submitter: false,
        scrollToFirstError: true,
        layout: readonly ? 'horizontal' : layout,
        className,
        style: style || {width: '100%'},
        validateMessages: {required: '此项为必填项'},
        ...(layout === 'horizontal' ? parseCol(4, 20) : parseCol(24, 24)),
        ...rest,
    };

    useEffect(() => {
        if (!readonly) {
            const temp: any = {};
            if (fields && fields.length > 0) {
                fields.forEach((item) => {
                    if (Array.isArray(item)) {
                        item.forEach(children => {
                            temp[children.key] = children
                        })
                    } else {
                        temp[item.key] = item;
                    }
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
    }, [initialValues, readonly]);

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

    const onValuesChange = async (changedValues: any, allValues: any) => {
        const changedKey = Object.keys(changedValues).toString();
        const element = fieldsRef.current[changedKey]
        if (element?.dependencies) {
            formProps?.form?.resetFields(element.dependencies);
        }
        formProps?.onValuesChange?.(
            transformSubmitValues(changedValues),
            transformSubmitValues(allValues),
        );
    };

    const context = useContext(ExWrapperContext)

    useEffect(() => {
        context?.setOnClickNextListener(
            () => formProps.form?.validateFields().then(transformSubmitValues))
    }, [])

    const filterFields = Factory.filterForm(fields)

    return (
        <ProForm {...formProps} onValuesChange={onValuesChange}>
            {
                filterFields.map(item => Factory.createFormFields(item, {
                    readonly,
                    initialValues,
                    labelCol: formProps.labelCol,
                    wrapperCol: formProps.wrapperCol,
                }))
            }
        </ProForm>
    )
}

ExForm.displayName = 'ExForm';

export default ExForm;
