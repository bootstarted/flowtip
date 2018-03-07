// @flow

// Import modules ==============================================================
import * as React from 'react';
import FlowTip from 'flowtip-react-dom';
import ResizeObserver from 'react-resize-observer';
import {Rect} from 'flowtip-core';

const Content = ({children, style}) => (
  <div
    style={{
      padding: 10,
      background: '#fff',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)',
      ...style,
    }}
  >
    {children}
  </div>
);

const Tail = ({result, style, children}) => {
  switch (result.region) {
    case 'top':
      return (
        <div style={{position: 'relative', width: 20, height: 10, ...style}}>
          <div
            style={{
              position: 'absolute',
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderTop: '10px solid #ccc',
            }}
          />
          {children}
        </div>
      );
    case 'right':
      return (
        <div style={{position: 'relative', width: 10, height: 20, ...style}}>
          <div
            style={{
              position: 'absolute',
              borderTop: '10px solid transparent',
              borderBottom: '10px solid transparent',
              borderRight: '10px solid #ccc',
            }}
          />
          {children}
        </div>
      );
    case 'bottom':
      return (
        <div style={{position: 'relative', width: 20, height: 10, ...style}}>
          <div
            style={{
              position: 'absolute',
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderBottom: '10px solid #ccc',
            }}
          />
          {children}
        </div>
      );
    case 'left':
      return (
        <div style={{position: 'relative', width: 10, height: 20, ...style}}>
          <div
            style={{
              position: 'absolute',
              borderTop: '10px solid transparent',
              borderBottom: '10px solid transparent',
              borderLeft: '10px solid #ccc',
            }}
          />
          {children}
        </div>
      );
    default:
      return null;
  }
};

type State = {
  flowTipOpen: boolean,
  target: Rect | null,
  targetX: number,
  targetY: number,
};

class ExampleWrapper extends React.PureComponent<{}, State> {
  state = {flowTipOpen: false, target: null, targetX: 0, targetY: 0};

  _buttonRef: HTMLElement | null = null;
  _observerRef: ResizeObserver | null = null;
  dragEnding: boolean = false;
  dragging: boolean = false;
  initialMouseX: number = 0;
  initialMouseY: number = 0;
  initialX: number = 0;
  initialY: number = 0;

  _handleButtonRef = (node: mixed) => {
    this._buttonRef = node instanceof HTMLElement ? node : null;
  };

  _handleObserverRef = (node: mixed) => {
    this._observerRef = node instanceof ResizeObserver ? node : null;
  };

  _toggleFlowTip = () => this.setState({flowTipOpen: !this.state.flowTipOpen});

  _handleTargetReflow = (target: ClientRect) =>
    this.setState({target: Rect.from(target)});

  _handleMouseUp = () => {
    if (this.dragging) {
      this.dragging = false;
      this.dragEnding = true;
      setTimeout(() => {
        this.dragEnding = false;
      }, 0);
    }
    window.removeEventListener('mousemove', this._handleMouseMove);
  };

  _handleMouseDown = (event: MouseEvent) => {
    if (this._buttonRef && event.target === this._buttonRef) {
      const rect = this._buttonRef.getBoundingClientRect();

      this.initialMouseX = event.clientX;
      this.initialMouseY = event.clientY;

      if (!document.body) return;
      this.initialX = rect.left - document.body.scrollLeft;
      this.initialY = rect.top - document.body.scrollTop;

      window.addEventListener('mousemove', this._handleMouseMove);
    }
  };

  _handleMouseMove = (event: MouseEvent) => {
    this.dragging = true;

    if (!document.body) return;

    this.setState(
      {
        targetX: event.clientX - this.initialMouseX + this.initialX,
        targetY: event.clientY - this.initialMouseY + this.initialY,
      },
      () => {
        if (this._observerRef) {
          this._observerRef._reflow();
        }
      },
    );
  };

  componentDidMount() {
    window.addEventListener('mousedown', this._handleMouseDown);
    window.addEventListener('mouseup', this._handleMouseUp);
  }

  render() {
    return (
      <div>
        <div
          ref={this._handleButtonRef}
          role="button"
          onClick={() => {
            if (!this.dragEnding) {
              this._toggleFlowTip();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === ' ') {
              this._toggleFlowTip();
              event.preventDefault();
            }
          }}
          npm
          tabIndex={0}
          style={{
            width: 200,
            height: 40,
            left: this.state.targetX,
            top: this.state.targetY,
            position: 'relative',
            background: '#40a0ff',
          }}
        >
          <ResizeObserver
            ref={this._handleObserverRef}
            onReflow={this._handleTargetReflow}
          />
          Activate FlowTip
        </div>
        {!!this.state.flowTipOpen && (
          <FlowTip target={this.state.target} content={Content} tail={Tail}>
            FlowTip Content
          </FlowTip>
        )}
      </div>
    );
  }
}

export default ExampleWrapper;
