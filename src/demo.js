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
    const anchor = ReactDOM.findDOMNode(this.refs.anchor);

    const rect = target.getBoundingClientRect();
    const arect = anchor.getBoundingClientRect();

    this.setState({
      targetProperties: {
        top: rect.top - arect.top,
        left: rect.left - arect.left,
        width: rect.width,
        height: rect.height,
      }
    });
  }

  updateParentProperties() {
    const parent = ReactDOM.findDOMNode(this.refs.parent);
    const anchor = ReactDOM.findDOMNode(this.refs.anchor);

    const rect = parent.getBoundingClientRect();
    const arect = anchor.getBoundingClientRect();

    const scrollerWidth = parent.offsetWidth - parent.clientWidth;
    const scrollerHeight = parent.offsetHeight - parent.clientHeight;

    this.setState({
      parentProperties: {
        top: rect.top - arect.top,
        left: rect.left - arect.left,
        width: rect.width - scrollerWidth,
        height: rect.height - scrollerHeight,
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
      position: "relative",
      overflow: "auto",
    };

    const flowtipProperties = {
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

    const anchorProperties = {
      position: "relative",
      top: "50px",
      left: "100px",
    };

    return (
      <div style={style} className="flowtipDemo">
        <h1>FlowTip.React Demo</h1>
        <div style={demoAreaStyle} className="flowtipDemoArea" ref="parent">
          <div ref="anchor" style={anchorProperties}>
            anchor
            <FlowTip target={this.state.targetProperties} parent={this.state.parentProperties} {...flowtipProperties}>
              <b>Holy Shit!</b>
              <br />
              FlowTip as React Component
            </FlowTip>
          </div>
          <div style={{height: "700px"}}/>
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
