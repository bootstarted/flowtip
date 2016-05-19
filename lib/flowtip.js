'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* eslint-disable complexity */


var applyAnchor = function applyAnchor(a, b) {
  return {
    left: b.left - a.left,
    top: b.top - a.top,
    width: b.width,
    height: b.height
  };
};

var Flowtip = function (_Component) {
  _inherits(Flowtip, _Component);

  function Flowtip() {
    _classCallCheck(this, Flowtip);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Flowtip).apply(this, arguments));
  }

  _createClass(Flowtip, [{
    key: 'rootAlign',
    value: function rootAlign(region) {
      return this.props[region + 'RootAlign'] || this.props.rootAlign;
    }
  }, {
    key: 'rootAlignOffset',
    value: function rootAlignOffset(region) {
      return this.props[region + 'RootAlignOffset'] || this.props.rootAlignOffset;
    }
  }, {
    key: 'targetAlign',
    value: function targetAlign(region) {
      return this.props[region + 'TargetAlign'] || this.props.targetAlign;
    }
  }, {
    key: 'targetAlignOffset',
    value: function targetAlignOffset(region) {
      return this.props[region + 'TargetAlignOffset'] || this.props.targetAlignOffset;
    }
  }, {
    key: 'availableRegion',
    value: function availableRegion(region) {
      return !this.props[region + 'Disabled'];
    }
  }, {
    key: 'fitsInRegion',
    value: function fitsInRegion(region, parent, target) {
      var position = this.calculatePosition(region, parent, target, false);
      var _props$content = this.props.content;
      var width = _props$content.width;
      var height = _props$content.height;


      if (region === 'top') {
        return position.top - this.props.edgeOffset >= parent.top;
      } else if (region === 'bottom') {
        return position.top + height + this.props.edgeOffset <= parent.top + parent.height;
      } else if (region === 'left') {
        return position.left - this.props.edgeOffset >= parent.left;
      } else if (region === 'right') {
        return position.left + width + this.props.edgeOffset <= parent.left + parent.width;
      }
      throw new TypeError();
    }
  }, {
    key: 'availableAndFitsIn',
    value: function availableAndFitsIn(_ref, regionParameter) {
      var _ref2 = _toArray(_ref);

      var region = _ref2[0];

      var regions = _ref2.slice(1);

      if (!regions || regions.length <= 0) {
        return this.props.region;
      }

      var availables = regionParameter[region].availables;
      var fits = regionParameter[region].fits;
      var hides = this.props.hideInDisabledRegions;

      if (availables && fits || !availables && hides) {
        return region;
      }
      return this.availableAndFitsIn(regions, regionParameter);
    }
  }, {
    key: 'regionParameters',
    value: function regionParameters(parent, target) {
      return {
        top: {
          fits: this.fitsInRegion('top', parent, target),
          availables: this.availableRegion('top')
        },
        bottom: {
          fits: this.fitsInRegion('bottom', parent, target),
          availables: this.availableRegion('bottom')
        },
        left: {
          fits: this.fitsInRegion('left', parent, target),
          availables: this.availableRegion('left')
        },
        right: {
          fits: this.fitsInRegion('right', parent, target),
          availables: this.availableRegion('right')
        }
      };
    }
  }, {
    key: 'targetAlignmentOffset',
    value: function targetAlignmentOffset(region) {
      var targetAlign = this.targetAlign(region);
      var targetAlignOffset = this.targetAlignOffset(region);

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
  }, {
    key: 'targetPivot',
    value: function targetPivot(region, targetParameter) {
      var targetAlign = this.targetAlign(region);
      var targetAlignOffset = this.targetAlignOffset(region);

      if (targetAlign === 'center') {
        if (region === 'top' || region === 'bottom') {
          return targetParameter.left + targetParameter.width / 2;
        } else if (region === 'left' || region === 'right') {
          return targetParameter.top + targetParameter.height / 2;
        }
      } else if (targetAlign === 'edge') {
        var pivots = void 0;
        if (region === 'top' || region === 'bottom') {
          pivots = [targetParameter.left, targetParameter.left + targetParameter.width];
        } else if (region === 'left' || region === 'right') {
          pivots = [targetParameter.top, targetParameter.top + targetParameter.height];
        }

        var positive = targetAlignOffset >= 0;
        if (region === 'top' || region === 'right') {
          return positive ? pivots[1] : pivots[0];
        } else if (region === 'bottom' || region === 'left') {
          return positive ? pivots[0] : pivots[1];
        }
      }
      throw new TypeError();
    }
  }, {
    key: 'tailPivot',
    value: function tailPivot(region, targetParameter, tailDimension, rootPosition) {
      var targetPivot = this.targetPivot(region, targetParameter);
      var pivot = void 0;

      if (region === 'top' || region === 'bottom') {
        pivot = targetPivot - rootPosition.left - tailDimension.width / 2;
      } else if (region === 'left' || region === 'right') {
        pivot = targetPivot - rootPosition.top - tailDimension.height / 2;
      }

      var effectiveOffset = this.targetAlignmentOffset(region);

      return pivot + effectiveOffset;
    }
  }, {
    key: 'rootPivot',
    value: function rootPivot(region, targetParameter) {
      var targetPivot = this.targetPivot(region, targetParameter);
      var rootAlign = this.rootAlign(region);
      var rootAlignOffset = this.rootAlignOffset(region);
      var _props$content2 = this.props.content;
      var width = _props$content2.width;
      var height = _props$content2.height;

      var pivot = void 0;
      var effectiveOffset = void 0;

      if (rootAlign === 'center') {
        if (region === 'top' || region === 'bottom') {
          pivot = targetPivot - width / 2;
        } else if (region === 'left' || region === 'right') {
          pivot = targetPivot - height / 2;
        }

        if (region === 'top' || region === 'right') {
          effectiveOffset = rootAlignOffset;
        } else if (region === 'bottom' || region === 'left') {
          effectiveOffset = rootAlignOffset * -1;
        }
      } else if (rootAlign === 'edge') {
        var pivots = void 0;
        if (region === 'top' || region === 'bottom') {
          pivots = [targetPivot, targetPivot - width];
        } else if (region === 'left' || region === 'right') {
          pivots = [targetPivot, targetPivot - height];
        }

        var positive = rootAlignOffset >= 0;
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
  }, {
    key: 'calculatePosition',
    value: function calculatePosition(region, parent, target) {
      var clamp = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];
      var _props$content3 = this.props.content;
      var width = _props$content3.width;
      var height = _props$content3.height;
      var _props$tail = this.props.tail;
      var tailWidth = _props$tail.width;
      var tailHeight = _props$tail.height;


      var position = {};

      var effectiveTargetOffset = void 0;

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
        } else if (position.left + width > parent.left + parent.width - this.props.edgeOffset) {
          position.left = parent.left + parent.width - width - this.props.edgeOffset;
        }
        if (position.top < parent.top + this.props.edgeOffset) {
          position.top = parent.top + this.props.edgeOffset;
        } else if (position.top + height > parent.top + parent.height - this.props.edgeOffset) {
          position.top = parent.top + parent.height - height - this.props.edgeOffset;
        }
      }

      position.top = Math.round(position.top);
      position.left = Math.round(position.left);
      position.width = width;
      position.height = height;
      return position;
    }
  }, {
    key: 'calculateTailPosition',
    value: function calculateTailPosition(region, target, position) {
      var tailDimension = this.props.tail;
      var tailWidth = tailDimension.width;
      var tailHeight = tailDimension.height;
      var _props$content4 = this.props.content;
      var height = _props$content4.height;
      var width = _props$content4.width;

      var tailOffset = this.props.tailOffset;
      var tail = {};
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
        tail.left = Math.min(width - tailWidth - tailOffset, Math.max(tailOffset, tail.left));
      } else if (region === 'left' || region === 'right') {
        tail.top = Math.min(height - tailHeight - tailOffset, Math.max(tailOffset, tail.top));
      }

      tail.width = tailWidth;
      tail.height = tailHeight;
      return tail;
    }
  }, {
    key: 'calculateRegion',
    value: function calculateRegion(parent, target) {
      var region = this.props.region;

      var regionParameter = this.regionParameters(parent, target);

      // Edge detection - flip
      if (region === 'top' && !regionParameter.top.fits) {
        region = this.availableAndFitsIn(['bottom', 'left', 'right'], regionParameter);
      } else if (region === 'bottom' && !regionParameter.bottom.fits) {
        region = this.availableAndFitsIn(['top', 'left', 'right'], regionParameter);
      } else if (region === 'left' && !regionParameter.left.fits) {
        region = this.availableAndFitsIn(['right', 'top', 'bottom'], regionParameter);
      } else if (region === 'right' && !regionParameter.right.fits) {
        region = this.availableAndFitsIn(['left', 'top', 'bottom'], regionParameter);
      }

      // Edge detection - squeeze
      if (['top', 'bottom'].indexOf !== region && !regionParameter.top.fits && !regionParameter.bottom.fits) {
        region = this.availableAndFitsIn(['left', 'right'], regionParameter);
      } else if (['left', 'right'].indexOf !== region && !regionParameter.left.fits && !regionParameter.right.fits) {
        region = this.availableAndFitsIn(['top', 'bottom'], regionParameter);
      }

      // Edge detection - rotate
      var rotation = void 0;
      if (region === 'top' || region === 'bottom') {
        if (parent.left + parent.width - (target.left + target.width / 2) - this.props.edgeOffset < this.props.rotationOffset) {
          rotation = region === 'top' ? ['left', 'bottom'] : ['left', 'top'];
        } else if (target.left + target.width / 2 - this.props.edgeOffset < parent.left + this.props.rotationOffset) {
          rotation = region === 'top' ? ['right', 'bottom'] : ['right', 'top'];
        }
      } else if (region === 'left' || region === 'right') {
        if (parent.top + parent.height - (target.top + target.height / 2) - this.props.edgeOffset < this.props.rotationOffset) {
          rotation = region === 'left' ? ['top', 'right'] : ['top', 'left'];
        } else if (target.top + target.height / 2 - this.props.edgeOffset < parent.top + this.props.rotationOffset) {
          rotation = region === 'left' ? ['bottom', 'right'] : ['bottom', 'left'];
        }
      }

      if (rotation) {
        region = this.availableAndFitsIn(rotation, regionParameter);
      }

      return region;
    }
  }, {
    key: 'calculateTailVisibility',
    value: function calculateTailVisibility(region, target, content, tail) {
      if (region === 'top') {
        return content.top + tail.top + tail.height <= target.top + this.props.targetOffset;
      } else if (region === 'bottom') {
        return content.top + tail.top >= target.top + target.height - this.props.targetOffset;
      } else if (region === 'left') {
        return content.top + tail.left + tail.width <= target.left + this.props.targetOffset;
      } else if (region === 'right') {
        return content.top + tail.left >= target.left + target.width - this.props.targetOffset;
      }
      throw new TypeError();
    }
  }, {
    key: 'render',
    value: function render() {
      var parent = applyAnchor(this.props.anchor, this.props.parent);
      var target = applyAnchor(this.props.anchor, this.props.target);

      var region = this.calculateRegion(parent, target);
      var contentPosition = this.calculatePosition(region, parent, target);

      var tailPosition = this.calculateTailPosition(region, target, contentPosition);

      var tailDetached = !this.calculateTailVisibility(region, target, contentPosition, tailPosition);

      contentPosition.left += this.props.offset.left;
      contentPosition.top += this.props.offset.top;

      return this.props.children({
        parent: parent,
        target: target,
        tail: {
          position: tailPosition,
          detached: tailDetached
        },
        content: {
          position: contentPosition
        },
        region: region
      });
    }
  }]);

  return Flowtip;
}(_react.Component);

Flowtip.defaultProps = {
  anchor: { top: 0, left: 0 },
  width: 0,
  height: 0,
  offset: { top: 0, left: 0 },
  tail: { width: 0, height: 0 },
  content: { width: 0, height: 0 },
  region: 'top',
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
  hideInDisabledRegions: false
};
exports.default = Flowtip;
//# sourceMappingURL=flowtip.js.map