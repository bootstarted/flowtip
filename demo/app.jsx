define(["jquery", "react", "flowtip"], function($, React, FlowTip) {
  var FlowTipDemo = React.createClass({
    updateTargetProperties: function () {
      var $target = $(React.findDOMNode(this.refs.target));
      var targetOffset = $target.offset();
      var parentOffset = $(React.findDOMNode(this.refs.parent)).offset();

      this.setState({
        targetProperties: {
          top: targetOffset.top - parentOffset.top,
          left: targetOffset.left - parentOffset.left,
          height: $target.outerHeight(),
          width: $target.outerWidth()
        }
      });
    },

    updateParentProperties: function () {
      var $parent = $(React.findDOMNode(this.refs.parent));
      var parentOffset = $parent.offset();

      this.setState({
        parentProperties: {
          top: parentOffset.top,
          left: parentOffset.left,
          height: $parent.outerHeight(),
          width: $parent.outerWidth(),
          scrollTop: $parent.scrollTop(),
          scrollLeft: $parent.scrollLeft()
        }
      });
    },

    handleTargetMove: function (position) {
      this.updateTargetProperties();
    },

    getInitialState: function () {
      return {
        targetProperties: {top: 0, left: 0, width: 0, height: 0},
        parentProperties: {top: 0, left: 0, width: 0, height: 0}
      };
    },

    componentDidMount: function () {
      this.updateParentProperties();
      this.updateTargetProperties();
    },

    render: function () {
      var style = {height: "100%"};

      var demoAreaStyle = {
        width: 800,
        height: 500,
        marginLeft: 50,
        position: "relative"
      };

      var flowtipProperties = {
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
          <FlowTipDemoTarget onTargetMove={this.handleTargetMove} ref="target" />
        </div>
      );
    }
  });

  var FlowTipDemoTarget = React.createClass({
    handleMouseMove: function (ev) {
      var position = {
        posX: ev.pageX - 10,
        posY: ev.pageY - 10
      };

      this.setState(position);
      this.props.onTargetMove(position);
    },

    getInitialState: function () {
      return {posX: 0, posY: 0};
    },

    componentDidMount: function () {
      window.addEventListener("mousemove", this.handleMouseMove);
    },

    componentWillUnmount: function () {
      window.removeEventListener("mousemove", this.handleMouseMove);
    },

    render: function () {
      var style = {
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
  });

  var startDemo = function () {
    React.render(
      <FlowTipDemo />,
      document.body
    );
  };

  return {
    startDemo: startDemo
  };
});
