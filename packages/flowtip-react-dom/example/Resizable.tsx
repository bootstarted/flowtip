import * as React from 'react';

import Rect, {RectShape} from 'flowtip-rect';

export interface Point {
  x: number;
  y: number;
}

const POINT_ZERO = {x: 0, y: 0};

export type Handle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export interface Props {
  anchor?: Point;
  position: RectShape;
  onChange?: (position: Rect) => unknown;
  handleSize?: number;
  handles?: {[key in Handle]: boolean};
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

interface State {
  activeHandle?: HTMLDivElement;
  anchor: Point;
  cursor?: string;
  dragging: boolean;
  focus: boolean;
  invertedX: boolean;
  invertedY: boolean;
  mouseOver: boolean;
  position: Rect;
  startPoint: Point;
  startPosition: Rect;
}

class Resizable extends React.PureComponent<Props, State> {
  static defaultProps = {
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

  static getDerivedStateFromProps({position}: Props) {
    return {position};
  }

  state: State = {
    anchor: this.props.anchor,
    cursor: undefined,
    dragging: false,
    focus: false,
    invertedX: false,
    invertedY: false,
    mouseOver: false,
    position: this.props.position,
    startPoint: POINT_ZERO,
    startPosition: Rect.zero,
  };

  styleTag = document.createElement('style');

  topLeftHandleRef = React.createRef<HTMLDivElement>();
  topHandleRef = React.createRef<HTMLDivElement>();
  topRightHandleRef = React.createRef<HTMLDivElement>();
  rightHandleRef = React.createRef<HTMLDivElement>();
  bottomRightHandleRef = React.createRef<HTMLDivElement>();
  bottomHandleRef = React.createRef<HTMLDivElement>();
  bottomLeftHandleRef = React.createRef<HTMLDivElement>();
  leftHandleRef = React.createRef<HTMLDivElement>();
  contentRef = React.createRef<HTMLDivElement>();

  handleFocus = () => {
    this.setState((state) => (!state.focus ? {focus: true} : null));
  };

  handleBlur = () => {
    this.setState((state) => (state.focus ? {focus: false} : null));
  };

  handleMouseEnter = (event: React.MouseEvent) => {
    if (event.buttons === 0) {
      this.setState((state) => (!state.mouseOver ? {mouseOver: true} : null));
    }
  };

  handleMouseLeave = () => {
    if (!this.state.dragging) {
      this.setState((state) => (state.mouseOver ? {mouseOver: false} : null));
    }
  };

  handleMouseMove = (event: MouseEvent) => {
    if (this.state.activeHandle) {
      const drag = {
        x: event.clientX - this.state.anchor.x - this.state.startPoint.x,
        y: event.clientY - this.state.anchor.y - this.state.startPoint.y,
      };

      let cursor;

      let top = this.state.position.top;
      let left = this.state.position.left;
      let bottom = this.state.position.bottom;
      let right = this.state.position.right;

      const setTop = () => {
        top = Math.min(
          Math.max(
            this.state.startPosition.top + drag.y,
            this.state.position.bottom - this.props.maxHeight,
          ),
          this.state.position.bottom - this.props.minHeight,
        );
      };

      const setRight = () => {
        right = Math.max(
          Math.min(
            this.state.startPosition.right + drag.x,
            this.state.position.left + this.props.maxWidth,
          ),
          this.state.position.left + this.props.minWidth,
        );
      };

      const setBottom = () => {
        bottom = Math.max(
          Math.min(
            this.state.startPosition.bottom + drag.y,
            this.state.position.top + this.props.maxHeight,
          ),
          this.state.position.top + this.props.minHeight,
        );
      };

      const setLeft = () => {
        left = Math.min(
          Math.max(
            this.state.startPosition.left + drag.x,
            this.state.position.right - this.props.maxWidth,
          ),
          this.state.position.right - this.props.minWidth,
        );
      };

      switch (this.state.activeHandle) {
        case this.contentRef.current:
          top = this.state.startPosition.top + drag.y;
          right = this.state.startPosition.right + drag.x;
          bottom = this.state.startPosition.bottom + drag.y;
          left = this.state.startPosition.left + drag.x;
          cursor = 'grabbing';
          break;
        case this.topLeftHandleRef.current:
          if (this.state.invertedY) {
            setBottom();
          } else {
            setTop();
          }
          if (this.state.invertedX) {
            setRight();
          } else {
            setLeft();
          }
          cursor = 'nwse-resize';
          break;
        case this.topHandleRef.current:
          if (this.state.invertedY) {
            setBottom();
          } else {
            setTop();
          }
          cursor = 'ns-resize';
          break;
        case this.topRightHandleRef.current:
          if (this.state.invertedY) {
            setBottom();
          } else {
            setTop();
          }
          if (this.state.invertedX) {
            setLeft();
          } else {
            setRight();
          }
          cursor = 'nesw-resize';
          break;
        case this.rightHandleRef.current:
          if (this.state.invertedX) {
            setLeft();
          } else {
            setRight();
          }
          cursor = 'ew-resize';
          break;
        case this.bottomRightHandleRef.current:
          if (this.state.invertedY) {
            setTop();
          } else {
            setBottom();
          }
          if (this.state.invertedX) {
            setLeft();
          } else {
            setRight();
          }
          cursor = 'nwse-resize';
          break;
        case this.bottomHandleRef.current:
          if (this.state.invertedY) {
            setTop();
          } else {
            setBottom();
          }
          cursor = 'ns-resize';
          break;
        case this.bottomLeftHandleRef.current:
          if (this.state.invertedY) {
            setTop();
          } else {
            setBottom();
          }
          if (this.state.invertedX) {
            setRight();
          } else {
            setLeft();
          }
          cursor = 'nesw-resize';
          break;
        case this.leftHandleRef.current:
          if (this.state.invertedX) {
            right = this.state.startPosition.left + drag.x;
          } else {
            setLeft();
          }
          cursor = 'ew-resize';
          break;
        default:
          this.endDrag();
          return;
      }

      if (cursor && !this.state.dragging) {
        this.styleTag.innerHTML = '';
        this.styleTag.appendChild(
          document.createTextNode(
            `*,*::before,*::after{cursor:${cursor} !important}`,
          ),
        );
      }

      const position = new Rect(left, top, right - left, bottom - top);

      if (this.props.onChange) {
        this.props.onChange(position);
      }

      this.setState((state) => (!state.dragging ? {dragging: true} : null));
    }
  };

  handleMouseUp = (event: MouseEvent) => {
    this.endDrag();
  };

  handleMouseDown = (event: React.MouseEvent) => {
    if (event.target instanceof HTMLDivElement) {
      const activeHandle = event.target;

      const {clientX, clientY} = event;

      this.setState((state: State) => {
        return {
          startPosition: state.position,
          startPoint: {
            x: clientX - state.anchor.x,
            y: clientY - state.anchor.y,
          },
          activeHandle,
          invertedX: state.position.width < 0,
          invertedY: state.position.height < 0,
        };
      });
    }
  };

  endDrag = () => {
    this.styleTag.innerHTML = '';
    this.setState((state) =>
      state.dragging || state.activeHandle !== undefined
        ? {dragging: false, activeHandle: undefined}
        : null,
    );
  };

  componentDidMount() {
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);

    document.head.appendChild(this.styleTag);
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseMove);

    if (this.styleTag.parentNode) {
      this.styleTag.parentNode.removeChild(this.styleTag);
    }
  }

  renderHandle(
    ref: React.RefObject<HTMLDivElement>,
    style: React.CSSProperties,
  ) {
    return (
      <div
        ref={ref}
        onMouseDown={this.handleMouseDown}
        style={{
          position: 'absolute',
          margin: 'auto',
          width: this.props.handleSize,
          height: this.props.handleSize,
          outline: '1px solid black',
          background: 'rgba(255,255,255,0.25)',
          ...style,
        }}
      />
    );
  }

  render() {
    const absPosition = Rect.abs(this.state.position);

    const handleOffset = -0.5 * (this.props.handleSize + 1);

    return (
      <div
        tabIndex={0}
        ref={this.contentRef}
        onMouseDown={this.handleMouseDown}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        style={{
          position: 'absolute',
          top: absPosition.top,
          left: absPosition.left,
          width: absPosition.width,
          height: absPosition.height,
          outlineOffset: -1,
          outline:
            this.state.mouseOver && !this.state.focus
              ? '2px solid rgba(0, 128, 255, 0.75)'
              : 'none',
        }}
      >
        {this.props.handles.nw &&
          this.state.focus &&
          this.renderHandle(this.topLeftHandleRef, {
            top: handleOffset,
            left: handleOffset,
            cursor: 'nwse-resize',
          })}
        {this.props.handles.n &&
          this.state.focus &&
          absPosition.width > 17 &&
          this.renderHandle(this.topHandleRef, {
            top: handleOffset,
            left: 0,
            right: 0,
            cursor: 'ns-resize',
          })}
        {this.props.handles.ne &&
          this.state.focus &&
          this.renderHandle(this.topRightHandleRef, {
            top: handleOffset,
            right: handleOffset,
            cursor: 'nesw-resize',
          })}
        {this.props.handles.e &&
          this.state.focus &&
          absPosition.height > 17 &&
          this.renderHandle(this.rightHandleRef, {
            right: handleOffset,
            top: 0,
            bottom: 0,
            cursor: 'ew-resize',
          })}
        {this.props.handles.se &&
          this.state.focus &&
          this.renderHandle(this.bottomRightHandleRef, {
            right: handleOffset,
            bottom: handleOffset,
            cursor: 'nwse-resize',
          })}
        {this.props.handles.s &&
          this.state.focus &&
          absPosition.width > 17 &&
          this.renderHandle(this.bottomHandleRef, {
            bottom: handleOffset,
            left: 0,
            right: 0,
            cursor: 'ns-resize',
          })}
        {this.props.handles.sw &&
          this.state.focus &&
          this.renderHandle(this.bottomLeftHandleRef, {
            left: handleOffset,
            bottom: handleOffset,
            cursor: 'nesw-resize',
          })}
        {this.props.handles.w &&
          this.state.focus &&
          absPosition.height > 17 &&
          this.renderHandle(this.leftHandleRef, {
            left: handleOffset,
            top: 0,
            bottom: 0,
            cursor: 'ew-resize',
          })}
      </div>
    );
  }
}

export default Resizable;
