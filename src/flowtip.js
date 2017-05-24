/* eslint-disable complexity */
import {Component} from 'react';

const applyAnchor = (a, b) => {
  return {
    left: b.left - a.left,
    top: b.top - a.top,
    width: b.width,
    height: b.height,
  };
};

export default class Flowtip extends Component {
  static defaultProps = {
    anchor: {top: 0, left: 0},
    width: 0,
    height: 0,
    offset: {top: 0, left: 0},
    tail: {width: 0, height: 0},
    content: {width: 0, height: 0},
    region: 'top',
    clamp: true,
    targetOffset: 0,
    edgeOffset: 30,
    tailOffset: 10,
    rotationOffset: 30,
    targetAlign: 'center',
    targetAlignOffset: 0,
    rootAlign: 'center',
    rootAlignOffset: 0,
    topDisabled: false,
    bottomDisabled: false,
    leftDisabled: false,
    rightDisabled: false,
    hideInDisabledRegions: false,
  };

  rootAlign(region) {
    return this.props[`${region}RootAlign`] || this.props.rootAlign;
  }

  rootAlignOffset(region) {
    return this.props[`${region}RootAlignOffset`] || this.props.rootAlignOffset;
  }

  targetAlign(region) {
    return this.props[`${region}TargetAlign`] || this.props.targetAlign;
  }

  targetAlignOffset(region) {
    return this.props[`${region}TargetAlignOffset`] ||
      this.props.targetAlignOffset;
  }

  availableRegion(region) {
    return !this.props[`${region}Disabled`];
  }

  fitsInRegion(region, parent, target) {
    const position = this.calculatePosition(region, parent, target, false);
    const {width, height} = this.props.content;

    if (region === 'top') {
      return position.top - this.props.edgeOffset >= parent.top;
    } else if (region === 'bottom') {
      return position.top + height + this.props.edgeOffset <=
        parent.top + parent.height;
    } else if (region === 'left') {
      return position.left - this.props.edgeOffset >= parent.left;
    } else if (region === 'right') {
      return position.left + width + this.props.edgeOffset <=
        parent.left + parent.width;
    }
    throw new TypeError();
  }

  availableAndFitsIn([region, ...regions], regionParameter) {
    if (!region) {
      return this.props.region;
    }

    const availables = regionParameter[region].availables;
    const fits = regionParameter[region].fits;
    const hides = this.props.hideInDisabledRegions;

    if ((availables && fits) || (!availables && hides)) {
      return region;
    }
    return this.availableAndFitsIn(regions, regionParameter);
  }

  regionParameters(parent, target) {
    return {
      top: {
        fits: this.fitsInRegion('top', parent, target),
        availables: this.availableRegion('top'),
      },
      bottom: {
        fits: this.fitsInRegion('bottom', parent, target),
        availables: this.availableRegion('bottom'),
      },
      left: {
        fits: this.fitsInRegion('left', parent, target),
        availables: this.availableRegion('left'),
      },
      right: {
        fits: this.fitsInRegion('right', parent, target),
        availables: this.availableRegion('right'),
      },
    };
  }

  targetAlignmentOffset(region) {
    const targetAlign = this.targetAlign(region);
    const targetAlignOffset = this.targetAlignOffset(region);

    if (targetAlign === 'center') {
      if (region === 'top' || region === 'right') {
        return targetAlignOffset;
      } else if (region === 'bottom' || region === 'left') {
        return targetAlignOffset * -1;
      }
    } else if (targetAlign === 'edge') {
      if (region === 'top' || region === 'right') {
        return targetAlignOffset * -1;
      } else if (region === 'bottom' || region === 'left') {
        return targetAlignOffset;
      }
    }
    throw new TypeError();
  }

  targetPivot(region, targetParameter) {
    const targetAlign = this.targetAlign(region);
    const targetAlignOffset = this.targetAlignOffset(region);

    if (targetAlign === 'center') {
      if (region === 'top' || region === 'bottom') {
        return targetParameter.left + (targetParameter.width / 2);
      } else if (region === 'left' || region === 'right') {
        return targetParameter.top + (targetParameter.height / 2);
      }
    } else if (targetAlign === 'edge') {
      let pivots;
      if (region === 'top' || region === 'bottom') {
        pivots = [
          targetParameter.left,
          targetParameter.left + targetParameter.width,
        ];
      } else if (region === 'left' || region === 'right') {
        pivots = [
          targetParameter.top,
          targetParameter.top + targetParameter.height,
        ];
      }

      const positive = targetAlignOffset >= 0;
      if (region === 'top' || region === 'right') {
        return positive ? pivots[1] : pivots[0];
      } else if (region === 'bottom' || region === 'left') {
        return positive ? pivots[0] : pivots[1];
      }
    }
    throw new TypeError();
  }

  tailPivot(region, targetParameter, tailDimension, rootPosition) {
    const targetPivot = this.targetPivot(region, targetParameter);
    let pivot;

    if (region === 'top' || region === 'bottom') {
      pivot = targetPivot - rootPosition.left - (tailDimension.width / 2);
    } else if (region === 'left' || region === 'right') {
      pivot = targetPivot - rootPosition.top - (tailDimension.height / 2);
    }

    const effectiveOffset = this.targetAlignmentOffset(region);

    return pivot + effectiveOffset;
  }

  rootPivot(region, targetParameter) {
    const targetPivot = this.targetPivot(region, targetParameter);
    const rootAlign = this.rootAlign(region);
    const rootAlignOffset = this.rootAlignOffset(region);
    const {width, height} = this.props.content;
    let pivot;
    let effectiveOffset;

    if (rootAlign === 'center') {
      if (region === 'top' || region === 'bottom') {
        pivot = targetPivot - (width / 2);
      } else if (region === 'left' || region === 'right') {
        pivot = targetPivot - (height / 2);
      }

      if (region === 'top' || region === 'right') {
        effectiveOffset = rootAlignOffset;
      } else if (region === 'bottom' || region === 'left') {
        effectiveOffset = rootAlignOffset * -1;
      }
    } else if (rootAlign === 'edge') {
      let pivots;
      if (region === 'top' || region === 'bottom') {
        pivots = [targetPivot, targetPivot - width];
      } else if (region === 'left' || region === 'right') {
        pivots = [targetPivot, targetPivot - height];
      }

      const positive = rootAlignOffset >= 0;
      if (region === 'top' || region === 'right') {
        pivot = positive ? pivots[1] : pivots[0];
      } else if (region === 'bottom' || region === 'left') {
        pivot = positive ? pivots[0] : pivots[1];
      }

      if (region === 'top' || region === 'right') {
        effectiveOffset = rootAlignOffset;
      } else if (region === 'bottom' || region === 'left') {
        effectiveOffset = rootAlignOffset * -1;
      }
    }

    return pivot + effectiveOffset + this.targetAlignmentOffset(region);
  }

  calculatePosition(region, parent, target, clamp = true) {
    const {width, height} = this.props.content;
    const {width: tailWidth, height: tailHeight} = this.props.tail;

    const position = {};

    let effectiveTargetOffset;

    if (region === 'top' || region === 'bottom') {
      effectiveTargetOffset = tailHeight + this.props.targetOffset;
    } else if (region === 'left' || region === 'right') {
      effectiveTargetOffset = tailWidth + this.props.targetOffset;
    }

    if (region === 'top') {
      position.top = target.top - height - effectiveTargetOffset;
      position.left = this.rootPivot(region, target);
    } else if (region === 'bottom') {
      position.top = target.top + target.height + effectiveTargetOffset;
      position.left = this.rootPivot(region, target);
    } else if (region === 'left') {
      position.top = this.rootPivot(region, target);
      position.left = target.left - width - effectiveTargetOffset;
    } else if (region === 'right') {
      position.top = this.rootPivot(region, target);
      position.left = target.left + target.width + effectiveTargetOffset;
    }

    if (clamp) {
      if (position.left < parent.left + this.props.edgeOffset) {
        position.left = parent.left + this.props.edgeOffset;
      } else if (
        position.left + width >
        parent.left + parent.width - this.props.edgeOffset
      ) {
        position.left = parent.left + parent.width -
          width - this.props.edgeOffset;
      }
      if (position.top < parent.top + this.props.edgeOffset) {
        position.top = parent.top + this.props.edgeOffset;
      } else if (
        position.top + height >
        parent.top + parent.height - this.props.edgeOffset
      ) {
        position.top = parent.top + parent.height -
          height - this.props.edgeOffset;
      }
    }

    position.top = Math.round(position.top);
    position.left = Math.round(position.left);
    position.width = width;
    position.height = height;
    return position;
  }

  calculateTailPosition(region, target, position) {
    const tailDimension = this.props.tail;
    const {width: tailWidth, height: tailHeight} = tailDimension;
    const {height, width} = this.props.content;
    const tailOffset = this.props.tailOffset;
    const tail = {};
    if (region === 'top') {
      tail.top = height;
      tail.left = this.tailPivot(region, target, tailDimension, position);
    } else if (region === 'bottom') {
      tail.top = tailHeight * -1;
      tail.left = this.tailPivot(region, target, tailDimension, position);
    } else if (region === 'left') {
      tail.top = this.tailPivot(region, target, tailDimension, position);
      tail.left = width;
    } else if (region === 'right') {
      tail.top = this.tailPivot(region, target, tailDimension, position);
      tail.left = tailWidth * -1;
    }

    tail.top = Math.round(tail.top);
    tail.left = Math.round(tail.left);

    if (region === 'top' || region === 'bottom') {
      tail.left = Math.min(
        width - tailWidth - tailOffset,
        Math.max(tailOffset, tail.left)
      );
    } else if (region === 'left' || region === 'right') {
      tail.top = Math.min(
        height - tailHeight - tailOffset,
        Math.max(tailOffset, tail.top)
      );
    }

    tail.width = tailWidth;
    tail.height = tailHeight;
    return tail;
  }

  calculateRegion(parent, target) {
    let region = this.props.region;

    const regionParameter = this.regionParameters(parent, target);

    // Edge detection - flip
    if (region === 'top' && !regionParameter.top.fits) {
      region = this.availableAndFitsIn([
        'bottom',
        'left',
        'right',
      ], regionParameter);
    } else if (region === 'bottom' && !regionParameter.bottom.fits) {
      region = this.availableAndFitsIn([
        'top',
        'left',
        'right',
      ], regionParameter);
    } else if (region === 'left' && !regionParameter.left.fits) {
      region = this.availableAndFitsIn([
        'right',
        'top',
        'bottom',
      ], regionParameter);
    } else if (region === 'right' && !regionParameter.right.fits) {
      region = this.availableAndFitsIn([
        'left',
        'top',
        'bottom',
      ], regionParameter);
    }

    return region;
  }

  calculateTailVisibility(region, target, content, tail) {
    if (region === 'top') {
      return content.top + tail.top + tail.height <=
        target.top + this.props.targetOffset;
    } else if (region === 'bottom') {
      return content.top + tail.top >=
        target.top + target.height - this.props.targetOffset;
    } else if (region === 'left') {
      return content.top + tail.left + tail.width <=
        target.left + this.props.targetOffset;
    } else if (region === 'right') {
      return content.top + tail.left >=
        target.left + target.width - this.props.targetOffset;
    }
    throw new TypeError();
  }

  render() {
    const parent = applyAnchor(this.props.anchor, this.props.parent);
    const target = applyAnchor(this.props.anchor, this.props.target);

    const region = this.calculateRegion(parent, target);
    const contentPosition = this.calculatePosition(
      region,
      parent,
      target,
      this.props.clamp
    );

    const tailPosition = this.calculateTailPosition(
      region,
      target,
      contentPosition
    );

    const tailDetached = !this.calculateTailVisibility(
      region,
      target,
      contentPosition,
      tailPosition
    );

    contentPosition.left += this.props.offset.left;
    contentPosition.top += this.props.offset.top;

    return this.props.children({
      parent,
      target,
      tail: {
        position: tailPosition,
        detached: tailDetached,
      },
      content: {
        position: contentPosition,
      },
      region,
    });
  }
}
