define(["underscore", "react"], function(_, React) {
  return React.createClass({
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
});
