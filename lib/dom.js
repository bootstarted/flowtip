'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _flowtip = require('./flowtip');

var _flowtip2 = _interopRequireDefault(_flowtip);

var _reactResizeObserver = require('react-resize-observer');

var _reactResizeObserver2 = _interopRequireDefault(_reactResizeObserver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* global window,Node */


exports.default = function (Content, Tail) {
  var _class, _temp;

  if (typeof Content !== 'function') {
    throw new TypeError('Content component is not a function.');
  }

  if (typeof Tail !== 'function') {
    throw new TypeError('Tail component is not a function.');
  }

  return _temp = _class = function (_Component) {
    _inherits(FlowTipDOM, _Component);

    function FlowTipDOM(props) {
      _classCallCheck(this, FlowTipDOM);

      var _this = _possibleConstructorReturn(this, (FlowTipDOM.__proto__ || Object.getPrototypeOf(FlowTipDOM)).call(this, props));

      _this.state = {
        tail: { width: 0, height: 0 },
        content: { width: 0, height: 0 },
        parent: { top: 0, left: 0, width: 0, height: 0 },
        anchor: { top: 0, left: 0, width: 0, height: 0 }
      };

      _this.handleScroll = _this.handleScroll.bind(_this);
      return _this;
    }

    _createClass(FlowTipDOM, [{
      key: 'getWindow',
      value: function getWindow() {
        return window;
      }
    }, {
      key: 'getElementNode',
      value: function getElementNode() {
        // only IE has Node as an object, most everyone else has it as a function
        return (typeof Node === 'function' || (typeof Node === 'undefined' ? 'undefined' : _typeof(Node)) === 'object') && typeof Node.ELEMENT_NODE === 'number' ? Node.ELEMENT_NODE : null;
      }
    }, {
      key: 'getDerivedStyle',
      value: function getDerivedStyle(node) {
        if (!(node && node.nodeType === this.getElementNode())) {
          return null;
        }
        return this.getWindow().getComputedStyle(node);
      }

      /**
       * Find the closest node that will control the positioning of the FlowTip™
       * content.
       * @param   {Node} _node Initial node to search from.
       * @returns {Node} The anchor parent.
       */

    }, {
      key: 'getAnchorParent',
      value: function getAnchorParent(_node) {
        var _this2 = this;

        var node = _node.parentNode;
        var isParentNode = function isParentNode(node) {
          var style = _this2.getDerivedStyle(node);
          return style && style.position !== 'static';
        };

        while (node) {
          if (isParentNode(node) || node.tagName === 'BODY') {
            return node;
          }
          node = node.parentNode;
        }
        return node;
      }

      /**
       * Find the closest node that should enclose the FlowTip™'s content.
       * Basically the nearest thing with scrollbars.
       * @param   {[type]} _node       [description]
       * @param   {[type]} parentClass =             null [description]
       * @returns {[type]}             [description]
       */

    }, {
      key: 'getBoundingParent',
      value: function getBoundingParent(_node) {
        var _this3 = this;

        var parentClass = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        var node = _node.parentNode;
        var scrollishStyle = function scrollishStyle(style) {
          return ['auto', 'hidden', 'scroll'].indexOf(style) !== -1;
        };

        var isParentNode = function isParentNode(node) {
          var style = _this3.getDerivedStyle(node);
          if (parentClass) {
            return node.className.indexOf(parentClass) !== -1;
          } else if (style) {
            return scrollishStyle(style.overflow) || scrollishStyle(style.overflowX) || scrollishStyle(style.overflowY);
          }
          return false;
        };

        while (node) {
          if (isParentNode(node) || node.tagName === 'BODY') {
            return node;
          }
          node = node.parentNode;
        }
        return node;
      }
    }, {
      key: 'getAnchorElement',
      value: function getAnchorElement() {
        return this.getAnchorParent(_reactDom2.default.findDOMNode(this.refs.flowtip));
      }
    }, {
      key: 'getParentElement',
      value: function getParentElement() {
        var parentClass = this.props.parentClass;

        return this.getBoundingParent(this.getAnchorElement(), parentClass);
      }
    }, {
      key: 'getAnchorRect',
      value: function getAnchorRect() {
        var anchor = this.getAnchorElement().getBoundingClientRect();
        return {
          top: anchor.top,
          left: anchor.left,
          width: anchor.width,
          height: anchor.height
        };
      }

      /**
       * Calculate the bounding parent. This is the rect in which the tooltip
       * must be contained.
       * @returns {Object} Bounding rect.
       */

    }, {
      key: 'getParentRect',
      value: function getParentRect() {
        var element = this.getParentElement();
        var scrollerWidth = element.offsetWidth - element.clientWidth;
        var scrollerHeight = element.offsetHeight - element.clientHeight;
        var rect = element.getBoundingClientRect();
        var parent = {
          left: rect.left,
          top: rect.top,
          width: rect.right - rect.left,
          height: rect.bottom - rect.top
        };
        // In addition to taking the parent element into consideration, take the
        // viewport into consideration too.
        if (this.props.clamp) {
          parent.left = Math.max(parent.left, 0);
          parent.top = Math.max(parent.top, 0);
          parent.height = Math.min(parent.height, this.getWindow().innerHeight - parent.top);
          parent.width = Math.min(parent.width, this.getWindow().innerWidth - parent.left);
        }
        parent.width -= scrollerWidth;
        parent.height -= scrollerHeight;
        return parent;
      }
    }, {
      key: 'handleScroll',
      value: function handleScroll() {
        this.props.onReflow();
        this.updateState();
      }
    }, {
      key: 'updateState',
      value: function updateState() {
        this.setState({
          parent: this.getParentRect(),
          anchor: this.getAnchorRect()
        });
      }
    }, {
      key: 'componentDidMount',
      value: function componentDidMount() {
        var parent = this.getParentElement();
        this.updateState();
        this.getWindow().addEventListener('scroll', this.handleScroll);
        parent.addEventListener('scroll', this.handleScroll);
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        var parent = this.getParentElement();
        this.getWindow().removeEventListener('scroll', this.handleScroll);
        parent.removeEventListener('scroll', this.handleScroll);
      }
    }, {
      key: 'render',
      value: function render() {
        var _this4 = this;

        return (0, _react.createElement)(_flowtip2.default, _extends({
          ref: 'flowtip',
          parent: this.state.parent,
          anchor: this.state.anchor,
          tail: this.state.tail,
          content: this.state.content,
          region: this.state.region,
          offset: this.state.offset
        }, this.props, {
          children: function children(_ref) {
            var region = _ref.region,
                content = _ref.content,
                tail = _ref.tail,
                target = _ref.target,
                parent = _ref.parent;
            return (0, _react.createElement)(
              Content,
              _extends({
                region: region,
                position: content.position,
                target: target,
                parent: parent,
                style: {
                  position: 'absolute',
                  left: content.position.left,
                  top: content.position.top
                }
              }, _this4.props.data),
              _this4.props.children,
              (0, _react.createElement)(_reactResizeObserver2.default, { onResize: function onResize(content) {
                  return _this4.setState({ content: content });
                } }),
              (0, _react.createElement)(
                Tail,
                _extends({
                  position: tail.position,
                  target: target,
                  parent: parent,
                  region: region,
                  detached: tail.detached,
                  style: {
                    position: 'absolute',
                    left: tail.position.left,
                    top: tail.position.top,
                    visibility: tail.detached ? 'hidden' : 'visible'
                  }
                }, _this4.props.data),
                (0, _react.createElement)(_reactResizeObserver2.default, { onResize: function onResize(tail) {
                    return _this4.setState({ tail: tail });
                  } })
              )
            );
          }
        }));
      }
    }]);

    return FlowTipDOM;
  }(_react.Component), _class.defaultProps = {
    clamp: true
  }, _temp;
};
//# sourceMappingURL=dom.js.map