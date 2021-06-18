import React, {useEffect, useState} from 'react';
import {Drawer, Modal} from "antd";

export interface PopupActionType {
    trigger: (key: string, opts?: {
        component?: any,
        onOkCallback?: Function,
        mode?: 'modal' | 'drawer',
        width?: number | string,
        [key: string]: any
    }) => void;
}

export interface PopupContainerProps {
    popupRef?: React.MutableRefObject<PopupActionType | undefined>;
    popups?: {
        key: string,
        component: any,
        onOkCallback?: Function,
        mode?: 'modal' | 'drawer',
        width?: number | string
    }[];
    onOkCallback?: Function
}

export const PopupContext = React.createContext<{
    onClose?: () => void,
    onOkCallback?: (res: any) => void,
}>({})

function PopupContainer(props: PopupContainerProps) {

    const {popupRef, popups, onOkCallback: globalOnOkCallback} = props;

    const [components, setComponents] = useState<Record<string, {
        component: any,
        visible: boolean,
        onOkCallback?: Function,
        opts?: {
            mode?: 'modal' | 'drawer',
            width?: number | string
        }
    }>>({});

    useEffect(() => {

        if (popups && popups.length > 0) {
            popups.forEach(item => {
                const {key, onOkCallback, ...rest} = item;
                components[item.key] = {
                    component: item.component,
                    onOkCallback,
                    visible: false,
                    opts: rest
                }
            })
        }

        if (popupRef && typeof popupRef !== 'function') {

            popupRef.current = {
                trigger: (key, opts) => {
                    if (components.hasOwnProperty('key')) {
                        components[key].visible = !components[key].visible
                    } else if (opts) {
                        const {component, onOkCallback, ...rest} = opts;
                        if (component) {
                            components[key] = {
                                component,
                                visible: true,
                                opts: rest,
                                onOkCallback: opts?.onOkCallback
                            }
                        }
                    } else {
                        throw new Error(`You not set component bind key=${key}.`)
                    }
                    setComponents({...components})
                }
            };
        }
    }, [])

    return <>
        {
            Object.keys(components).map(key => {
                const {visible, component, onOkCallback, opts} = components[key];
                const value = {
                    onClose: () => {
                        components[key].visible = false
                        setComponents({...components})
                    },
                    onOkCallback: async (res: any) => {
                        console.log('popup onOkCallback')
                        await onOkCallback?.(res)
                        await globalOnOkCallback?.(res)
                    }
                }

                const dom = (
                    <PopupContext.Provider key={key} value={value}>
                        {component}
                    </PopupContext.Provider>
                )

                const defaultProps = {
                    key,
                    visible,
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

                return (
                    <Modal bodyStyle={{padding: 0, position: "relative"}} footer={false} {...defaultProps}>{dom}</Modal>
                )
            })
        }
    </>
}

export default PopupContainer;
