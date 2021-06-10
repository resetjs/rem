import React, {Suspense, useEffect, useState} from 'react';
import {IAuthority} from '../../interface';
import rem from '../../rem';


interface FloatType extends IAuthority {
    //  浮动组件唯一标识, 该标识具备多个关联的组件, 逗号分隔
    openid: string | string[];
    //  浮动层组件, 必须是React.lazy方式导入
    component: any;
    //  浮动层组件参数
    componentProps?: any;
    //  回调
    handleCallback?: (res: any, openid: string) => void;

    current?: any;
}

type FloatDataType = Record<string, { data?: any; visible: boolean }>;

interface FloatLayoutProps {
    dataSource: FloatType[];
    handleCallback?: (res: any, openid: string) => void;
    floatRef?: React.MutableRefObject<FloatActionType | undefined>;
}

interface FloatProps<T = any> {
    openid: string | string[];
    visible: boolean;
    floatAction: FloatActionType;
    onClose: () => void;
    handleCallback?: (res: any) => void;
    selectedData: T;
}

interface FloatActionType {
    open: <T>(openid: string, data?: T) => void;
}

export const PopupContext = React.createContext<| {
    open: <T>(openid: string, data?: T) => void;
    handleCallback: (listener: Function) => void
} | null>(null);


function PopupContainer(props: FloatLayoutProps) {

    const {dataSource, floatRef, handleCallback} = props;
    const [floatValueEnum, setFloatValueEnum] = useState<FloatDataType>();

    useEffect(() => {
        if (dataSource && dataSource.length > 0 && !floatValueEnum) {
            const obj: any = {};
            dataSource.forEach((item) => {
                if (Array.isArray(item.openid)) {
                    item.openid.forEach((key) => {
                        obj[key] = {data: undefined, visible: false};
                    });
                } else {
                    obj[item.openid] = {data: undefined, visible: false};
                }
            });
            setFloatValueEnum(obj);
        }
    }, [dataSource]);

    const handleOperation = (openid: string, data: any, visible = true) => {
        if (!floatValueEnum || !floatValueEnum[openid]) return;
        if (visible) {
            setFloatValueEnum((prevState) => ({...prevState, [openid]: {visible, data}}));
        } else {
            setFloatValueEnum((prevState) => {
                const temp: any = prevState ? prevState[openid] : [openid];
                temp.visible = false;
                return {...prevState, ...temp};
            });

            //  这里做一个延迟关闭后的处理, 用于清空当前表单数据, 提前清除造成还没关闭的时候就没了
            setTimeout(() => {
                setFloatValueEnum((prevState) => ({...prevState, [openid]: {visible: false}}));
            }, 200);
        }
    };

    const userAction: FloatActionType = {
        open: (key: string, data: any) => handleOperation(key, data, true),
    };

    useEffect(() => {
        if (floatRef && typeof floatRef !== 'function') {
            floatRef.current = userAction;
        }
    }, [floatValueEnum]);

    const onClose = (openid: string) => {
        handleOperation(openid, null, false);
    };
    return (
        <PopupContext.Provider value={{
            open: handleOperation,
            handleCallback: (listener => {
                if (listener) listener()
            })
        }}>
            <Suspense fallback={null}>
                {floatValueEnum &&
                dataSource.map((item) => {
                    let findOpenId: string;
                    if (Array.isArray(item.openid)) {
                        const findKey = item.openid.find((key) => !!floatValueEnum[key].visible);
                        findOpenId = findKey || item.openid[0];
                    } else {
                        findOpenId = item.openid;
                    }
                    const current = floatValueEnum[findOpenId];
                    return React.cloneElement(<item.component/>, {
                        key: findOpenId,
                        openid: findOpenId,
                        initValues: current?.data,
                        visible: current?.visible,
                        onClose: () => onClose(findOpenId),
                        handleCallback: (res: any) => {
                            onClose(findOpenId);
                            if (item.handleCallback) {
                                item.handleCallback?.(res, findOpenId)
                            } else if (handleCallback) {
                                handleCallback(res, findOpenId)
                            }
                        }
                    })
                })}
            </Suspense>
        </PopupContext.Provider>
    );
}

export default PopupContainer;
