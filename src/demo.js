/* eslint-disable react/no-multi-comp */
import React from "react";
import ReactDOM from "react-dom";
import FlowTip from "./flowtip";

class FlowTipDemo extends React.Component {
  state = {
    targetProperties: {top: 0, left: 0, width: 0, height: 0},
    parentProperties: {top: 0, left: 0, width: 0, height: 0},
  };

  updateTargetProperties() {
    const target = ReactDOM.findDOMNode(this.refs.target);
    const parent = ReactDOM.findDOMNode(this.refs.parent);

    this.setState({
      targetProperties: {
        top: target.offsetTop - parent.offsetTop,
        left: target.offsetLeft - parent.offsetLeft,
        height: target.offsetHeight,
        width: target.offsetWidth,
      }
    });
  }

  updateParentProperties() {
    const parent = ReactDOM.findDOMNode(this.refs.parent);

    this.setState({
      parentProperties: {
        top: parent.offsetTop,
        left: parent.offsetLeft,
        height: parent.offsetHeight,
        width: parent.offsetWidth,
        scrollTop: parent.scrollTop,
        scrollLeft: parent.scrollLeft,
      }
    });
  }

  handleTargetMove(){
    this.updateTargetProperties();
  }

  componentDidMount() {
    this.updateParentProperties();
    this.updateTargetProperties();
  }

  render() {
    const style = {height: "100%"};

    const demoAreaStyle = {
      width: 800,
      height: 500,
      marginLeft: 50,
      position: "relative"
    };

    const flowtipProperties = {
      className: "flowtip-root",
      tailClassName: "flowtip-tail",
      width: 200,
      height: 80,
      persevere: false,
      targetOffsetFrom: "tail",
      targetOffset: 10,
      rotationOffset: 15,
      edgeOffset: 10,
      rootAlign: "center",
      rootAlignOffset: 0,
      targetAlign: "center",
      targetAlignOffset: 0
    };

    return (
      <div style={style} className="flowtipDemo">
        <h1>FlowTip.React Demo</h1>
        <div style={demoAreaStyle} className="flowtipDemoArea" ref="parent">
          <FlowTip target={this.state.targetProperties} parent={this.state.parentProperties} {...flowtipProperties}>
            <b>Holy Shit!</b>
            <br />
            FlowTip as React Component
          </FlowTip>
        </div>
        <FlowTipDemoTarget onTargetMove={this.handleTargetMove.bind(this)} ref="target" />
      </div>
    );
  }
}

class FlowTipDemoTarget extends React.Component {
  state = { posX: 0, posY: 0, active: true };

  handleMouseMove(ev) {
    if (!this.state.active) {
      return;
    }

    const position = {
      posX: ev.pageX - 10,
      posY: ev.pageY - 20
    };

    this.setState(position);
    this.props.onTargetMove(position);
  }

  handleMouseClick() {
    this.setState({active: !this.state.active});
  }

  componentDidMount() {
    window.addEventListener("mousemove", this.handleMouseMove.bind(this));
    window.addEventListener("click", this.handleMouseClick.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener("mousemove", this.handleMouseMove.bind(this));
    window.removeEventListener("click", this.handleMouseClick.bind(this));
  }

  render() {
    const style = {
      position: "absolute",
      width: 20,
      height: 20,
      cursor: "default",
      top: this.state.posY,
      left: this.state.posX
    };

    return (
      <div style={style} className="flowtipDemoTarget"></div>
    );
  }
};

ReactDOM.render(<FlowTipDemo />, document.getElementById("demo"));
