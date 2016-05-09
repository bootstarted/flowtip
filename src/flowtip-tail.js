import React from "react";

export default class FlowtipTail extends React.Component {
  static defaultProps = {
    width: 20,
    height: 10
  };

  getOriginalDimension() {
    return this._originalDimension;
  }

  componentWillMount() {
    this._originalDimension = {
      width: this.props.width,
      height: this.props.height
    };
  }

  render() {
    if (this.props.hidden) {
      return null;
    }

    const style = {
      width: this.props.width,
      height: this.props.height,
      position: "absolute",
      top: this.props.top,
      left: this.props.left
    };

    return (
      <div style={style} className={this.props.className}/>
    );
  }
}
