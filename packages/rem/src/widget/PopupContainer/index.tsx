import React, {LazyExoticComponent, useEffect, useState} from 'react';
import {Drawer, Modal} from "antd";

export interface PopupActionType {
    trigger: (key: string, component: LazyExoticComponent<any>, opts?: {
        handleCallback?: Function,
        mode?: 'modal' | 'drawer',
        width?: number | string
    }) => void;
}

export interface PopupContainerProps {
    popupRef: React.MutableRefObject<PopupActionType | undefined>;
}

function PopupContainer(props: PopupContainerProps) {

    const {popupRef} = props;

    const [components, setComponents] = useState<Record<string, {
        component: LazyExoticComponent<any>,
        visible: boolean,
        opts?: {
            handleCallback?: Function,
            mode?: 'modal' | 'drawer',
            width?: number | string
        }
    }>>({});

    useEffect(() => {
        if (popupRef && typeof popupRef !== 'function') {
            popupRef.current = {
                trigger: (key, component, opts) => {
                    if (!components.hasOwnProperty('key')) {
                        components[key] = {component, visible: true, opts}
                    } else {
                        components[key].visible = !components[key].visible
                    }
                    setComponents({...components})
                }
            };
        }
    }, [])

    return <>
        {
            Object.keys(components).map(key => {
                const {visible, component: Component, opts} = components[key];
                const onClose = () => {
                    components[key].visible = false
                    setComponents({...components})
                };
                const dom = (
                    <React.Suspense fallback={null}>
                        <Component
                            onClose={onClose}
                            handleCallback={opts?.handleCallback}/>
                    </React.Suspense>
                )

                const defaultProps = {
                    key,
                    visible,
                    onClose,
                    closable: false,
                    destroyOnClose: true,
                    maskClosable: false,
                    width: opts?.width
                }

                if (opts?.mode === 'drawer') {
                    return (
                        <Drawer placement="right" {...defaultProps}>{dom}</Drawer>
                    )
                }

                const {onClose: onCancel, ...rest} = defaultProps
                return (
                    <Modal bodyStyle={{padding: 0, position: "relative"}}
                           footer={false}
                           onCancel={onCancel}
                           {...rest}>{dom}</Modal>
                )
            })
        }
    </>
}

export default PopupContainer;
