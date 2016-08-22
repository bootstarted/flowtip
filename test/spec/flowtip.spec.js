import {createElement} from 'react';
import {shallow} from 'enzyme';
import {expect} from 'chai';
import FlowTip from '../../src/flowtip';

describe('FlowTip', () => {
  it('should keep flyout in the desired region if possible', () => {
    const parent = {left: 0, top: 0, width: 300, height: 300};
    const anchor = parent;
    const tail = {width: 50, height: 50};
    const content = {width: 100, height: 100};
    const region = 'left';
    const offset = {left: 0, top: 0};
    const target = {left: 200, top: 100, width: 50, height: 50};
    const component = shallow(
      <FlowTip
        parent={parent}
        anchor={anchor}
        tail={tail}
        content={content}
        region={region}
        offset={offset}
        target={target}
        children={({region}) =>
          <div>{region}</div>
        }
      />
    );
    expect(component.text()).to.equal('left');
  });
});
