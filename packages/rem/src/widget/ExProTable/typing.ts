import {ProColumnType, ProTableProps} from "@ant-design/pro-table/lib/typing";
import React from "react";
import {ActionType} from "@ant-design/pro-table";
import {PopupContainerProps} from "../PopupContainer";

export declare type ExProColumnType<T = unknown, ValueType = 'text'> =
    { binding?: React.ReactNode, bindingProps?: any, authority?: string } & ProColumnType<T, ValueType>

export declare type ExProColumnGroupType<RecordType, ValueType> =
    { children: ExProColumns<RecordType>[] } & ExProColumnType<RecordType, ValueType>;

export declare type ExProColumns<T = any, ValueType = 'text'> =
    | ExProColumnGroupType<T, ValueType>
    | ExProColumnType<T, ValueType>;

export interface ExProTableProps<T, U, ValueType> extends Omit<ProTableProps<T, U, ValueType>, "columns">, PopupContainerProps {
    columns?: ExProColumns<T, ValueType>[];
    handleCallback?: (actionRef: React.MutableRefObject<ActionType | undefined> | ((actionRef: ActionType) => void)) => void;
}