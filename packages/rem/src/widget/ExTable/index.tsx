import React, {useEffect, useRef, useState} from 'react';
import type {ActionType, ProColumns} from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type {FloatActionType, FloatType} from '../../layouts/FloatLayout';
import FloatLayout from '../../layouts/FloatLayout';
import type {IAuthority, RequestOptions, TableField} from '../../interface';
import {Button, Dropdown, Menu, Space} from 'antd';
import type {ProTableProps} from '@ant-design/pro-table/lib/typing';
import type {ParamsType} from '@ant-design/pro-provider';
import Factory from '../../utils/factory';
import useHandle from '../../hooks/useHandle';
import ElementContainer from '../../layouts/ElementContainer';
import type {TableAlertProps} from '@ant-design/pro-table/lib/components/Alert';
import type {SearchProps} from 'antd/lib/input';
import getRem from '../../rem';

export interface ExTableProps<T, U, ValueType> extends ProTableProps<T, U, ValueType>, IAuthority {
    simpleSearch?:
        | (SearchProps & {
        name?: string;
    })
        | boolean;
    actionRef?: React.MutableRefObject<ActionType | undefined>;
    floatRef?: React.MutableRefObject<FloatActionType>;
    columnFields: TableField<T>[];
    toolbarFields?: TableField<T>[];
    operationFields?: TableField<T>[];
    alertFields?: TableField<TableAlertProps<T>>[];
    handleCallback?: (actionRef: React.MutableRefObject<ActionType | undefined>) => void;
    floatDataSource?: FloatType[];
    selectedRows?: any[];
    selectedRowKeys?: string[];
}

function findFloatComponent(field: TableField, floats: FloatType[]) {
    if (field.floatComponent) {
        floats.push({
            component: field.floatComponent,
            openid: field.key,
            authority: field.authority,
            componentProps: field.floatProps,
        });
    }
}

const ExTable = <T extends Record<string, any>, U extends ParamsType = {}, ValueType = 'text'>(props: ExTableProps<T, U, ValueType> & { defaultClassName: string; },
) => {
    const {
        simpleSearch,
        rowKey,
        handleCallback,
        authority,
        columnFields,
        toolbarFields,
        alertFields,
        operationFields,
        toolBarRender,
        selectedRows: sRows,
        selectedRowKeys,
        search,
        actionRef: propsActionRef,
        floatRef: propsFloatRef,
        ...other
    } = props;

    const defaultActionRef = useRef<ActionType>();
    const actionRef = propsActionRef || defaultActionRef;

    const defaultFloatRef = useRef<FloatActionType>();
    const floatRef = defaultFloatRef || defaultActionRef;

    const [advancedSearch, setAdvancedSearch] = useState(false);

    const {onHandle} = useHandle();

    const {checkAuthority} = getRem().permission;

    const [actionVisibleIndex, setActionVisibleIndex] = useState(-1);
    const [selectedRows, setSelectedRows] = useState<any[]>(sRows || []);
    const [selectedKeys, setSelectedKes] = useState<string[]>(selectedRowKeys || []);

    const defaultHandleCallback = (res: any) => {
        if (handleCallback) {
            handleCallback(actionRef);
        } else {
            actionRef?.current?.clearSelected?.();
            actionRef.current?.reload();
        }
        return res;
    };

    const onHandleToRefresh = (opts: RequestOptions) => {
        return onHandle(opts).then(defaultHandleCallback);
    };

    const transformField = (field: any, entity: any, defaultProps?: any) => {
        const {componentProps, ...rest} = field;
        const newField = rest;
        newField.componentProps = defaultProps;
        if (field.componentProps && typeof field.componentProps === 'function') {
            newField.componentProps = {
                ...defaultProps,
                ...componentProps?.(entity, onHandleToRefresh, actionRef, floatRef),
            };
        } else if (field.componentProps) {
            newField.componentProps = {...defaultProps, ...componentProps};
        }
        return newField;
    };

    const parseProColumn = (field: TableField): ProColumns => {
        const {columnsProps, componentName, render, valueEnum} = field;
        const column: ProColumns = {
            key: field.key,
            title: field.label,
            dataIndex: field.key,
            search: field.search,
            hideInTable:
                checkAuthority(field.authority) && field.hasOwnProperty('show') ? !field.show : false,
            valueEnum,
            ...columnsProps,
        };
        column.render = (dom, entity, index, action) => {
            let current = dom;
            if (componentName) {
                const trigger = (openid: string) => floatRef.current?.open(openid, entity);
                current = Factory.createField(transformField(field, entity), {
                    optionProps: {trigger, entity},
                });
            }
            if (render) current = render?.(current, entity, action, floatRef.current!!);
            return current;
        };
        return column;
    };

    const onDropdownVisibleChange = (flag: boolean, index: number) => {
        setActionVisibleIndex(flag ? index : -1);
    };

    const tableProps: ProTableProps<T, U, ValueType> = {
        rowKey: rowKey || 'id',
        actionRef,
    };

    const [floats, setFloats] = useState<FloatType[]>();

    useEffect(() => {
        const temp = props.floatDataSource || [];
        columnFields?.map((item) => findFloatComponent(item, temp));
        operationFields?.map((item) => findFloatComponent(item, temp));
        toolbarFields?.map((item) => findFloatComponent(item, temp));
        alertFields?.map((item) => findFloatComponent(item, temp));
        setFloats(temp);
    }, []);

    if (columnFields && columnFields.length > 0) {
        const tableColumn = columnFields?.map<ProColumns>((item) => parseProColumn(item));
        if (operationFields && operationFields.length > 0) {
            tableColumn.push({
                title: '操作',
                key: 'option',
                width: 300,
                align: 'center',
                valueType: 'option',
                render: (dom: React.ReactNode, entity: T, index) => {
                    const list = operationFields.map((field) =>
                        transformField(field, entity, {
                            size: 'small',
                            ghost: 'true',
                            type: 'primary',
                        }),
                    );
                    const trigger = (openid: string) => floatRef.current?.open(openid, entity);
                    let arr: any = [];
                    const optionProps = {trigger, entity};
                    if (list.length > 4) {
                        //  超过3个按钮, 替换更多展开形式
                        for (let i = 0; i < 3; i += 1) {
                            const field = Factory.createField(list[i], {optionProps});
                            if (field) arr.push(field);
                        }
                        const menus: any = [];
                        for (let i = 3; i < list.length; i += 1) {
                            const temp = list[i];
                            if (temp.componentName === 'Button') {
                                temp.componentProps = {...temp.componentProps, type: 'link'};
                            } else if (
                                temp.componentName === 'Popconfirm' &&
                                temp.componentProps &&
                                temp.componentProps.children
                            ) {
                                temp.componentProps.children = (
                                    <Button {...temp.componentProps} type={'link'} danger>
                                        {temp.content}
                                    </Button>
                                );
                            }
                            const field = Factory.createField(temp, {optionProps});
                            if (field) menus.push(<Menu.Item key={temp.key}>{field}</Menu.Item>);
                        }
                        arr.push(
                            <Dropdown
                                key={'action-more'}
                                visible={index === actionVisibleIndex}
                                onVisibleChange={(flag) => onDropdownVisibleChange(flag, index)}
                                overlay={<Menu>{menus}</Menu>}
                            >
                                <Button type={'primary'} size={'small'} ghost>
                                    更多
                                </Button>
                            </Dropdown>,
                        );
                    } else {
                        arr = Factory.createTableFields(list, {trigger, entity});
                    }
                    return arr;
                },
            });
        }
        tableProps.columns = tableColumn;
    }

    const showSearch = (!props.hasOwnProperty('search') || props.search) && simpleSearch;

    if (simpleSearch) {
        let temp: any = simpleSearch;
        if (showSearch) temp = advancedSearch ? false : simpleSearch;
        tableProps.options = {search: temp};
    }

    if (!props.hasOwnProperty('toolBarRender') || toolBarRender !== false) {
        tableProps.toolBarRender = (action, rows) => {
            const render: React.ReactNode[] = [];

            if (showSearch && !advancedSearch) {
                render.push(
                    <Button key={'filter'} type={'link'} onClick={() => setAdvancedSearch(!advancedSearch)}>
                        开启筛选
                    </Button>,
                );
            }

            if (toolBarRender) {
                render.push(toolBarRender(action, rows));
            }

            if (toolbarFields) {
                const list = toolbarFields.map((field) => transformField(field, null));
                const trigger = (openid: string) => floatRef.current?.open(openid);
                render.push(Factory.createTableFields(list, {trigger}));
            }

            return render;
        };
    }

    if (alertFields && alertFields?.length > 0) {
        tableProps.rowSelection = {
            selectedRowKeys: selectedKeys,
            onSelect: (record: any, selected: boolean) => {
                const rowKeyId = typeof rowKey === 'string' ? record[rowKey] : 'id';
                if (selected) {
                    setSelectedKes([...selectedKeys, record[rowKeyId]]);
                    setSelectedRows([...selectedRows, record]);
                } else {
                    const newKeys = selectedKeys
                        .map((value) => (record[rowKeyId] === value ? '' : value))
                        .filter((e) => e);
                    const newRows = selectedRows
                        .map((item: any) => (record[rowKeyId] === item[rowKeyId] ? '' : item))
                        .filter((e) => e);
                    setSelectedKes([...newKeys]);
                    setSelectedRows([...newRows]);
                }
            },
            onSelectAll: (selected: boolean, rows: T[]) => {
                const rowKeyId = typeof rowKey === 'string' ? rowKey : 'id';
                const newRows = rows?.length ? rows.filter((e) => e) : [];
                setSelectedKes(selected ? newRows.map((item: any) => item[rowKeyId]) : []);
                setSelectedRows(selected ? newRows : []);
            },
        };
        tableProps.tableAlertOptionRender = (entity) => {
            const temp = entity;
            temp.selectedRows = selectedRows;
            const list = alertFields?.map((field) => transformField(field, temp)) || [];
            return <Space size={16}>{Factory.createTableFields(list)}</Space>;
        };
    }

    const customSearch: any = {
        defaultCollapsed: false,
        optionRender: (searchConfig: any, _props: { form: any }, dom: React.ReactNode[]) => [
            ...dom,
            <Button type={'link'} key="close" onClick={() => setAdvancedSearch(false)}>
                关闭筛选
            </Button>,
        ],
    };

    let tableSearchRender = search;
    if (showSearch) tableSearchRender = advancedSearch ? customSearch : false;

    return (
        <ElementContainer authority={props.authority} showNoMatch={true}>
            <ProTable<T, U, ValueType> {...tableProps} {...other} search={tableSearchRender}/>
            <FloatLayout floatRef={floatRef} handleCallback={defaultHandleCallback} dataSource={floats}/>
        </ElementContainer>
    );
}

export default ExTable
