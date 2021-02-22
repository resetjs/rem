import React from 'react';
import { Radio } from 'antd';
import classNames from 'classnames';
import { ProFormRadio } from '@ant-design/pro-form';
import useRequest from '../../hooks/useRequest';
import { BaseFieldType, IRequest } from '../../interface';
import { RadioGroupProps } from 'antd/lib/radio/interface';
import { transformDatas, transformTarget } from '../../utils/transforms';
import rem from '../../rem';

/**
 * @description:
 * @author: Freddy.Zhou
 * @create: 2020-10-16 10:33
 * */

export interface ExRadioProps extends IRequest, BaseFieldType, RadioGroupProps {
  fieldNames?: { value?: string, label?: string }
}

export default function ExRadio(props: ExRadioProps & { mode?: 'Image' }) {

  const { read, readValue, formItemProps, fieldNames, request, options, valueEnum, mode, ...other } = props;
  const { dataSource } = useRequest(request);

  const list = transformTarget({ dataSource, options, valueEnum }, fieldNames);

  return read
    ? readValue
      ? list.find((item: any) => item.value.toString() === readValue.toString())?.label
      : <span>{rem.constants.DEFAULT_VALUE}</span>
    : <div className={classNames({ 'radio-image-mode': mode === 'Image' })}>
      {
        formItemProps
          ? <ProFormRadio.Group {...formItemProps} fieldProps={other} options={list} className='radio-image' />
          : <Radio.Group options={list} {...other} className='radio-image' />
      }
    </div>;
}
