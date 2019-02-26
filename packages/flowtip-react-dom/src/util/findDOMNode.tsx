import {findDOMNode as _findDOMNode} from 'react-dom';
import {Component} from 'react';

type FiberNode = {
  stateNode: null | Element | Text,
  child: FiberNode | void,
};

const findDOMNode = (
  componentOrElement: Element | Component,
): null | Element | Text => {
  const node = _findDOMNode(componentOrElement);
  if (node) return node;

  let fiberNode: FiberNode | void =
    // flowlint-next-line unclear-type: off
    componentOrElement && (componentOrElement as any)._reactInternalFiber;

  while (fiberNode && !(fiberNode.stateNode instanceof Element)) {
    fiberNode = fiberNode.child;
  }

  return fiberNode ? fiberNode.stateNode : null;
};

export default findDOMNode;
