// @flow
import * as React from 'react';
import {findDOMNode} from 'react-dom';
import ResizeObserver from 'react-resize-observer';

import flowtip, {
  RIGHT,
  LEFT,
  CENTER,
  Rect,
  areEqualDimensions,
  getClampedTailPosition,
} from 'flowtip-core';

import type {RectLike, Region, Align, Dimensions, Result} from 'flowtip-core';

import getContainingBlock from './util/getContainingBlock';

// Static `flowtip` layout calculation result mock for use during initial client
// side render or on server render where DOM feedback is not possible.
const STATIC_RESULT: Result = {
  region: 'bottom',
  reason: 'default',
  rect: Rect.zero,
  valid: {top: false, right: false, bottom: true, left: false},
  offset: 0,
  overlap: 0,
  overlapCenter: 0,
  _static: true,
};

export type State = {
  containingBlock: RectLike,
  bounds: RectLike | null,
  content: Dimensions | null,
  tail: Dimensions | null,
  result: Result | null,
};

type Style = {[string]: string | number};

export type Props = {
  /** DOMRect (or similar shaped object) of target position. */
  target: RectLike | null,
  /**
    DOMRect (or similar shaped object) of content boundary.
   */
  bounds: RectLike | null,
  /** Default region the content should unless otherwise constrained. */
  region: Region | void,
  /** Retain the previous rendered region unless otherwise constrained. */
  sticky: boolean,
  /** Offset between target rect and tail. */
  targetOffset: number,
  /** Minimum distance between content react and boundary edge. */
  edgeOffset: number,
  /**
   * Prevent the tail from getting within this distance of the corner of
   * the content.
   */
  tailOffset: number,
  /** Relative alignment of content rect and target rect. */
  align: Align,
  /** Disable the top region. */
  topDisabled: boolean,
  /** Disable the right region. */
  rightDisabled: boolean,
  /** Disable the bottom region. */
  bottomDisabled: boolean,
  /** Disable the left region. */
  leftDisabled: boolean,
  /** Constrain the content at the top boundary. */
  constrainTop: boolean,
  /** Constrain the content at the top boundary. */
  constrainRight: boolean,
  /** Constrain the content at the right boundary. */
  constrainBottom: boolean,
  /** Constrain the content at the bottom boundary. */
  constrainLeft: boolean,
  content:
    | React.ComponentType<{
        style: Style,
        result: Result,
        children?: React.Node,
      }>
    | string,
  tail?: React.ComponentType<{
    style: Style,
    result: Result,
    children?: React.Node,
  }>,
  children?: React.Node,
};

const omitFlowtipProps = (props: Props) => {
  const {
    target: _target,
    bounds: _bounds,
    region: _region,
    sticky: _sticky,
    targetOffset: _targetOffset,
    edgeOffset: _edgeOffset,
    tailOffset: _tailOffset,
    align: _align,
    topDisabled: _topDisabled,
    rightDisabled: _rightDisabled,
    bottomDisabled: _bottomDisabled,
    leftDisabled: _leftDisabled,
    constrainTop: _constrainTop,
    constrainRight: _constrainRight,
    constrainBottom: _constrainBottom,
    constrainLeft: _constrainLeft,
    content: _content,
    tail: _tail,
    ...rest
  } = props;

  return rest;
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
    content: 'div',
  };

  _nextContent: Dimensions | null = null;
  _nextTail: Dimensions | null = null;
  _nextContainingBlock: RectLike = Rect.zero;
  _nextBounds: RectLike | null = Rect.zero;
  _lastRegion: Region | void;
  _isMounted: boolean = false;
  _containingBlockNode: HTMLElement | null = null;
  _node: HTMLElement | null = null;
  state = this._getState(this.props);

  _handleContentSize = this._handleContentSize.bind(this);
  _handleTailSize = this._handleTailSize.bind(this);
  _handleScroll = this._handleScroll.bind(this);

  // ===========================================================================
  // Lifecycle Methods.
  // ===========================================================================
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
    this._nextBounds = this._getBoundsRect(nextProps);

    this._updateState(nextProps);
  }

  componentDidUpdate(): void {
    this._updateDOMNodes();
  }

  componentWillUnmount(): void {
    this._isMounted = false;

    this._containingBlockNode = null;
    this._node = null;

    window.removeEventListener('scroll', this._handleScroll);
    window.removeEventListener('resize', this._handleScroll);
  }

  // ===========================================================================
  // State Management.
  // ===========================================================================

  _getLastRegion(nextProps: Props): Region | void {
    return this._lastRegion || nextProps.region;
  }

  _getRegion(nextProps: Props): Region | void {
    // Feed the current region in as the default if `sticky` is true.
    // This makes the component stay in its region until it meets a
    // boundary edge and must change.
    return nextProps.sticky ? this._getLastRegion(nextProps) : nextProps.region;
  }

  /**
   * Get the dimension of the tail perpendicular to the attached edge of the
   * content rect.
   *
   * Note: `props` are passed in as an argument to allow using this method from
   * within `componentWillReceiveProps`.
   *
   * @param   {Object} nextProps - FlowTip props.
   * @returns {number} Tail length.
   */
  _getTailLength(nextProps: Props): number {
    const lastRegion = this._getLastRegion(nextProps);

    if (this._nextTail) {
      // Swap the width and height into "base" and "length" to create
      // measurements that are agnostic to tail orientation.
      if (lastRegion === LEFT || lastRegion === RIGHT) {
        return this._nextTail.width;
      }
      // Either lastRegion is top or bottom - or it is undefined, which means
      // the tail was rendered using the static dummy result that uses the
      // bottom region.
      return this._nextTail.height;
    }

    return 0;
  }

  /**
   * Get the offset between the target and the content rect.
   *
   * The flowtip layout calculation does not factor the dimensions of the tail.
   * This method encodes the tail dimension into the `offset` parameter.
   *
   * Note: `props` are passed in as an argument to allow using this method from
   * within `componentWillReceiveProps`.
   *
   * @param   {Object} nextProps - FlowTip props.
   * @returns {number} Tail length.
   */
  _getOffset(nextProps: Props) {
    // Ensure that the there is `targetOffset` amount of space between the
    // tail and the target rect.
    return nextProps.targetOffset + this._getTailLength(nextProps);
  }

  /**
   * Get the dimension of the tail parallel to the attached edge of the content
   * rect.
   *
   * Note: `props` are passed in as an argument to allow using this method from
   * within `componentWillReceiveProps`.
   *
   * @param   {Object} nextProps - FlowTip props.
   * @returns {number} Tail base size.
   */
  _getTailBase(nextProps: Props): number {
    const lastRegion = this._getLastRegion(nextProps);

    if (this._nextTail) {
      // Swap the width and height into "base" and "length" to create
      // measurements that are agnostic to tail orientation.
      if (lastRegion === LEFT || lastRegion === RIGHT) {
        return this._nextTail.height;
      }
      // Either lastRegion is top or bottom - or it is undefined, which means
      // the tail was rendered using the static dummy result that uses the
      // bottom region
      return this._nextTail.width;
    }

    return 0;
  }

  /**
   * Get current minimum linear overlap value.
   *
   * Overlap ensures that there is always enough room to render a tail that
   * points to the target rect. This will force the content to enter a
   * different region if there is not enough room. The `tailOffset` value
   * is the minumun distance between the tail and the content corner.
   *
   * Note: `props` are passed in as an argument to allow using this method from
   * within `componentWillReceiveProps`.
   *
   * @param   {Object} nextProps - FlowTip props.
   * @returns {number} Minimum linear overlap.
   */
  _getOverlap(nextProps: Props): number {
    return nextProps.tailOffset + this._getTailBase(nextProps) / 2;
  }

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

    let result = null;

    if (
      bounds &&
      target &&
      content &&
      (typeof nextProps.Tail !== 'function' || tail)
    ) {
      const config = {
        offset: this._getOffset(nextProps),
        overlap: this._getOverlap(nextProps),
        align: nextProps.align,
        region: this._getRegion(nextProps),
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

      this._lastRegion = result.region;
    }

    return {
      containingBlock,
      bounds,
      content,
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

  // ===========================================================================
  // DOM Measurement Methods.
  // ===========================================================================

  _getBoundsRect(nextProps: Props): RectLike | null {
    const viewport = new Rect(
      0,
      0,
      window.document.documentElement.clientWidth,
      window.document.documentElement.clientHeight,
    );

    const bounds = Rect.grow(
      nextProps.bounds ? Rect.intersect(viewport, nextProps.bounds) : viewport,
      -nextProps.edgeOffset,
    );

    // A rect with neagitve dimensions doesn't make sense here.
    // Returning null disable rendering of any content.
    if (bounds.width >= 0 && bounds.height >= 0) {
      return bounds;
    }

    return null;
  }

  _getContainingBlockRect(): RectLike {
    if (!this._containingBlockNode) return Rect.zero;
    return Rect.from(this._containingBlockNode.getBoundingClientRect());
  }

  // ===========================================================================
  // DOM Element Accessors.
  // ===========================================================================

  _updateDOMNodes(): void {
    const node = findDOMNode(this);
    this._node = node instanceof HTMLElement ? node : null;

    const block = this._node && getContainingBlock(this._node.parentNode);
    if (block) {
      this._containingBlockNode = block;
    } else {
      // Refine nullable `document.body`.
      // see: https://stackoverflow.com/questions/42377663
      if (document.body === null) {
        throw new Error('document.body is null');
      }
      this._containingBlockNode = document.body;
    }
  }

  // ===========================================================================
  // Event Handlers.
  // ===========================================================================

  /**
   * Content `ResizeObserver` handler.
   *
   * Responds to changes in the dimensions of the rendered content and updates
   * the cached `_nextContent` rect and triggers a state update.
   *
   * @param   {Object} rect - DOMRect instance.
   * @returns {void}
   */
  _handleContentSize(rect: ClientRect): void {
    this._nextContent = {width: rect.width, height: rect.height};
    this._updateState(this.props);
  }

  /**
   *
   * Tail `ResizeObserver` handler.
   *
   * Responds to changes in the dimensions of the rendered tail element and
   * updates the cached `_nextContent` rect and triggers a state update.
   *
   * @param   {Object} rect - DOMRect instance.
   * @returns {void}
   */
  _handleTailSize(rect: ClientRect): void {
    this._nextTail = {width: rect.width, height: rect.height};
    this._updateState(this.props);
  }

  /**
   * Window scroll handler.
   *
   * Responds to changes in the window scroll position to update the cached
   * `_nextContainingBlock` and `_nextBounds` rects and triggers a state update.
   *
   * @returns {void}
   */
  _handleScroll(): void {
    this._nextContainingBlock = this._getContainingBlockRect();
    this._nextBounds = this._getBoundsRect(this.props);
    this._updateState(this.props);
  }

  // ===========================================================================
  // Render Methods.
  // ===========================================================================

  /**
   * Get the content element position style based on the current layout result
   * in the state.
   *
   * @param   {Object} result - A `flowtip` layout result.
   * @returns {Object} Content position style.
   */
  _getContentStyle(result: Result): Style {
    const {containingBlock} = this.state;

    // Hide the result with css clip - preserving its ability to be measured -
    // when working with a static layout result mock.
    if (!result || result._static === true) {
      return {
        position: 'absolute',
        clip: 'rect(0 0 0 0)',
      };
    }

    return {
      position: 'absolute',
      top: Math.round(result.rect.top - containingBlock.top),
      left: Math.round(result.rect.left - containingBlock.left),
    };
  }

  /**
   * Get the tail element position style based on the current layout result in
   * the state.
   *
   * @param   {Object} result - A `flowtip` layout result.
   * @returns {Object} Tail position style.
   */
  _getTailStyle(result: Result): Style {
    const {tailOffset} = this.props;
    const {tail} = this.state;

    if (!result) return {position: 'absolute'};

    const {region} = result;

    const tailAttached = result.offset >= this._getOffset(this.props);

    const style: Style = {
      position: 'absolute',
      visibility: tailAttached ? 'visible' : 'hidden',
    };

    if (tail) {
      const position = getClampedTailPosition(result, tail, tailOffset);

      // Position the tail at the opposite edge of the region. i.e. if region is
      // `right` the style will be `right: 100%`, which will place the tail
      // at left edge.
      style[region] = '100%';

      if (region === RIGHT || region === LEFT) {
        style.top = position;
      } else {
        style.left = position;
      }
    }

    return style;
  }

  /**
   * Render the tail element. A `ResizeObserver` is inserted to allow measuring
   * the dimensions of the rendered content.
   *
   * @param   {Object} result - A `flowtip` layout result.
   * @returns {Object|null} Rendered element.
   */
  renderTail(result: Result): React.Node {
    if (!this.props.tail) return null;

    const {tail: Tail} = this.props;
    const tailStyle = this._getTailStyle(result);

    return (
      <Tail result={result} style={tailStyle}>
        <ResizeObserver onResize={this._handleTailSize} />
      </Tail>
    );
  }

  /**
   * Render the content element. A `ResizeObserver` is inserted before the other
   * children to allow measuring the dimensions of the rendered content.
   *
   * @param   {Object} result - A `flowtip` layout result.
   * @returns {Object|null} Rendered element.
   */
  renderContent(result: Result): React.Node {
    if (!this.props.content) return null;

    const {children, content: Content} = this.props;

    const contentProps = {
      ...omitFlowtipProps(this.props),
      style: this._getContentStyle(result),
    };

    if (typeof Content === 'function') {
      contentProps.result = result;
    }

    return (
      <Content {...contentProps}>
        <ResizeObserver onResize={this._handleContentSize} />
        {children}
        {this.renderTail(result)}
      </Content>
    );
  }

  render(): React.Node {
    if (this.state.result) {
      return this.renderContent(this.state.result);
    }

    if (this.props.content) {
      return this.renderContent(STATIC_RESULT);
    }

    return null;
  }
}

export default FlowTip;
