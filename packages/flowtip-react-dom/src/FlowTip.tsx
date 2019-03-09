import * as React from 'react';

import flowtip, {
  Result,
  Region,
  Align,
  Dimensions,
  getClampedTailPosition,
  TOP,
  RIGHT,
  BOTTOM,
  LEFT,
} from 'flowtip-core';
import Rect, {RectShape} from 'flowtip-rect';
import ResizeObserver from 'react-resize-observer';

import Debug from './FlowTipDebug';

import {getBorders} from './domUtil';
import LayoutObserver from './LayoutObserver';
import Point from './Point';

type LayoutObserverOnLayout = Function &
  LayoutObserver['props']['onLayoutChange'];

interface RenderContext {
  anchor: Point;
  result: Result;
  setContentSize: React.Dispatch<React.SetStateAction<Dimensions>>;
  setTailSize: React.Dispatch<React.SetStateAction<Dimensions>>;
  contentStyle: React.CSSProperties;
}

interface Props {
  anchor: Point;
  target: RectShape;
  bounds: RectShape;
  tailSize?: Dimensions;
  contentSize?: Dimensions;
  align?: Align;
  region?: Region;
  sticky: boolean;
  targetOffset: number;
  edgeOffset: number;
  tailOffset: number;
  topDisabled: boolean;
  rightDisabled: boolean;
  bottomDisabled: boolean;
  leftDisabled: boolean;
  constrainTop: boolean;
  constrainRight: boolean;
  constrainBottom: boolean;
  constrainLeft: boolean;
  snapTop: Align[];
  snapRight: Align[];
  snapBottom: Align[];
  snapLeft: Align[];

  debug: boolean;

  children?:
    | ((context: RenderContext, children: React.ReactNode) => React.ReactNode)
    | React.ReactNode;
  tail?:
    | ((context: RenderContext, children: React.ReactNode) => React.ReactNode)
    | {[key in Region]?: React.ReactNode};
}

const FlowTip: React.StatelessComponent<Props> = (props) => {
  const {target = Rect.zero} = props;

  const [anchorPoint, setAnchorPoint] = React.useState<Point>(props.anchor);
  const [boundsRect, setBoundsRect] = React.useState<RectShape>(props.bounds);

  const [tailSize, setTailSize] = React.useState<Dimensions>(Rect.zero);
  React.useMemo(() => {
    if (props.tailSize !== undefined) {
      setTailSize(props.tailSize);
    }
  }, [props.tailSize]);

  const [contentSize, setContentSize] = React.useState<Dimensions>(Rect.zero);
  React.useMemo(() => {
    if (props.contentSize !== undefined) {
      setContentSize(props.contentSize);
    }
  }, [props.contentSize]);

  const snapTop = React.useMemo(() => props.snapTop, props.snapTop);
  const snapRight = React.useMemo(() => props.snapRight, props.snapRight);
  const snapBottom = React.useMemo(() => props.snapBottom, props.snapBottom);
  const snapLeft = React.useMemo(() => props.snapLeft, props.snapLeft);

  const resultRef = React.useRef<Result>();

  const tailLength: number =
    resultRef.current &&
    (resultRef.current.region === TOP || resultRef.current.region === BOTTOM)
      ? tailSize.height
      : tailSize.width;

  const tailBase: number =
    resultRef.current &&
    (resultRef.current.region === LEFT || resultRef.current.region === RIGHT)
      ? tailSize.height
      : tailSize.width;

  const offset = props.targetOffset + tailLength;

  const edgeOffset = props.edgeOffset !== undefined ? props.edgeOffset : offset;

  const result: Result = React.useMemo<Result>(
    () =>
      flowtip({
        // Set the required offset between the target and the content (calculated
        // above based on the rendered tail length).
        offset,
        // Use the calculated target offset as the default edge offset value. This
        // ensures the positioned content does not shift by the length of the tail
        // when it switches regions while constrained to the boundary edge.
        edgeOffset,
        // Require a minimum liner overlap between the target and the positioned
        // content equal to the measured width of the tail (plus additional tail
        // offset value which restricts the tail proximity to the content edges)
        overlap: tailBase * 0.5 + props.tailOffset,
        // Feed the previous result `align` and `region` values as the preferred
        // `align` and `region` value into the next calculation when `sticky` is
        // enabled. The layout resolver will return these values as long as they
        // continue to be valid - causing FlowTip to stick to a specific position
        // until it is forced to move as the result of a collision.
        align:
          props.sticky && resultRef.current
            ? resultRef.current.align
            : props.align,
        region:
          props.sticky && resultRef.current
            ? resultRef.current.region
            : props.region,
        // Constrain the positioned content to the provided (or by LayoutObserver)
        // boundary rectangle.
        bounds: boundsRect,
        // Forward the provided target element rectangle.
        target,
        // The size is measured by a ReactResizeObserver instance (when using the
        // default content render callback). A rectangle instance can be provided
        // but only width and height are referenced in the layout calculation.
        content: contentSize,
        disabled: {
          top: props.topDisabled,
          right: props.rightDisabled,
          bottom: props.bottomDisabled,
          left: props.leftDisabled,
        },
        constrain: {
          top: props.constrainTop,
          right: props.constrainRight,
          bottom: props.constrainBottom,
          left: props.constrainLeft,
        },
        snap: {
          top: snapTop,
          right: snapRight,
          bottom: snapBottom,
          left: snapLeft,
        },
      }),
    [
      resultRef.current ? resultRef.current.align : undefined,
      resultRef.current ? resultRef.current.region : undefined,
      tailSize.width,
      tailSize.height,
      boundsRect.top,
      boundsRect.left,
      boundsRect.width,
      boundsRect.height,
      contentSize.width,
      contentSize.height,
      target.top,
      target.left,
      target.width,
      target.height,
      props.align,
      props.region,
      props.targetOffset,
      props.tailOffset,
      props.edgeOffset,
      props.topDisabled,
      props.rightDisabled,
      props.bottomDisabled,
      props.leftDisabled,
      props.constrainTop,
      props.constrainRight,
      props.constrainBottom,
      props.constrainLeft,
      snapTop,
      snapRight,
      snapBottom,
      snapLeft,
    ],
  );

  resultRef.current = result;

  const constrainedEdge = React.useMemo<string | undefined>(() => {
    if (
      boundsRect.top !== 0 ||
      boundsRect.top + boundsRect.height !== window.innerHeight
    ) {
      return undefined;
    }

    if (props.constrainTop) {
      const minTop =
        result.region === BOTTOM
          ? Math.max(offset || 0, edgeOffset || 0)
          : edgeOffset || 0;

      if (result.rect.top <= minTop) {
        return TOP;
      }
    }

    if (props.constrainBottom) {
      const maxBottom =
        result.region === TOP
          ? Math.max(offset || 0, edgeOffset || 0)
          : edgeOffset || 0;

      if (result.rect.bottom >= maxBottom) {
        return BOTTOM;
      }
    }

    return undefined;
  }, [
    result,
    boundsRect.top,
    boundsRect.height,
    window.innerHeight,
    props.constrainTop,
    props.constrainBottom,
    offset,
    edgeOffset,
  ]);

  const contentStyle = React.useMemo<React.CSSProperties>(() => {
    // If the tail content dimensions are not yet known (this is the case on the
    // initial render when using react-resize-observer) hide the content with
    // css clip. Doing so makes it invisible but still forces the DOM to
    // calculate its layout - allowing its size to be measured using
    // react-resize-observer.
    if (contentSize.width === 0 && contentSize.height === 0) {
      return {
        position: 'absolute',
        clip: 'rect(0 0 0 0)',
      };
    }

    if (constrainedEdge === TOP) {
      return {
        position: 'fixed',
        top: Math.round(result.rect.top),
        left: Math.round(result.rect.left),
      };
    } else if (constrainedEdge === BOTTOM) {
      return {
        position: 'fixed',
        bottom: Math.round(window.innerHeight - result.rect.bottom),
        left: Math.round(result.rect.left),
      };
    }
    return {
      position: 'absolute',
      top: Math.round(result.rect.top - anchorPoint.y),
      left: Math.round(result.rect.left - anchorPoint.x),
    };
  }, [
    result,
    contentSize.width,
    contentSize.height,
    constrainedEdge,
    window.innerHeight,
    anchorPoint.x,
    anchorPoint.y,
  ]);

  const contentRef = React.useRef<HTMLElement>();

  const tailStyle = React.useMemo<React.CSSProperties>(() => {
    const style: React.CSSProperties = {
      position: 'absolute',
    };

    // If the tail dimensions are not yet known (this is the case on the initial
    // render when using react-resize-observer) or if the tail is positioned
    // such that it intersects the defined target hide the tail with css clip.
    // Doing so makes it invisible but still forces the DOM to calculate its
    // layout - allowing its size to be measured using react-resize-observer.
    if (
      (tailSize.width === 0 && tailSize.height === 0) ||
      result.offset < offset
    ) {
      style.clip = 'rect(0 0 0 0)';
      return style;
    }

    const borders = contentRef.current
      ? getBorders(contentRef.current)
      : undefined;

    const position = getClampedTailPosition(result, tailSize, props.tailOffset);

    if (borders) {
      style[result.region] = `calc(100% + ${borders[result.region]}px)`;
    } else {
      style[result.region] = '100%';
    }

    if (result.region === RIGHT || result.region === LEFT) {
      style.top = position - (borders ? borders.top : 0);
    } else {
      style.left = position - (borders ? borders.left : 0);
    }

    return style;
  }, [
    result,
    contentRef.current,
    tailSize.width,
    tailSize.height,
    offset,
    props.tailOffset,
  ]);

  const context = React.useMemo<RenderContext>(() => {
    return {
      anchor: anchorPoint,
      result,
      setContentSize,
      setTailSize,
      contentStyle,
      tailStyle,
      contentRef,
    };
  }, [
    anchorPoint,
    result,
    setContentSize,
    setTailSize,
    contentStyle,
    tailStyle,
  ]);

  const tailResizeObserver = props.tailSize === undefined && (
    <ResizeObserver onResize={setTailSize} />
  );

  // Call the tail render callback or lookup a tail element from a map of
  // regions depending on the value of the `tail` prop.
  const tailElement =
    typeof props.tail === 'function'
      ? props.tail(context, tailResizeObserver)
      : props.tail &&
        props.tail[result.region] && (
          <div style={tailStyle}>
            {tailResizeObserver}
            {props.tail[result.region]}
          </div>
        );

  const contentResizeObserver = props.contentSize === undefined && (
    <ResizeObserver onResize={setContentSize} />
  );

  // Call the content render callback, passing it the resolved tail and a resize
  // observer - which can be rendered or discarded. If the resize observer and
  // tail are not rendered, the `setTailSize` and `setContentSize` props must
  // be called.
  const contentElement =
    typeof props.children === 'function' ? (
      (props.children as any)(
        context,
        <>
          {contentResizeObserver}
          {tailElement}
        </>,
      )
    ) : (
      <div style={context.contentStyle}>
        {contentResizeObserver}
        {tailElement}
        {props.children}
      </div>
    );

  const layoutObserver = (
    <LayoutObserver
      onLayoutChange={React.useCallback<LayoutObserverOnLayout>(
        ({anchor, clippingRect}) => {
          setAnchorPoint(anchor);
          setBoundsRect(clippingRect);
        },
        [setAnchorPoint, setBoundsRect],
      )}
    />
  );

  return (
    <>
      {props.debug && (
        <Debug rect={result.rect} bounds={boundsRect} target={props.target} />
      )}
      {layoutObserver}
      {contentElement}
    </>
  );
};

const defaultSnap = [0, 0.5, 1];

FlowTip.defaultProps = {
  anchor: Rect.zero,
  bounds: Rect.zero,
  sticky: true,
  targetOffset: 0,
  tailOffset: 0,
  align: 0.5,
  topDisabled: false,
  rightDisabled: false,
  bottomDisabled: false,
  leftDisabled: false,
  constrainTop: true,
  constrainRight: true,
  constrainBottom: true,
  constrainLeft: true,
  snapTop: defaultSnap,
  snapRight: defaultSnap,
  snapBottom: defaultSnap,
  snapLeft: defaultSnap,
  debug: false,
};

export default FlowTip;
