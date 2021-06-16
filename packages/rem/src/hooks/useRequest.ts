import type { RequestOptions } from '../interface';
import useHandle from './useHandle';
import { useEffect, useRef, useState } from 'react';
import isEqual  from 'lodash/isEqual';

export default function useRequest<T = any>(options?: RequestOptions) {
  const { onHandle, isLoading } = useHandle();

  const [dataSource, setDataSource] = useState<T>();

  const prevOptionsRef = useRef<RequestOptions>();

  const handleRequest = async () => {
    if (!options) return;
    const res = await onHandle(options);
    setDataSource(res);
  };

  const checkTrigger = () => {
    if (options?.hasOwnProperty('trigger')) {
      return !!options.trigger;
    }
    return true;
  };

  const equalData = () => {
    const prevOptions = prevOptionsRef.current;
    const origin = {
      url: prevOptions?.url,
      params: prevOptions?.params,
      data: prevOptions?.params,
      trigger: prevOptions?.trigger,
    };
    const target = {
      url: options?.url,
      params: options?.params,
      data: options?.params,
      trigger: options?.trigger,
    };
    return isEqual(origin, target);
  };

  useEffect(() => {
    if (options && !isLoading && checkTrigger() && !equalData()) {
      handleRequest();
    }
    prevOptionsRef.current = options;
  }, [options]);

  return {
    dataSource,
    setDataSource,
    onRefresh: handleRequest,
    isLoading,
  };
}
