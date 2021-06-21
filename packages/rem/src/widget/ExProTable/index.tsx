import ProTable, {ActionType} from "@ant-design/pro-table";
import React, {useEffect, useRef} from "react";
import {ParamsType} from "@ant-design/pro-provider";
import {ExProTableProps} from "./typing";
import PopupContainer from "../PopupContainer";

export default function ExProTable<T, U extends ParamsType, ValueType = 'text'>(props: ExProTableProps<T, U, ValueType>) {

    const {
        columns,
        popupRef,
        popups,
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

    return <>
        <ProTable columns={columns} actionRef={actionRef} {...userRest} />
        <PopupContainer
            onOkCallback={() => {
                actionRef.current?.clearSelected?.();
                actionRef.current?.reload();
            }}
            popups={popups}
            popupRef={popupRef} />
    </>
}
