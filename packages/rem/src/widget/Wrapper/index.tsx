import React, {useContext, useRef, useState} from "react";
import {Button, message, Space, Steps} from "antd";
import {useHistory} from "react-router-dom";

import {ManualProps} from "../Manual";
import useHandle from "../../hooks/useHandle";

import './index.less'
import ProCard from "@ant-design/pro-card";
import {CloseOutlined} from "@ant-design/icons";
import {PopupContext} from "../PopupContainer";

type WrapperField = {
    //  组件唯一表示
    key: string
    // 标题
    label?: string
    //  表单成员集
    children: any
    // 容器样式
    style?: any
    //  表单说明
    manual?: ManualProps
    //  点击下一步触发回调, 包含最后一步提交也算下一步
    onNext?: <V = any> (values: V, onHandle: any) => Promise<any> | void
}

interface OperationConfig {
    hideCancel?: true;
    cancelText?: string;
    okText?: string;
    nextText?: string;
    prevText?: string
    hidePrevButton?: boolean;
}

type WrapperProps = {
    title?: string,
    //  指示器类型
    indicator?: 'tab' | 'step' | 'card'
    //  指示器位置
    indicatorPosition: 'top' | 'right' | 'bottom' | 'left'
    //  指示器 props
    indicatorProps?: any
    //  表单成员集
    fragments?: WrapperField[];
    //  切换回调
    onChange?: (current: number, selectedOptions: WrapperField) => void;
    //  页面说明
    manual?: ManualProps;
    //  只读
    readonly?: boolean;
    //  关闭监听
    onClose?: any
    //  提交
    onOk?: <V = any> (values: V, onHandle: any) => Promise<any> | void
    //  提交回调
    onOkCallback?: (res: any) => void;
    //  当前
    current?: number
    //  操作配置
    operation?: OperationConfig;
    // 每一个页面都是单独的
    alone?: true
}

export const WrapperContext = React.createContext<| {
    //  监听当前所在模块的下一步操作
    setOnClickNextListener: (listener: Function) => void
    //  获取当前所在模块数据集
    getCurrent: () => any
    //  设置当前所在模块数据集
    setCurrent: (value: any) => void
    //  获取Wrapper所有模块数据集 tips:如果模块间有重复的数据属性, 以最后的模块的为准, 请保证全局的唯一性
    getAll: () => any
    //  获取Wrapper某个模块的数据集
    get: (key: string) => any
}
    | undefined>(undefined);

function Wrapper(props: WrapperProps) {

    const {
        title,
        fragments: validGroups = [],
        // manual,
        readonly,
        onChange,
        indicator,
        // onClose,
        onOk,
        // onOkCallback,
        current: userCurrent = 0,
        operation,
        alone,
        indicatorPosition = 'left',
    } = props;

    const {onClose, onOkCallback} = useContext(PopupContext)

    const [current, setCurrent] = useState(userCurrent);

    const storeRef = useRef<{ [key: string]: { value: any, listeners: Function[] } }>({})

    const {onHandle, isLoading} = useHandle()

    const history = useHistory();

    // const renderManual = () => {
    //     let temp = manual;
    //     if (validGroups && validGroups[current] && validGroups[current].manual) {
    //         temp = validGroups[current].manual
    //     }
    //     return temp && !readonly && <Manual {...temp} type={isSideWay ? 'vertical' : 'horizontal'}/>;
    // };

    const next = (nextCurrent: number) => {
        setCurrent(nextCurrent);
        const obj = validGroups[nextCurrent];
        if (obj) onChange?.(nextCurrent, obj);
    };

    const updateValues = async (index: number) => {
        const {key} = validGroups[index]
        if (storeRef.current[key]) {
            let values = storeRef.current[key]?.value || {}
            if (storeRef.current[key].listeners.length > 0) {
                const results = await Promise.all(storeRef.current[key].listeners.map(listener => listener()));
                results.forEach(item => {
                    values = {...values, ...item}
                })
            }
            const backingOut = await validGroups[index].onNext?.(storeRef.current[key]?.value, onHandle);
            if (backingOut) values = {...values, ...backingOut}
            storeRef.current[key].value = values
            console.log('updateValues', values)
            return values
        }
        return null
    }

    const replay = async () => {
        try {
            let values = {}
            const results = await Promise.all(validGroups.map((_, index) => updateValues(index)));
            results.forEach(item => {
                values = {...values, ...item}
            })
            const result = await onOk?.(values, onHandle)
            await onOkCallback?.(result)
            onClose?.()
        } catch (err) {
            console.log(err)
            if (err.message) message.error(err.message)
        }
    }

    const getValues = () => {
        let temp = {}
        Object.keys(storeRef.current)
            .forEach(key => {
                temp = {...temp, ...storeRef.current[key].value}
            })
        return temp
    }

    const renderHandle = () => {
        const buttons = [];
        if ((current === 0 || alone) && !operation?.hideCancel) {
            buttons.push(
                <Button className={'rem-form-btn'}
                        key="back"
                        onClick={() => {
                            if (onClose) {
                                onClose()
                            } else if (history.length === 1) {
                                window.close()
                            } else {
                                history.goBack()
                            }
                        }}
                >
                    {operation?.cancelText || '返 回'}
                </Button>
            )
        }

        if (!readonly && indicator === 'step' && current > 0 && !operation?.hidePrevButton && !alone) {
            buttons.push(
                <Button
                    className={'rem-form-btn'}
                    key="pre"
                    onClick={() => next(current - 1)}
                >
                    {operation?.prevText || '上一步'}
                </Button>
            )
        }

        if (!readonly && indicator === 'step' && current < validGroups.length - 1) {
            buttons.push(
                <Button
                    className={'rem-form-btn'}
                    key="next"
                    type="primary"
                    loading={isLoading}
                    onClick={async () => {
                        try {
                            await updateValues(current)
                            setCurrent(current + 1)
                        } catch (err) {
                            console.log(err.message)
                            if (err.message) message.error(err.message)
                        }
                    }}>
                    {operation?.nextText || '下一步'}
                </Button>
            )
        }

        if (!readonly && (indicator !== 'step' || current === validGroups.length - 1)) {
            buttons.push(
                <Button
                    className={'rem-form-btn'}
                    loading={isLoading}
                    key="submit"
                    type="primary"
                    onClick={replay}
                >
                    {operation?.okText || '提 交'}
                </Button>
            )
        }

        return <Space>{buttons}</Space>
    }

    const cardProps: any = {
        bordered: false,
        bodyStyle: {padding: 0},
        title: title || validGroups[current]?.label,
        extra: <div onClick={onClose} style={{cursor: "pointer"}}><CloseOutlined/></div>
    };

    const isSideWay = indicatorPosition === 'left' || indicatorPosition === 'right';

    const dom = validGroups.map((child, index) => {

        const divStyle: any = {
            width: '100%',
            display: "flex",
            flexDirection: "column",
        }

        if (indicator === 'step') {
            divStyle.contentVisibility = current === index ? "visible" : "hidden";
        }

        const content = (
            <WrapperContext.Provider key={child.key} value={{
                setOnClickNextListener: (listener => {
                    if (!storeRef.current[child.key]) {
                        storeRef.current[child.key] = {listeners: [], value: {}}
                    }
                    storeRef.current[child.key].listeners.push(listener)
                }),
                getCurrent: () => {
                    return storeRef.current[child.key]?.value;
                },
                setCurrent: (value: any) => {
                    if (!storeRef.current[child.key]) {
                        storeRef.current[child.key] = {listeners: [], value: {}}
                    }
                    storeRef.current[child.key].value = {...storeRef.current[child.key].value, ...value}
                },
                get: (key: string) => {
                    return storeRef.current[key]?.value;
                },
                getAll: getValues
            }}>
                <div style={divStyle}>
                    <div className={'rem-form-wrapper'}>
                        {React.cloneElement(child.children, {global: storeRef.current})}
                    </div>
                    <div className={'rem-form-wrapper-submitter'}>
                        {renderHandle()}
                    </div>
                </div>
            </WrapperContext.Provider>
        )

        if (indicator === "tab" || indicator === 'card') {
            return (
                <ProCard.TabPane tab={child.label} cardProps={{bodyStyle: {padding: 0}}} key={index.toString()}>
                    {content}
                </ProCard.TabPane>
            )
        }

        return content
    })

    let content: any = dom;
    if (indicator === 'step') {
        content = (
            <ProCard {...cardProps}
                     split={isSideWay ? 'vertical' : 'horizontal'}>
                <ProCard colSpan={isSideWay ? 4 : 24}>
                    {
                        <Steps current={current}
                               direction={isSideWay ? 'vertical' : 'horizontal'}
                               size="small"
                               style={{height: isSideWay ? '100%' : 'auto'}}>
                            {validGroups.map((item) => (
                                <Steps.Step title={item.label} key={item.key}/>
                            ))}
                        </Steps>
                    }
                </ProCard>
                <ProCard bodyStyle={{padding: 0}} colSpan={isSideWay ? 20 : 24}>{dom}</ProCard>
            </ProCard>
        )
    } else if (indicator === 'tab' || indicator === 'card') {
        cardProps.tabs = {
            activeKey: current.toString(),
            tabPosition: indicatorPosition,
            type: indicator,
            onChange: setCurrent
        }
        content = <ProCard {...cardProps}>{content}</ProCard>
    }

    return content
}

export default Wrapper