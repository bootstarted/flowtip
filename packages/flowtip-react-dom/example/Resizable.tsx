import * as React from 'react';

import Rect, {RectShape} from 'flowtip-rect';

interface Point {
  x: number;
  y: number;
}

const POINT_ZERO = {x: 0, y: 0};

export type Handle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

interface Props {
  anchor: Point;
  value: RectShape;
  onChange?: (value: Rect) => unknown;
  handleSize: number;
  handles: {[key in Handle]: boolean};
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
}

const Resizable = (props: Props): React.ReactElement | null => {
  const propsRef = React.useRef<Props>();
  propsRef.current = props;

  const nwHandleRef = React.useRef<HTMLDivElement>(null);
  const nHandleRef = React.useRef<HTMLDivElement>(null);
  const neHandleRef = React.useRef<HTMLDivElement>(null);
  const eHandleRef = React.useRef<HTMLDivElement>(null);
  const seHandleRef = React.useRef<HTMLDivElement>(null);
  const sHandleRef = React.useRef<HTMLDivElement>(null);
  const swHandleRef = React.useRef<HTMLDivElement>(null);
  const wHandleRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Refs to keep track of drag start values during subsequent renders
  const startValueRef = React.useRef<RectShape>();
  const startPointRef = React.useRef<Point>();

  const activeElementRef = React.useRef<HTMLDivElement>();

  const [hasFocus, setHasFocus] = React.useState<boolean>(false);
  const [mouseOver, setMouseOver] = React.useState<boolean>(false);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);

  const handleMouseDown = (event: React.MouseEvent): void => {
    if (event.target instanceof HTMLDivElement) {
      activeElementRef.current = event.target;
      startValueRef.current = props.value;
      startPointRef.current = {
        x: event.clientX - props.anchor.x,
        y: event.clientY - props.anchor.y,
      };
    }
  };

  const handleMouseUp = React.useCallback(() => {
    startValueRef.current = undefined;
    startPointRef.current = undefined;
    activeElementRef.current = undefined;
    setIsDragging(false);
  }, []);

  const handleMouseMove = React.useCallback((event: MouseEvent) => {
    const startPoint = startPointRef.current;
    const startValue = startValueRef.current;
    const activeElement = activeElementRef.current;

    if (!activeElement || !startValue || !startPoint || !propsRef.current) {
      return;
    }

    const {
      value,
      maxHeight,
      minHeight,
      maxWidth,
      minWidth,
      onChange,
    } = propsRef.current;

    setIsDragging(true);

    const drag = {
      x: event.clientX - startPoint.x - propsRef.current.anchor.x,
      y: event.clientY - startPoint.y - propsRef.current.anchor.y,
    };

    let top = value.top;
    let left = value.left;
    let bottom = value.top + value.height;
    let right = value.left + value.width;

    let setTop = (): void => {
      top = Math.min(
        Math.max(startValue.top + drag.y, value.top + value.height - maxHeight),
        value.top + value.height - minHeight,
      );
    };

    let setRight = (): void => {
      right = Math.max(
        Math.min(
          startValue.left + startValue.width + drag.x,
          value.left + maxWidth,
        ),
        value.left + minWidth,
      );
    };

    let setBottom = (): void => {
      bottom = Math.max(
        Math.min(
          startValue.top + startValue.height + drag.y,
          value.top + maxHeight,
        ),
        value.top + minHeight,
      );
    };

    let setLeft = (): void => {
      left = Math.min(
        Math.max(startValue.left + drag.x, value.left + value.width - maxWidth),
        value.left + value.width - minWidth,
      );
    };

    if (value.width < 0) {
      const temp = setLeft;
      setLeft = setRight;
      setRight = temp;
    }

    if (value.height < 0) {
      const temp = setTop;
      setTop = setBottom;
      setBottom = temp;
    }

    if (activeElement === contentRef.current) {
      top = startValue.top + drag.y;
      right = startValue.left + startValue.width + drag.x;
      bottom = startValue.top + startValue.height + drag.y;
      left = startValue.left + drag.x;
    } else if (activeElement === nwHandleRef.current) {
      setTop();
      setLeft();
    } else if (activeElement === nHandleRef.current) {
      setTop();
    } else if (activeElement === neHandleRef.current) {
      setTop();
      setRight();
    } else if (activeElement === eHandleRef.current) {
      setRight();
    } else if (activeElement === seHandleRef.current) {
      setBottom();
      setRight();
    } else if (activeElement === sHandleRef.current) {
      setBottom();
    } else if (activeElement === swHandleRef.current) {
      setBottom();
      setLeft();
    } else if (activeElement === wHandleRef.current) {
      setLeft();
    } else {
      // The active element is not currently mounted. This is the case when a
      // handle is disabled during a drag event
      handleMouseUp();
      return;
    }

    if (onChange) {
      onChange(new Rect(left, top, right - left, bottom - top));
    }
  }, []);

  // Attach/remove global event listeners
  React.useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Update forced global cursor style
  React.useEffect((): (() => void) => {
    let cursor;

    switch (activeElementRef.current) {
      case contentRef.current:
        if (isDragging) {
          cursor = 'grabbing';
        }
        break;
      case nwHandleRef.current:
      case seHandleRef.current:
        cursor = 'nwse-resize';
        break;
      case nHandleRef.current:
      case sHandleRef.current:
        cursor = 'ns-resize';
        break;
      case neHandleRef.current:
      case swHandleRef.current:
        cursor = 'nesw-resize';
        break;
      case eHandleRef.current:
      case wHandleRef.current:
        cursor = 'ew-resize';
        break;
    }

    if (cursor) {
      const style = `*,*::before,*::after{cursor:${cursor} !important}`;

      const styleTag = document.createElement('style');
      styleTag.appendChild(document.createTextNode(style));

      return () => {
        if (styleTag.parentNode) {
          styleTag.parentNode.removeChild(styleTag);
        }
      };
    }

    return () => {};
  }, [activeElementRef.current, isDragging]);

  const renderHandle = (
    ref: React.RefObject<HTMLDivElement>,
    style: React.CSSProperties,
  ): React.ReactNode => (
    <div
      ref={ref}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        margin: 'auto',
        width: props.handleSize,
        height: props.handleSize,
        outline: '1px solid black',
        background: 'rgba(255,255,255,0.25)',
        ...style,
      }}
    />
  );

  const absPosition = Rect.abs(props.value);
  const handlePos = -0.5 * (props.handleSize + 1);

  const hideMidHandleBelow = 17;

  return (
    <div
      ref={contentRef}
      onMouseDown={handleMouseDown}
      onMouseEnter={(event: React.MouseEvent) => {
        // Ignore mouseenter events when the primary mouse button is pressed.
        // This is a quick way to ignore what is likely a drag event.
        if (!(event.buttons & 1)) {
          setMouseOver(true);
        }
      }}
      onMouseLeave={() => {
        // Mouse leave events may be fired during a handle drag if the DOM is
        // slow to update below the cursor or if the value is constrained while
        // dragging.
        if (!isDragging) {
          setMouseOver(false);
        }
      }}
      tabIndex={0}
      onFocus={() => setHasFocus(true)}
      onBlur={() => setHasFocus(false)}
      style={{
        position: 'absolute',
        top: absPosition.top,
        left: absPosition.left,
        width: absPosition.width,
        height: absPosition.height,
        outlineOffset: -1,
        outline:
          mouseOver && !hasFocus ? '2px solid rgba(0, 128, 255, 0.75)' : 'none',
      }}
    >
      {props.handles.nw &&
        hasFocus &&
        renderHandle(nwHandleRef, {top: handlePos, left: handlePos})}
      {props.handles.n &&
        hasFocus &&
        absPosition.width >= hideMidHandleBelow &&
        renderHandle(nHandleRef, {top: handlePos, left: 0, right: 0})}
      {props.handles.ne &&
        hasFocus &&
        renderHandle(neHandleRef, {top: handlePos, right: handlePos})}
      {props.handles.e &&
        hasFocus &&
        absPosition.height >= hideMidHandleBelow &&
        renderHandle(eHandleRef, {right: handlePos, top: 0, bottom: 0})}
      {props.handles.se &&
        hasFocus &&
        renderHandle(seHandleRef, {right: handlePos, bottom: handlePos})}
      {props.handles.s &&
        hasFocus &&
        absPosition.width >= hideMidHandleBelow &&
        renderHandle(sHandleRef, {bottom: handlePos, left: 0, right: 0})}
      {props.handles.sw &&
        hasFocus &&
        renderHandle(swHandleRef, {left: handlePos, bottom: handlePos})}
      {props.handles.w &&
        hasFocus &&
        absPosition.height >= hideMidHandleBelow &&
        renderHandle(wHandleRef, {left: handlePos, top: 0, bottom: 0})}
    </div>
  );
};

Resizable.defaultProps = {
  anchor: POINT_ZERO,
  handleSize: 5,
  handles: {
    nw: true,
    n: true,
    ne: true,
    e: true,
    se: true,
    s: true,
    sw: true,
    w: true,
  },
  minWidth: Number.NEGATIVE_INFINITY,
  minHeight: Number.NEGATIVE_INFINITY,
  maxWidth: Number.POSITIVE_INFINITY,
  maxHeight: Number.POSITIVE_INFINITY,
};

export default Resizable;
