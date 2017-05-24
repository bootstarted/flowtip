import flowtip from '../src/flowtip';

import {drawResult} from './util';

import {internalLeft} from './fixtures';

describe('flowtip', () => {
  describe('inverted result', () => {
    it('should have highest priority', () => {
      const config = {
        ...internalLeft,
        region: 'bottom',
        disabled: {bottom: true},
      };
      const result = flowtip(config);

      expect(drawResult(config, result)).toMatchSnapshot();
      expect(result.reason).toEqual('inverted');
      expect(result.region).toEqual('top');
    });

    it('can be disabled', () => {
      const config = {
        ...internalLeft,
        region: 'top',
        disabled: {top: true, bottom: true},
      };
      const result = flowtip(config);

      expect(drawResult(config, result)).toMatchSnapshot();
      expect(result.reason).toEqual('ideal');
      expect(result.region).toEqual('right');
    });
  });
});
