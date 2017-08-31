import flowtip from '../src/flowtip';

import {drawResult} from './util';

import {internalTop} from './fixtures';

describe('flowtip', () => {
  describe('default result', () => {
    it('should have highest priority', () => {
      const config = {
        ...internalTop,
        region: 'top',
      };
      const result = flowtip(config);

      expect(drawResult(config, result)).toMatchSnapshot();
      expect(result.reason).toEqual('default');
      expect(result.region).toEqual('top');
    });
  });
});
