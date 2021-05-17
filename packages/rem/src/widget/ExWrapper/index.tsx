import React, {useEffect, useState} from "react";
import {Button, Card, Menu, message, Radio, Space, Steps, Tabs} from "antd";
import {useHistory} from "react-router-dom";
import {ExDrawer, ExModal, Manual, RequestOptions} from "@/rem";
import {ManualProps} from "@/rem/widget/Manual";

import './index.less'

type ExFormGroupField = {
    //  组件唯一表示
    key: string
    // 标题
    label?: string
    //  组件Props
    fieldProps?: any
    //  表单成员集
    children: React.ReactNode
    // 提交
    onSubmit?: (values: any | undefined, onHandle: (opts: RequestOptions) => Promise<any>) => Promise<any>
    // 容器样式
    style?: any
    //  表单说明
    manual?: ManualProps
    //  自定义界面
    render?: React.ReactNode
    //  隐藏显示
    show?: boolean
}

interface OperationConfig {
    hideCancel?: true;
    cancelText?: string;
    okText?: string;
    nextText?: string;
    prevText?: string
}

export type FormWrapperProps = {
    //  指示器类型
    indicator?: 'tabs' | 'step' | 'sideMenu' | 'radio';
    //  指示器 props
    indicatorProps?: any
    //  容器类型
    mode: 'modal' | 'drawer' | 'page';
    //  容器 props
    modeProps?: any
    //  表单成员集
    fragments?: ExFormGroupField[];
    //  切换回调
    onChange?: (current: number, selectedOptions: ExFormGroupField) => void;
    //  独立页面 (页面没有任何关联性)
    independent?: boolean;
    //  页面说明
    manual?: ManualProps;
    //  只读
    read?: boolean;
    //  关闭监听
    onClose?: any
    // 内容
    children?: React.ReactNode
    //  底部视图
    footer?: (dom: React.ReactNode) => React.ReactNode
    //  确认 loading
    confirmLoading?: boolean
    //  提交
    onOk?: () => void
    //  下一步
    onNext?: (index: number) => Promise<any>
    //  是否显示
    visible?: boolean
    //  当前
    current?: number
    //  操作配置
    operation?: OperationConfig;
    // 尾布局
    tailLayout?: any
}

export default function ExWrapper(props: FormWrapperProps) {

    const {
        mode = 'page',
        fragments,
        manual,
        read,
        onChange,
        indicator,
        indicatorProps,
        independent,
        onClose,
        modeProps: userModeProps,
        confirmLoading,
        visible,
        onOk,
        current: userCurrent = 0,
        onNext,
        operation,
    } = props

    const [current, setCurrent] = useState(userCurrent);

    useEffect(() => {
        if (!visible && mode !== 'page') {
            setCurrent(0);
        }
    }, [visible])

    const history = useHistory();

    const isSideWay = indicator === 'sideMenu' || indicator === 'tabs';

    const validGroups = fragments?.filter((item) => !item.hasOwnProperty('show') || item.show) || [];

    const renderManual = () => {
        let temp = manual;
        if (validGroups && validGroups[current] && validGroups[current].manual) {
            temp = validGroups[current].manual
        }
        return temp && !read && <Manual {...temp} type={isSideWay ? 'vertical' : 'horizontal'}/>;
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
                    <Steps current={current} style={{width: `${(fragments?.length || 0) * 200}px`}}
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

    const renderHandle = () => {

        const buttons = [];

        if (!operation?.hideCancel && (indicator !== 'step' || indicator !== 'step' && current === 0)) {
            buttons.push(
                <Button className={'rem-form-btn'}
                        key="back"
                        onClick={() => {
                            if (mode === "page") {
                                if (history.length === 1) {
                                    window.close()
                                } else {
                                    history.goBack()
                                }
                            } else {
                                onClose()
                            }
                        }}
                >
                    {operation?.cancelText || '返 回'}
                </Button>
            )
        }

        if (!read && indicator === 'step' && current > 0 && !independent) {
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

        if (!read && indicator === 'step' && current < validGroups.length - 1) {
            buttons.push(
                <Button
                    className={'rem-form-btn'}
                    key="next"
                    type="primary"
                    loading={confirmLoading}
                    onClick={() => {
                        if (onNext) {
                            onNext?.(current)
                                .then(() => setCurrent(current + 1))
                                .catch(err => {
                                    console.log('------------------next err---------------');
                                    console.log(err);
                                    message.error(err?.message || '点击下一步失败, 请稍后重试!')
                                })
                        } else {
                            setCurrent(current + 1)
                        }
                    }}>
                    {operation?.nextText || '下一步'}
                </Button>
            )
        }

        if (!read && (indicator !== 'step' || current === validGroups.length - 1)) {
            buttons.push(
                <Button
                    className={'rem-form-btn'}
                    loading={confirmLoading}
                    key="submit"
                    type="primary"
                    onClick={onOk}
                >
                    {operation?.okText || '提 交'}
                </Button>
            )
        }

        return <Space>{buttons}</Space>
    }

    const content = (
        <Card bordered={false} bodyStyle={{padding:0}}>
            <div className={isSideWay ? 'rem-form-container-menu' : 'rem-form-container'}>
                <div className={isSideWay ? 'rem-form-content-menu' : 'rem-form-content'}>
                    {renderIndicator()}
                    <div
                      style={{
                        width: '100%',
                        display: "flex",
                        flexDirection: "column",
                        alignItems: indicator === 'sideMenu' ? 'flex-start': 'center',
                      }}>
                        {indicator === 'sideMenu' && (
                            <h1 className={'rem-form-menu-title'}>{validGroups[current].label}</h1>
                        )}
                        {validGroups[current].children}
                    </div>
                </div>
                {renderManual()}
            </div>
            <div className={'rem-form-wrapper-submitter'}>
                {renderHandle()}
            </div>
        </Card>
    )

    const modeProps: any = {
        ...userModeProps,
        visible,
        onClose,
        bodyStyle: {padding: 0},
        footer: mode === 'modal' && read ? false : renderHandle()
    };

    switch (mode) {
        case "modal":
            return <ExModal {...modeProps}>{content}</ExModal>
        case "drawer":
            return <ExDrawer {...modeProps}>{content}</ExDrawer>
        default:
            return content
    }

}
