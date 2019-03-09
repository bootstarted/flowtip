import * as React from 'react';

import ResizeObserver from 'react-resize-observer';
import Rect, {RectShape} from 'flowtip-rect';

import {useDebouncedState, useId} from './util/react';
import FlowTip, {TailProps} from '../src';

const triangles = {
  top: (
    <div
      style={{
        width: 0,
        height: 0,
        borderTop: '6px solid rgba(0,0,0,0.5)',
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
      }}
    />
  ),
  right: (
    <div
      style={{
        width: 0,
        height: 0,
        borderRight: '6px solid rgba(0,0,0,0.5)',
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
      }}
    />
  ),
  bottom: (
    <div
      style={{
        width: 0,
        height: 0,
        borderBottom: '6px solid rgba(0,0,0,0.5)',
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
      }}
    />
  ),
  left: (
    <div
      style={{
        width: 0,
        height: 0,
        borderLeft: '6px solid rgba(0,0,0,0.5)',
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
      }}
    />
  ),
};

interface TooltipProps {
  showDelay?: number;
  hideDelay?: number;
  style?: React.CSSProperties;
  children?:
    | ((handleReflow: (rect: RectShape) => unknown) => React.ReactNode)
    | React.ReactNode;
  content?: React.ReactNode;
  active?: boolean;
  draggable?: boolean;
}

const Tooltip: React.StatelessComponent<TooltipProps> = ({
  showDelay = 0,
  hideDelay = 500,
  style,
  children,
  active: staticActive,
  draggable,
  content,
}) => {
  const [active, setActive] = useDebouncedState(false);
  const [target, setTarget] = React.useState<Rect>(Rect.zero);

  const tooltipId = useId();

  const targetRef = React.useRef<HTMLSpanElement>(null);
  const targetResizeRef = React.useRef<ResizeObserver>(null);

  React.useEffect(() => {
    if (staticActive !== undefined) {
      return;
    }

    const handleMouseMove = (event: UIEvent) => {
      if (
        targetRef.current &&
        event.target instanceof Node &&
        targetRef.current.contains(event.target)
      ) {
        setActive(true, showDelay);
      } else {
        setActive(false, hideDelay);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [staticActive]);

  const handleReflow = (rect: RectShape) => setTarget(Rect.fromRect(rect));

  return (
    <span
      aria-describedby={tooltipId}
      style={
        typeof children === 'function'
          ? style
          : {position: 'relative', ...style}
      }
      ref={targetRef}
      draggable={draggable}
    >
      {typeof children === 'function' ? (
        children(handleReflow)
      ) : (
        <>
          <ResizeObserver ref={targetResizeRef} onReflow={handleReflow} />
          {children}
        </>
      )}

      {(staticActive || active) && (
        <FlowTip debug target={target} tail={triangles} tailOffset={8}>
          <div
            id={tooltipId}
            role="tooltip"
            style={{
              borderRadius: 8,
              background: 'rgba(0,0,0,0.5)',
              padding: '18px 6px',
              color: 'white',
              whiteSpace: 'nowrap',
            }}
          >
            {content}
          </div>
        </FlowTip>
      )}
    </span>
  );
};

export default React.memo(Tooltip);
