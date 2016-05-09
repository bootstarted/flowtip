/* eslint-disable complexity */
import React from "react";
import { pick, extend } from "./utils";

import FlowtipRoot from "./flowtip-root";

export default class Flowtip extends React.Component {
  static defaultProps = {
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

  state = {
    region: this.props.region,
    position: { tail: {} }
  };

  rootAlign(region) {
    return this.props[region + "RootAlign"] || this.props.rootAlign;
  }

  rootAlignOffset(region) {
    return this.props[region + "RootAlignOffset"] || this.props.rootAlignOffset;
  }

  targetAlign(region) {
    return this.props[region + "TargetAlign"] || this.props.targetAlign;
  }

  targetAlignOffset(region) {
    return this.props[region + "TargetAlignOffset"] || this.props.targetAlignOffset;
  }

  availableRegion(region) {
    return !this.props[region + "Disabled"];
  }

  fitsInRegion(region, parent, target) {
    const position = this.calculatePosition(parent, target, false);
    const rootDimension = this.rootDimension();

    if (region === "top") {
      return position.top - this.props.edgeOffset >= parent.top;
    } else if (region === "bottom") {
      return position.top + rootDimension.height + this.props.edgeOffset <= parent.top + parent.height;
    } else if (region === "left") {
      return position.left - this.props.edgeOffset >= parent.left;
    } else if (region === "right") {
      return position.left + rootDimension.width + this.props.edgeOffset <= parent.left + parent.width;
    }
  }

  availableAndFitsIn([region, ...regions], regionParameter) {
    if (!regions || regions.length <= 0) {
      return this.state.region;
    }

    const availables = regionParameter[region].availables;
    const fits = regionParameter[region].fits;
    const hides = this.props.hideInDisabledRegions;

    if ((availables && fits) || (!availables && hides)) {
      return region;
    } else {
      return this.availableAndFitsIn(regions, regionParameter);
    }
  }

  rootDimension() {
    return this.refs.root.getDimension();
  }

  tailDimension(region) {
    if (!this._tailOriginalDimension) {
      this._tailOriginalDimension = this.refs.root.getTailOriginalDimension();
    }

    const dimension = {
      width: this._tailOriginalDimension.width,
      height: this._tailOriginalDimension.height
    };

    if (region === "left" || region === "right") {
      return {width: dimension.height, height: dimension.width};
    } else {
      return dimension;
    }
  }

  tailType(region) {
    switch (region) {
    case "top":
      return "bottom";
    case "bottom":
      return "top";
    case "right":
      return "left";
    case "left":
      return "right";
    }
  }

  regionParameters(parent, target) {
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
  }

  targetAlignmentOffset(region) {
    const targetAlign = this.targetAlign(region);
    const targetAlignOffset = this.targetAlignOffset(region);

    if (targetAlign === "center") {
      if (region === "top" || region === "right") {
        return targetAlignOffset;
      } else if (region === "bottom" || region === "left") {
        return targetAlignOffset * -1;
      }
    } else if (targetAlign === "edge") {
      if (region === "top" || region === "right") {
        return targetAlignOffset * -1;
      } else if (region === "bottom" || region === "left") {
        return targetAlignOffset;
      }
    }
  }

  targetPivot(region, targetParameter) {
    const targetAlign = this.targetAlign(region);
    const targetAlignOffset = this.targetAlignOffset(region);
    let pivot;

    if (targetAlign === "center") {
      if (region === "top" || region === "bottom") {
        pivot = targetParameter.left + (targetParameter.width / 2);
      } else if (region === "left" || region === "right") {
        pivot = targetParameter.top + (targetParameter.height / 2);
      }
    } else if (targetAlign === "edge") {
      let pivots;
      if (region === "top" || region === "bottom") {
        pivots = [targetParameter.left, targetParameter.left + targetParameter.width];
      } else if (region === "left" || region === "right") {
        pivots = [targetParameter.top, targetParameter.top + targetParameter.height];
      }

      const positive = targetAlignOffset >= 0;
      if (region === "top" || region === "right") {
        pivot = positive ? pivots[1] : pivots[0];
      } else if (region === "bottom" || region === "left") {
        pivot = positive ? pivots[0] : pivots[1];
      }
    }

    return pivot;
  }

  tailPivot(region, targetParameter, tailDimension, rootPosition) {
    const targetPivot = this.targetPivot(region, targetParameter);
    let pivot;

    if (region === "top" || region === "bottom") {
      pivot = targetPivot - rootPosition.left - (tailDimension.width / 2);
    } else if (region === "left" || region === "right") {
      pivot = targetPivot - rootPosition.top - (tailDimension.height / 2);
    }

    const effectiveOffset = this.targetAlignmentOffset(region);

    return pivot + effectiveOffset;
  }

  rootPivot(region, targetParameter, rootDimension) {
    const targetPivot = this.targetPivot(region, targetParameter);
    const rootAlign = this.rootAlign(region);
    const rootAlignOffset = this.rootAlignOffset(region);
    let pivot;
    let effectiveOffset;

    if (rootAlign === "center") {
      if (region === "top" || region === "bottom") {
        pivot = targetPivot - (rootDimension.width / 2);
      } else if (region === "left" || region === "right") {
        pivot = targetPivot - (rootDimension.height / 2);
      }

      if (region === "top" || region === "right") {
        effectiveOffset = rootAlignOffset;
      } else if (region === "bottom" || region === "left") {
        effectiveOffset = rootAlignOffset * -1;
      }
    } else if (rootAlign === "edge") {
      let pivots;
      if (region === "top" || region === "bottom") {
        pivots = [targetPivot, targetPivot - rootDimension.width];
      } else if (region === "left" || region === "right") {
        pivots = [targetPivot, targetPivot - rootDimension.height];
      }

      const positive = rootAlignOffset >= 0;
      if (region === "top" || region === "right") {
        pivot = positive ? pivots[1] : pivots[0];
      } else if (region === "bottom" || region === "left") {
        pivot = positive ? pivots[0] : pivots[1];
      }

      if (region === "top" || region === "right") {
        effectiveOffset = rootAlignOffset;
      } else if (region === "bottom" || region === "left") {
        effectiveOffset = rootAlignOffset * -1;
      }
    }

    return pivot + effectiveOffset + this.targetAlignmentOffset(region);
  }

  calculatePosition(parent, target, clamp = true) {
    const region = this.state.region;
    const hasTail = this.props.hasTail;
    const rootDimension = this.rootDimension();

    let tailDimension = {};
    let tailWidth = 0;
    let tailHeight = 0;

    if (hasTail) {
      tailDimension = this.tailDimension(region);
      tailWidth = tailDimension.width;
      tailHeight = tailDimension.height;
    }

    const position = {
      hidden: !this.availableRegion(region),
      tail: {
        hidden: !hasTail
      }
    };

    let effectiveTargetOffset;

    if (this.props.targetOffsetFrom === "root") {
      effectiveTargetOffset = this.props.targetOffset;
    } else if (this.props.targetOffsetFrom === "tail") {
      if (region === "top" || region === "bottom") {
        effectiveTargetOffset = tailHeight + this.props.targetOffset;
      } else if (region === "left" || region === "right") {
        effectiveTargetOffset = tailWidth + this.props.targetOffset
      }
    }

    if (region === "top") {
      position.top = target.top - rootDimension.height - effectiveTargetOffset;
      position.left = this.rootPivot(region, target, rootDimension);
    } else if (region === "bottom") {
      position.top = target.top + target.height + effectiveTargetOffset;
      position.left = this.rootPivot(region, target, rootDimension);
    } else if (region === "left") {
      position.top = this.rootPivot(region, target, rootDimension);
      position.left = target.left - rootDimension.width - effectiveTargetOffset;
    } else if (region === "right") {
      position.top = this.rootPivot(region, target, rootDimension);
      position.left = target.left + target.width + effectiveTargetOffset;
    }

    if (clamp) {
      if (position.left < parent.left + this.props.edgeOffset) {
        position.left = parent.left + this.props.edgeOffset;
      } else if (position.left + rootDimension.width > parent.left + parent.width - this.props.edgeOffset) {
        position.left = parent.left + parent.width - rootDimension.width - this.props.edgeOffset;
      }
      if (position.top < parent.top + this.props.edgeOffset) {
        position.top = parent.top + this.props.edgeOffset;
      } else if (position.top + rootDimension.height > parent.top + parent.height - this.props.edgeOffset) {
        position.top = parent.top + parent.height - rootDimension.height - this.props.edgeOffset;
      }
    }

    position.top = Math.round(position.top);
    position.left = Math.round(position.left);

    if (hasTail) {
      if (region === "top") {
        position.tail.top = rootDimension.height;
        position.tail.left = this.tailPivot(region, target, tailDimension, position);
      } else if (region === "bottom") {
        position.tail.top = tailHeight * -1;
        position.tail.left = this.tailPivot(region, target, tailDimension, position);
      } else if (region === "left") {
        position.tail.top = this.tailPivot(region, target, tailDimension, position);
        position.tail.left = rootDimension.width;
      } else if (region === "right") {
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
  }

  calculateRegion(parent, target) {
    let region = this.state.region;

    if (this.props.persevere) {
      region = this.props.region;
    }

    const regionParameter = this.regionParameters(parent, target);

    // Edge detection - flip
    if (region === "top" && !regionParameter.top.fits) {
      region = this.availableAndFitsIn(["bottom", "left", "right"], regionParameter);
    } else if (region === "bottom" && !regionParameter.bottom.fits) {
      region = this.availableAndFitsIn(["top", "left", "right"], regionParameter);
    } else if (region === "left" && !regionParameter.left.fits) {
      region = this.availableAndFitsIn(["right", "top", "bottom"], regionParameter);
    } else if (region === "right" && !regionParameter.right.fits) {
      region = this.availableAndFitsIn(["left", "top", "bottom"], regionParameter);
    }

    // Edge detection - squeeze
    if ((["top", "bottom"].indexOf !== region) && !regionParameter.top.fits && !regionParameter.bottom.fits) {
      region = this.availableAndFitsIn(["left", "right"], regionParameter);
    } else if ((["left", "right"].indexOf !== region) && !regionParameter.left.fits && !regionParameter.right.fits) {
      region = this.availableAndFitsIn(["top", "bottom"], regionParameter);
    }

    // Edge detection - rotate
    let rotateOptions;
    if (region === "top" || region === "bottom") {
      if ((parent.left + parent.width) - (target.left + (target.width / 2)) - this.props.edgeOffset < this.props.rotationOffset) {
        rotateOptions = region === "top" ? ["left", "bottom"] : ["left", "top"];
      } else if (target.left + (target.width / 2) - this.props.edgeOffset < parent.left + this.props.rotationOffset) {
        rotateOptions = region === "top" ? ["right", "bottom"] : ["right", "top"];
      }
    } else if (region === "left" || region === "right") {
      if ((parent.top + parent.height) - (target.top + (target.height / 2)) - this.props.edgeOffset < this.props.rotationOffset) {
        rotateOptions = region === "left" ? ["top", "right"] : ["top", "left"];
      } else if (target.top + (target.height / 2) - this.props.edgeOffset < parent.top + this.props.rotationOffset) {
        rotateOptions = region === "left" ? ["bottom", "right"] : ["bottom", "left"];
      }
    }

    if (rotateOptions) {
      region = this.availableAndFitsIn(rotateOptions, regionParameter);
    }

    return region;
  }

  componentWillReceiveProps(nextProps) {
    const newRegion = this.calculateRegion(nextProps.parent || this.props.parent, nextProps.target || this.props.target);
    this.setState({region: newRegion});

    const newPosition = this.calculatePosition(nextProps.parent || this.props.parent, nextProps.target || this.props.target);
    this.setState({position: newPosition});
  }

  render() {
    const rootProperties = extend(pick(this.props, [
      "className", "contentClassName", "tailClassName",
      "width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight"
    ]), pick(this.state.position, ["top", "left", "tail", "hidden"]));


    rootProperties.tail.width = rootProperties.tail.width || this.props.tailWidth;
    rootProperties.tail.height = rootProperties.tail.height || this.props.tailHeight;

    return (
      <FlowtipRoot ref="root" {...rootProperties}>
        {this.props.children}
      </FlowtipRoot>
    );
  }
};
