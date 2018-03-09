// @flow

import {Rect} from 'flowtip-core';

const getContentRect = (node: HTMLElement): Rect => {
  const rect = node.getBoundingClientRect();
  const style = getComputedStyle(node);

  const topBorder = parseInt(style.borderTopWidth, 10);
  const rightBorder = parseInt(style.borderRightWidth, 10);
  const bottomBorder = parseInt(style.borderBottomWidth, 10);
  const leftBorder = parseInt(style.borderLeftWidth, 10);

  return new Rect(
    rect.left + leftBorder || 0,
    rect.top + topBorder || 0,
    Math.min(rect.width - leftBorder - rightBorder, node.clientWidth) || 0,
    Math.min(rect.height - topBorder - bottomBorder, node.clientHeight) || 0,
  );
};

export default getContentRect;
