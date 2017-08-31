// @flow
export {default, TOP, RIGHT, BOTTOM, LEFT, CENTER} from './flowtip';
export {default as areEqualDimensions} from './util/areEqualDimensions';
export {default as getClampedTailPosition} from './util/getClampedTailPosition';
export {default as Rect} from './Rect';

export type {
  Region,
  Reason,
  Dimensions,
  Align,
  Regions,
  Result,
  Config,
} from './flowtip';
export type {RectLike} from './Rect';
