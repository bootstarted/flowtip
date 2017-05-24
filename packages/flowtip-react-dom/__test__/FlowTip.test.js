import {renderToStaticMarkup} from 'react-dom/server';
import React from 'react';
import {mount} from 'enzyme';
import Flowtip from '../src/FlowTip';

const Content = ({result: _result, ...props}) => <div id='content' {...props}/>;

const rect = {top: 0, left: 0, width: 0, height: 0};

describe('Flowtip', () => {
  describe('_node', () => {
    it('should equal the `Content` DOM node', () => {
      document.body.innerHTML = renderToStaticMarkup(
        <div id='root'/>
      );

      const wrapper = mount(
        <Flowtip content={'foobar'} target={rect}/>,
        {attachTo: document.getElementById('root')},
      );

      const instance = wrapper.instance();
      const content = wrapper.find('foobar').get(0);

      expect(content).toBeTruthy();
      expect(instance._node).toEqual(content);
      wrapper.unmount();
    });
  });

  describe('_containingBlockNode', () => {
    it('should equal the closest parent with position not `static`', () => {
      document.body.innerHTML = renderToStaticMarkup(
        <div id='parent' style={{position: 'relative'}}>
          <div>
            <div id='root'/>
          </div>
        </div>
      );

      const wrapper = mount(
        <Flowtip content={Content} target={rect}/>,
        {attachTo: document.getElementById('root')},
      );

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
      spy = jest.spyOn(Flowtip.prototype, '_handleScroll');
    });

    afterEach(() => {
      spy.mockReset();
      spy.mockRestore();
    });

    it('should be called when the body scrolls', () => {
      document.body.innerHTML = renderToStaticMarkup(
        <div id='parent' style={{overflow: 'scroll'}}>
          <div>
            <div id='root'/>
          </div>
        </div>
      );

      const wrapper = mount(
        <Flowtip/>,
        {attachTo: document.getElementById('root')},
      );

      expect(spy).toHaveBeenCalledTimes(0);

      window.dispatchEvent(new UIEvent('scroll'));

      expect(spy).toHaveBeenCalledTimes(1);
      wrapper.unmount();
    });
  });
});
