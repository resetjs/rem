import {Form} from "antd";
import type {ProFormProps} from "@ant-design/pro-form";
import ProForm from "@ant-design/pro-form";
import React, {useEffect, useRef} from "react";
import type {FormField, RequestOptions} from "../../../../interface";
import Factory from "../../../../utils/factory";
import {formatToArray, formatUploadValue, parseUploadValue} from "../../../../utils/transforms";
import useHandle from "../../../../hooks/useHandle";
import type {FloatActionType} from "../../../../layouts/FloatLayout";

type FormFieldType = Record<string, FormField>;

type FormContentProps = {
    openid?: string
    renderHandle: (form: any, handleSubmit: any, isLoading?: boolean) => React.ReactNode
    formFields?: FormField[]
    read?: boolean

    //  外边传进来的数据
    selectedData?: any;
    //  控制打开当前页面其他表单回调
    floatAction?: FloatActionType;
    handleCallback?: (res: any, openid?: string) => void;

    onSubmit: (values: any) => RequestOptions
    onSubmitCallback?: (res: any) => void;
}

export default function FormContent(props: FormContentProps & ProFormProps) {

    const {
        read,
        openid,
        formFields,
        renderHandle,
        form: userForm,
        initialValues,
        handleCallback,
        onSubmitCallback,
        onSubmit,
        selectedData,
        floatAction,
        ...other
    } = props;

    const form = userForm || Form.useForm[0]

    const fieldsRef = useRef<FormFieldType>({});
    const {onHandle, isLoading} = useHandle();
    const formProps: ProFormProps = {
        submitter: false,
        scrollToFirstError: true,
        validateMessages: {required: '此项为必填项'},
        ...other,
    };

    const renderFields = (list: FormField[] = []) => {
        return Factory.createFormFields(list, {
            read,
            initialValues,
            labelCol: formProps.labelCol,
            wrapperCol: formProps.wrapperCol,
        });
    };

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


    const handleSubmit = () => {
        formProps.form
            ?.validateFields()
            .then(transformSubmitValues)
            .then(onSubmit)
            .then(onHandle)
            .then(res => {
                //  当前obSubmit 回调
                onSubmitCallback?.(res);
                //  FloatLayout 回调
                handleCallback?.(res);
            })
            .catch((err) => {
                console.log('------------------form err---------------');
                console.log(err);
            });
    };

    useEffect(() => {
        if (initialValues && !read) {
            const temp: any = {};
            if (formFields && formFields.length > 0) {
                formFields.forEach((item) => {
                    temp[item.key] = item;
                });
            }
            fieldsRef.current = temp;
            form?.resetFields();

            Object.keys(initialValues).forEach(key => {
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
    }, [initialValues, read]);

    return (
        <ProForm {...formProps} form={form} onValuesChange={onValuesChange} name={openid || 'ExForm'}>
            {renderFields(formFields)}
            {read
                ? <Form.Item wrapperCol={{span: 24}}>{renderHandle(form, handleSubmit, isLoading)}</Form.Item>
                : (
                    <Form.Item
                        wrapperCol={{
                            span: 24,
                            offset: formProps.layout === 'vertical' ? 0 : formProps.labelCol?.span || 4,
                        }}
                    >
                        {renderHandle(form, handleSubmit, isLoading)}
                    </Form.Item>
                )
            }
        </ProForm>
    )
}
