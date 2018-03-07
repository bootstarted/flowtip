// @flow
import type {Dimensions} from '../flowtip';

const areEqualDimensions = (a: ?Dimensions, b: ?Dimensions): boolean => {
  if (a === b) return true;

  if ((a === null || a === undefined) && (b === null || b === undefined)) {
    return true;
  }

  if (a === null || a === undefined || b === null || b === undefined) {
    return false;
  }

  return a.width === b.width && a.height === b.height;
};

export default areEqualDimensions;
