import flowtip from '../src/flowtip';

import {drawResult} from './util';

import {internalTop} from './fixtures';

describe('flowtip', () => {
  describe('content align', () => {
    it('should align `start`', () => {
      const config = {
        ...internalTop,
        align: 'start',
      };
      const result = flowtip(config);

      expect(drawResult(config, result)).toMatchSnapshot();
      expect(result.reason).toEqual('ideal');
      expect(result.region).toEqual('bottom');
    });

    it('should align `center`', () => {
      const config = {
        ...internalTop,
        align: 'center',
      };
      const result = flowtip(config);

      expect(drawResult(config, result)).toMatchSnapshot();
      expect(result.reason).toEqual('ideal');
      expect(result.region).toEqual('bottom');
    });

    it('should align `end`', () => {
      const config = {
        ...internalTop,
        align: 'end',
      };
      const result = flowtip(config);

      expect(drawResult(config, result)).toMatchSnapshot();
      expect(result.reason).toEqual('ideal');
      expect(result.region).toEqual('bottom');
    });
  });
});
