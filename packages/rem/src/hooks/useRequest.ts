import { RequestOptions } from '../interface';
import useHandle from './useHandle';
import { useEffect, useRef, useState } from 'react';
import { isEqual } from 'lodash';

export default function useRequest<T = any>(options: RequestOptions | undefined, trigger?: boolean) {

  const { onHandle, isLoading } = useHandle();

  const [dataSource, setDataSource] = useState<T>();

  const prevOptionsRef = useRef<RequestOptions>();

  const handleRequest = () => {
    if (options) {
      onHandle({
        url: options.url,
        method: options.method,
        data: options?.data,
        params: options?.params,
      }).then((res: any) => {
        if (options.callback) {
          Promise.resolve(options.callback(res)).then(value => setDataSource(value));
        } else {
          setDataSource(res);
        }
      }).catch(e => {
      });
    }
  };

  const checkTrigger = () => {
    //  存在条件触发
    if (options?.hasOwnProperty('trigger')) {
      return !!options?.trigger;
    }
    //  不存在条件, 直接跳过
    return true;
  };

  const equalData = () => {
    const prevOptions = prevOptionsRef.current;
    const origin = { url: prevOptions?.url, params: prevOptions?.params, data: prevOptions?.params };
    const target = { url: options?.url, params: options?.params, data: options?.params };
    return isEqual(origin, target);
  };

  useEffect(() => {
    if (options && !prevOptionsRef.current && checkTrigger()) {
      handleRequest();
    }
    prevOptionsRef.current = options;
  }, []);

  const globalInitialize = useRef(false);

  useEffect(() => {
    if (trigger && checkTrigger() && equalData()) {
      handleRequest();
    }
  }, [trigger]);

  useEffect(() => {
    // 仅当开启了trigger, 加载完毕后开启options监听
    if (trigger && prevOptionsRef.current && checkTrigger() && !equalData()) {
      handleRequest();
      prevOptionsRef.current = options;
    }
  }, [trigger, options, globalInitialize.current]);

  useEffect(() => {
    // 已经初始化过, 判断跟上一个是否有什么差异, 有的话就触发 (该监听不包含trigger)
    if (prevOptionsRef.current && checkTrigger() && !equalData() && !trigger) {
      handleRequest();
      prevOptionsRef.current = options;
    }
  }, [options]);

  return {
    dataSource,
    setDataSource,
    onRefresh: handleRequest,
    isLoading,
  };

}
