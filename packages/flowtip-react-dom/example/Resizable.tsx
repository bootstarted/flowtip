import * as React from 'react';

import Rect from 'flowtip-rect';

export interface Vec2Shape {
  x: number;
  y: number;
}

export class Vec2 implements Vec2Shape {
  x: number;
  y: number;

  static zero = new Vec2(0, 0);

  static fromVec2(point: Vec2Shape): Vec2 {
    if (point instanceof Vec2) {
      return point;
    }

    return new Vec2(point.x, point.y);
  }

  static add(a: Vec2Shape, b: Vec2Shape): Vec2 {
    return new Vec2(a.x + b.x, a.y + b.y);
  }

  static subtract(min: Vec2Shape, sub: Vec2Shape): Vec2 {
    return new Vec2(min.x - sub.x, min.y - sub.y);
  }

  constructor(x, y) {
    this.x = x;
    this.y = y;
    Object.freeze(this);
  }
}

export interface Props {
  anchor: Vec2;
  position: Rect;
  onChangeStart?: () => unknown;
  onChangeEnd?: () => unknown;
  onChange?: (position: Rect) => unknown;
  onHover?: () => unknown;
  onSetActive?: () => unknown;
  active?: boolean;
  focused?: boolean;
  handleSize?: number;
}

interface State {
  activeHandle?: HTMLDivElement;
  anchor: Vec2;
  cursor?: string;
  dragging: boolean;
  invertedX: boolean;
  invertedY: boolean;
  position: Rect;
  startPoint: Vec2;
  startPosition: Rect;
}

class Resizable extends React.PureComponent<Props, State> {
  static defaultProps = {
    handleSize: 5,
  };

  static getDerivedStateFromProps({position}: Props) {
    return {position};
  }

  state: State = {
    anchor: this.props.anchor,
    cursor: undefined,
    dragging: false,
    invertedX: false,
    invertedY: false,
    position: this.props.position,
    startPoint: Vec2.zero,
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

  handleMouseMove = (event: MouseEvent) => {
    if (
      this.props.onHover &&
      this.contentRef.current &&
      event.target instanceof HTMLElement &&
      this.contentRef.current.contains(event.target)
    ) {
      this.props.onHover();
    }

    if (this.state.activeHandle && this.props.active) {
      const drag = Vec2.subtract(
        Vec2.subtract(
          new Vec2(event.clientX, event.clientY),
          this.state.anchor,
        ),
        this.state.startPoint,
      );

      let cursor;

      let top = this.state.position.top;
      let left = this.state.position.left;
      let bottom = this.state.position.bottom;
      let right = this.state.position.right;

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
            bottom = this.state.startPosition.bottom + drag.y;
          } else {
            top = this.state.startPosition.top + drag.y;
          }
          if (this.state.invertedX) {
            right = this.state.startPosition.right + drag.x;
          } else {
            left = this.state.startPosition.left + drag.x;
          }
          cursor = 'nwse-resize';
          break;
        case this.topHandleRef.current:
          if (this.state.invertedY) {
            bottom = this.state.startPosition.bottom + drag.y;
          } else {
            top = this.state.startPosition.top + drag.y;
          }
          cursor = 'ns-resize';
          break;
        case this.topRightHandleRef.current:
          if (this.state.invertedY) {
            bottom = this.state.startPosition.bottom + drag.y;
          } else {
            top = this.state.startPosition.top + drag.y;
          }
          if (this.state.invertedX) {
            left = this.state.startPosition.left + drag.x;
          } else {
            right = this.state.startPosition.right + drag.x;
          }
          cursor = 'nesw-resize';
          break;
        case this.rightHandleRef.current:
          if (this.state.invertedX) {
            left = this.state.startPosition.left + drag.x;
          } else {
            right = this.state.startPosition.right + drag.x;
          }
          cursor = 'ew-resize';
          break;
        case this.bottomRightHandleRef.current:
          if (this.state.invertedY) {
            top = this.state.startPosition.top + drag.y;
          } else {
            bottom = this.state.startPosition.bottom + drag.y;
          }
          if (this.state.invertedX) {
            left = this.state.startPosition.left + drag.x;
          } else {
            right = this.state.startPosition.right + drag.x;
          }
          cursor = 'nwse-resize';
          break;
        case this.bottomHandleRef.current:
          if (this.state.invertedY) {
            top = this.state.startPosition.top + drag.y;
          } else {
            bottom = this.state.startPosition.bottom + drag.y;
          }
          cursor = 'ns-resize';
          break;
        case this.bottomLeftHandleRef.current:
          if (this.state.invertedY) {
            top = this.state.startPosition.top + drag.y;
          } else {
            bottom = this.state.startPosition.bottom + drag.y;
          }
          if (this.state.invertedX) {
            right = this.state.startPosition.right + drag.x;
          } else {
            left = this.state.startPosition.left + drag.x;
          }
          cursor = 'nesw-resize';
          break;
        case this.leftHandleRef.current:
          if (this.state.invertedX) {
            right = this.state.startPosition.left + drag.x;
          } else {
            left = this.state.startPosition.left + drag.x;
          }
          cursor = 'ew-resize';
          break;
      }

      if (!this.state.dragging) {
        if (this.props.onChangeStart) {
          this.props.onChangeStart();
        }
      } else if (cursor) {
        this.styleTag.innerHTML = '';
        this.styleTag.appendChild(
          document.createTextNode(
            `*,*::before,*::after{cursor:${this.state.cursor} !important}`,
          ),
        );
      }

      const position = new Rect(left, top, right - left, bottom - top);

      if (this.props.onChange) {
        this.props.onChange(position);
      }

      this.setState((state) => {
        if (!state.dragging) {
          return {
            dragging: true,
          };
        }
        return null;
      });
    }
  };

  handleMouseUp = (event: MouseEvent) => {
    this.styleTag.innerHTML = '';

    if (this.state.dragging && this.props.onChangeEnd) {
      this.props.onChangeEnd();
    }

    this.setState((state: State) => {
      if (state.activeHandle !== undefined || state.dragging) {
        return {
          dragging: false,
          activeHandle: undefined,
        };
      }
      return null;
    });
  };

  handleMouseDown = (event: React.MouseEvent) => {
    if (event.target instanceof HTMLDivElement) {
      const activeHandle = event.target;

      const {clientX, clientY} = event;

      if (this.props.onSetActive) {
        this.props.onSetActive();
      }

      this.setState((state: State) => {
        return {
          startPosition: state.position,
          startPoint: Vec2.subtract(new Vec2(clientX, clientY), state.anchor),
          activeHandle,
          invertedX: state.position.width < 0,
          invertedY: state.position.height < 0,
        };
      });
    }
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
        ref={this.contentRef}
        onMouseDown={this.handleMouseDown}
        style={{
          position: 'absolute',
          top: absPosition.top,
          left: absPosition.left,
          width: absPosition.width,
          height: absPosition.height,
          outlineOffset: -1,
          outline:
            !this.props.active && this.props.focused
              ? '2px solid rgba(0, 128, 255, 0.75)'
              : 'none',
        }}
      >
        {this.props.active &&
          this.renderHandle(this.topLeftHandleRef, {
            top: handleOffset,
            left: handleOffset,
            cursor: 'nwse-resize',
          })}
        {this.props.active &&
          absPosition.width > 17 &&
          this.renderHandle(this.topHandleRef, {
            top: handleOffset,
            left: 0,
            right: 0,
            cursor: 'ns-resize',
          })}
        {this.props.active &&
          this.renderHandle(this.topRightHandleRef, {
            top: handleOffset,
            right: handleOffset,
            cursor: 'nesw-resize',
          })}
        {this.props.active &&
          absPosition.height > 17 &&
          this.renderHandle(this.rightHandleRef, {
            right: handleOffset,
            top: 0,
            bottom: 0,
            cursor: 'ew-resize',
          })}
        {this.props.active &&
          this.renderHandle(this.bottomRightHandleRef, {
            right: handleOffset,
            bottom: handleOffset,
            cursor: 'nwse-resize',
          })}
        {this.props.active &&
          absPosition.width > 17 &&
          this.renderHandle(this.bottomHandleRef, {
            bottom: handleOffset,
            left: 0,
            right: 0,
            cursor: 'ns-resize',
          })}
        {this.props.active &&
          this.renderHandle(this.bottomLeftHandleRef, {
            left: handleOffset,
            bottom: handleOffset,
            cursor: 'nesw-resize',
          })}
        {this.props.active &&
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

// export default React.forwardRef<HTMLDivElement, Props>((props, ref) => (
//   <Resizable {...props} forwardedRef={ref} />
// ));

export default Resizable;
