import ExCascader from './widget/ExCascader';
import ExCheckbox from './widget/ExCheckbox';
import ExDatePicker from './widget/ExDatePicker';
import ExDrawer from './widget/ExDrawer';
import ExForm from './widget/ExForm';
import ExInputNumber from './widget/ExInputNumber';
import ExInputText from './widget/ExInputText';
import ExModal from './widget/ExModal';
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
import type {ElementProps} from './layouts/ElementContainer';
import ElementContainer from './layouts/ElementContainer';
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
    TableField,
} from './interface';
import type {FloatActionType, FloatLayoutProps, FloatProps, FloatType,} from './layouts/FloatLayout';
import FloatLayout from './layouts/FloatLayout';
import type {PageLayoutProps} from './layouts/PageLayout';
import PageLayout from './layouts/PageLayout';

import rem from './rem';

import './utils/factory';
import './utils/transforms';
import useHandle from './hooks/useHandle';
import useRequest from './hooks/useRequest';

import './index.less';


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

export {useHandle, useRequest};

export {
    ElementContainer,
    FloatLayout,
    PageLayout,
    ExCascader,
    ExCheckbox,
    ExDatePicker,
    ExDrawer,
    ExForm,
    ExInputNumber,
    ExInputText,
    ExModal,
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
};

export default rem;
