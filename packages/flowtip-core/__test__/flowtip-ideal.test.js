import flowtip from '../src/flowtip';

import {drawResult} from './util';

import {
  internalTop,
  externalTop,
  internalBottom,
  externalBottom,
  internalLeft,
  externalLeft,
  internalRight,
  externalRight,
  oversizedHorizontal,
  oversizedVertical,
} from './fixtures';

describe('flowtip', () => {
  describe('ideal result', () => {
    describe('at internal top', () => {
      it('should return `bottom`', () => {
        const config = internalTop;
        const result = flowtip(config);

        expect(drawResult(config, result)).toMatchSnapshot();
        expect(result.reason).toEqual('ideal');
        expect(result.region).toEqual('bottom');
      });
    });

    describe('at external top', () => {
      it('should return `bottom`', () => {
        const config = externalTop;
        const result = flowtip(config);

        expect(drawResult(config, result)).toMatchSnapshot();
        expect(result.reason).toEqual('ideal');
        expect(result.region).toEqual('bottom');
      });
    });

    describe('at internal bottom', () => {
      it('should return `top`', () => {
        const config = internalBottom;
        const result = flowtip(config);

        expect(drawResult(config, result)).toMatchSnapshot();
        expect(result.reason).toEqual('ideal');
        expect(result.region).toEqual('top');
      });
    });

    describe('at external bottom', () => {
      it('should return `top`', () => {
        const config = externalBottom;
        const result = flowtip(config);

        expect(drawResult(config, result)).toMatchSnapshot();
        expect(result.reason).toEqual('ideal');
        expect(result.region).toEqual('top');
      });
    });

    describe('at internal left', () => {
      it('should return `right`', () => {
        const config = internalLeft;
        const result = flowtip(config);

        expect(drawResult(config, result)).toMatchSnapshot();
        expect(result.reason).toEqual('ideal');
        expect(result.region).toEqual('right');
      });
    });

    describe('at external left', () => {
      it('should return `right`', () => {
        const config = externalLeft;
        const result = flowtip(config);

        expect(drawResult(config, result)).toMatchSnapshot();
        expect(result.reason).toEqual('ideal');
        expect(result.region).toEqual('right');
      });
    });

    describe('at internal right', () => {
      it('should return `left`', () => {
        const config = internalRight;
        const result = flowtip(config);

        expect(drawResult(config, result)).toMatchSnapshot();
        expect(result.reason).toEqual('ideal');
        expect(result.region).toEqual('left');
      });
    });

    describe('at external right', () => {
      it('should return `left`', () => {
        const config = externalRight;
        const result = flowtip(config);

        expect(drawResult(config, result)).toMatchSnapshot();
        expect(result.reason).toEqual('ideal');
        expect(result.region).toEqual('left');
      });
    });

    describe('with oversized content', () => {
      it('should center horizontally', () => {
        const config = oversizedHorizontal;
        const result = flowtip(config);

        expect(drawResult(config, result)).toMatchSnapshot();
        expect(result.reason).toEqual('ideal');
        expect(result.region).toEqual('bottom');
      });

      it('should center vertically', () => {
        const config = oversizedVertical;
        const result = flowtip(config);

        expect(drawResult(config, result)).toMatchSnapshot();
        expect(result.reason).toEqual('ideal');
        expect(result.region).toEqual('right');
      });
    });

    describe('with region config', () => {
      it('should override `default` reason', () => {
        const config = {
          ...internalTop,
          region: 'bottom',
        };
        const result = flowtip(config);

        expect(drawResult(config, result)).toMatchSnapshot();
        expect(result.reason).toEqual('ideal');
        expect(result.region).toEqual('bottom');
      });

      it('should return `inverted` reason', () => {
        const config = {
          ...internalTop,
          region: 'top',
          disabled: {top: true},
        };
        const result = flowtip(config);

        expect(drawResult(config, result)).toMatchSnapshot();
        expect(result.reason).toEqual('ideal');
        expect(result.region).toEqual('bottom');
      });
    });
  });
});
