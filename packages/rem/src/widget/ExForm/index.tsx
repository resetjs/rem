import React, { Fragment, useEffect, useRef, useState } from 'react';
import type { ProFormProps } from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';
import { Button, Form, Menu, message, Radio, Space, Steps, Tabs } from 'antd';
import useHandle from '../../hooks/useHandle';
import type {FormField, RequestOptions } from '../../interface';
import type { ExModalProps } from '../ExModal';
import ExModal from '../ExModal';
import Factory from '../../utils/factory';
import { formatToArray, parseCol, formatUploadValue, parseUploadValue } from '../../utils/transforms';
import type { FloatActionType } from '../../layouts/FloatLayout';
import type { ManualProps } from '../Manual';
import Manual from '../Manual';
import cloneDeep from 'lodash/cloneDeep';
import isArray from 'lodash/isArray';

import './index.less';
import { useHistory } from 'react-router-dom';

const { TabPane } = Tabs;

interface ExFormGroupField {
  //  组件唯一表示
  key: string;
  // 标题
  label?: string;
  //  组件Props
  fieldProps?: any;
  //  表单成员集
  children?: FormField[];
  // 提交
  onSubmit?: <T>(
    onHandle: (params: RequestOptions) => Promise<T>,
    values?: any,
  ) => Promise<boolean>;
  // 容器样式
  style?: any;
  //  表单说明
  manual?: ManualProps;
  //  自定义界面
  render?: React.ReactNode;
  //  隐藏显示
  show?: boolean;
}

interface ExFormGroup {
  mode?: 'tabs' | 'step' | 'sideMenu' | 'radio';
  //  隐藏指示器
  hideIndicator?: true;
  //  Mode容器的Props
  modeProps?: any;
  //  表单成员集
  children: ExFormGroupField[];
  //  切换回调
  onChange?: (key: string, selectedOptions: ExFormGroupField) => void;
  //  是否独立页面
  independent?: boolean;
}

export interface ExFormProps extends ProFormProps {
  // 表单唯一标识
  openid: string;
  // 表单容器模式 (modal=弹出窗形式, drawer=侧边栏模式
  mode: 'modal' | 'drawer' | 'page';
  //  表单容器扩展属性字段
  modeProps?: ExModalProps;
  // 表单成员
  formFields?: FormField[];
  // 表单容器关闭回调
  onClose?: (key: string) => void;
  // 表单提交回到
  onSubmit?: <T>(values: any, onHandle: (params: RequestOptions) => Promise<T>) => Promise<T>;
  // 表单提交成功回调
  onSubmitCallback?: (res: any, options: any) => void;
  // 表单容器展示
  visible?: boolean;
  //  表单提交回调
  handleCallback?: (res: any, openid?: string) => void;
  //  表单成员分组模式
  group?: ExFormGroup;
  //  外边传进来的数据
  selectedData?: any;
  //  表单顶部自定义组件字段
  renderTop?: React.ReactNode;
  // 表单底部自定义组件字段
  renderFooter?: React.ReactNode;
  //  表单是否为只读类型
  read?: boolean;
  //  控制打开当前页面其他表单回调
  floatAction?: FloatActionType;
  // 过滤字段
  staticContext?: any;
  // 表单说明
  manual?: ManualProps;
}

type FormFieldType = Record<string, FormField>;

const ExForm = (props: ExFormProps) => {
  const {
    className,
    style,
    manual,
    read,
    renderTop,
    renderFooter,
    form: userForm,
    floatAction,
    selectedData,
    initialValues,
    mode,
    openid,
    group,
    formFields,
    onSubmit,
    onSubmitCallback,
    visible,
    onClose,
    handleCallback,
    modeProps,
    staticContext,
    layout,
    ...other
  } = props;

  const validGroups =
    group?.children.filter((item) => !item.hasOwnProperty('show') || item.show) || [];

  const history = useHistory();
  const { isLoading, onHandle } = useHandle();
  const fieldsRef = useRef<FormFieldType>({});
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();

  let formLayout = mode === 'page' ? 'vertical' : layout || 'horizontal';
  if (read) {
    formLayout = 'horizontal';
  }

  const formProps: ProFormProps = {
    form: userForm || form,
    submitter: false,
    scrollToFirstError: true,
    layout: formLayout,
    style: group?.children[current]?.style || { width: mode === 'page' ? '640px' : '100%' },
    validateMessages: { required: '此项为必填项' },
    ...(formLayout === 'horizontal' ? parseCol(4, 20) : parseCol(24, 24)),
    ...other,
  };

  useEffect(() => {
    if ((mode === 'page' || visible) && !read) {
      const temp: any = {};
      if (group) {
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
      group?.onChange?.(validGroups[0] && validGroups[0].key, validGroups[0]);
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
    } else if (!visible && mode !== 'page') {
      setCurrent(0);
    }
  }, [visible, initialValues, read]);

  const transformSubmitValues = (values: any) => {
    const newValues = {...values};
    Object.keys(fieldsRef.current).forEach((key) => {
      const field = fieldsRef.current[key];
      if (typeof field.transform === 'function') {
        newValues[key] = field.transform(values[key]);
      } else if (field.componentName === 'Upload' && !field.transform) {
        newValues[key] = parseUploadValue(values[key]);
      }
    });
    return newValues;
  };

  const handleSubmit = () => {
    formProps.form
      ?.validateFields()
      .then(transformSubmitValues)
      .then((formatValues) => onSubmit?.(formatValues, onHandle))
      .then((res) => {
        handleCallback?.(res, openid);
        onClose?.(openid);
        onSubmitCallback?.(res, { reset });
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

  const defaultModalProps: ExModalProps = {
    visible,
    onOk: handleSubmit,
    confirmLoading: isLoading,
    onClose,
    openid,
    bodyStyle: {padding: 0},
  };

  if (read) defaultModalProps.footer = false;

  const next = (nextCurrent: number) => {
    setCurrent(nextCurrent);
    const obj = validGroups[nextCurrent];
    if (obj) group?.onChange?.(obj.key, obj);
  };

  const defaultSubmitButton = (
    <Space>
      {mode === 'page' && group?.mode !== 'step' && (
        <Button
          className={'rem-form-btn'}
          onClick={() => (history.length === 1 ? window.close() : history.goBack())}
        >
          返回
        </Button>
      )}
      {(!group || group?.mode !== 'step' || current === validGroups.length - 1) && (
        <Button
          className={'rem-form-btn'}
          loading={isLoading}
          key="submit"
          type="primary"
          onClick={handleSubmit}
        >
          提 交
        </Button>
      )}
    </Space>
  );

  function handleNext(values: any) {
    if (validGroups[current].onSubmit) {
      // @ts-ignore
      validGroups[current]
        .onSubmit(onHandle, values)
        .then(() => next(current + 1))
        .catch((err) => {
          message.error(err.message || err);
        });
    } else {
      next(current + 1);
    }
  }

  const defaultSubmitter = (
    <Space>
      {mode === 'modal' && current === 0 && (
        <Button className={'rem-form-btn'} onClick={() => onClose?.(openid)}>
          取消
        </Button>
      )}
      {group && current > 0 && !group.independent && group.mode === 'step' && (
        <Button
          className={'rem-form-btn'}
          key="pre"
          onClick={() => {
            next(current - 1);
          }}
        >
          上一步
        </Button>
      )}
      {mode === 'page' && current === 0 && (
        <Button
          className={'rem-form-btn'}
          onClick={() => (history.length === 1 ? window.close() : history.goBack())}
        >
          返回
        </Button>
      )}
      {group && current < validGroups.length - 1 && group.mode === 'step' && (
        <Button
          className={'rem-form-btn'}
          key="next"
          type="primary"
          loading={isLoading}
          onClick={() => {
            const keys = validGroups[current]?.children?.map((child) => child.key);
            formProps.form?.validateFields(keys).then(handleNext);
          }}
        >
          下一步
        </Button>
      )}
      {defaultSubmitButton}
    </Space>
  );

  defaultModalProps.footer = mode === 'modal' && read ? false : defaultSubmitter;

  const renderFields = (list: FormField[] = [], position: number) => {
    return Factory.createFormFields(list, {
      read,
      initialValues,
      hidden: position !== current,
      labelCol: formProps.labelCol,
      wrapperCol: formProps.wrapperCol,
    });
  };

  const renderGroupMode = (): React.ReactNode | void => {
    let dom = null;
    if (!group || group?.hideIndicator) return dom;
    switch (group.mode) {
      case 'sideMenu':
        dom = (
          <Menu
            className={'rem-form-menu'}
            mode="inline"
            onClick={(e) => {
              const temp = parseInt(e.key.toString(), 10);
              setCurrent(temp);
              group.onChange?.(validGroups[temp].key, validGroups[temp]);
            }}
            selectedKeys={[current.toString()]}
            {...group.modeProps}
          >
            {validGroups.map((item, position) => (
              <Menu.Item key={position}>{item.label}</Menu.Item>
            ))}
          </Menu>
        );
        break;
      case 'step':
        dom = (
          <Steps current={current} className={'rem-form-steps'} {...group.modeProps}>
            {validGroups.map((item) => (
              <Steps.Step title={item.label} key={item.key} />
            ))}
          </Steps>
        );
        break;
      case 'radio':
        dom = (
          <div className={'rem-form-radio'}>
            <Radio.Group
              onChange={(e) => {
                const temp = parseInt(e.target.value, 10);
                setCurrent(temp);
                group.onChange?.(validGroups[temp].key, validGroups[temp]);
              }}
              value={current.toString()}
              optionType="button"
              buttonStyle="solid"
              {...group?.modeProps}
            >
              {validGroups.map((item, index) => (
                <Radio.Button key={`${index}`} value={`${index}`}>
                  {item.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          </div>
        );
        break;
      case 'tabs':
        dom = (
          <Tabs
            size="small"
            className={'rem-form-tabs'}
            tabPosition="left"
            activeKey={current.toString()}
            onChange={(key) => {
              const temp = parseInt(key, 10);
              setCurrent(temp);
              group.onChange?.(validGroups[temp].key, validGroups[temp]);
            }}
            {...group?.modeProps}
          >
            {validGroups.map((item, index) => (
              <TabPane key={`${index}`} tab={item.label} />
            ))}
          </Tabs>
        );
        break;
      default:
        break;
    }
    return dom;
  };

  const isSideWay = group?.mode === 'sideMenu' || group?.mode === 'tabs';

  const renderManual = () => {
    const temp = group ? validGroups[current].manual : manual;
    return temp && !read && <Manual {...temp} type={isSideWay ? 'vertical' : 'horizontal'} />;
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

  const renderContent = (
    <>
      {renderTop}
      <div className={isSideWay ? 'rem-form-container-menu' : 'rem-form-container'}>
        <div className={isSideWay ? 'rem-form-content-menu' : 'rem-form-content'}>
          {renderGroupMode()}
          <ProForm {...formProps} onValuesChange={onValuesChange} name={openid || 'ExForm'}>
            {group?.mode === 'sideMenu' && (
              <h1 className={'rem-form-menu-title'}>{validGroups[current].label}</h1>
            )}
            {group
              ? validGroups.map((item, position) =>
                  item.render && current === position
                    ? item.render
                    : renderFields(item.children, position),
                )
              : renderFields(formFields, 0)}
            {mode === 'page' && !read && (
              <Form.Item
                wrapperCol={{
                  span: 24,
                  offset: formLayout === 'vertical' ? 0 : props.labelCol?.span || 4,
                }}
              >
                {group?.mode === 'step' ? defaultSubmitter : defaultSubmitButton}
              </Form.Item>
            )}
          </ProForm>
        </div>
        {renderManual()}
      </div>
      {props.children}
      {renderFooter}
    </>
  );

  if (mode === 'modal') {
    return (
      <ExModal {...defaultModalProps} {...modeProps}>
        {renderContent}
      </ExModal>
    );
  }
  if (mode === 'page') {
    return <div className={'rem-form-container'}>{renderContent}</div>;
  }
  return <Fragment />;
};

export default ExForm;
