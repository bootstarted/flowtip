// @flow

const findAncestor = (
  callback: (node: Node) => boolean,
  node: ?Node,
): HTMLElement | null => {
  let current = node;

  while (current instanceof HTMLElement) {
    if (callback(current)) {
      return current;
    }

    current = current.parentNode;
  }

  return null;
};

export default findAncestor;
