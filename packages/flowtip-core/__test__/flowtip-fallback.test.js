import flowtip from '../src/flowtip';

import {drawResult} from './util';

import {externalLeft} from './fixtures';

describe('flowtip', () => {
  describe('fallback result', () => {
    it('should return a region', () => {
      const config = {
        ...externalLeft,
        region: 'left',
        disabled: {top: true, bottom: true, right: true},
      };
      const result = flowtip(config);

      expect(drawResult(config, result)).toMatchSnapshot();
      expect(result.reason).toEqual('fallback');
      expect(result.region).toEqual('left');
    });

    it('should _always_ return a region', () => {
      const config = {
        ...externalLeft,
        disabled: {top: true, bottom: true, left: true, right: true},
      };
      const result = flowtip(config);

      expect(drawResult(config, result)).toMatchSnapshot();
      expect(result.reason).toEqual('fallback');
      expect(result.region).toEqual('top');
    });
  });
});
