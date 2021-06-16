import { useState } from 'react';
import { request } from '../rem';
import type { RequestOptions } from '../interface';

export default function useHandle() {
  const [isLoading, setLoading] = useState<boolean>();

  const onHandle = async (options: RequestOptions) => {
    setLoading(true);
    const { callback, trigger, ...rest } = options;
    try {
      const res = request(rest);
      return callback ? callback(res) : res;
    } finally {
      setLoading(false);
    }
  };
  return { isLoading, onHandle };
}
