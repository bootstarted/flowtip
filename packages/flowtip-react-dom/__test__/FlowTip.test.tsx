import {renderToStaticMarkup} from 'react-dom/server';
import React from 'react';
import {mount} from 'enzyme';
import FlowTip from '../src/FlowTip';

const Content = ({result: _result, ...props}) => (
  <div id="content" {...props} />
);

const rect = {top: 0, left: 0, width: 0, height: 0};

describe('FlowTip', () => {
  describe('_node', () => {
    it('should equal the `Content` DOM node', () => {
      document.body.innerHTML = renderToStaticMarkup(<div id="root" />);

      const wrapper = mount(<FlowTip content={Content} target={rect} />, {
        attachTo: document.getElementById('root'),
      });

      expect(wrapper.find(Content).length).toEqual(1);
      wrapper.unmount();
    });
  });

  describe('_containingBlockNode', () => {
    it('should equal the closest parent with position not `static`', () => {
      document.body.innerHTML = renderToStaticMarkup(
        <div id="parent" style={{position: 'relative'}}>
          <div>
            <div id="root" />
          </div>
        </div>,
      );

      const wrapper = mount(<FlowTip content={Content} target={rect} />, {
        attachTo: document.getElementById('root'),
      });

      const instance = wrapper.instance();
      const parent = document.getElementById('parent');

      expect(parent).toBeTruthy();
      expect(instance._containingBlockNode).toEqual(parent);
      wrapper.unmount();
    });
  });

  describe('_handleScroll()', () => {
    let spy;

    beforeEach(() => {
      spy = jest.spyOn(FlowTip.prototype, '_updateState');
    });

    afterEach(() => {
      spy.mockReset();
      spy.mockRestore();
    });

    it('should be called when the body scrolls', () => {
      document.body.innerHTML = renderToStaticMarkup(
        <div id="parent" style={{overflow: 'scroll'}}>
          <div>
            <div id="root" />
          </div>
        </div>,
      );

      const wrapper = mount(<FlowTip />, {
        attachTo: document.getElementById('root'),
      });

      const count = spy.mock.calls.length;

      window.dispatchEvent(new UIEvent('scroll'));

      expect(spy).toHaveBeenCalledTimes(count + 1);

      wrapper.unmount();
    });
  });
});
