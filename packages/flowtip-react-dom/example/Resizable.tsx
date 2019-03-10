import * as React from 'react';

import Rect, {RectShape} from 'flowtip-rect';

interface Point {
  x: number;
  y: number;
}

const POINT_ZERO = {x: 0, y: 0};

export type Handle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export interface Props {
  anchor?: Point;
  value: RectShape;
  onChange?: (value: Rect) => unknown;
  handleSize?: number;
  handles?: {[key in Handle]: boolean};
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

const Resizable: React.StatelessComponent<Props> = (props): React.ReactNode => {
  const propsRef = React.useRef<Props>();
  propsRef.current = props;

  const nwHandleRef = React.useRef<HTMLDivElement>();
  const nHandleRef = React.useRef<HTMLDivElement>();
  const neHandleRef = React.useRef<HTMLDivElement>();
  const eHandleRef = React.useRef<HTMLDivElement>();
  const seHandleRef = React.useRef<HTMLDivElement>();
  const sHandleRef = React.useRef<HTMLDivElement>();
  const swHandleRef = React.useRef<HTMLDivElement>();
  const wHandleRef = React.useRef<HTMLDivElement>();
  const contentRef = React.useRef<HTMLDivElement>();

  // Refs to keep track of drag start values during subsequent renders
  const startValueRef = React.useRef<Rect>();
  const startPointRef = React.useRef<Point>();

  const activeElementRef = React.useRef<HTMLDivElement>();

  const [hasFocus, setHasFocus] = React.useState<boolean>(false);
  const [mouseOver, setMouseOver] = React.useState<boolean>(false);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);

  const handleMouseDown = (event: React.MouseEvent): void => {
    if (event.target instanceof HTMLDivElement) {
      startValueRef.current = props.value;
      startPointRef.current = {
        x: event.clientX - props.anchor.x,
        y: event.clientY - props.anchor.y,
      };
      activeElementRef.current = event.target;
    }
  };

  const handleMouseUp = React.useCallback(() => {
    startValueRef.current = undefined;
    startPointRef.current = undefined;
    activeElementRef.current = undefined;
    setIsDragging(false);
  }, []);

  const handleMouseMove = React.useCallback((event: MouseEvent) => {
    if (!activeElementRef.current) {
      return;
    }

    setIsDragging(true);

    const drag = {
      x: event.clientX - startPointRef.current.x - propsRef.current.anchor.x,
      y: event.clientY - startPointRef.current.y - propsRef.current.anchor.y,
    };

    let top = propsRef.current.value.top;
    let left = propsRef.current.value.left;
    let bottom = propsRef.current.value.bottom;
    let right = propsRef.current.value.right;

    let setTop = (): void => {
      top = Math.min(
        Math.max(
          startValueRef.current.top + drag.y,
          propsRef.current.value.bottom - propsRef.current.maxHeight,
        ),
        propsRef.current.value.bottom - propsRef.current.minHeight,
      );
    };

    let setRight = (): void => {
      right = Math.max(
        Math.min(
          startValueRef.current.right + drag.x,
          propsRef.current.value.left + propsRef.current.maxWidth,
        ),
        propsRef.current.value.left + propsRef.current.minWidth,
      );
    };

    let setBottom = (): void => {
      bottom = Math.max(
        Math.min(
          startValueRef.current.bottom + drag.y,
          propsRef.current.value.top + propsRef.current.maxHeight,
        ),
        propsRef.current.value.top + propsRef.current.minHeight,
      );
    };

    let setLeft = (): void => {
      left = Math.min(
        Math.max(
          startValueRef.current.left + drag.x,
          propsRef.current.value.right - propsRef.current.maxWidth,
        ),
        propsRef.current.value.right - propsRef.current.minWidth,
      );
    };

    if (propsRef.current.value.width < 0) {
      const temp = setLeft;
      setLeft = setRight;
      setRight = temp;
    }

    if (propsRef.current.value.height < 0) {
      const temp = setTop;
      setTop = setBottom;
      setBottom = temp;
    }

    if (activeElementRef.current === contentRef.current) {
      top = startValueRef.current.top + drag.y;
      right = startValueRef.current.right + drag.x;
      bottom = startValueRef.current.bottom + drag.y;
      left = startValueRef.current.left + drag.x;
    } else if (activeElementRef.current === nwHandleRef.current) {
      setTop();
      setLeft();
    } else if (activeElementRef.current === nHandleRef.current) {
      setTop();
    } else if (activeElementRef.current === neHandleRef.current) {
      setTop();
      setRight();
    } else if (activeElementRef.current === eHandleRef.current) {
      setRight();
    } else if (activeElementRef.current === seHandleRef.current) {
      setBottom();
      setRight();
    } else if (activeElementRef.current === sHandleRef.current) {
      setBottom();
    } else if (activeElementRef.current === swHandleRef.current) {
      setBottom();
      setLeft();
    } else if (activeElementRef.current === wHandleRef.current) {
      setLeft();
    } else {
      // The active element is not currently mounted. This is the case when a
      // handle is disabled during a drag event
      handleMouseUp();
      return;
    }

    if (propsRef.current.onChange) {
      propsRef.current.onChange(
        new Rect(left, top, right - left, bottom - top),
      );
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
  React.useEffect(() => {
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
      tabIndex={0}
      ref={contentRef}
      onMouseDown={handleMouseDown}
      onMouseEnter={(event: React.MouseEvent) => {
        // Ignore mouseenter events when the primary mouse button is pressed.
        // This is a quick way to ignore what is likely a drag event.
        if (event.buttons & 1) {
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
          mouseOver && !hasFocus
            ? '2px solid rgba(0, 128, 255, 0.75)'
            : undefined,
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
