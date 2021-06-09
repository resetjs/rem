import {ProColumnType, ProTableProps} from "@ant-design/pro-table/lib/typing";
import React from "react";
import {FloatActionType} from "../../layouts/FloatLayout";
import {ActionType} from "@ant-design/pro-table";

export declare type ExProColumnType<T = unknown, ValueType = 'text'> =
    { binding?: React.ReactNode, bindingProps?: any, authority?: string } & ProColumnType<T, ValueType>

export declare type ExProColumnGroupType<RecordType, ValueType> =
    { children: ExProColumns<RecordType>[] } & ExProColumnType<RecordType, ValueType>;

export declare type ExProColumns<T = any, ValueType = 'text'> =
    | ExProColumnGroupType<T, ValueType>
    | ExProColumnType<T, ValueType>;

export interface ExProTableProps<T, U, ValueType> extends Omit<ProTableProps<T, U, ValueType>, "columns"> {
    columns?: ExProColumns<T, ValueType>[];
    floatRef?: React.MutableRefObject<FloatActionType>;
    handleCallback?: (actionRef: React.MutableRefObject<ActionType | undefined> | ((actionRef: ActionType) => void)) => void;
}