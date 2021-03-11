import React from 'react';
import {Radio} from 'antd';
import classNames from 'classnames';
import {ProFormRadio} from '@ant-design/pro-form';
import useRequest from '../../hooks/useRequest';
import type {BaseFieldType, IRequest} from '../../interface';
import type {RadioGroupProps} from 'antd/lib/radio/interface';
import {transformTarget} from '../../utils/transforms';
import rem from '../../rem';
import {dataType, isEmpty} from '../../utils/utils';

export interface ExRadioProps extends IRequest, BaseFieldType, RadioGroupProps {
    fieldNames?: { value?: string; label?: string };
}

export default function ExRadio(props: ExRadioProps & { mode?: 'Image' }) {

    const {read, readValue, formItemProps, fieldNames, request, options, valueEnum, mode, ...other} = props

    const {dataSource} = useRequest(request);

    const list = transformTarget({dataSource, options, valueEnum}, fieldNames);

    if (read) {
        return (!isEmpty(readValue) && list.length)
            ? list.find((item: any) => {
                if (dataType(readValue) === 'boolean') {
                    return item.value === readValue
                }
                return item.value.toString() === readValue.toString()
            })?.label
            : <span>{rem().constants.DEFAULT_VALUE}</span>
    }
    return (
        <div className={classNames({'radio-image-mode': mode === 'Image'})} style={formItemProps?.style}>
            {
                formItemProps
                    ? <ProFormRadio.Group {...formItemProps} fieldProps={other} options={list} className='radio-image'/>
                    : <Radio.Group options={list} {...other} className='radio-image'/>
            }
        </div>
    );
}
