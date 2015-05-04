define(["underscore", "react"], function(_, React) {
  return React.createClass({
    getOriginalDimension: function () {
      return this._originalDimension;
    },

    getDefaultProps: function() {
      return {
        width: 20,
        height: 10
      };
    },

    componentWillMount: function () {
      this._originalDimension = {
        width: this.props.width,
        height: this.props.height
      };
    },

    render: function () {
      if (this.props.hidden) {
        return null;
      }

      var style = {
        width: this.props.width,
        height: this.props.height,
        position: "absolute",
        top: this.props.top,
        left: this.props.left
      };

      var classNames = _.chain(["flowtip-tail", this.props.className])
        .compact()
        .join(" ");

      return (
        <div style={style} className={classNames}></div>
      );
    }
  });
});
