import React, {cloneElement, ReactElement, useEffect, useRef, useState} from "react";
import {Button, Card, Menu, message, Radio, Space, Steps, Tabs} from "antd";
import {useHistory} from "react-router-dom";
import {ExDrawer, ExModal, Manual, useHandle} from "@/rem";
import {ManualProps} from "@/rem/widget/Manual";

import './index.less'

type ExWrapperField = {
  //  组件唯一表示
  key: string
  // 标题
  label?: string
  //  表单成员集
  children: ReactElement
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

export type ExWrapperProps = {
  //  指示器类型
  indicator?: 'tabs' | 'step' | 'sideMenu' | 'radio';
  //  指示器 props
  indicatorProps?: any
  //  容器类型
  mode?: 'modal' | 'drawer' | 'page';
  //  容器 props
  modeProps?: any
  //  表单成员集
  fragments: ExWrapperField[];
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
}

export default function ExWrapper(props: ExWrapperProps) {

  const {
    mode = 'page',
    fragments: validGroups,
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
  } = props

  const [current, setCurrent] = useState(userCurrent);

  const {onHandle, isLoading} = useHandle()

  const valuesRef = useRef({})

  useEffect(() => {
    if (!visible && mode !== 'page') {
      setCurrent(0);
    }
  }, [visible])

  const history = useHistory();

  const isSideWay = indicator === 'sideMenu' || indicator === 'tabs';

  const [handler, setHandles] = useState<Function[]>([])

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
    let res;
    if (handler[current]) {
      res = await handler[current]()
      valuesRef.current = {...valuesRef.current, ...res}
    }
    await validGroups[current].onNext?.(res, onHandle)
  }

  const renderHandle = () => {
    const buttons = [];
    if (current === 0 && !operation?.hideCancel) {
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

    if (!readonly && indicator === 'step' && current > 0 && !operation?.hidePrevButton) {
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
            await updateValues()
            setCurrent(current + 1)
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
            await updateValues()
            try {
              const result = await onOk?.(valuesRef.current, onHandle)
              await onOkCallback?.(result)
              onClose?.()
            } catch (err) {
              console.log(err.message)
              message.error(err.message)
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
                <div
                  key={child.key}
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
                  {cloneElement(child.children, {
                    emit: (callback: any) => {
                      handler[index] = callback
                      setHandles([...handler])
                    },
                  })}
                </div>
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
    ...userModeProps,
    visible,
    onClose,
    bodyStyle: {padding: 0},
    footer: mode === 'modal' && readonly ? false : renderHandle()
  };

  switch (mode) {
    case "modal":
      return <ExModal {...modeProps}>{content}</ExModal>
    case "drawer":
      return <ExDrawer {...modeProps}>{content}</ExDrawer>
    case "page":
    default:
      return content
  }

}
