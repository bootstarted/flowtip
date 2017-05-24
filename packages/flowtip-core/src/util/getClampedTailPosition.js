// @flow
import {LEFT, RIGHT} from '../flowtip';
import type {Dimensions, Result} from '../flowtip';

const getClampedTailPosition = (
  result: Result,
  tail: Dimensions,
  tailOffset: number,
): number => {
  const {region, rect, overlapCenter} = result;
  let offset;
  let range;

  if (region === RIGHT || region === LEFT) {
    offset = tail.height / 2;
    range = rect.height;
  } else {
    // Position is top or bottom.
    offset = tail.width / 2;
    range = rect.width;
  }

  const min = offset + tailOffset;
  const max = range - min;

  return Math.min(max, Math.max(min, overlapCenter)) - offset;
};

export default getClampedTailPosition;
