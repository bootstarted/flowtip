import * as React from 'react';

export default function useDebouncedState<T>(
  initialValue: T,
): [T, (value: T, delay?: number) => void] {
  const [pendingState, setPendingState] = React.useState<{
    value: T;
    delay: number;
  }>({
    value: initialValue,
    delay: 0,
  });

  const [debouncedValue, setDebouncedValue] = React.useState(
    pendingState.value,
  );

  React.useEffect(() => {
    if (pendingState.delay) {
      const timeout = setTimeout(() => {
        setDebouncedValue(pendingState.value);
      }, pendingState.delay);

      return () => {
        clearTimeout(timeout);
      };
    }

    setDebouncedValue(pendingState.value);
    return () => {};
  }, [pendingState.value, pendingState.delay]);

  return [
    debouncedValue,
    (value, delay = 0) => setPendingState({value, delay}),
  ];
}
