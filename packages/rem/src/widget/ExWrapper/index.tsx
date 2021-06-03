import React, {useEffect, useRef, useState} from "react";
import {Button, Card, Menu, message, Radio, Space, Steps, Tabs} from "antd";
import {useHistory} from "react-router-dom";

import Manual, {ManualProps} from "../Manual";
import useHandle from "../../hooks/useHandle";
import PopupWindow from "../PopupWindow";

import './index.less'

type ExWrapperField = {
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

type ExWrapperProps = {
    //  指示器类型
    indicator?: 'tabs' | 'step' | 'sideMenu' | 'radio';
    //  指示器 props
    indicatorProps?: any
    //  容器类型
    mode?: 'modal' | 'drawer';
    //  容器 props
    modeProps?: any
    //  表单成员集
    fragments?: ExWrapperField[];
    //  切换回调
    onChange?: (current: number, selectedOptions: ExWrapperField) => void;
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
    //  是否显示
    visible?: boolean
    //  当前
    current?: number
    //  操作配置
    operation?: OperationConfig;
    // 每一个页面都是单独的
    alone?: true
}

export const ExWrapperContext = React.createContext<| {
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

function ExWrapper(props: ExWrapperProps) {

    const {
        mode,
        fragments: validGroups = [],
        manual,
        readonly,
        onChange,
        indicator,
        indicatorProps,
        onClose,
        modeProps: userModeProps,
        visible,
        onOk,
        onOkCallback,
        current: userCurrent = 0,
        operation,
        alone
    } = props;

    const [current, setCurrent] = useState(userCurrent);

    const storeRef = useRef<{ [key: string]: { value: any, listeners: Function[] } }>({})

    const {onHandle, isLoading} = useHandle()

    useEffect(() => {
        if (!visible && mode) {
            setCurrent(0);
        }
    }, [visible])


    const history = useHistory();

    const isSideWay = indicator === 'sideMenu' || indicator === 'tabs';

    const renderManual = () => {
        let temp = manual;
        if (validGroups && validGroups[current] && validGroups[current].manual) {
            temp = validGroups[current].manual
        }
        return temp && !readonly && <Manual {...temp} type={isSideWay ? 'vertical' : 'horizontal'}/>;
    };

    const next = (nextCurrent: number) => {
        setCurrent(nextCurrent);
        const obj = validGroups[nextCurrent];
        if (obj) onChange?.(nextCurrent, obj);
    };

    const renderIndicator = (): React.ReactNode | void => {
        let dom = null;
        switch (indicator) {
            case 'sideMenu':
                dom = (
                    <Menu
                        className={'rem-form-menu'}
                        mode="inline"
                        onClick={(e) => next(parseInt(e.key.toString(), 10))}
                        selectedKeys={[current.toString()]}
                        {...indicatorProps}
                    >
                        {validGroups.map((item, position) => (
                            <Menu.Item key={position}>{item.label}</Menu.Item>
                        ))}
                    </Menu>
                );
                break;
            case 'step':
                dom = (
                    <Steps current={current} style={{width: `${(validGroups?.length || 0) * 200}px`}}
                           className={'rem-form-steps'} {...indicatorProps}>
                        {validGroups.map((item) => (
                            <Steps.Step title={item.label} key={item.key}/>
                        ))}
                    </Steps>
                );
                break;
            case 'radio':
                dom = (
                    <div className={'rem-form-radio'}>
                        <Radio.Group
                            onChange={(e) => next(parseInt(e.target.value, 10))}
                            value={current.toString()}
                            optionType="button"
                            buttonStyle="solid"
                            {...indicatorProps}
                        >
                            {validGroups.map((item, index) => (
                                <Radio.Button key={`${index}`} value={`${index}`}>
                                    {item.label}
                                </Radio.Button>
                            ))}
                        </Radio.Group>
                    </div>
                );
                break;
            case 'tabs':
                dom = (
                    <Tabs
                        size="small"
                        className={'rem-form-tabs'}
                        tabPosition="left"
                        activeKey={current.toString()}
                        onChange={(key) => next(parseInt(key, 10))}
                        {...indicatorProps}
                    >
                        {validGroups.map((item, index) => (
                            <Tabs.TabPane key={`${index}`} tab={item.label}/>
                        ))}
                    </Tabs>
                );
                break;
            default:
                break;
        }
        return dom;
    };

    const updateValues = async () => {
        const {key} = validGroups[current]
        if (storeRef.current[key] && storeRef.current[key].listeners.length > 0) {
            const results = await Promise.all(storeRef.current[key].listeners.map(listener => listener()));
            results.forEach(item => {
                storeRef.current[key].value = {...storeRef.current[key].value, ...item};
            })
        }
        await validGroups[current].onNext?.(storeRef.current[key]?.value, onHandle);
    }

    const getValues = () => {
        let values = {};
        Object.keys(storeRef.current).forEach(key => {
            values = {...values, ...storeRef.current[key].value}
        })
        return values;
    }

    const renderHandle = () => {
        const buttons = [];
        if ((current === 0 || alone) && !operation?.hideCancel) {
            buttons.push(
                <Button className={'rem-form-btn'}
                        key="back"
                        onClick={() => {
                            if (mode === "modal" || mode === "drawer") {
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
                            await updateValues()
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
                    onClick={async () => {
                        try {
                            await updateValues()
                            const result = await onOk?.(getValues(), onHandle)
                            await onOkCallback?.(result)
                            onClose?.()
                        } catch (err) {
                            console.log(err.message)
                            if (err.message) message.error(err.message)
                        }
                    }}
                >
                    {operation?.okText || '提 交'}
                </Button>
            )
        }

        return <Space>{buttons}</Space>
    }

    const content = (
        <Card bordered={false} bodyStyle={{padding: 0}}>
            <div className={isSideWay ? 'rem-form-container-menu' : 'rem-form-container'}>
                <div className={isSideWay ? 'rem-form-content-menu' : 'rem-form-content'}>
                    {renderIndicator()}
                    {
                        validGroups.map((child, index) => {
                            return (
                                <ExWrapperContext.Provider key={child.key} value={{
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
                                    <div
                                        style={{
                                            width: '100%',
                                            display: "flex",
                                            flexDirection: "column",
                                            contentVisibility: current === index ? "visible" : "hidden",
                                            alignItems: indicator === 'sideMenu' ? 'flex-start' : 'center',
                                        }}>
                                        {indicator === 'sideMenu' && (
                                            <h1 className={'rem-form-menu-title'}>{child.label}</h1>
                                        )}
                                        {child.children}
                                    </div>
                                </ExWrapperContext.Provider>
                            )
                        })
                    }
                </div>
                {renderManual()}
            </div>
            <div className={'rem-form-wrapper-submitter'}>
                {renderHandle()}
            </div>
        </Card>
    )

    const modeProps: any = {
        mode,
        ...userModeProps,
        visible,
        onClose,
        bodyStyle: {padding: 0},
        footer: mode === 'modal' && readonly ? false : renderHandle()
    };

    switch (mode) {
        case "modal":
        case "drawer":
            return <PopupWindow {...modeProps}>{content}</PopupWindow>
        default:
            return content
    }

}

export default ExWrapper