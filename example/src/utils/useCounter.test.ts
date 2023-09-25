import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

test('useCounter should increment and decrement count', () => {
  const { result } = renderHook(() => useCounter());

  // 初始值应为 0
  expect(result.current.count).toBe(0);

  // 调用 increment 后，count 应该增加 1
  act(() => {
    result.current.increment();
  });
  expect(result.current.count).toBe(1);

  // 调用 decrement 后，count 应该减少 1
  act(() => {
    result.current.decrement();
  });
  expect(result.current.count).toBe(0);
});