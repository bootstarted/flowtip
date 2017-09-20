/* global window,Node */
import {createElement, Component} from 'react';
import ReactDOM from 'react-dom';

import FlowTip from './flowtip';
import ResizeObserver from 'react-resize-observer';

export default (Content, Tail) => {
  if (typeof(Content) !== 'function') {
    throw new TypeError('Content component is not a function.');
  }

  if (typeof(Tail) !== 'function') {
    throw new TypeError('Tail component is not a function.');
  }

  return class FlowTipDOM extends Component {
    static defaultProps = {
      clamp: true,
    };

    state = {
      tail: {width: 0, height: 0},
      content: {width: 0, height: 0},
      parent: {top: 0, left: 0, width: 0, height: 0},
      anchor: {top: 0, left: 0, width: 0, height: 0},
    };

    constructor(props) {
      super(props);
      this.handleScroll = this.handleScroll.bind(this);
    }

    getWindow() {
      return window;
    }

    getElementNode() {
      // only IE has Node as an object, most everyone else has it as a function
      return (typeof Node === 'function' || typeof Node === 'object') &&
        typeof Node.ELEMENT_NODE === 'number' ?  Node.ELEMENT_NODE : null;
    }

    getDerivedStyle(node) {
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
    getAnchorParent(_node) {
      let node = _node.parentNode;
      const isParentNode = (node) => {
        const style = this.getDerivedStyle(node);
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
    getBoundingParent(_node, parentClass = null) {
      let node = _node.parentNode;
      const scrollishStyle = (style) => [
        'auto',
        'hidden',
        'scroll',
      ].indexOf(style) !== -1;

      const isParentNode = (node) => {
        const style = this.getDerivedStyle(node);
        if (parentClass) {
          return node.className.indexOf(parentClass) !== -1;
        } else if (style) {
          return scrollishStyle(style.overflow) ||
            scrollishStyle(style.overflowX) ||
            scrollishStyle(style.overflowY);
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

    getAnchorElement() {
      return this.getAnchorParent(ReactDOM.findDOMNode(this.refs.flowtip));
    }

    getParentElement() {
      const {parentClass} = this.props;
      return this.getBoundingParent(this.getAnchorElement(), parentClass);
    }

    getAnchorRect() {
      const anchor = this.getAnchorElement().getBoundingClientRect();
      return {
        top: anchor.top,
        left: anchor.left,
        width: anchor.width,
        height: anchor.height,
      };
    }

    /**
     * Calculate the bounding parent. This is the rect in which the tooltip
     * must be contained.
     * @returns {Object} Bounding rect.
     */
    getParentRect() {
      const element = this.getParentElement();
      const scrollerWidth = element.offsetWidth - element.clientWidth;
      const scrollerHeight = element.offsetHeight - element.clientHeight;
      const rect = element.getBoundingClientRect();
      const parent = {
        left: rect.left,
        top: rect.top,
        width: rect.right - rect.left,
        height: rect.bottom - rect.top,
      };
      // In addition to taking the parent element into consideration, take the
      // viewport into consideration too.
      if (this.props.clamp) {
        parent.left = Math.max(parent.left, 0);
        parent.top = Math.max(parent.top, 0);
        parent.height = Math.min(
          parent.height,
          this.getWindow().innerHeight - parent.top
        );
        parent.width = Math.min(
          parent.width,
          this.getWindow().innerWidth - parent.left
        );
      }
      parent.width -= scrollerWidth;
      parent.height -= scrollerHeight;
      return parent;
    }

    handleScroll() {
      this.props.onReflow();
      this.updateState();
    }

    updateState() {
      this.setState({
        parent: this.getParentRect(),
        anchor: this.getAnchorRect(),
      });
    }

    componentDidMount() {
      const parent = this.getParentElement();
      this.updateState();
      this.getWindow().addEventListener('scroll', this.handleScroll);
      parent.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
      const parent = this.getParentElement();
      this.getWindow().removeEventListener('scroll', this.handleScroll);
      parent.removeEventListener('scroll', this.handleScroll);
    }

    render() {
      return (
        <FlowTip
          ref='flowtip'
          parent={this.state.parent}
          anchor={this.state.anchor}
          tail={this.state.tail}
          content={this.state.content}
          region={this.state.region}
          offset={this.state.offset}
          {...this.props}
          children={({region, content, tail, target, parent}) => (
            <Content
              region={region}
              position={content.position}
              target={target}
              parent={parent}
              style={{
                position: 'absolute',
                left: content.position.left,
                top: content.position.top,
              }}
              {...this.props.data}
            >
              {this.props.children}
              <ResizeObserver onResize={(content) => this.setState({content})}/>
              <Tail
                position={tail.position}
                target={target}
                parent={parent}
                region={region}
                detached={tail.detached}
                style={{
                  position: 'absolute',
                  left: tail.position.left,
                  top: tail.position.top,
                  visibility: tail.detached ? 'hidden' : 'visible',
                }}
                {...this.props.data}
              >
                <ResizeObserver onResize={(tail) => this.setState({tail})}/>
              </Tail>
            </Content>
          )}
        />
      );
    }
  };
};
