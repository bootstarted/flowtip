// @flow
import warning from 'fbjs/lib/warning';

const warned = {};

const singleWarning = (key: string, cond: any, ...args: Array<any>): void => {
  warning(warned[key] || cond, ...args);
  warned[key] = true;
};

export default singleWarning;
