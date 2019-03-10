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
  private lastAnchor: Point = {x: 0, y: 0};
  private lastClippingRect: Rect = Rect.zero;

  public state = {
    anchor: this.lastAnchor,
    clippingRect: this.lastClippingRect,
  };

  private _ref = React.createRef<HTMLElement>();

  private update = (): void => {
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
      this.lastAnchor.x !== anchor.x ||
      this.lastAnchor.y !== anchor.y ||
      !Rect.areEqual(this.lastClippingRect, clippingRect)
    ) {
      this.lastAnchor = anchor;
      this.lastClippingRect = clippingRect;
      const update = Object.freeze({anchor, clippingRect});

      if (this.props.onLayoutChange) {
        this.props.onLayoutChange(update);
      }
      this.setState(update);
    }
  };

  public componentDidMount(): void {
    this.update();
    window.addEventListener('scroll', this.update, true);
    window.addEventListener('resize', this.update, true);
  }

  public componentWillUnmount(): void {
    window.removeEventListener('scroll', this.update, true);
    window.removeEventListener('resize', this.update, true);
  }

  public render(): React.ReactNode {
    return (
      <>
        <noscript ref={this._ref} />
        {this.props.children && this.props.children(this.state)}
      </>
    );
  }
}
export default LayoutObserver;
