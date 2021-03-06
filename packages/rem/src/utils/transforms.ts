import moment from 'moment';
import { findDataType } from './utils';

function transformTarget(
  targets: { dataSource: any; options: any; valueEnum: any },
  fieldNames?: { label?: string; value?: string; children?: string },
) {
  const { dataSource, options, valueEnum } = targets;
  let list = [];
  if (dataSource) {
    list = transformDatas(dataSource, fieldNames);
  } else if (options) {
    list = transformDatas(options, fieldNames);
  } else if (valueEnum) {
    list = objectToArray(valueEnum);
  }
  return list;
}

function parseValueEnum(list: any[], labelKey: any, valueKey: any) {
  const obj: any = {};
  for (let i = 0; i < list.length; i += 1) {
    obj[list[i][valueKey]] = list[i][labelKey];
  }
  return obj;
}

function objectToArray(valueEnum: object) {
  const list: { label: any; value: string }[] = [];
  if(valueEnum) {
    Object.keys(valueEnum).forEach((key) => {
      list.push({ label: valueEnum[key], value: key });
    });
  }
  return list;
}

function transformDatas(
  list: any[] = [],
  fieldNames?: { value?: string; label?: string; children?: string; labelKey?: string },
  suffix?: string,
) {
  if (!list || !list.length) return []
  return list.map((item: any) => {

    const label = item[fieldNames?.label || 'label'] || item['name']

    const format: any = {
      value: item[fieldNames?.value || 'value'],
      [fieldNames?.labelKey || 'label']: findDataType(label) === 'object'? label : String(label) + (suffix || ''),
      disabled: item.disabled,
    }

    const children = item[fieldNames?.children || 'children'];
    if (children) {
      format.children = transformDatas(children, fieldNames);
    }

    return format
  })
}

function parseCol(label: number | string = 24, wrapper: number | string = 24) {
  return {
    labelCol: { span: label, offset: 0 },
    wrapperCol: { span: wrapper, offset: 0 },
  };
}

function formatToArray(value: any, separator = ',') {
  if (value && typeof value === 'string') {
    return value.split(separator);
  }
  if (value && Object.prototype.toString.call(value) === '[object Array]') {
    return value;
  }
  return undefined;
}

function formatMoment(obj: any, options?: { format?: string; extra?: string }) {
  let temp = '';
  const format = options?.format || 'yyyy-MM-DD';
  if (format === 'yyyy-MM-DD' && !options?.hasOwnProperty('extra')) temp = ' 00:00:00';
  if (obj) {
    if (moment.isMoment(obj)) {
      return obj.format(format) + temp;
    }
    return moment(obj).format(format) + temp;
  }
  return null;
}

function formatUploadValue(values: string | string[]) {
  let temp: any[] = []
  if (values) {
    if (Array.isArray(values)) {
      temp = values?.map((url, position) =>
          typeof url === 'string'
              ? {uid: position, name: url.substring(url.lastIndexOf('/') + 1), status: 'done', url}
              : url,
      );
    } else {
      temp = [{uid: '-1', name: values.substring(values.lastIndexOf('/') + 1), status: 'done', url: values}];
    }
  }
  return temp;
}

function parseUploadValue(values: any | string[]) {
  if (values && Array.isArray(values)) {
    return values
        .filter((item) => item.status && item.status === 'done')
        .map((item) => item.url || item.response)
        .join(',');
  }
  return values?.status === 'done' ? values.url || values.response : values;
}

export {
  parseUploadValue,
  formatUploadValue,
  parseValueEnum,
  transformDatas,
  parseCol,
  formatToArray,
  formatMoment,
  objectToArray,
  transformTarget,
};
