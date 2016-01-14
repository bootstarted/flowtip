import React from "react";
import _ from "underscore";

export default React.createClass({
  render: function () {
    var classNames = _.chain(["flowtip-content", this.props.className])
      .compact()
      .join(" ");

    return (
      <div className={classNames}>
        {this.props.children}
      </div>
    );
  }
});
