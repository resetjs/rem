import React, { Suspense, useEffect, useState } from 'react';
import rem from '../rem';
import type { IAuthority } from '../interface';

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
  dataSource: FloatType[] | undefined;
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

function filterDataSource(dataSource: any[] = []) {
  const filter = dataSource?.filter((item) => rem.permission.checkAuthority(item.authority)) || [];
  //  过滤重复组件
  const components: FloatType[] = [];
  const temp: any = {};

  filter.forEach((item) => {
    const { component, openid } = item;
    const findIndex = components.findIndex((find) => find.component === component);
    let targets: string[];
    if (Array.isArray(openid)) {
      openid.forEach((key) => {
        temp[key] = item;
      });
      targets = openid;
    } else {
      temp[openid] = item;
      targets = openid.split(',');
    }

    if (findIndex > -1) {
      //  已经存在
      const find = components[findIndex].openid;
      if (Array.isArray(find)) {
        components[findIndex].openid = find.concat(targets);
      } else {
        components[findIndex].openid = find.split(',').concat(targets);
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
      const obj: any = {};
      dataSource.forEach((item) => {
        if (Array.isArray(item.openid)) {
          item.openid.forEach((key) => {
            obj[key] = { data: undefined, visible: false };
          });
        } else {
          obj[item.openid] = { data: undefined, visible: false };
        }
      });
      setFloatValueEnum(obj);
    }
  }, [dataSource]);

  const handleOperation = (openid: string, data: any, visible = true) => {
    if (!floatValueEnum || !floatValueEnum[openid]) return;
    if (visible) {
      setFloatValueEnum((prevState) => ({ ...prevState, [openid]: { visible, data } }));
    } else {
      setFloatValueEnum((prevState) => {
        const temp: any = prevState ? prevState[openid] : [openid];
        temp.visible = false;
        return { ...prevState, ...temp };
      });

      //  这里做一个延迟关闭后的处理, 用于清空当前表单数据, 提前清除造成还没关闭的时候就没了
      setTimeout(() => {
        setFloatValueEnum((prevState) => ({ ...prevState, [openid]: { visible: false } }));
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

  const filter = filterDataSource(dataSource);

  return (
    <Suspense fallback={null}>
      {floatValueEnum &&
        filter.map((item) => {
          let findOpenId: string;
          if (Array.isArray(item.openid)) {
            const findKey = item.openid.find((key) => !!floatValueEnum[key].visible);
            findOpenId = findKey || item.openid[0];
          } else {
            findOpenId = item.openid;
          }
          const current = floatValueEnum[findOpenId];
          return (
            <item.component
              key={findOpenId}
              openid={findOpenId}
              selectedData={current?.data}
              visible={current?.visible}
              floatAction={userAction}
              onClose={onClose}
              handleCallback={(res: any, openid: string) =>
                item.handleCallback?.(res, openid) || handleCallback?.(res, openid)
              }
              {...item.componentProps}
            />
          );
        })}
    </Suspense>
  );
}

export { FloatType, FloatLayoutProps, FloatProps, FloatActionType };

export default FloatLayout;
