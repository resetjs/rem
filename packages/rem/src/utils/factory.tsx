import React from 'react';
import {Button, Form, Popconfirm} from 'antd';
import type {Field, FormField, TableField} from '../interface';
import ProForm, {ProFormText} from '@ant-design/pro-form';
import type {ColProps} from 'antd/lib/grid/col';

import ExCheckbox from '../widget/ExCheckbox';
import ExSelect from '../widget/ExSelect';
import ExTreeSelect from '../widget/ExTreeSelect';
import ExCascader from '../widget/ExCascader';
import ExTransfer from '../widget/ExTransfer';
import ExUpload from '../widget/ExUpload';
import ExRadio from '../widget/ExRadio';
import ExInputText from '../widget/ExInputText';
import ExInputNumber from '../widget/ExInputNumber';
import ExDatePicker from '../widget/ExDatePicker';
import ExSwitch from '../widget/ExSwitch';
import {permission} from '../rem';

const FormItem = Form.Item;

const SELECT_PLACEHOLDER = ['Checkbox', 'Select', 'TreeSelect', 'Transfer'];

type FormProps = {
    initialValues?: any;
    readonly?: boolean;
    hidden?: boolean;
    wrapperCol?: ColProps;
    labelCol?: ColProps;
    layout?: 'horizontal' | 'vertical' | 'inline'
};

type OptionType = {
    trigger?: (openid: string) => void;
    entity?: any;
    readonly?: boolean;
    readonlyValue?: any;
};

type CreateOptions = {
    formItemProps?: any;
    optionProps?: OptionType;
};

function filterField(field: any) {
    return (
        permission.checkAuthority(field.authority) &&
        (!field.hasOwnProperty('show') || field.show) &&
        !!(field.componentName || field.render)
    );
}

function filterFields<T extends Field>(fields: T[]) {
    return fields.filter((field) => filterField(field));
}

function create(field: Field, opts?: CreateOptions): React.ReactNode {
    const {formItemProps, optionProps} = opts || {};

    const placeholder =
        SELECT_PLACEHOLDER.findIndex((name) => name === field.componentName) > -1 ? '选择' : '输入';

    const {children, ...other} = field?.componentProps || {};

    const componentProps: any = {
        key: field.key,
        style: {width: '100%'},
        precision: 0,
        ...other,
    };

    if (field.request) {
        componentProps.request = field.request;
    } else if (field.valueEnum) {
        componentProps.valueEnum = field.valueEnum;
    }

    const tipsComponentProps = {
        ...componentProps,
        placeholder: `请${placeholder}${formItemProps?.label || ''} ${
            field.request ? '(支持搜索)' : ''
        }`,
    };

    const fieldProps = {formItemProps, ...optionProps};

    let dom;
    switch (field.componentName) {
        case 'Checkbox':
            dom = <ExCheckbox options={field?.options} {...fieldProps} {...other} />;
            break;
        case 'Radio':
            dom = <ExRadio options={field?.options} {...fieldProps} {...componentProps} />;
            break;
        case 'Select':
            dom = <ExSelect options={field?.options} {...fieldProps} {...tipsComponentProps} />;
            break;
        case 'TreeSelect':
            dom = <ExTreeSelect options={field?.options} {...fieldProps} {...tipsComponentProps} />;
            break;
        case 'Input':
            dom = <ExInputText {...fieldProps} {...tipsComponentProps} />;
            break;
        case 'TextArea':
            dom = <ExInputText type={'TextArea'} {...fieldProps} {...tipsComponentProps} />;
            break;
        case 'InputNumber':
            dom = <ExInputNumber {...fieldProps} {...tipsComponentProps} />;
            break;
        case 'InputPassword':
            dom = <ProFormText.Password {...formItemProps} fieldProps={tipsComponentProps}/>;
            break;
        case 'Transfer':
            dom = <ExTransfer {...fieldProps} {...componentProps} />;
            break;
        case 'Cascader':
            dom = <ExCascader {...fieldProps} options={field?.options} {...tipsComponentProps} />;
            break;
        case 'Upload':
            dom = <ExUpload {...fieldProps} {...componentProps} />;
            break;
        case 'Button': {
            if (!componentProps.onClick && optionProps) {
                componentProps.onClick = () => optionProps.trigger?.(field.key);
            }
            const {style, ...rest} = componentProps;
            dom = <Button {...rest}>{children || field.content}</Button>;
        }
            break;
        case 'Link': {
            if (!componentProps.onClick && optionProps) {
                componentProps.onClick = () => optionProps.trigger?.(field.key);
            }
            const {style, ...rest} = componentProps;
            dom = <a {...rest}>{children || field.content}</a>;
        }
            break;
        case 'Popconfirm':
            dom = <Popconfirm {...componentProps}>{children || <a>{field.content}</a>}</Popconfirm>;
            break;
        case 'Switch': {
            const {style, ...rest} = componentProps;
            dom = <ExSwitch formItemProps={formItemProps} {...rest} />;
        }
            break;
        case 'DatePicker':
        case 'DateRangePicker':
        case 'TimePicker':
        case 'DateTimeRangePicker':
        case 'DateTimePicker':
            dom = <ExDatePicker {...fieldProps} {...componentProps} type={field.componentName}/>;
            break;
        default:
            dom = <span key={field.key}>暂未识别组件{field.componentName}</span>;
    }

    return dom;
}

class Factory {
    //  创建普通对象
    static createField(field: Field, opts?: CreateOptions): React.ReactNode | undefined {
        if (filterField(field)) {
            const temp = {...field};
            if (!field.content && opts?.optionProps?.entity) {
                temp.content = opts?.optionProps?.entity[field.key];
            }
            const dom = create(temp, {optionProps: opts?.optionProps});
            return temp.hasOwnProperty('render') ? temp.render?.(dom, opts?.optionProps?.entity) : dom;
        }
        return undefined;
    }

    //  创建表格对象
    static createTableFields(fields: TableField[], optionProps?: OptionType): React.ReactNode[] {
        return filterFields(fields).map((field) => this.createField(field, {optionProps}));
    }

    static filterForm(fields: (FormField | FormField[])[]) {
        const arr: (FormField | FormField[])[] = [];
        fields.forEach(field => {
            if (Array.isArray(field)) {
                const temp = filterFields(field)
                if (temp.length > 0) arr.push(temp)
            } else if (filterField(field)) {
                arr.push(field)
            }
        })
        return arr;
    }

    //  创建表单对象
    static createFormFields(field: (FormField | FormField[]), formProps: FormProps): React.ReactNode {

        if (Array.isArray(field)) {
            const keys = field.map(item => item.key)
            return (
                <ProForm.Group key={keys.join('-')}>
                    {field.map(item => Factory.createFormFields(item, formProps))}
                </ProForm.Group>
            )
        }

        const rules = [{required: field.required || false}];

        const formItemProps: any = {
            rules,
            key: field.key,
            name: field.key,
            label: field.label,
            hidden: formProps?.hidden,
            noStyle: !!field.extra,
            required: field.required,
            ...field.formItemProps,
        };

        const readonly =
            (field.hasOwnProperty('readonly') && field.readonly) ||
            (!field.hasOwnProperty('readonly') && formProps?.readonly);

        let optionProps;
        if (readonly) {
            optionProps = {
                readonly: true,
                readonlyValue: formProps?.initialValues?.[field.key],
            };
        }

        let dom = create(field, {formItemProps, optionProps});

        const readProps: any = {name: undefined, extra: undefined, required: false};

        // 仅当全局read模式, 才格式化样式
        if (!field.hasOwnProperty('readonly') && formProps?.readonly) {
            readProps.labelCol = {span: 0};
            readProps.wrapperCol = {span: 24};
        }

        if (field.extra && !readonly) {
            dom = (
                <FormItem
                    key={field.key}
                    hidden={formItemProps.hidden}
                    label={field.label}
                    required={field.required}
                >
                    {dom}
                    {field.extra}
                </FormItem>
            );
        }

        if (field.hasOwnProperty('render')) {
            const temp = readonly
                ? readProps
                : {name: field.formItemProps?.rules ? field.key : undefined};
            return (
                <FormItem {...formItemProps} {...temp}>
                    {field.render?.(dom, {formItemProps, ...optionProps})}
                </FormItem>
            );
        }

        return readonly
            ? (
                <FormItem {...formItemProps} {...readProps}>
                    {dom}
                </FormItem>
            )
            : dom
    }
}

export default Factory;
