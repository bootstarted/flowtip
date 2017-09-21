import {createElement} from 'react';
import sinon from 'sinon';
import {shallow} from 'enzyme';
import {expect} from 'chai';

import FlowTip from '../../src/flowtip';
import FlowTipDOM from '../../src/dom';

describe('FlowTip DOM', () => {
  const ContentComponent = () => (
    <div className="dummp-content" />
  );

  const TailComponent = () => (
    <div className="dummp-tail" />
  );

  const getComponentClass = (content, tail) => {
    return FlowTipDOM(content, tail);
  };

  const getComponent = (ComponentClass, children) => {
    return shallow(
      <ComponentClass parentClass="dummy-parent">
        {children}
      </ComponentClass>
    );
  };

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Invalid parameters', () => {
    it('should throw error when given invalid content component', () => {
      const renderDOMFlowTip = () => {
        return shallow(getComponentClass({lala: 42}, TailComponent));
      };
      expect(renderDOMFlowTip).to.throw(TypeError, /component is not a function/);
    });

    it('should throw error when given invalid tail component', () => {
      const renderDOMFlowTip = () => {
        return shallow(getComponentClass(ContentComponent, {lala: 42}));
      };
      expect(renderDOMFlowTip).to.throw(TypeError, /component is not a function/);
    });
  });

  describe('Valid parameters', () => {
    it('should render an instance of FlowTip', () => {
      const FlowTipComponent = getComponentClass(ContentComponent, TailComponent);
      const component = getComponent(FlowTipComponent, (<span>Test</span>));
      expect(component.find(FlowTip)).to.have.length(1);
    });

    it('should calculate correct parent and anchor properties', () => {
      const FlowTipComponent = getComponentClass(ContentComponent, TailComponent);
      const component = getComponent(FlowTipComponent, (<span>Test</span>));
      const instance = component.instance();

      const computedStyle = {position: "relative", overflow: "auto"};
      const dummyWindow = {
        addEventListener: sandbox.stub(),
        removeEventListener: sandbox.stub(),
        getComputedStyle: () => (computedStyle),
        innerHeight: 1000,
        innerWidth: 2000
      };

      const dummyParent = {
        className: "dummy-parent",
        offsetWidth: 210,
        clientWidth: 200,
        offsetHeight: 430,
        clientHeight: 400,
        addEventListener: sandbox.stub(),
        removeEventListener: sandbox.stub(),
        getBoundingClientRect: () => ({top: 10, left: 20, right: 300, bottom: 400})
      };

      const dummyAnchor = {
        className: "dummy-anchor",
        parentNode: dummyParent,
        getBoundingClientRect: () => ({top: 10, left: 20, width: 30, height: 40})
      };

      sandbox.stub(FlowTipComponent.prototype, "getWindow").returns(dummyWindow);
      sandbox.stub(FlowTipComponent.prototype, "getDerivedStyle").returns(computedStyle);
      sandbox.stub(FlowTipComponent.prototype, "getAnchorElement").returns(dummyAnchor);

      instance.componentDidMount();

      expect(instance.state.parent).to.have.property('top', 10);
      expect(instance.state.parent).to.have.property('left', 20);
      expect(instance.state.parent).to.have.property('width', 270);
      expect(instance.state.parent).to.have.property('height', 360);

      expect(instance.state.anchor).to.have.property('top', 10);
      expect(instance.state.anchor).to.have.property('left', 20);
      expect(instance.state.anchor).to.have.property('width', 30);
      expect(instance.state.anchor).to.have.property('height', 40);
    });
  });

  describe('getDerivedStyle', () => {
    it('should return styles for an HTML Element', () => {
      const computedStyle = {position: "relative", overflow: "auto"};
      const dummyWindow = {
        addEventListener: sandbox.stub(),
        removeEventListener: sandbox.stub(),
        getComputedStyle: () => (computedStyle),
        innerHeight: 756,
        innerWidth: 1028
      };

      const FlowTipComponent = getComponentClass(ContentComponent, TailComponent);
      const component = getComponent(FlowTipComponent, (<span>Test</span>));
      const instance = component.instance();

      sandbox.stub(FlowTipComponent.prototype, "getWindow").returns(dummyWindow);
      sandbox.stub(FlowTipComponent.prototype, "getElementNode").returns(3);
      const doc = {
        nodeType: 9 // Node.DOCUMENT_NODE
      };
      const docElement = {
        nodeType: 3 // Node.ELEMENT_NODE
      }

      expect(instance.getDerivedStyle(doc)).to.be.null;
      expect(instance.getDerivedStyle(docElement)).not.to.be.null;
      expect(instance.getDerivedStyle(docElement)).to.deep.equal(computedStyle);
    });
  });
});
