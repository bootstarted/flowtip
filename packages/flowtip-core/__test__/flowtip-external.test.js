import flowtip from '../src/flowtip';

import {drawResult} from './util';

import {
  externalUpperTopRight,
  externalLowerTopRight,
  externalUpperBottomRight,
  externalLowerBottomRight,
  externalLowerBottomLeft,
  externalUpperBottomLeft,
  externalLowerTopLeft,
  externalUpperTopLeft,
} from './fixtures';

describe('flowtip', () => {
  describe('external result', () => {
    describe('upper top-right quadrant', () => {
      it('should return `bottom`', () => {
        const config = externalUpperTopRight;

        const result = flowtip(config);

        expect(drawResult(config, result)).toMatchSnapshot();
        expect(result.reason).toEqual('external');
        expect(result.region).toEqual('bottom');
      });

      describe('with `top` region disabled', () => {
        it('should return `left`', () => {
          const config = {
            ...externalUpperTopRight,
            disabled: {bottom: true},
          };

          const result = flowtip(config);

          expect(drawResult(config, result)).toMatchSnapshot();
          expect(result.reason).toEqual('external');
          expect(result.region).toEqual('left');
        });
      });

      describe('with `top` constrain disabled', () => {
        it('should return `left`', () => {
          const config = {
            ...externalUpperTopRight,
            constrain: {top: false},
          };
          const result = flowtip(config);

          expect(drawResult(config, result)).toMatchSnapshot();
          expect(result.reason).toEqual('external');
          expect(result.region).toEqual('left');
        });

        describe('and `right` constrain disabled', () => {
          it('should return `bottom`', () => {
            const config = {
              ...externalUpperTopRight,
              constrain: {top: false, right: false},
            };
            const result = flowtip(config);

            expect(drawResult(config, result)).toMatchSnapshot();
            expect(result.reason).toEqual('external');
            expect(result.region).toEqual('bottom');
          });
        });
      });
    });

    describe('lower top-right quadrant', () => {
      it('should return `left`', () => {
        const config = externalLowerTopRight;
        const result = flowtip(config);

        expect(drawResult(config, result)).toMatchSnapshot();
        expect(result.reason).toEqual('external');
        expect(result.region).toEqual('left');
      });

      describe('with `left` region disabled', () => {
        it('should return `bottom`', () => {
          const config = {
            ...externalLowerTopRight,
            disabled: {left: true},
          };
          const result = flowtip(config);

          expect(drawResult(config, result)).toMatchSnapshot();
          expect(result.reason).toEqual('external');
          expect(result.region).toEqual('bottom');
        });
      });

      describe('with `right` constrain disabled', () => {
        it('should return `bottom`', () => {
          const config = {
            ...externalLowerTopRight,
            constrain: {right: false},
          };
          const result = flowtip(config);

          expect(drawResult(config, result)).toMatchSnapshot();
          expect(result.reason).toEqual('external');
          expect(result.region).toEqual('bottom');
        });

        describe('and `top` constrain disabled', () => {
          it('should return `left`', () => {
            const config = {
              ...externalLowerTopRight,
              constrain: {right: false, top: false},
            };
            const result = flowtip(config);

            expect(drawResult(config, result)).toMatchSnapshot();
            expect(result.reason).toEqual('external');
            expect(result.region).toEqual('left');
          });
        });
      });
    });

    describe('upper bottom-right quadrant', () => {
      it('should return `left`', () => {
        const config = externalUpperBottomRight;
        const result = flowtip(config);

        expect(drawResult(config, result)).toMatchSnapshot();
        expect(result.reason).toEqual('external');
        expect(result.region).toEqual('left');
      });

      describe('with `left` region disabled', () => {
        it('should return `left`', () => {
          const config = {
            ...externalUpperBottomRight,
            disabled: {left: true},
          };
          const result = flowtip(config);

          expect(drawResult(config, result)).toMatchSnapshot();
          expect(result.reason).toEqual('external');
          expect(result.region).toEqual('top');
        });
      });

      describe('with `right` constrain disabled', () => {
        it('should return `top`', () => {
          const config = {
            ...externalUpperBottomRight,
            constrain: {right: false},
          };
          const result = flowtip(config);

          expect(drawResult(config, result)).toMatchSnapshot();
          expect(result.reason).toEqual('external');
          expect(result.region).toEqual('top');
        });

        describe('and `bottom` constrain disabled', () => {
          it('should return `left`', () => {
            const config = {
              ...externalUpperBottomRight,
              constrain: {right: false, bottom: false},
            };
            const result = flowtip(config);

            expect(drawResult(config, result)).toMatchSnapshot();
            expect(result.reason).toEqual('external');
            expect(result.region).toEqual('left');
          });
        });
      });
    });

    describe('lower bottom-right quadrant', () => {
      it('should return `top`', () => {
        const config = externalLowerBottomRight;
        const result = flowtip(config);

        expect(drawResult(config, result)).toMatchSnapshot();
        expect(result.reason).toEqual('external');
        expect(result.region).toEqual('top');
      });

      describe('with `top` region disabled', () => {
        it('should return `left`', () => {
          const config = {
            ...externalLowerBottomRight,
            disabled: {top: true},
          };
          const result = flowtip(config);

          expect(drawResult(config, result)).toMatchSnapshot();
          expect(result.reason).toEqual('external');
          expect(result.region).toEqual('left');
        });
      });

      describe('with `bottom` constrain disabled', () => {
        it('should return `left`', () => {
          const config = {
            ...externalLowerBottomRight,
            constrain: {bottom: false},
          };
          const result = flowtip(config);

          expect(drawResult(config, result)).toMatchSnapshot();
          expect(result.reason).toEqual('external');
          expect(result.region).toEqual('left');
        });

        describe('and `right` constrain disabled', () => {
          it('should return `top`', () => {
            const config = {
              ...externalLowerBottomRight,
              constrain: {bottom: false, right: false},
            };
            const result = flowtip(config);

            expect(drawResult(config, result)).toMatchSnapshot();
            expect(result.reason).toEqual('external');
            expect(result.region).toEqual('top');
          });
        });
      });
    });

    describe('lower bottom-left quadrant', () => {
      it('should return `top`', () => {
        const config = externalLowerBottomLeft;
        const result = flowtip(config);

        expect(drawResult(config, result)).toMatchSnapshot();
        expect(result.reason).toEqual('external');
        expect(result.region).toEqual('top');
      });

      describe('with `top` region disabled', () => {
        it('should return `right`', () => {
          const config = {
            ...externalLowerBottomLeft,
            disabled: {top: true},
          };
          const result = flowtip(config);

          expect(drawResult(config, result)).toMatchSnapshot();
          expect(result.reason).toEqual('external');
          expect(result.region).toEqual('right');
        });
      });

      describe('with `bottom` constrain disabled', () => {
        it('should return `right`', () => {
          const config = {
            ...externalLowerBottomLeft,
            constrain: {bottom: false},
          };
          const result = flowtip(config);

          expect(drawResult(config, result)).toMatchSnapshot();
          expect(result.reason).toEqual('external');
          expect(result.region).toEqual('right');
        });

        describe('and `left` constrain disabled', () => {
          it('should return `top`', () => {
            const config = {
              ...externalLowerBottomLeft,
              constrain: {bottom: false, left: false},
            };
            const result = flowtip(config);

            expect(drawResult(config, result)).toMatchSnapshot();
            expect(result.reason).toEqual('external');
            expect(result.region).toEqual('top');
          });
        });
      });
    });

    describe('upper bottom-left quadrant', () => {
      it('should return `right`', () => {
        const config = externalUpperBottomLeft;
        const result = flowtip(config);

        expect(drawResult(config, result)).toMatchSnapshot();
        expect(result.reason).toEqual('external');
        expect(result.region).toEqual('right');
      });

      describe('with `right` region disabled', () => {
        it('should return `right`', () => {
          const config = {
            ...externalUpperBottomLeft,
            disabled: {right: true},
          };
          const result = flowtip(config);

          expect(drawResult(config, result)).toMatchSnapshot();
          expect(result.reason).toEqual('external');
          expect(result.region).toEqual('top');
        });
      });

      describe('with `left` constrain disabled', () => {
        it('should return `top`', () => {
          const config = {
            ...externalUpperBottomLeft,
            constrain: {left: false},
          };
          const result = flowtip(config);

          expect(drawResult(config, result)).toMatchSnapshot();
          expect(result.reason).toEqual('external');
          expect(result.region).toEqual('top');
        });

        describe('and `bottom` constrain disabled', () => {
          it('should return `right`', () => {
            const config = {
              ...externalUpperBottomLeft,
              constrain: {left: false, bottom: false},
            };
            const result = flowtip(config);

            expect(drawResult(config, result)).toMatchSnapshot();
            expect(result.reason).toEqual('external');
            expect(result.region).toEqual('right');
          });
        });
      });
    });

    describe('lower top-left quadrant', () => {
      it('should return `right`', () => {
        const config = externalLowerTopLeft;
        const result = flowtip(config);

        expect(drawResult(config, result)).toMatchSnapshot();
        expect(result.reason).toEqual('external');
        expect(result.region).toEqual('right');
      });

      describe('with `right` region disabled', () => {
        it('should return `bottom`', () => {
          const config = {
            ...externalLowerTopLeft,
            disabled: {right: true},
          };
          const result = flowtip(config);

          expect(drawResult(config, result)).toMatchSnapshot();
          expect(result.reason).toEqual('external');
          expect(result.region).toEqual('bottom');
        });
      });

      describe('with `left` constrain disabled', () => {
        it('should return `bottom`', () => {
          const config = {
            ...externalLowerTopLeft,
            constrain: {left: false},
          };
          const result = flowtip(config);

          expect(drawResult(config, result)).toMatchSnapshot();
          expect(result.reason).toEqual('external');
          expect(result.region).toEqual('bottom');
        });

        describe('and `top` constrain disabled', () => {
          it('should return `right`', () => {
            const config = {
              ...externalLowerTopLeft,
              constrain: {left: false, top: false},
            };
            const result = flowtip(config);

            expect(drawResult(config, result)).toMatchSnapshot();
            expect(result.reason).toEqual('external');
            expect(result.region).toEqual('right');
          });
        });
      });
    });

    describe('upper top-left quadrant', () => {
      it('should return `bottom`', () => {
        const config = externalUpperTopLeft;
        const result = flowtip(config);

        expect(drawResult(config, result)).toMatchSnapshot();
        expect(result.reason).toEqual('external');
        expect(result.region).toEqual('bottom');
      });

      describe('with `bottom` region disabled', () => {
        it('should return `right`', () => {
          const config = {
            ...externalUpperTopLeft,
            disabled: {bottom: true},
          };
          const result = flowtip(config);

          expect(drawResult(config, result)).toMatchSnapshot();
          expect(result.reason).toEqual('external');
          expect(result.region).toEqual('right');
        });
      });

      describe('with `top` constrain disabled', () => {
        it('should return `right`', () => {
          const config = {
            ...externalUpperTopLeft,
            constrain: {top: false},
          };
          const result = flowtip(config);

          expect(drawResult(config, result)).toMatchSnapshot();
          expect(result.reason).toEqual('external');
          expect(result.region).toEqual('right');
        });

        describe('and `left` constrain disabled', () => {
          it('should return `bottom`', () => {
            const config = {
              ...externalUpperTopLeft,
              constrain: {top: false, left: false},
            };
            const result = flowtip(config);

            expect(drawResult(config, result)).toMatchSnapshot();
            expect(result.reason).toEqual('external');
            expect(result.region).toEqual('bottom');
          });
        });
      });
    });
  });
});
