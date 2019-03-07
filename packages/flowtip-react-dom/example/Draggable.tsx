import * as React from 'react';

import Rect from 'flowtip-rect';
import {getContainingBlock, getContentRect} from '../src';
import ResizeObserver from 'react-resize-observer';

interface DraggableProps {
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onReflow?: (rect: Rect) => void;
}

interface DraggableState {
  rect: Rect;
  startX: number;
  startY: number;
  dragging: boolean;
}

const Draggable: React.StatelessComponent<DraggableProps> = ({
  children,
  onReflow,
  style,
}) => {
  const [state, setState] = React.useState<DraggableState>({
    rect: Rect.zero,
    startX: 0,
    startY: 0,
    dragging: false,
  });

  const elementRef = React.useRef<HTMLDivElement>(null);

  // const clippingBlockNode = elementRef.current
  //   ? getClippingBlock(elementRef.current.parentNode)
  //   : undefined;
  const containingBlockNode = elementRef.current
    ? getContainingBlock(elementRef.current.parentNode)
    : undefined;

  const containingRect = containingBlockNode
    ? getContentRect(containingBlockNode)
    : undefined;

  // const boundsRect = clippingBlockNode
  //   ? clippingBlockNode.getBoundingClientRect()
  //   : undefined;

  React.useEffect(() => {
    if (state.dragging) {
      const handleMouseMove = (event: MouseEvent) => {
        setState((currentState: DraggableState) => {
          if (!elementRef.current) {
            return currentState;
          }

          if (!containingRect || !containingBlockNode) {
            return currentState;
          }

          const left /*Math.max(
            boundsRect.left - containingRect.left,
            Math.min(
              boundsRect.left + boundsRect.width - currentState.rect.width,*/ =
              event.clientX -
              currentState.startX /*,
            ),
          )*/;

          const top /*Math.max(
            boundsRect.top - containingRect.top,
            Math.min(
              boundsRect.top + boundsRect.height - currentState.rect.height,*/ =
              event.clientY -
              currentState.startY /*,
            ),
          )*/;

          const nextRect = new Rect(
            left,
            top,
            currentState.rect.width,
            currentState.rect.height,
          );

          if (onReflow) {
            onReflow(nextRect);
          }

          return {...currentState, rect: nextRect};
        });
      };

      const handleMouseUp = (event: MouseEvent) => {
        setState((currentState: DraggableState) => ({
          ...currentState,
          dragging: false,
        }));
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseMove);
      };
    }
    return () => {};
  }, [state.dragging]);

  return (
    <div
      ref={elementRef}
      onMouseDown={(event) => {
        setState((currentState: DraggableState) => ({
          ...currentState,
          dragging: true,
          startX: event.clientX - currentState.rect.left,
          startY: event.clientY - currentState.rect.top,
        }));
      }}
      style={{
        position: 'absolute',
        top:
          state.rect.y +
          (containingBlockNode ? containingBlockNode.scrollTop : 0) -
          (containingRect ? containingRect.top : 0),
        left:
          state.rect.x +
          (containingBlockNode ? containingBlockNode.scrollLeft : 0) -
          (containingRect ? containingRect.left : 0),
        userSelect: 'none',
        cursor: 'default',
        ...style,
      }}
    >
      <ResizeObserver
        onReflow={(rect) => {
          setState((currentState: DraggableState) => {
            const nextRect = Rect.fromRect(rect);

            if (onReflow) {
              onReflow(nextRect);
            }

            return {...currentState, rect: nextRect};
          });
        }}
      />
      {children}
    </div>
  );
};

export default React.memo(Draggable);
