import * as React from 'react';
import flowtip, {
  CENTER,
  areEqualDimensions,
  Region,
  Dimensions,
  Config,
} from 'flowtip-core';
import Rect, {RectShape} from 'flowtip-rect';

import {Props, State, Result, Point} from './types';
import findDOMNode from './util/findDOMNode';
import {
  getBorders,
  getContainingBlock,
  getClippingBlock,
  getContentRect,
  getViewportRect,
} from './util/dom';
import {getRegion, getOverlap, getOffset, getAlign} from './util/state';
import defaultRender from './defaultRender';

import FlowTipDebug from './FlowTipDebug';

const POINT_ZERO: Point = Object.freeze({x: 0, y: 0});

const areEqualPoints = (a: Point, b: Point) => {
  return a.x === b.x && a.y === b.y;
};

// Static `flowtip` layout calculation result mock for use during initial client
// side render or on server render where DOM feedback is not possible.
const STATIC_RESULT: Result = {
  bounds: Rect.zero,
  target: Rect.zero,
  region: 'bottom',
  reason: 'default',
  align: 0.5,
  rect: Rect.zero,
  valid: {top: false, right: false, bottom: true, left: false},
  offset: 0,
  overlap: 0,
  overlapCenter: 0,
  _static: false,
};

class FlowTip extends React.Component<Props, State> {
  static defaultProps = {
    sticky: true,
    targetOffset: 0,
    tailOffset: 0,
    align: CENTER,
    topDisabled: false,
    rightDisabled: false,
    bottomDisabled: false,
    leftDisabled: false,
    constrainTop: true,
    constrainRight: true,
    constrainBottom: true,
    constrainLeft: true,
    render: defaultRender,
    debug: false,
  };

  _nextContent?: Dimensions;
  _nextTail?: Dimensions;
  _nextAnchor: Point = POINT_ZERO;
  _nextBounds?: Rect;
  _lastRegion?: Region;
  _isMounted: boolean = false;
  _containingBlockNode: HTMLElement | null = null;
  _clippingBlockNode: HTMLElement | null = null;
  _node: HTMLElement | null = null;

  state: State = {
    anchor: POINT_ZERO,
    result: STATIC_RESULT,
  };

  // Lifecycle Methods =========================================================

  componentDidMount(): void {
    this._isMounted = true;

    this._updateDOMNodes();
    this._nextAnchor = this._getAnchor();
    this._nextBounds = this._getBoundsRect(this.props);

    this._updateState(this.props);

    window.addEventListener('scroll', this._handleScroll);
    window.addEventListener('resize', this._handleScroll);
  }

  componentWillReceiveProps(nextProps: Props): void {
    this._nextAnchor = this._getAnchor();
    this._nextBounds = this._getBoundsRect(nextProps);

    this._updateState(nextProps);
  }

  componentDidUpdate(): void {
    this._updateDOMNodes();
  }

  componentWillUnmount(): void {
    this._isMounted = false;

    this._containingBlockNode = null;
    this._clippingBlockNode = null;
    this._node = null;

    window.removeEventListener('scroll', this._handleScroll);
    window.removeEventListener('resize', this._handleScroll);
  }

  // State Management ==========================================================

  /**
   * Get the next state.
   *
   * This method uses any cached measurements in combination with the provided
   * props to get a new `flowtip` layout result. The element measurements used
   * as inputs to `flowtip` are also cached in the state to compare against the
   * next requested state update.
   *
   * Note: `props` are passed in as an argument to allow using this method from
   * within `componentWillReceiveProps`.
   *
   * @param   {Object} nextProps - FlowTip props.
   * @returns {void}
   */
  _getState(nextProps: Props): State {
    const anchor = this._nextAnchor;
    const bounds = this._nextBounds;
    const content = this._nextContent;
    const tail = this._nextTail;
    const target = nextProps.target;

    let result = STATIC_RESULT;
    if (
      bounds &&
      target &&
      content &&
      (typeof nextProps.tail !== 'function' || tail)
    ) {
      const intermediateState: State = {
        ...this.state,
        anchor,
        bounds,
        tail,
        content,
      };

      const offset = getOffset(nextProps, intermediateState);
      const overlap = getOverlap(nextProps, intermediateState);
      const region = getRegion(nextProps, intermediateState);
      const align = getAlign(nextProps, intermediateState);
      const {edgeOffset = offset} = nextProps;

      const config: Config = {
        offset,
        edgeOffset,
        overlap,
        align,
        region,
        bounds,
        target,
        content,
        disabled: {
          top: nextProps.topDisabled,
          right: nextProps.rightDisabled,
          bottom: nextProps.bottomDisabled,
          left: nextProps.leftDisabled,
        },
        constrain: {
          top: nextProps.constrainTop,
          right: nextProps.constrainRight,
          bottom: nextProps.constrainBottom,
          left: nextProps.constrainLeft,
        },
        snap: {
          top: [0, 0.5, 1],
          right: [0, 0.5, 1],
          bottom: [0, 0.5, 1],
          left: [0, 0.5, 1],
        },
      };

      result = flowtip(config);
    }

    const contentBorders = this._node ? getBorders(this._node) : undefined;

    return {
      anchor,
      bounds,
      content,
      contentBorders,
      tail,
      result,
    };
  }

  /**
   * Trigger a state update and render if necessary.
   *
   * Note: `props` are passed in as an argument to allow using this method from
   * within `componentWillReceiveProps`.
   *
   * @param   {Object} nextProps - FlowTip props.
   * @returns {void}
   */
  _updateState(nextProps: Props): void {
    if (!this._isMounted) return;

    // Only trigger a state update if the dynamic measurements have changed
    // since the last update. We can optimize here since the `flowtip` layout
    // calculation is an entire pure function - we would get the same result.
    if (
      !areEqualDimensions(this.state.content, this._nextContent) ||
      !areEqualDimensions(this.state.tail, this._nextTail) ||
      !areEqualPoints(this.state.anchor, this._nextAnchor) ||
      !Rect.areEqual(this.state.bounds, this._nextBounds) ||
      !Rect.areEqual(this.props.target, nextProps.target) ||
      this.props.region !== nextProps.region ||
      this.props.sticky !== nextProps.sticky ||
      this.props.targetOffset !== nextProps.targetOffset ||
      this.props.edgeOffset !== nextProps.edgeOffset ||
      this.props.tailOffset !== nextProps.tailOffset ||
      this.props.align !== nextProps.align ||
      this.props.topDisabled !== nextProps.topDisabled ||
      this.props.rightDisabled !== nextProps.rightDisabled ||
      this.props.bottomDisabled !== nextProps.bottomDisabled ||
      this.props.leftDisabled !== nextProps.leftDisabled ||
      this.props.constrainTop !== nextProps.constrainTop ||
      this.props.constrainRight !== nextProps.constrainRight ||
      this.props.constrainBottom !== nextProps.constrainBottom ||
      this.props.constrainLeft !== nextProps.constrainLeft
    ) {
      this.setState(this._getState(nextProps));
    }
  }

  // DOM Measurement Methods ===================================================

  _getBoundsRect(nextProps: Props): Rect | undefined {
    const processBounds = (boundsRect: RectShape) => {
      const visibleBounds = Rect.intersect(getViewportRect(), boundsRect);

      return Rect.isValid(visibleBounds) ? visibleBounds : undefined;
    };

    if (nextProps.bounds) {
      return processBounds(nextProps.bounds);
    }

    if (this._clippingBlockNode) {
      return processBounds(getContentRect(this._clippingBlockNode));
    }

    return undefined;
  }

  _getAnchor(): Point {
    if (!this._containingBlockNode) {
      return POINT_ZERO;
    }
    const contentRect = getContentRect(this._containingBlockNode);

    return {
      x:
        contentRect.left -
        (this._containingBlockNode ? this._containingBlockNode.scrollLeft : 0),
      y:
        contentRect.top -
        (this._containingBlockNode ? this._containingBlockNode.scrollTop : 0),
    };
  }

  // DOM Element Accessors =====================================================

  _updateDOMNodes(): void {
    const node = findDOMNode(this);

    if (node instanceof HTMLElement) {
      this._node = node;

      this._containingBlockNode = getContainingBlock(node.parentNode);

      this._clippingBlockNode = getClippingBlock(node.parentNode);
    }
  }

  // Event Handlers ============================================================

  /**
   * Content `ResizeObserver` handler.
   *
   * Responds to changes in the dimensions of the rendered content and updates
   * the cached `_nextContent` rect and triggers a state update.
   *
   * @param   {Object} rect - Object with `width` and `height` properties.
   * @returns {void}
   */
  _handleContentSize = (rect: Dimensions) => {
    this._nextContent = {width: rect.width, height: rect.height};
    this._updateState(this.props);
  };

  /**
   *
   * Tail `ResizeObserver` handler.
   *
   * Responds to changes in the dimensions of the rendered tail element and
   * updates the cached `_nextContent` rect and triggers a state update.
   *
   * @param   {Object} rect - Object with `width` and `height` properties.
   * @returns {void}
   */
  _handleTailSize = (rect: Dimensions) => {
    this._nextTail = {width: rect.width, height: rect.height};
    this._updateState(this.props);
  };

  /**
   * Window scroll handler.
   *
   * Responds to changes in the window scroll position to update the cached
   * `_nextAnchor` point and `_nextBounds` rect and triggers a state update.
   *
   * @returns {void}
   */
  _handleScroll = () => {
    this._nextAnchor = this._getAnchor();
    this._nextBounds = this._getBoundsRect(this.props);
    this._updateState(this.props);
  };

  render(): React.ReactNode {
    const content = this.props.render({
      onTailSize: this._handleTailSize,
      onContentSize: this._handleContentSize,
      state: this.state,
      props: this.props,
    });

    if (this.props.debug) {
      const result = {...this.state.result};
      if (this.props.target) {
        result.target = Rect.fromRect(this.props.target);
      }

      return (
        <>
          {content}
          <FlowTipDebug {...result} />
        </>
      );
    }

    return content;
  }
}

export default FlowTip;
