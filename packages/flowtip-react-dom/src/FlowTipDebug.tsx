import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {RectShape} from 'flowtip-rect';

class FlowTipDebug extends React.Component<{
  bounds: RectShape;
  target: RectShape;
  rect: RectShape;
}> {
  portalNode: HTMLDivElement = document.createElement('div');
  canvasRef: React.RefObject<HTMLCanvasElement> = React.createRef();

  componentDidMount() {
    document.body.appendChild(this.portalNode);
  }

  componentDidUpdate() {
    const canvas = this.canvasRef.current;
    if (canvas === null) {
      return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const context = canvas.getContext('2d');

    if (context === null) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = 'orange';
    context.strokeRect(
      this.props.bounds.left + 0.5,
      this.props.bounds.top + 0.5,
      this.props.bounds.width - 1,
      this.props.bounds.height - 1,
    );

    context.strokeStyle = 'red';
    context.strokeRect(
      this.props.target.left + 0.5,
      this.props.target.top + 0.5,
      this.props.target.width - 1,
      this.props.target.height - 1,
    );

    context.strokeStyle = 'blue';
    context.strokeRect(
      this.props.rect.left + 0.5,
      this.props.rect.top + 0.5,
      this.props.rect.width - 1,
      this.props.rect.height - 1,
    );
  }

  componentWillUnmount() {
    document.body.removeChild(this.portalNode);
  }

  render() {
    return ReactDOM.createPortal(
      <>
        <canvas
          ref={this.canvasRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            background: 'transparent',
          }}
        />
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            background: 'transparent',
          }}
        >
          <pre>{JSON.stringify(this.props, null, 2)}</pre>
        </div>
      </>,
      this.portalNode,
    );
  }
}

export default FlowTipDebug;
