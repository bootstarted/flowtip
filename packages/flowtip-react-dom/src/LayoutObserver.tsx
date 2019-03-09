import * as React from 'react';

import Rect from 'flowtip-rect';

import {getContainingBlock, getClippingBlock, getContentRect} from './domUtil';

import Point from './Point';

interface State {
  anchor: Point;
  clippingRect: Rect;
}

interface Props {
  onLayoutChange?: (state: State) => unknown;
  children?: (state: State) => React.ReactNode;
}

class LayoutObserver extends React.PureComponent<Props, State> {
  _lastAnchor: Point = {x: 0, y: 0};
  _lastClippingRect: Rect = Rect.zero;

  state = {
    anchor: this._lastAnchor,
    clippingRect: this._lastClippingRect,
  };

  _ref = React.createRef<HTMLElement>();

  update = () => {
    if (!this._ref.current) {
      return;
    }

    const parentNode = this._ref.current.parentNode;

    const containingBlockNode = getContainingBlock(parentNode);
    const contentRect = getContentRect(containingBlockNode);
    const anchor = {
      x: contentRect.left - containingBlockNode.scrollLeft,
      y: contentRect.top - containingBlockNode.scrollTop,
    };

    const clippingBlockNode = getClippingBlock(parentNode);
    const clippingRect = getContentRect(clippingBlockNode);

    if (
      this._lastAnchor.x !== anchor.x ||
      this._lastAnchor.y !== anchor.y ||
      !Rect.areEqual(this._lastClippingRect, clippingRect)
    ) {
      this._lastAnchor = anchor;
      this._lastClippingRect = clippingRect;
      const update = Object.freeze({anchor, clippingRect});

      if (this.props.onLayoutChange) {
        this.props.onLayoutChange(update);
      }
      this.setState(update);
    }
  };

  componentDidMount() {
    this.update();
    window.addEventListener('scroll', this.update, true);
    window.addEventListener('resize', this.update, true);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.update, true);
    window.removeEventListener('resize', this.update, true);
  }

  render() {
    return (
      <>
        <noscript ref={this._ref} />
        {this.props.children && this.props.children(this.state)}
      </>
    );
  }
}
export default LayoutObserver;
