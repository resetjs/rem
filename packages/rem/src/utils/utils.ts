

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
