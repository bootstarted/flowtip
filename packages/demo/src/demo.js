import React from 'react';
import ReactDOM from 'react-dom';
import FlowTip from 'flowtip-react-dom';
import ResizeObserver from 'react-resize-observer';
import styled, {css} from 'styled-components';
import Draggable from 'react-draggable';

const Content = styled.div`
  padding: 10px;
  background: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  border: solid 1px #e9e9e9;
`;

const Tail = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  position: absolute;
  border: 0px solid #e9e9e9;
  background: #fff;
  border-width: 1px 1px 0px 0px;
  ${({region}) => {
    switch (region) {
      case 'left':
        return css`
          transform: translateX(-50%) rotate(45deg);
        `;
      case 'right':
        return css`
          transform: translateX(50%) rotate(-135deg);
        `;
      case 'top':
        return css`
          left: 50%;
          transform: translateY(-50%) rotate(135deg);
        `;
      case 'bottom':
        return css`
          left: 50%;
          transform: translateY(50%) rotate(-45deg);
        `;
      default:
        return '';
    }
  }};
`;

const BoundsContainer = styled.div`
  border: dashed 1px #c0c0c0;
  background: rgba(0, 0, 0, 0.2);
  position: absolute;
  top: 0;
  left: 0;
`;

const Handle = styled.div`
  position: absolute;
  transform: translateX(-50%) translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #aaa;
`;

const ExampleTarget = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 200px;
  height: 50px;
  background: purple;
`;

class ExampleTip extends React.Component {
  render() {
    const {children, bounds, target} = this.props;
    return (
      <FlowTip target={target} bounds={bounds} debug>
        {({contentStyle, tailStyle, setTailSize, setContentSize, region}) => {
          return (
            <Content style={contentStyle}>
              {children}
              <ResizeObserver onReflow={setContentSize} />
              <Tail region={region} style={tailStyle}>
                <ResizeObserver onReflow={setTailSize} />
              </Tail>
            </Content>
          );
        }}
      </FlowTip>
    );
  }
}

class FlowTipExample extends React.Component {
  state = {
    flowTipOpen: true,
    target: {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    },
    bounds: {
      top: 0,
      left: 0,
      width: 400,
      height: 400,
    },
  };

  _toggleFlowTip = () => this.setState({flowTipOpen: !this.state.flowTipOpen});

  _handleTargetReflow = (target) =>
    this.setState({
      target: {
        left: target.left,
        top: target.top,
        width: target.width,
        height: target.height,
      },
    });

  _handleBoundsTrag = (e, d) => {
    this.setState((state) => {
      return {
        bounds: {
          ...state.bounds,
          top: state.bounds.top + d.deltaY,
          left: state.bounds.left + d.deltaX,
        },
      };
    });
  };

  _renderBounds() {
    const {bounds} = this.state;
    return (
      <Draggable onDrag={this._handleBoundsTrag}>
        <BoundsContainer
          style={{
            width: bounds.width,
            height: bounds.height,
          }}
        >
          <Handle style={{top: 0, left: 0}} />
          <Handle style={{top: 0, right: 0}} />
          <Handle style={{bottom: 0, left: 0}} />
          <Handle style={{bottom: 0, right: 0}} />
        </BoundsContainer>
      </Draggable>
    );
  }

  _handleTargetDrag = (e, d) => {
    this.setState((state) => {
      return {
        target: {
          ...state.target,
          top: state.target.top + d.deltaY,
          left: state.target.left + d.deltaX,
        },
      };
    });
  };

  render() {
    return (
      <div>
        {this._renderBounds()}
        <div style={{position: 'relative'}}>
          <button onClick={this._toggleFlowTip}>Activate FlowTip</button>
          <Draggable onDrag={this._handleTargetDrag}>
            <ExampleTarget>
              <ResizeObserver onReflow={this._handleTargetReflow} />
            </ExampleTarget>
          </Draggable>
          {!!this.state.flowTipOpen && (
            <ExampleTip bounds={this.state.bounds} target={this.state.target}>
              Hello World this is a test message
            </ExampleTip>
          )}
        </div>
      </div>
    );
  }
}

ReactDOM.render(<FlowTipExample />, document.getElementById('app'));
