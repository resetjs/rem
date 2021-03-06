import ExCascader from './widget/ExCascader';
import ExCheckbox from './widget/ExCheckbox';
import ExDatePicker from './widget/ExDatePicker';
import ExForm from './widget/ExForm';
import ExInputNumber from './widget/ExInputNumber';
import ExInputText from './widget/ExInputText';
import ExRadio from './widget/ExRadio';
import ExSelect from './widget/ExSelect';
import ExSwitch from './widget/ExSwitch';
import ExSkeleton from './widget/ExSkeleton';
import ExTransfer from './widget/ExTransfer';
import ExTreeSelect from './widget/ExTreeSelect';
import Manual from './widget/Manual';
import SimpleForm from './widget/SimpleForm';
import ExTable from './widget/ExTable';
import ExUpload from './widget/ExUpload';
import Wrapper from './widget/Wrapper';
import type {ElementProps} from './layouts/ElementContainer';
import ElementContainer from './layouts/ElementContainer';
import ExProTable from "./widget/ExProTable";
import PopupContainer from "./widget/PopupContainer";

import type {
    AuthorityRule,
    BaseFieldType,
    Field,
    FormField,
    IAuthority,
    IRequest,
    IValueEnum,
    ProFieldRequestListData,
    RequestOptions,
    RequestResponse,
    TableField
} from './interface';

import type {FloatActionType, FloatLayoutProps, FloatProps, FloatType,} from './layouts/FloatLayout';
import FloatLayout from './layouts/FloatLayout';
import type {PageLayoutProps} from './layouts/PageLayout';
import PageLayout from './layouts/PageLayout';

import './utils/factory';
import './utils/transforms';
import useHandle from './hooks/useHandle';
import useRequest from './hooks/useRequest';

import './index.less';

import createRem from './rem'

export type {
    Field,
    TableField,
    FormField,
    BaseFieldType,
    AuthorityRule,
    IAuthority,
    RequestOptions,
    IRequest,
    ProFieldRequestListData,
    IValueEnum,
    RequestResponse,
    FloatType,
    FloatLayoutProps,
    FloatProps,
    FloatActionType,
    PageLayoutProps,
    ElementProps,
};

export {useHandle, useRequest, createRem};

export {
    ElementContainer,
    FloatLayout,
    PageLayout,
    ExCascader,
    ExCheckbox,
    ExDatePicker,
    ExForm,
    ExInputNumber,
    ExInputText,
    ExRadio,
    ExSelect,
    ExSkeleton,
    ExSwitch,
    ExTable,
    ExTransfer,
    ExTreeSelect,
    ExUpload,
    Manual,
    SimpleForm,
    Wrapper,
    ExProTable,
    PopupContainer
};

export default  createRem