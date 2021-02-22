import { useState } from 'react';
import rem from '../rem';
import { RequestOptions } from '../interface';

export default function useHandle() {

  const [isLoading, setLoading] = useState<boolean>();

  const onHandle = async (options: RequestOptions) => {

    const { url, data, method, params } = options;
    setLoading(true);

    try {
      return await rem.request(options);
    } finally {
      setLoading(false);
    }
  };

  return { isLoading, onHandle };

}
