import { renderHook, act } from '@testing-library/react-hooks';
import useRequest from './useRequest';

describe('useRequest', () => {
  const setRequest = (initialValue: any) =>
    renderHook(() => {
      const { dataSource } = useRequest(initialValue);
      return {
        dataSource,
      } as const;
    });

  it('should support initialValue', () => {
    const hook = setRequest({
      method: 'post',
      url: '123',
    });

    act(() => {
      console.log(hook);
    });
  });

  it('should not support update when unmount', () => {
    const hook = setRequest(0);
    hook.unmount();
    act(() => {});
  });
});
