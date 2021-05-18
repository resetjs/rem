import {useEffect, useRef} from 'react';
import type {ProFormProps} from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';
import {Form} from 'antd';
import type {FormField} from '../../interface';
import Factory from '../../utils/factory';
import {formatToArray, formatUploadValue, parseCol, parseUploadValue} from '../../utils/transforms';

import './index.less';

export interface ExFormProps extends ProFormProps {
  // 表单成员
  formFields: FormField[];

  staticContext?: any
  // emit
  emit?: Function
  //  只读
  readonly?: boolean;
}

type FormFieldType = Record<string, FormField>;

function ExForm(props: ExFormProps) {

  const {
    openid,
    className,
    style,
    readonly,
    form: userForm,
    initialValues,
    formFields,
    layout = 'vertical',
    staticContext,
    emit,
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
      if (formFields && formFields.length > 0) {
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

  const handleSubmit = () => {
    return formProps.form?.validateFields().then(transformSubmitValues)
  };

  useEffect(() => {
    emit?.(handleSubmit)
  }, [])


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
      {Factory.createFormFields(formFields, {
        readonly,
        initialValues,
        labelCol: formProps.labelCol,
        wrapperCol: formProps.wrapperCol,
      })}
    </ProForm>
  )

};
ExForm.displayName = 'ExForm';

export default ExForm;
