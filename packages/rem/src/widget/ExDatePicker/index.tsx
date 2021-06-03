import type { BaseFieldType } from '../../interface';
import React from 'react';
import {
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormDateTimePicker,
  ProFormDateTimeRangePicker,
  ProFormTimePicker,
} from '@ant-design/pro-form';
import { DatePicker, TimePicker } from 'antd';
import type { DatePickerProps } from 'antd/lib/date-picker';
import { formatMoment } from '../../utils/transforms';
import rem from '../../rem';

interface ExDatePickerProps extends BaseFieldType {
  type?: 'DatePicker' | 'DateRangePicker' | 'TimePicker' | 'DateTimeRangePicker' | 'DateTimePicker';
}

export default function ExDatePicker(props: ExDatePickerProps & DatePickerProps) {
  const { readonly, readonlyValue, formItemProps, type, ...other } = props;

  const format = typeof other.format === 'string' ? other.format : 'YYYY-MM-DD';

  const content = () => {
    switch (type) {
      case 'DateRangePicker':
        return formItemProps ? (
          <ProFormDateRangePicker {...formItemProps} fieldProps={other} />
        ) : (
          <DatePicker {...other} />
        );

      case 'TimePicker':
        return formItemProps ? (
          <ProFormTimePicker {...formItemProps} fieldProps={other} />
        ) : (
          <TimePicker {...other} />
        );

      case 'DateTimeRangePicker':
        // @ts-ignore
        return formItemProps ? <ProFormDateTimeRangePicker {...formItemProps} fieldProps={other} /> : <DatePicker {...other} />;

      case 'DateTimePicker':
        return formItemProps ? (
          <ProFormDateTimePicker {...formItemProps} fieldProps={other} />
        ) : (
          <DatePicker {...other} />
        );

      default:
        return formItemProps ? (
          <ProFormDatePicker {...formItemProps} fieldProps={other} />
        ) : (
          <DatePicker {...other} />
        );
    }
  };

  return readonly ? (
    <>
      {readonlyValue ? (
        <div>{formatMoment(readonlyValue, { format, extra: '' })}</div>
      ) : (
        rem().constants.DEFAULT_VALUE
      )}
    </>
  ) : (
    content()
  );
}
