import React, { Suspense, useEffect, useState } from 'react';
import rem from '../rem';
import { IAuthority } from '../interface';

interface FloatType extends IAuthority {
  //  浮动组件唯一标识, 该标识具备多个关联的组件, 逗号分隔
  openid: string | string[]
  //  浮动层组件, 必须是React.lazy方式导入
  component: any
  //  浮动层组件参数
  componentProps?: any
  //  回调
  handleCallback?: (res: any, openid: string) => void
  current?: any
}

interface FloatDataType {
  [openid: string]: { data?: any, visible: boolean };
}

interface FloatLayoutProps {
  dataSource: FloatType[] | undefined
  handleCallback?: (res: any, openid: string) => void
  floatRef?: React.MutableRefObject<FloatActionType | undefined>
}

interface FloatProps<T = any> {
  openid: string
  visible: boolean
  floatAction: FloatActionType
  onClose: () => void
  handleCallback?: (res: any) => void
  selectedData: T
}

interface FloatActionType {
  open: <T>(openid: string, data?: T) => void;
}

function filterDataSource(dataSource: any[] = []) {

  const filter = dataSource?.filter(item => rem.permission.checkAuthority(item.authority)) || [];
  //  过滤重复组件
  const components: FloatType[] = [];
  const temp: any = {};

  filter.forEach(item => {
    const { component, openid } = item;
    const findIndex = components.findIndex(find => find.component === component);
    let targets: string[];
    if (Array.isArray(openid)) {
      openid.forEach(key => temp[key] = item);
      targets = openid;
    } else {
      temp[openid] = item;
      targets = openid.split(',');
    }

    if (findIndex > -1) { //  已经存在
      let temp = components[findIndex].openid;
      if (Array.isArray(temp)) {
        components[findIndex].openid = temp.concat(targets);
      } else {
        components[findIndex].openid = temp.split(',').concat(targets);
      }
    } else {
      components.push(item);
    }
  });
  return components;
}

function FloatLayout(props: FloatLayoutProps) {

  const { dataSource, floatRef, handleCallback } = props;
  const [floatValueEnum, setFloatValueEnum] = useState<FloatDataType>();

  useEffect(() => {
    if (dataSource && dataSource.length > 0 && !floatValueEnum) {
      let obj: any = {};
      dataSource.forEach(item => {
        if (Array.isArray(item.openid)) {
          item.openid.forEach(key => obj[key] = { data: undefined, visible: false });
        } else {
          obj[item.openid] = { data: undefined, visible: false };
        }
      });
      setFloatValueEnum(obj);
    }
  }, [dataSource]);

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

  const handleOperation = (openid: string, data: any, visible = true) => {
    if (!floatValueEnum || !floatValueEnum[openid]) return;
    setFloatValueEnum(prevState => ({
      ...prevState,
      [openid]: { visible, data: visible ? data : prevState ? prevState[openid].data : null },
    }));
  };

  const filter = filterDataSource(dataSource);

  return (
    <Suspense fallback={null}>
      {floatValueEnum &&
      filter.map(item => {
        let current: { data?: any, visible: boolean }, openid;
        if (Array.isArray(item.openid)) {
          const findKey = item.openid.find(key => !!floatValueEnum[key].visible);
          openid = findKey || item.openid[0];
        } else {
          openid = item.openid;
        }
        current = floatValueEnum[openid];
        return (
          <item.component
            key={openid}
            openid={openid}
            selectedData={current?.data}
            visible={current?.visible}
            floatAction={userAction}
            onClose={onClose}
            handleCallback={(res: any, openid: string) => item.handleCallback?.(res, openid) || handleCallback?.(res, openid)}
            {...item.componentProps}
          />
        );
      })}
    </Suspense>
  );
}

export {
  FloatType,
  FloatLayoutProps,
  FloatProps,
  FloatActionType,
};

export default FloatLayout;
