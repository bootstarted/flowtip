(function () {
define('flowtip-tail',["underscore", "react"], function(_, React) {
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
        React.createElement("div", {style: style, className: classNames})
      );
    }
  });
});


define('flowtip-content',["underscore", "react"], function(_, React) {
  return React.createClass({
    render: function () {
      var classNames = _.chain(["flowtip-content", this.props.className])
        .compact()
        .join(" ");

      return (
        React.createElement("div", {className: classNames}, 
          this.props.children
        )
      );
    }
  });
});


define('flowtip-root',[
  "jquery",
  "underscore",
  "react",
  "flowtip-tail",
  "flowtip-content"
], function(
  $,
  _,
  React,
  FlowTipTail,
  FlowtipContent
) {
  return React.createClass({
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
        React.createElement("div", {style: style, className: classNames, ref: "root"}, 
          React.createElement(FlowtipContent, React.__spread({},  contentProperties), 
            this.props.children
          ), 
          React.createElement(FlowTipTail, React.__spread({ref: "tail"},  tailProperties))
        )
      );
    }
  });
});


define('flowtip',[
  "jquery",
  "underscore",
  "react",
  "flowtip-root"
], function(
  $,
  _,
  React,
  FlowTipRoot
) {
  return React.createClass({
    rootAlign: function (region) {
      return this.props[region + "RootAlign"] || this.props.rootAlign;
    },

    rootAlignOffset: function (region) {
      return this.props[region + "RootAlignOffset"] || this.props.rootAlignOffset;
    },

    targetAlign: function (region) {
      return this.props[region + "TargetAlign"] || this.props.targetAlign;
    },

    targetAlignOffset: function (region) {
      return this.props[region + "TargetAlignOffset"] || this.props.targetAlignOffset;
    },

    availableRegion: function (region) {
      return !this.props[region + "Disabled"];
    },

    fitsInRegion: function (region, parent, target) {
      var position = this.calculatePosition(parent, target);
      var rootDimension = this.rootDimension();

      if (region == "top") {
        return position.top - this.props.edgeOffset >= 0;
      } else if (region == "bottom") {
        return position.top + rootDimension.height + this.props.edgeOffset <= parent.height;
      } else if (region == "left") {
        return position.left -this.props.edgeOffset >= 0;
      } else if (region == "right") {
        return position.left + rootDimension.width + this.props.edgeOffset <= parent.width;
      }
    },

    availableAndFitsIn: function (regions, regionParameter, _first) {
      if (!_first) {
        _first = regions[0];
      }

      var region = regions[0];

      if (!regions || regions.length <= 0) {
        return this.state.region;
      }

      var availables = regionParameter[region].availables,
        fits = regionParameter[region].fits,
        hides = this.props.hideInDisabledRegions;

      if ((availables && fits) || (!availables && hides)) {
        return region;
      } else {
        return this.availableAndFitsIn(regions.slice(1), regionParameter, _first);
      }
    },

    rootDimension: function () {
      return this.refs.root.getDimension();
    },

    tailDimension: function (region) {
      if (!this._tailOriginalDimension) {
        this._tailOriginalDimension = this.refs.root.getTailOriginalDimension();
      }

      var dimension = {
        width: this._tailOriginalDimension.width,
        height: this._tailOriginalDimension.height
      };

      if (region == "left" || region == "right") {
        return {width: dimension.height, height: dimension.width};
      } else {
        return dimension;
      }
    },

    tailType: function (region) {
      if (region == "top") { return "bottom"; }
      if (region == "bottom") { return "top"; }
      if (region == "left") { return "right"; }
      if (region == "right") { return "left"; }
    },

    regionParameters: function (parent, target) {
      return {
        top: {
          fits: this.fitsInRegion("top", parent, target),
          availables: this.availableRegion("top")
        },
        bottom: {
          fits: this.fitsInRegion("bottom", parent, target),
          availables: this.availableRegion("bottom")
        },
        left: {
          fits: this.fitsInRegion("left", parent, target),
          availables: this.availableRegion("left")
        },
        right: {
          fits: this.fitsInRegion("right", parent, target),
          availables: this.availableRegion("right")
        }
      };
    },

    targetAlignmentOffset: function (region) {
      var targetAlign = this.targetAlign(region);
      var targetAlignOffset = this.targetAlignOffset(region);

      if (targetAlign == "center") {
        if (region == "top" || region == "right") {
          return targetAlignOffset;
        } else if (region == "bottom" || region == "left") {
          return targetAlignOffset * -1;
        }
      } else if (targetAlign == "edge") {
        if (region == "top" || region == "right") {
          return targetAlignOffset * -1;
        } else if (region == "bottom" || region == "left") {
          return targetAlignOffset;
        }
      }
    },

    targetPivot: function (region, targetParameter) {
      var targetAlign = this.targetAlign(region);
      var targetAlignOffset = this.targetAlignOffset(region);
      var pivot;

      if (targetAlign == "center") {
        if (region == "top" || region == "bottom") {
          pivot = targetParameter.left + (targetParameter.width / 2);
        } else if (region == "left" || region == "right") {
          pivot = targetParameter.top + (targetParameter.height / 2);
        }
      } else if (targetAlign == "edge") {
        var pivots;
        if (region == "top" || region == "bottom") {
          pivots = [targetParameter.left, targetParameter.left + targetParameter.width];
        } else if (region == "left" || region == "right") {
          pivots = [targetParameter.top, targetParameter.top + targetParameter.height];
        }

        var positive = targetAlignOffset >= 0;
        if (region == "top" || region == "right") {
          pivot = positive ? pivots[1] : pivots[0];
        } else if (region == "bottom" || region == "left") {
          pivot = positive ? pivots[0] : pivots[1];
        }
      }

      return pivot;
    },

    tailPivot: function (region, targetParameter, tailDimension, rootPosition) {
      var targetPivot = this.targetPivot(region, targetParameter);
      var pivot;

      if (region == "top" || region == "bottom") {
        pivot = targetPivot - rootPosition.left - (tailDimension.width / 2);
      } else if (region == "left" || region == "right") {
        pivot = targetPivot - rootPosition.top - (tailDimension.height / 2);
      }

      var effectiveOffset = this.targetAlignmentOffset(region);

      return pivot + effectiveOffset;
    },

    rootPivot: function (region, targetParameter, rootDimension) {
      var targetPivot = this.targetPivot(region, targetParameter);
      var rootAlign = this.rootAlign(region);
      var rootAlignOffset = this.rootAlignOffset(region);
      var pivot;
      var effectiveOffset;

      if (rootAlign == "center") {
        if (region == "top" || region == "bottom") {
          pivot = targetPivot - (rootDimension.width / 2);
        } else if (region == "left" || region == "right") {
          pivot = targetPivot - (rootDimension.height / 2);
        }

        if (region == "top" || region == "right") {
          effectiveOffset = rootAlignOffset;
        } else if (region == "bottom" || region == "left") {
          effectiveOffset = rootAlignOffset * -1;
        }
      } else if (rootAlign == "edge") {
        var pivots;
        if (region == "top" || region == "bottom") {
          pivots = [targetPivot, targetPivot - rootDimension.width];
        } else if (region == "left" || region == "right") {
          pivots = [targetPivot, targetPivot - rootDimension.height];
        }

        var positive = rootAlignOffset >= 0;
        if (region == "top" || region == "right") {
          pivot = positive ? pivots[1] : pivots[0];
        } else if (region == "bottom" || region == "left") {
          pivot = positive ? pivots[0] : pivots[1];
        }

        if (region == "top" || region == "right") {
          effectiveOffset = rootAlignOffset;
        } else if (region == "bottom" || region == "left") {
          effectiveOffset = rootAlignOffset * -1;
        }
      }

      return pivot + effectiveOffset + this.targetAlignmentOffset(region);
    },

    calculatePosition: function (parent, target) {
      var region = this.state.region;
      var hasTail = this.props.hasTail;
      var rootDimension = this.rootDimension();

      var tailWidth = 0;
      var tailHeight = 0;
      if (hasTail) {
        var tailDimension = this.tailDimension(region);
        tailWidth = tailDimension.width;
        tailHeight = tailDimension.height;
      }

      var position = {
        hidden: !this.availableRegion(region),
        tail: {
          hidden: !hasTail
        }
      };

      var effectiveTargetOffset;

      if (this.props.targetOffsetFrom == "root") {
        effectiveTargetOffset = this.props.targetOffset;
      } else if (this.props.targetOffsetFrom == "tail") {
        if (region == "top" || region == "bottom") {
          effectiveTargetOffset = tailHeight + this.props.targetOffset;
        } else if (region == "left" || region == "right") {
          effectiveTargetOffset = tailWidth + this.props.targetOffset
        }
      }

      if (region == "top") {
        position.top = target.top - rootDimension.height - effectiveTargetOffset;
        position.left = this.rootPivot(region, target, rootDimension);
      } else if (region == "bottom") {
        position.top = target.top + target.height + effectiveTargetOffset;
        position.left = this.rootPivot(region, target, rootDimension);
      } else if (region == "left") {
        position.top = this.rootPivot(region, target, rootDimension);
        position.left = target.left - rootDimension.width - effectiveTargetOffset;
      } else if (region == "right") {
        position.top = this.rootPivot(region, target, rootDimension);
        position.left = target.left + target.width + effectiveTargetOffset;
      }

      if (region == "top" || region == "bottom") {
        if (position.left < this.props.edgeOffset) {
          position.left = this.props.edgeOffset;
        } else if (position.left + rootDimension.width > parent.width - this.props.edgeOffset) {
          position.left = parent.width - rootDimension.width - this.props.edgeOffset;
        }
      } else if (region == "left" || region == "right") {
        if (position.top < this.props.edgeOffset) {
          position.top = this.props.edgeOffset;
        } else if (position.top + rootDimension.height > parent.height - this.props.edgeOffset) {
          position.top = parent.height - rootDimension.height - this.props.edgeOffset;
        }
      }

      position.top = Math.round(position.top) + parent.scrollTop;
      position.left = Math.round(position.left) + parent.scrollLeft;

      if (hasTail) {
        if (region == "top") {
          position.tail.top = rootDimension.height;
          position.tail.left = this.tailPivot(region, target, tailDimension, position);
        } else if (region == "bottom") {
          position.tail.top = tailHeight * -1;
          position.tail.left = this.tailPivot(region, target, tailDimension, position);
        } else if (region == "left") {
          position.tail.top = this.tailPivot(region, target, tailDimension, position);
          position.tail.left = rootDimension.width;
        } else if (region == "right") {
          position.tail.top = this.tailPivot(region, target, tailDimension, position);
          position.tail.left = tailWidth * -1;
        }

        position.tail.top = Math.round(position.tail.top);
        position.tail.left = Math.round(position.tail.left);
        position.tail.width = tailWidth;
        position.tail.height = tailHeight;
        position.tail.type = this.tailType(region);
      }

      return position;
    },

    calculateRegion: function (parent, target) {
      var region = this.state.region;

      if (this.props.persevere) {
        region = this.props.region;
      }

      var regionParameter = this.regionParameters(parent, target);

      // Edge detection - flip
      if (region == "top" && !regionParameter.top.fits) {
        region = this.availableAndFitsIn(["bottom", "left", "right"], regionParameter);
      } else if (region == "bottom" && !regionParameter.bottom.fits) {
        region = this.availableAndFitsIn(["top", "left", "right"], regionParameter);
      } else if (region == "left" && !regionParameter.left.fits) {
        region = this.availableAndFitsIn(["right", "top", "bottom"], regionParameter);
      } else if (region == "right" && !regionParameter.right.fits) {
        region = this.availableAndFitsIn(["left", "top", "bottom"], regionParameter);
      }

      // Edge detection - squeeze
      if (_.contains(["top", "bottom"], region) && !regionParameter.top.fits && !regionParameter.bottom.fits) {
        region = this.availableAndFitsIn(["left", "right"], regionParameter);
      } else if (_.contains(["left", "right"], region) && !regionParameter.left.fits && !regionParameter.right.fits) {
        region = this.availableAndFitsIn(["top", "bottom"], regionParameter);
      }

      // Edge detection - rotate
      var rotateOptions;
      if (region == "top" || region == "bottom") {
        if ((parent.width) - (target.left + (target.width / 2)) - this.props.edgeOffset < this.props.rotationOffset) {
          rotateOptions = region == "top" ? ["left", "bottom"] : ["left", "top"];
        } else if (target.left + (target.width / 2) - this.props.edgeOffset < this.props.rotationOffset) {
          rotateOptions = region == "top" ? ["right", "bottom"] : ["right", "top"];
        }
      } else if (region == "left" || region == "right") {
        if ((parent.height) - (target.top + (target.height / 2)) - this.props.edgeOffset < this.props.rotationOffset) {
          rotateOptions = region == "left" ? ["top", "right"] : ["top", "left"];
        } else if (target.top + (target.height / 2) - this.props.edgeOffset < this.props.rotationOffset) {
          rotateOptions = region == "left" ? ["bottom", "right"] : ["bottom", "left"];
        }
      }

      if (rotateOptions) {
        region = this.availableAndFitsIn(rotateOptions, regionParameter);
      }

      return region;
    },

    getInitialState: function () {
      return {
        region: this.props.region,
        position: { tail: {} }
      };
    },

    getDefaultProps: function() {
      return {
        className: "",
        contentClassName: "",
        tailClassName: "",
        hasTail: true,
        region: "top",
        targetOffset: 10,
        targetOffsetFrom: "root",
        edgeOffset: 30,
        rotationOffset: 30,
        targetAlign: "center",
        targetAlignOffset: 0,
        rootAlign: "center",
        rootAlignOffset: 0,
        persevere: false,
        topDisabled: false,
        bottomDisabled: false,
        leftDisabled: false,
        rightDisabled: false,
        hideInDisabledRegions: false
      };
    },

    componentWillReceiveProps: function (nextProps) {
      var newRegion = this.calculateRegion(nextProps.parent || this.props.parent, nextProps.target || this.props.target);
      this.setState({region: newRegion});

      var newPosition = this.calculatePosition(nextProps.parent || this.props.parent, nextProps.target || this.props.target);
      this.setState({position: newPosition});
    },

    render: function () {
      var style = { position: "relative" };

      var rootProperties = _.extend(_.pick(this.props, [
        "className", "contentClassName", "tailClassName",
        "width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight"
      ]), _.pick(this.state.position, ["top", "left", "tail", "hidden"]));

      rootProperties.tail.width = rootProperties.tail.width || this.props.tailWidth;
      rootProperties.tail.height = rootProperties.tail.height || this.props.tailHeight;

      return (
        React.createElement("div", {style: style, clgassName: "flowtip"}, 
          React.createElement(FlowTipRoot, React.__spread({ref: "root"},  rootProperties), 
            this.props.children
          )
        )
      );
    }
  });
});

}());