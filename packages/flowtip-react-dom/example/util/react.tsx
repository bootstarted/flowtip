import {useMemo, useEffect, useState} from 'react';

let currentId = 0;

const getNextId = () => `react-element-${currentId++}`;

export function useId(): string {
  return useMemo(getNextId, []);
}

export function useDebouncedState<T>(
  initialValue: T,
): [T, (value: T, delay?: number) => void] {
  const [pendingState, setPendingState] = useState<{
    value: T;
    delay: number;
  }>({
    value: initialValue,
    delay: 0,
  });

  const [debouncedValue, setDebouncedValue] = useState(pendingState.value);

  useEffect(() => {
    if (pendingState.value !== debouncedValue) {
      if (pendingState.delay) {
        const timeout = setTimeout(() => {
          setDebouncedValue(pendingState.value);
        }, pendingState.delay);

        return () => {
          clearTimeout(timeout);
        };
      }

      setDebouncedValue(pendingState.value);
    }
    return () => {};
  }, [pendingState.value, pendingState.delay]);

  return [
    debouncedValue,
    (value, delay = 0) => setPendingState({value, delay}),
  ];
}
