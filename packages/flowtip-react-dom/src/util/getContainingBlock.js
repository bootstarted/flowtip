// @flow
import findAncestor from './findAncestor';

const getContainingBlock = (node: ?Node): HTMLElement | null => {
  const result = findAncestor((node) => {
    if (node.tagName === 'BODY') return true;

    const style = window.getComputedStyle(node);

    return style.position && style.position !== 'static';
  }, node);

  return result;
};

export default getContainingBlock;
