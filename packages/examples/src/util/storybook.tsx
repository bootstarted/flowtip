import {action} from '@storybook/addon-actions';

export function withAction<T extends any[], R>(
  name: string,
  func: (...args: T) => R,
): (...args: T) => R {
  const handler = action(name);
  return (...args: T) => {
    handler(...args);
    return func(...args);
  };
}
