import omit from '../src/util/omit';

describe('omit', () => {
  it('return a an object with properties omitted', () => {
    expect(omit(['a', 'b', 'c'], {a: 'a', b: 'b', d: 'd', e: 'e'}))
      .toEqual({d: 'd', e: 'e'});
  });
});
