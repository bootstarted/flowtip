import React from "react";
import ReactDOM from "react-dom"
import { pick, extend } from "./utils";

import FlowtipTail from "./flowtip-tail";

export default class FlowtopRoot extends React.Component {
  static defaultProps = {
    width: null,
    height: "auto",
    minWidth: null,
    minHeight: null,
    maxWidth: null,
    maxHeight: null
  };

  getDimension() {
    const root = ReactDOM.findDOMNode(this.refs.root);

    return {
      width: root.clientWidth || this.props.width,
      height: root.clientHeight || this.props.height
    };
  }

  getTailOriginalDimension() {
    return this.refs.tail.getOriginalDimension();
  }

  render() {
    if (this.props.hidden) {
      return null;
    }

    const style = {
      position: "absolute",
      top: this.props.top,
      left: this.props.left,
      minWidth: this.props.minWidth,
      minHeight: this.props.minHeight,
      maxWidth: this.props.maxWidth,
      maxHeight: this.props.maxHeight,
      width: this.props.width,
      height: this.props.height
    };

    const tailProperties = extend({
      className: this.props.tailClassName
    }, pick(this.props.tail, [
      "top", "left", "width", "height", "hidden", "type"
    ]));

    return (
      <div style={style} className={this.props.className} ref="root">
        {this.props.children}
        <FlowtipTail ref="tail" {...tailProperties} />
      </div>
    );
  }
};
