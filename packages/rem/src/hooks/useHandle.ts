import { useState } from 'react';
import rem from '../rem';
import type { RequestOptions } from '../interface';

export default function useHandle() {
  const [isLoading, setLoading] = useState<boolean>();

  const onHandle = async <T>(options: RequestOptions) => {
    setLoading(true);
    const { callback, trigger, ...rest } = options;
    try {
      const res = await rem().request<T>(rest);
      return callback ? callback(res) : res;
    } finally {
      setLoading(false);
    }
  };
  return { isLoading, onHandle };
}
