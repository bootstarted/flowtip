import * as React from 'react';
import flowtip, {CENTER, Rect, areEqualDimensions} from 'flowtip-core';
import {RectLike, Region, Dimensions, Result} from 'flowtip-core';

import {Props, State} from './types';
import findDOMNode from './util/findDOMNode';
import {
  getBorders,
  getContainingBlock,
  getClippingBlock,
  getContentRect,
  getViewportRect,
} from './util/dom';
import {getRegion, getOverlap, getOffset} from './util/state';
import defaultRender from './defaultRender';

// Static `flowtip` layout calculation result mock for use during initial client
// side render or on server render where DOM feedback is not possible.
const STATIC_RESULT: Result = {
  bounds: Rect.zero,
  target: Rect.zero,
  region: 'bottom',
  reason: 'default',
  rect: Rect.zero,
  valid: {top: false, right: false, bottom: true, left: false},
  offset: 0,
  overlap: 0,
  overlapCenter: 0,
  _static: true,
};

class FlowTip extends React.Component<Props, State> {
  static defaultProps = {
    bounds: null,
    region: undefined,
    sticky: true,
    targetOffset: 0,
    edgeOffset: 0,
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
  };

  _nextContent: Dimensions | null = null;
  _nextTail: Dimensions | null = null;
  _nextContainingBlock: Rect = Rect.zero;
  _nextBounds: Rect | null = null;
  _lastRegion: Region | void;
  _isMounted: boolean = false;
  _containingBlockNode: HTMLElement | null = null;
  _clippingBlockNode: HTMLElement | null = null;
  _node: HTMLElement | null = null;
  state = {
    containingBlock: Rect.zero,
    boundedByViewport: true,
    bounds: null,
    content: null,
    contentBorders: null,
    tail: null,
    result: STATIC_RESULT,
  };

  // Lifecycle Methods =========================================================

  componentDidMount(): void {
    this._isMounted = true;

    this._updateDOMNodes();
    this._nextContainingBlock = this._getContainingBlockRect();
    this._nextBounds = this._getBoundsRect(this.props);

    this._updateState(this.props);

    window.addEventListener('scroll', this._handleScroll);
    window.addEventListener('resize', this._handleScroll);
  }

  componentWillReceiveProps(nextProps: Props): void {
    this._nextContainingBlock = this._getContainingBlockRect();
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
    const containingBlock = this._nextContainingBlock;
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
      const intermediateState = {
        ...this.state,
        bounds,
        containingBlock,
        tail,
        content,
      };

      const offset = getOffset(nextProps, intermediateState);
      const overlap = getOverlap(nextProps, intermediateState);
      const region = getRegion(nextProps, intermediateState);
      const {edgeOffset = offset, align} = nextProps;

      const config = {
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
      };

      result = flowtip(config);
    }

    const contentBorders = this._node ? getBorders(this._node) : null;

    const boundedByViewport =
      !nextProps.bounds && this._clippingBlockNode === document.documentElement;

    return {
      containingBlock,
      boundedByViewport,
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
      !Rect.areEqual(this.state.containingBlock, this._nextContainingBlock) ||
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

  _getBoundsRect(nextProps: Props): Rect | null {
    const processBounds = (boundsRect: RectLike) => {
      const visibleBounds = Rect.intersect(getViewportRect(), boundsRect);

      return Rect.isValid(visibleBounds) ? visibleBounds : null;
    };

    if (nextProps.bounds) {
      return processBounds(nextProps.bounds);
    }

    if (document.body && this._clippingBlockNode === document.documentElement) {
      return processBounds(
        new Rect(
          -window.scrollX,
          -window.scrollY,
          document.body.scrollWidth,
          document.body.scrollHeight,
        ),
      );
    }

    if (this._clippingBlockNode) {
      return processBounds(getContentRect(this._clippingBlockNode));
    }

    return null;
  }

  _getContainingBlockRect(): Rect {
    if (!this._containingBlockNode) {
      return Rect.zero;
    }

    if (
      document.body &&
      this._containingBlockNode === document.documentElement
    ) {
      return new Rect(
        -window.scrollX,
        -window.scrollY,
        document.body.scrollWidth,
        document.body.scrollHeight,
      );
    }

    return getContentRect(this._containingBlockNode);
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
   * `_nextContainingBlock` and `_nextBounds` rects and triggers a state update.
   *
   * @returns {void}
   */
  _handleScroll = () => {
    this._nextContainingBlock = this._getContainingBlockRect();
    this._nextBounds = this._getBoundsRect(this.props);
    this._updateState(this.props);
  };

  render(): React.ReactNode {
    return this.props.render({
      onTailSize: this._handleTailSize,
      onContentSize: this._handleContentSize,
      state: this.state,
      props: this.props,
    });
  }
}

export default FlowTip;
