// @flow

import findAncestor from './findAncestor';

const getClippingBlock = (node: ?Node): HTMLElement | null => {
  const result = findAncestor((node) => {
    if (node === document.documentElement) return true;

    const style = getComputedStyle(node);

    return style.overflow && style.overflow !== 'visible';
  }, node);

  return result;
};

export default getClippingBlock;
