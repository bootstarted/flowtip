// @flow

import {findDOMNode as _findDOMNode} from 'react-dom';
import type {Component} from 'react';

// flowlint unclear-type: off
const findDOMNode = (
  componentOrElement: Element | ?Component<any, any>,
): null | Element | Text => {
  const node = _findDOMNode(componentOrElement);
  if (node) return node;

  let fiberNode =
    componentOrElement && (componentOrElement: any)._reactInternalFiber;

  while (fiberNode && !(fiberNode.stateNode instanceof Element)) {
    fiberNode = fiberNode.child;
  }

  return fiberNode ? fiberNode.stateNode : null;
};

export default findDOMNode;
