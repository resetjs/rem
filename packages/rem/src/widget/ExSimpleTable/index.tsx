import ProTable, {ActionType, ProTableProps} from "@ant-design/pro-table";
import React, {useEffect, useMemo, useRef} from "react";
import {ParamsType} from "@ant-design/pro-provider";
import {ProColumns} from "@ant-design/pro-table/lib/typing";
import FloatLayout, {FloatActionType, FloatType} from "../../layouts/FloatLayout";

export interface ExSimpleTableProps<T, ValueType> {
    columns: (ProColumns<T, ValueType> & {
        binding?: React.ReactNode,
        bindingProps?: any,
        authority?: string
    })[]
    floatRef?: React.MutableRefObject<FloatActionType>;
    handleCallback?: (actionRef: React.MutableRefObject<ActionType | undefined> | ((actionRef: ActionType) => void)) => void;
}


export default function ExSimpleTable<T, U extends ParamsType, ValueType = 'text'>(props: Omit<ProTableProps<T, U, ValueType>, "columns"> & ExSimpleTableProps<T, ValueType>) {
    const {
        columns,
        floatRef: propsFloatRef,
        actionRef: propsActionRef,
        handleCallback,
        ...userRest
    } = props

    const actionRef = useRef<ActionType>();

    useEffect(() => {
        if (typeof propsActionRef === 'function' && actionRef.current) {
            propsActionRef(actionRef.current);
        }
    }, [propsActionRef]);

    if (propsActionRef && typeof propsActionRef !== "function") {
        propsActionRef.current = actionRef.current;
    }

    const defaultFloatRef = useRef<FloatActionType>();
    const floatRef = defaultFloatRef;

    const [components, proColumns, defaultHandleCallback] = useMemo(() => {
        const arr: FloatType[] = [];
        const temp = columns?.map(item => {
            const {binding, bindingProps, authority, ...rest} = item;
            const newItem = rest
            if (item.binding) {
                arr.push({
                    component: binding,
                    componentProps: bindingProps,
                    authority,
                    openid: item.key!!.toString(),
                })

                newItem.render = (dom: React.ReactNode, entity: T, index, action, schema) => {
                    let content = dom
                    if (item.render) {
                        content = item.render(dom, entity, index, action, schema)
                    }
                    return <div onClick={() => {
                        floatRef.current?.open(item.key!!.toString(), entity)
                    }}>{content}</div>
                }
            }
            return newItem;
        })

        const callback = (res: any) => {
            if (handleCallback) {
                handleCallback(actionRef);
            } else {
                actionRef.current?.clearSelected?.();
                actionRef.current?.reload();
            }
            return res;
        };

        return [arr, temp, callback]
    }, [])

    return (
        <>
            <ProTable columns={proColumns} actionRef={propsActionRef} {...userRest} />
            <FloatLayout floatRef={floatRef} handleCallback={defaultHandleCallback} dataSource={components}/>
        </>
    )
}
