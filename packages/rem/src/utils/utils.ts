export function findDataType(value?: object | string): string {
    let typeValue: string = ''
    const dataType = Object.prototype.toString.call(value)
    switch (dataType) {
        case '[object Undefined]':
            typeValue = 'undefined'
            break;
        case '[object Number]':
            typeValue = 'number'
            break;
        case '[object String]':
            typeValue = 'string'
            break;
        case '[object Object]':
            typeValue = 'object'
            break;
        case '[object Array]':
            typeValue = 'array'
            break;
        case '[object Boolean]':
            typeValue = 'boolean'
            break;
        case '[object Null]':
            typeValue = 'null'
            break;
        case '[object Function]':
            typeValue = 'function'
            break;
        default:
            typeValue = ''
            break;
    }
    return typeValue
}

/**
 * 判断数据类型
 * @param {要验证的值} value
 */
export function dataType(value?: any): string {
    const type = typeof value
    if (type !== 'object') return type;
    return Object.prototype.toString.call({}).replace(/^\[object (\S+)\]$/, '$1').toLowerCase();
}

export function isEmpty(value?: any) {
    if (value === null || value === undefined || value === '') return true;
    return false;
}


