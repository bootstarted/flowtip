import Rect from 'flowtip-rect';

export interface Borders {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export function findAncestor(
  callback: (node: HTMLElement) => boolean,
  node: Node | null | void,
): HTMLElement | null {
  let current: Node | null | void = node;

  while (current instanceof HTMLElement) {
    if (callback(current)) {
      return current;
    }

    current = current.parentNode;
  }

  return null;
}

export function getBorders(node: HTMLElement): Borders {
  const style = getComputedStyle(node);

  const top = style.borderTopWidth ? parseInt(style.borderTopWidth, 10) : 0;
  const right = style.borderRightWidth
    ? parseInt(style.borderRightWidth, 10)
    : 0;
  const bottom = style.borderBottomWidth
    ? parseInt(style.borderBottomWidth, 10)
    : 0;
  const left = style.borderLeftWidth ? parseInt(style.borderLeftWidth, 10) : 0;

  return {top, right, bottom, left};
}

export function getClippingBlock(node: Node | null | void): HTMLElement {
  const result = findAncestor((node) => {
    if (node === document.documentElement) return true;

    const style = getComputedStyle(node);

    return !!(style.overflow && style.overflow !== 'visible');
  }, node);

  if (result) return result;
  if (document.documentElement !== null) return document.documentElement;

  throw new Error('document.documentElement is null');
}

export function getContainingBlock(node: Node | null | void): HTMLElement {
  const result = findAncestor((node) => {
    if (node === document.documentElement) return true;

    const style = getComputedStyle(node);

    return !!(style.position && style.position !== 'static');
  }, node);

  if (result) return result;
  if (document.documentElement !== null) return document.documentElement;

  throw new Error('document.documentElement is null');
}

export function getContentRect(node: HTMLElement): Rect {
  const rect = node.getBoundingClientRect();
  const border = getBorders(node);

  return new Rect(
    rect.left + border.left,
    rect.top + border.top,
    Math.min(rect.width - border.left - border.right, node.clientWidth),
    Math.min(rect.height - border.top - border.bottom, node.clientHeight),
  );
}

export function getViewportRect(): Rect {
  return new Rect(0, 0, window.innerWidth, window.innerHeight);
}
