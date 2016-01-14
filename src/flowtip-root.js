import React from "react";
import $ from "jquery";
import _ from "underscore";

import FlowtipTail from "./flowtip-tail";
import FlowtipContent from "./flowtip-content";

export default React.createClass({
  getDimension: function () {
    var $root = $(React.findDOMNode(this.refs.root));
    return {
      width: $root.width() || this.props.width,
      height: $root.height() || this.props.height
    };
  },

  getTailOriginalDimension: function () {
    return this.refs.tail.getOriginalDimension();
  },

  getDefaultProps: function() {
    return {
      width: null,
      height: "auto",
      minWidth: null,
      minHeight: null,
      maxWidth: null,
      maxHeight: null
    };
  },

  render: function () {
    if (this.props.hidden) {
      return null;
    }

    var style = {
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

    var classNames = _.chain(["flowtip-root", this.props.className])
      .compact()
      .join(" ");

    var contentProperties = {
      className: this.props.contentClassName
    };

    var tailProperties = _.extend({
      className: this.props.tailClassName
    }, _.pick(this.props.tail, [
      "top", "left", "width", "height", "hidden", "type"
    ]));

    return (
      <div style={style} className={classNames} ref="root">
        <FlowtipContent {...contentProperties}>
          {this.props.children}
        </FlowtipContent>
        <FlowtipTail ref="tail" {...tailProperties} />
      </div>
    );
  }
});
