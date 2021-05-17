import React, {useEffect, useRef, useState} from 'react';
import type {ProFormProps} from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';
import {Form, message} from 'antd';
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
  openid?: string
  // 表单成员
  formFields?: FormField[];
  //  表单提交
  onSubmit?: (values: any, onHandle: (opts: RequestOptions) => Promise<any>) => Promise<any>
  // 表单提交成功回调
  onSubmitCallback?: (res: any, options: any) => void;
  //  表单提交回调
  handleCallback?: (res: any, openid?: string) => void;
  //  外边传进来的数据
  selectedData?: any
  //  控制打开当前页面其他表单回调
  floatAction?: FloatActionType;
  // 过滤字段
  staticContext?: any
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
    floatAction,
    selectedData,
    indicator,
    independent,
    staticContext,
    manual,
    operation,
    ...other
  } = props;

  const validGroups =
    fragments?.filter((item) => !item.hasOwnProperty('show') || item.show) || [];

  const {isLoading, onHandle} = useHandle();
  const fieldsRef = useRef<FormFieldType>({});
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();

  let formLayout = layout || (mode === 'page' ? 'vertical' : 'horizontal');
  if (read) formLayout = 'horizontal';

  const formProps: ProFormProps = {
    form: userForm || form,
    submitter: false,
    scrollToFirstError: true,
    layout: formLayout,
    className,
    style: validGroups[current]?.style || style || {width: '100%'},
    validateMessages: {required: '此项为必填项'},
    ...(formLayout === 'horizontal' ? parseCol(4, 20) : parseCol(24, 24)),
    ...other,
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
      .then(res => {
        return onSubmit?.(res, onHandle) || res
      })
      .then((res) => {
        handleCallback?.(res, openid);
        onClose?.();
        onSubmitCallback?.(res, {reset});
      })
      .catch((err) => {
        console.log('------------------form err---------------');
        console.log(err);
        message.error(err?.message || '提交失败, 请稍后重试')
      });
  };

  function reset() {
    setCurrent(0);
    formProps.form?.resetFields();
  }

  const handleNext = async (index: number) => {
    const keys = validGroups[index]?.children?.map((child) => child.key);
    const values = await formProps.form?.validateFields(keys)
    if (validGroups[current].onSubmit) {
      return validGroups[current].onSubmit?.(values, onHandle)
    }
    return values;
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

  return (
    <ProForm {...formProps} onValuesChange={onValuesChange} name={openid || 'ExForm'}>
      {validGroups.length > 0
        ? validGroups.map((item, position) =>
          item.render && current === position
            ? item.render
            : renderFields(item.children, position),
        )
        : renderFields(formFields, 0)}
    </ProForm>
  )

};

export default ExForm;
