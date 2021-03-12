import React, {useState} from "react";
import ExModal from "../../../ExModal";
import ExDrawer from "../../../ExDrawer";
import type {ManualProps} from "../../../Manual";
import Manual from "../../../Manual";
import {Button, Menu, message, Radio, Space, Steps, Tabs} from "antd";
import {useHistory} from "react-router-dom";
import useHandle from "../../../../hooks/useHandle";
import type {FormField, RequestOptions} from "../../../../interface";
import FormContent from "../Content";
import {parseCol} from "../../../../utils/transforms";

type ExFormGroupField = {
    //  组件唯一表示
    key: string;
    // 标题
    label?: string;
    //  组件Props
    fieldProps?: any;
    //  表单成员集
    children?: FormField[];
    // 提交
    onSubmit?: <T>(
        onHandle: (params: RequestOptions) => Promise<T>,
        values?: any,
    ) => Promise<boolean>;
    // 容器样式
    style?: any;
    //  表单说明
    manual?: ManualProps;
    //  自定义界面
    render?: React.ReactNode;
    //  隐藏显示
    show?: boolean;
}

type FormWrapperProps = {
    //  指示器类型
    indicator?: 'tabs' | 'step' | 'sideMenu' | 'radio';
    //  指示器 props
    indicatorProps?: any
    //  容器类型
    mode: 'modal' | 'drawer' | 'page';
    //  容器 props
    modeProps: any
    //  表单成员集
    fragments: ExFormGroupField[];
    //  切换回调
    onChange?: (key: string, selectedOptions: ExFormGroupField) => void;
    //  独立页面 (页面没有任何关联性)
    independent?: boolean;
    //  页面说明
    manual?: ManualProps;
    //  只读
    read?: boolean;
    //  唯一标识
    openid: string
    //  关闭监听
    onClose: any
}

export default function FormWrapper(props: FormWrapperProps) {

    const {
        mode = 'page',
        modeProps,
        fragments,
        manual,
        read,
        onChange,
        indicator,
        indicatorProps,
        independent,
        onClose
    } = props

    const [current, setCurrent] = useState(0);
    const history = useHistory();
    const { onHandle} = useHandle();

    const isSideWay = indicator === 'sideMenu' || indicator === 'tabs';

    const validGroups = fragments.filter((item) => !item.hasOwnProperty('show') || item.show) || [];

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
        if (obj) onChange?.(obj.key, obj);
    };

    const renderIndicator = (): React.ReactNode | void => {
        let dom = null;
        switch (indicator) {
            case 'sideMenu':
                dom = (
                    <Menu
                        className={'rem-form-menu'}
                        mode="inline"
                        onClick={(e) => {
                            const temp = parseInt(e.key.toString(), 10);
                            setCurrent(temp);
                            onChange?.(validGroups[temp].key, validGroups[temp]);
                        }}
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
                    <Steps current={current} className={'rem-form-steps'} {...indicatorProps}>
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
                            onChange={(e) => {
                                const temp = parseInt(e.target.value, 10);
                                setCurrent(temp);
                                onChange?.(validGroups[temp].key, validGroups[temp]);
                            }}
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
                        onChange={(key) => {
                            const temp = parseInt(key, 10);
                            setCurrent(temp);
                            onChange?.(validGroups[temp].key, validGroups[temp]);
                        }}
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

    const renderHandle = (form: any, handleSubmit: any, isLoading?: boolean) => {

        const buttons = [];

        if (indicator !== 'step' || indicator !== 'step' && current === 0) {
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
                    返 回
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
                    上一步
                </Button>
            )
        }

        if (!read && indicator === 'step' && current < validGroups.length - 1) {
            buttons.push(
                <Button
                    className={'rem-form-btn'}
                    key="next"
                    type="primary"
                    loading={isLoading}
                    onClick={() => {
                        const keys = validGroups[current]?.children?.map((child) => child.key);
                        form.validateFields(keys).then((values: any) => {
                            if (validGroups[current].onSubmit) {
                                validGroups[current].onSubmit?.(onHandle, values)
                                    .then(() => next(current + 1))
                                    .catch((err) => {
                                        message.error(err.message || err);
                                    });
                            } else {
                                next(current + 1);
                            }
                        });
                    }}
                >
                    下一步
                </Button>
            )
        }

        if (!read && (indicator !== 'step' || current === validGroups.length - 1)) {
            buttons.push(
                <Button
                    className={'rem-form-btn'}
                    loading={isLoading}
                    key="submit"
                    type="primary"
                    onClick={handleSubmit}
                >
                    提 交
                </Button>
            )
        }

        return <Space>{buttons}</Space>
    }

    const layout = mode === 'page' ? 'vertical' : 'horizontal'

    const content = (
        <div className={isSideWay ? 'rem-form-container-menu' : 'rem-form-container'}>
            <div className={isSideWay ? 'rem-form-content-menu' : 'rem-form-content'}>
                {renderIndicator()}
                <div>
                    {indicator === 'sideMenu' && (
                        <h1 className={'rem-form-menu-title'}>{validGroups[current].label}</h1>
                    )}
                    <FormContent renderHandle={renderHandle}
                                 style={validGroups[current]?.style || {width: mode === 'page' ? '640px' : '100%'}}
                                 {...(layout === 'horizontal' ? parseCol(4, 20) : parseCol(24, 24))}
                                 layout={layout}/>
                </div>
            </div>
            {renderManual()}
        </div>
    )

    switch (mode) {
        case "modal":
            return <ExModal {...modeProps}>{content}</ExModal>
        case "drawer":
            return <ExDrawer {...modeProps}>{content}</ExDrawer>
        default:
            return <div className={'rem-form-container'}>{content}</div>
    }

}
