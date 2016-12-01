/* eslint-disable react/no-multi-comp */
/* global window document */

import {createElement, Component} from 'react';
import ReactDOM from 'react-dom';

import flowtip from '../src/dom';

const MyFlowTip = flowtip(
  ({style, region, children}) => (
    <div className={`flowtip-root flowtip-root-${region}`} style={style}>
      {children}
    </div>
  ),
  ({style, region, children}) => (
    <div className={`flowtip-tail flowtip-tail-${region}`} style={style}>
      {children}
    </div>
  )
);

class FlowTipDemo extends Component {
  state = {
    target: {top: 0, left: 0, width: 0, height: 0},
    clamp: true,
  };

  componentDidMount() {
    this.updateTargetProperties();
  }

  handleTargetMove() {
    this.updateTargetProperties();
  }

  handleClampClick(e) {
    this.setState({
      clamp: e.target.checked === true,
    });
  }

  updateTargetProperties() {
    this.setState({
      target: ReactDOM.findDOMNode(this.refs.target).getBoundingClientRect(),
    });
  }

  render() {
    const flowtipProperties = {
      targetOffset: 10,
      rotationOffset: 15,
      edgeOffset: 10,
      rootAlign: 'center',
      rootAlignOffset: 0,
      targetAlign: 'center',
      targetAlignOffset: 0,
      clamp: this.state.clamp,
    };

    return (
      <div className='flowtipDemo'>
        <h1>FlowTip.React Demo</h1>
        <div style={{height: '200px'}}/>
        <div className='flowtipClamp'>
          <label htmlFor='clampCheckbox'>Clamp</label>
          <input
            id='clampCheckbox'
            type='checkbox'
            checked={this.state.clamp}
            onChange={this.handleClampClick.bind(this)}
          />
        </div>
        <div className='flowtipDemoArea leparent'>
          <div style={{position: 'relative', marginLeft: 120, marginTop: 140}}>
            Potato
            <MyFlowTip
              {...flowtipProperties}
              onReflow={() => this.updateTargetProperties()}
              target={this.state.target}
            >
              <b>Holy Shit!</b>
              <br />
              FlowTip as React Component That happens to be able
              handle arbitrary body sizes!
            </MyFlowTip>
          </div>
          <div style={{height: '700px'}}/>
        </div>
        <FlowTipDemoTarget
          onTargetMove={this.handleTargetMove.bind(this)}
          ref='target'
        />
        <div style={{height: '700px'}}/>
      </div>
    );
  }
}

class FlowTipDemoTarget extends Component {
  state = {posX: 0, posY: 0, active: true};

  componentDidMount() {
    window.addEventListener('mousemove', this.handleMouseMove.bind(this));
    window.addEventListener('click', this.handleMouseClick.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    window.removeEventListener('click', this.handleMouseClick.bind(this));
  }

  handleMouseMove(ev) {
    if (!this.state.active) {
      return;
    }

    const position = {
      posX: ev.pageX - 10,
      posY: ev.pageY - 20,
    };

    this.setState(position);
    this.props.onTargetMove(position);
  }

  handleMouseClick() {
    this.setState({active: !this.state.active});
  }

  render() {
    const style = {
      position: 'absolute',
      width: 60,
      height: 20,
      cursor: 'default',
      top: this.state.posY,
      left: this.state.posX,
    };

    return (
      <div style={style} className='flowtipDemoTarget'></div>
    );
  }
}

ReactDOM.render(<FlowTipDemo />, document.getElementById('demo'));
