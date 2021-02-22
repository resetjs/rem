import React from 'react';
import {Button, Form, Popconfirm} from 'antd';
import {
    AuthorityRule,
    IRequest,
    IValueEnum,
    ProFieldRequestListData,
    RequestOptions,
    ResponseResult,
} from '../interface';
import {ProFormText} from '@ant-design/pro-form';
import {FormItemProps} from 'antd/lib/form';
import {ColProps} from 'antd/lib/grid/col';
import {ProColumns} from '@ant-design/pro-table';
import {SearchTransformKeyFn} from '@ant-design/pro-utils';
import {ProCoreActionType} from '@ant-design/pro-utils/lib/typing';
import {FloatActionType} from '../layouts/FloatLayout';

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
import {NamePath} from 'rc-field-form/es/interface';
import rem from '../rem';

const FormItem = Form.Item;

const SELECT_PLACEHOLDER = ['Checkbox', 'Select', 'TreeSelect', 'Transfer'];

interface Field<T = any> extends IRequest {

    //  组件唯一表示
    key: string;

    //  组件类型
    componentName?: 'Input' | 'TextArea' | 'DatePicker' | 'Transfer' | 'TimePicker'
        | 'DateTimePicker' | 'DateRangePicker' | 'DateTimeRangePicker' | 'Checkbox'
        | 'Radio' | 'Switch' | 'Rate' | 'Slider'
        | 'Select' | 'InputPassword' | 'TreeSelect' | 'InputNumber' | 'Cascader'
        | 'Upload' | 'Popconfirm' | 'Button' | 'Link';

    //  组件扩展字段
    componentProps?: any

    //  是否显示成员
    show?: true | boolean

    // 依赖字段，所依赖字段改变置空当前值
    dependencies?: NamePath[],

    //  组件数据集, valueEnum类型(仅适用于选择组件)
    valueEnum?: IValueEnum,

    //  组件数据集, 数组类型(仅适用于选择组件)
    options?: ProFieldRequestListData[]

    //  权限校验
    authority?: string | string[] | AuthorityRule

    //  初始化组件值, 仅当输入内容, 选项内容有效
    value?: string | number;

    //  组件内容
    content?: React.ReactNode

    // 自定义组件
    render?: (dom: React.ReactNode, entity?: T | undefined, action?: ProCoreActionType, floatAction?: FloatActionType) => React.ReactNode
}

interface TableField<T = any> extends Field<T> {

    //  组件展示内容, 表单形式为名称, 表格形式为标题
    label?: string | React.ReactNode;

    componentProps?: (entity: T, onHandle: (params: RequestOptions) => Promise<ResponseResult>, action?: ProCoreActionType, floatAction?: FloatActionType) => any

    //  操作项对应浮动层组件属性
    floatProps?: any

    //  操作项对应浮动层组件
    floatComponent?: any

    // ProColumns props
    columnsProps?: ProColumns<T>

    //  常用columnsProps下的字段, 抽取出来
    search?: false | { transform: SearchTransformKeyFn; }
}

interface FormField extends Field {

    //  组件展示内容, 表单形式为名称, 表格形式为标题
    label?: string | React.ReactNode;

    //  是否为必填字段
    required?: boolean;

    //  组件分组, 默认包裹 <ProForm.Group /> 组件
    //  children?: FormField[]

    // 对应 <Form.Item /> 扩展字段
    formItemProps?: FormItemProps

    // 表单组件是否为只读类型
    read?: boolean

    //  扩展组件, 默认在右边
    extra?: React.ReactNode

    // 自定义组件
    render?: (dom: React.ReactNode, opts?: CreateOptions) => React.ReactNode

    // 转换参数, 如不需要转换, 则传递 false
    transform?: (data: any) => any | false

    //  弃用字段
    // description?: string;
    // formProps?: any
    // placeholder?: string; 请在 componentProps 实现
    // labelCol?: { span: number, offset: number } 表单成员名称宽度, 请在 formItemProps 实现
    // wrapperCol?: { span: number, offset: number } 表单成员内容宽度, 请在 formItemProps 实现
    // hideFormItem?: false | boolean;  移除是否隐藏form包裹, 请用render实现, 默认不包裹 <Form.Item />
    // component 已经移除了, 请用 render实现
}

type FormProps = {
    initialValues?: any
    read?: boolean
    hidden: boolean
    wrapperCol?: ColProps
    labelCol?: ColProps
}

type OptionType = {
    trigger?: (openid: string) => void
    entity?: any
    read?: boolean
    readValue?: any
}

type CreateOptions = {
    formItemProps?: any
    optionProps?: OptionType
}

function filterField(field: any) {
    return rem.permission.checkAuthority(field.authority) && (!field.hasOwnProperty('show') || field.show) && !!(field.componentName || field.render);
}

function filterFields<T extends Field>(fields: T[]) {
    return fields.filter(field => filterField(field));
}

function create(field: Field, opts?: CreateOptions): React.ReactNode {

    const {formItemProps, optionProps} = opts || {};

    const placeholder = SELECT_PLACEHOLDER.findIndex(name => name === field.componentName) > -1 ? '选择' : '输入';

    const {children, ...other} = field?.componentProps || {};

    const componentProps = {
        key: field.key,
        placeholder: `请${placeholder}${formItemProps?.label || ''} ${!!field.request ? '(支持搜索)' : ''}`,
        style: {width: '100%'},
        precision: 0,
        ...other,
    };

    if (field.request) {
        componentProps.request = field.request;
    } else if (field.valueEnum) {
        componentProps.valueEnum = field.valueEnum;
    }

    const fieldProps = {formItemProps: formItemProps, ...optionProps};

    let dom;
    switch (field.componentName) {
        case 'Checkbox': {
            const {placeholder, ...other} = componentProps;
            dom = <ExCheckbox options={field?.options} {...fieldProps} {...other} />;
        }
            break;
        case 'Radio': {
            const {placeholder, ...other} = componentProps;
            dom = <ExRadio options={field?.options} {...fieldProps} {...other} />;
        }
            break;
        case 'Select': {
            dom = <ExSelect options={field?.options} {...fieldProps} {...componentProps} />;
        }
            break;
        case 'TreeSelect': {
            dom = <ExTreeSelect options={field?.options} {...fieldProps} {...componentProps} />;
        }
            break;
        case 'Input':
            dom = <ExInputText {...fieldProps} {...componentProps} />;
            break;
        case 'TextArea':
            dom = <ExInputText type={'TextArea'} {...fieldProps} {...componentProps} />;
            break;
        case 'InputNumber':
            dom = <ExInputNumber {...fieldProps} {...componentProps} />;
            break;
        case 'InputPassword':
            dom = <ProFormText.Password {...formItemProps} fieldProps={componentProps}/>;
            break;
        case 'Transfer': {
            dom = <ExTransfer {...fieldProps} {...componentProps} />;
        }
            break;
        case 'Cascader': {
            dom = <ExCascader {...fieldProps} options={field?.options} {...componentProps} />;
        }
            break;
        case 'Upload': {
            dom = <ExUpload {...fieldProps} {...componentProps} />;
        }
            break;
        case 'Button': {
            if (!componentProps.onClick && optionProps) {
                componentProps.onClick = () => optionProps.trigger?.(field.key);
            }
            const {placeholder, style, ...other} = componentProps;
            dom = <Button {...other} >{children || field.content}</Button>;
        }
            break;
        case 'Link': {
            if (!componentProps.onClick && optionProps) {
                componentProps.onClick = () => optionProps.trigger?.(field.key);
            }
            const {placeholder, style, ...other} = componentProps;
            dom = <a {...other}>{children || field.content}</a>;
        }
            break;
        case 'Popconfirm': {
            const {placeholder, ...other} = componentProps;
            dom = <Popconfirm {...other}>{children || <a>{field.content}</a>}</Popconfirm>;
        }
            break;
        case 'Switch': {
            const {placeholder, style, ...other} = componentProps;
            dom = <ExSwitch formItemProps={formItemProps} {...other} />;
        }
            break;
        case 'DatePicker':
        case 'DateRangePicker':
        case 'TimePicker':
        case 'DateTimeRangePicker':
        case 'DateTimePicker': {
            dom = <ExDatePicker {...fieldProps} {...componentProps} type={field.componentName}/>;
        }
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
            if (!field.content && opts?.optionProps?.entity) {
                field.content = opts?.optionProps?.entity[field.key];
            }
            const dom = create(field, {optionProps: opts?.optionProps});
            return field.hasOwnProperty('render') ? field.render?.(dom, opts?.optionProps?.entity) : dom;
        }
        return undefined;
    }

    //  创建表格对象
    static createTableFields(fields: TableField[], optionProps?: OptionType): React.ReactNode[] {
        return filterFields(fields).map(field => this.createField(field, {optionProps}));
    }

    //  创建表单对象
    static createFormFields(fields: FormField[], formProps: FormProps): React.ReactNode[] {

        return filterFields(fields).map((field, position) => {

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

            const read = (field.hasOwnProperty('read') && field.read) || (!field.hasOwnProperty('read') && formProps?.read);

            let optionProps;
            if (read) {
                optionProps = {
                    read: true,
                    readValue: formProps?.initialValues?.[field.key],
                };
            }

            let dom = create(field, {formItemProps, optionProps});

            const readProps: any = {name: undefined, extra: undefined, required: false};

            // 仅当全局read模式, 才格式化样式
            if (!field.hasOwnProperty('read') && formProps?.read) {
                readProps.labelCol = {span: 0};
                readProps.wrapperCol = {span: 24};
            }

            if (field.extra && !read) {
                dom = <FormItem key={field.key} hidden={formItemProps.hidden} label={field.label}
                                required={field.required}>
                    {dom}
                    {field.extra}
                </FormItem>;
            }

            if (field.hasOwnProperty('render')) {
                const temp = read ? readProps : {name: field.formItemProps?.rules ? field.key : undefined};
                return <Form.Item {...formItemProps} {...temp}>{field.render?.(dom, {formItemProps, ...optionProps})}</Form.Item>;
            } else {
                return read ? <Form.Item  {...formItemProps} {...readProps}>{dom}</Form.Item> : dom;
            }

        });
    }
}

export {
    FormField,
    TableField,
    Field
}

export default Factory
