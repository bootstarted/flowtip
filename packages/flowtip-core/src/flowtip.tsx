import Rect, {RectShape} from 'flowtip-rect';

export type Region = 'top' | 'right' | 'bottom' | 'left';
export type Reason = 'default' | 'inverted' | 'ideal' | 'external' | 'fallback';
export type Dimensions = {width: number; height: number};
export type Align = 'start' | 'center' | 'end' | number;

type Regions<T> = {[key in Region]: T};
type RegionsShape<T> = {[key in Region]: T};

type Position = {
  region: Region;
  align: number;
};

export interface Result {
  bounds: Rect;
  target: Rect;
  region: Region;
  reason: Reason;
  align: number;
  rect: Rect;
  valid: Regions<boolean>;
  offset: number;
  overlap: number;
  overlapCenter: number;
}
type Context = {
  offset: number;
  overlap: number;
  edgeOffset: number;
  align: number;
  region?: Region;
  bounds: Rect;
  target: Rect;
  content: Dimensions;
  disabled: Regions<boolean>;
  constrain: Regions<boolean>;
};
export interface Config {
  offset?: number;
  overlap?: number;
  edgeOffset?: number;
  align?: Align;
  region?: Region;
  bounds: RectShape;
  target: RectShape;
  content: Dimensions;
  disabled?: RegionsShape<boolean>;
  constrain?: RegionsShape<boolean>;
}

export const TOP: Region = 'top';
export const RIGHT: Region = 'right';
export const BOTTOM: Region = 'bottom';
export const LEFT: Region = 'left';

export const START: Align = 'start';
export const CENTER: Align = 'center';
export const END: Align = 'end';

function getRect(context: Context, region: Region, align: number): Rect {
  const {target, content, offset} = context;

  let left;
  let top;

  if (region === TOP || region === BOTTOM) {
    left = target.left + (target.width - content.width) * align;

    if (region === TOP) {
      top = target.top - content.height - offset;
    } else {
      // Region is bottom.
      top = target.bottom + offset;
    }
  } else {
    // Region is left or right.
    top = target.top + (target.height - content.height) * align;

    if (region === LEFT) {
      left = target.left - content.width - offset;
    } else {
      // Region is right.
      left = target.right + offset;
    }
  }

  return new Rect(left, top, content.width, content.height);
}

function getOffsetBounds(context: Context, region: Region): Rect {
  const {bounds, edgeOffset, offset} = context;
  const maxOffset = Math.max(offset, edgeOffset);

  const left = bounds.left + (region === RIGHT ? maxOffset : edgeOffset);
  const top = bounds.top + (region === BOTTOM ? maxOffset : edgeOffset);
  const right = bounds.right - (region === LEFT ? maxOffset : edgeOffset);
  const bottom = bounds.bottom - (region === TOP ? maxOffset : edgeOffset);

  return new Rect(left, top, right - left, bottom - top);
}

function constrainLeft(
  context: Context,
  region: Region,
  offsetBounds: Rect,
  rect: Rect,
): number {
  const {constrain, bounds} = context;

  // Center align the content rect if is wider than the bounds rect.
  if (constrain.left && constrain.right && rect.width > offsetBounds.width) {
    return bounds.left + (bounds.width - rect.width) / 2;
  }

  // If either the left or right edge of the content rect is outside the bounds
  // rect, position it on the edge. Only one of these cases can be true since
  // the content is not wider than the bounds.
  if (constrain.left && rect.left < offsetBounds.left) {
    return offsetBounds.left;
  }

  if (constrain.right && rect.right > offsetBounds.left + offsetBounds.width) {
    return offsetBounds.right - rect.width;
  }

  return rect.left;
}

function constrainTop(
  context: Context,
  region: Region,
  offsetBounds: Rect,
  rect: Rect,
): number {
  const {constrain, bounds} = context;

  // Center align the content rect if is taller than the bounds rect.
  if (constrain.top && constrain.bottom && rect.height > offsetBounds.height) {
    return bounds.top + (bounds.height - rect.height) / 2;
  }

  // If either the left or right edge of the content rect is outside the bounds
  // rect, position it on the edge. Only one of these cases can be true since
  // the content is not taller than the bounds.
  if (constrain.top && rect.top < offsetBounds.top) {
    return offsetBounds.top;
  }

  if (constrain.bottom && rect.bottom > offsetBounds.bottom) {
    return offsetBounds.bottom - rect.height;
  }

  return rect.top;
}

function getValidRegions(context: Context): Regions<boolean> {
  return {
    top: isValidPosition(context, TOP, context.align),
    right: isValidPosition(context, RIGHT, context.align),
    bottom: isValidPosition(context, BOTTOM, context.align),
    left: isValidPosition(context, LEFT, context.align),
  };
}

function isValidPosition(
  context: Context,
  region: Region,
  align: number,
): boolean {
  const {
    target,
    overlap,
    offset,
    edgeOffset,
    bounds,
    content,
    constrain,
  } = context;

  const offsetBounds = Rect.grow(bounds, -edgeOffset);

  if (region === TOP || region === BOTTOM) {
    // This value is true if `overlap` amount of the target rect intersects
    // the bounds rect in the horizontal direction.
    const topBottomValid =
      offsetBounds.right - target.left >= overlap &&
      target.right - offsetBounds.left >= overlap;

    if (!topBottomValid) {
      return false;
    }

    if (region === TOP) {
      const topMargin = target.top - offsetBounds.top - offset;
      if (!(topMargin >= content.height)) {
        return false;
      }
    } else {
      const bottomMargin = offsetBounds.bottom - target.bottom - offset;
      if (!(bottomMargin >= content.height)) {
        return false;
      }
    }

    const contentLeft = target.left + (target.width - content.width) * align;
    const contentRight = contentLeft + content.width;

    const topBottomClips =
      (!constrain.left && bounds.left + edgeOffset > contentLeft) ||
      (!constrain.right && bounds.right - edgeOffset < contentRight);

    if (topBottomClips) {
      return false;
    }
  } else {
    // This value is true if `overlap` amount of the target rect intersects
    // the bounds rect in the vertical direction.
    const leftRightValid =
      offsetBounds.bottom - target.top >= overlap &&
      target.bottom - offsetBounds.top >= overlap;

    if (!leftRightValid) {
      return false;
    }

    if (region === LEFT) {
      const leftMargin = target.left - offsetBounds.left - offset;
      if (!(leftMargin >= content.width)) {
        return false;
      }
    } else {
      const rightMargin = offsetBounds.right - target.right - offset;
      if (!(rightMargin >= content.width)) {
        return false;
      }
    }

    const contentTop = target.top + (target.height - content.height) * align;
    const contentBottom = contentTop + content.height;

    const leftRightClips =
      (!constrain.top && bounds.top + edgeOffset > contentTop) ||
      (!constrain.bottom && bounds.right - edgeOffset < contentBottom);

    if (leftRightClips) {
      return false;
    }
  }

  return true;
}

function getIdealPosition(
  context: Context,
  valid: Regions<boolean>,
): Position | undefined {
  const {target, content, disabled, bounds} = context;

  let margin = 0;
  let region: Region | undefined = undefined;

  // Calculate the amount of remaining free space in each region when occupied
  // by the content rect. It is not necessary to factor `offset` into this
  // calculation since it is constant for all regions.
  const topMargin = target.top - bounds.top - content.height;
  const rightMargin = bounds.right - target.right - content.width;
  const bottomMargin = bounds.bottom - target.bottom - content.height;
  const leftMargin = target.left - bounds.left - content.width;

  if (valid.top && !disabled.top && topMargin > margin) {
    margin = topMargin;
    region = TOP;
  }

  if (valid.right && !disabled.right && rightMargin > margin) {
    margin = rightMargin;
    region = RIGHT;
  }

  if (valid.bottom && !disabled.bottom && bottomMargin > margin) {
    margin = bottomMargin;
    region = BOTTOM;
  }

  if (valid.left && !disabled.left && leftMargin > margin) {
    margin = leftMargin;
    region = LEFT;
  }

  if (region) {
    return {region, align: context.align};
  }

  return undefined;
}

function getExternalRegion(context: Context): Region | undefined {
  const {target, constrain, bounds, edgeOffset, disabled} = context;

  const offsetBounds = Rect.grow(bounds, -edgeOffset);

  const atTop =
    target.top + target.height / 2 < offsetBounds.top + offsetBounds.height / 2;

  const atLeft =
    target.left + target.width / 2 < offsetBounds.left + offsetBounds.width / 2;

  const atBottom = !atTop;
  const atRight = !atLeft;

  const topDist = offsetBounds.top - target.bottom;
  const rightDist = target.left - offsetBounds.right;
  const bottomDist = target.top - offsetBounds.bottom;
  const leftDist = offsetBounds.left - target.right;

  const upperTopLeft = atTop && atLeft && topDist >= leftDist;
  const lowerTopLeft = atTop && atLeft && topDist < leftDist;

  const upperTopRight = atTop && atRight && topDist >= rightDist;
  const lowerTopRight = atTop && atRight && topDist < rightDist;

  const lowerBottomRight = atBottom && atRight && bottomDist >= rightDist;
  const upperBottomRight = atBottom && atRight && bottomDist < rightDist;

  const lowerBottomLeft = atBottom && atLeft && bottomDist >= leftDist;
  const upperBottomLeft = atBottom && atLeft && bottomDist < leftDist;

  if (!disabled.top) {
    if (lowerBottomRight && constrain.bottom) return TOP;
    if (lowerBottomRight && !constrain.right) return TOP;
    if (lowerBottomLeft && constrain.bottom) return TOP;
    if (lowerBottomLeft && !constrain.left) return TOP;
    if (upperBottomRight && constrain.bottom && disabled.left) return TOP;
    if (upperBottomLeft && constrain.bottom && disabled.right) return TOP;
    if (upperBottomLeft && !constrain.left && constrain.bottom) return TOP;
    if (upperBottomRight && !constrain.right && constrain.bottom) return TOP;
  }

  if (!disabled.right) {
    if (upperBottomLeft && constrain.left) return RIGHT;
    if (upperBottomLeft && !constrain.bottom) return RIGHT;
    if (lowerTopLeft && constrain.left) return RIGHT;
    if (lowerTopLeft && !constrain.top) return RIGHT;
    if (lowerBottomLeft && constrain.left && disabled.top) return RIGHT;
    if (upperTopLeft && constrain.left && disabled.bottom) return RIGHT;
    if (upperTopLeft && !constrain.top && constrain.left) return RIGHT;
    if (lowerBottomLeft && !constrain.bottom && constrain.left) return RIGHT;
  }

  if (!disabled.bottom) {
    if (upperTopLeft && constrain.top) return BOTTOM;
    if (upperTopLeft && !constrain.left) return BOTTOM;
    if (upperTopRight && constrain.top) return BOTTOM;
    if (upperTopRight && !constrain.right) return BOTTOM;
    if (lowerTopLeft && constrain.top && disabled.right) return BOTTOM;
    if (lowerTopRight && constrain.top && disabled.left) return BOTTOM;
    if (lowerTopRight && !constrain.right && constrain.top) return BOTTOM;
    if (lowerTopLeft && !constrain.left && constrain.top) return BOTTOM;
  }

  if (!disabled.left) {
    if (lowerTopRight && constrain.right) return LEFT;
    if (lowerTopRight && !constrain.top) return LEFT;
    if (upperBottomRight && constrain.right) return LEFT;
    if (upperBottomRight && !constrain.bottom) return LEFT;
    if (upperTopRight && constrain.right && disabled.bottom) return LEFT;
    if (lowerBottomRight && constrain.right && disabled.top) return LEFT;
    if (upperTopRight && !constrain.top && constrain.right) return LEFT;
    if (lowerBottomRight && !constrain.bottom && constrain.right) return LEFT;
  }

  return undefined;
}

function getExternalPosition(context: Context): Position | undefined {
  const region = getExternalRegion(context);

  if (region) {
    return {region, align: context.align};
  }

  return undefined;
}

/**
 * Get the opposite region of the one provided.
 * i.e. `left` -> `right`, `top` -> `bottom`
 *
 * @param   {string} region A region (`top`, `right`, `bottom`, or `left`).
 * @returns {string} The inverse region.
 */
function invertRegion(region: Region): Region {
  return {
    top: BOTTOM,
    bottom: TOP,
    left: RIGHT,
    right: LEFT,
  }[region];
}

function getDefaultPosition(
  context: Context,
  valid: Regions<boolean>,
): Position | undefined {
  const {region} = context;

  if (typeof region === 'string') {
    if (valid[region] && !context.disabled[region]) {
      return {region, align: context.align};
    }
  }

  return undefined;
}

function getInvertDefaultPosition(
  context: Context,
  valid: Regions<boolean>,
): Position | undefined {
  const {region} = context;

  if (typeof region === 'string') {
    const invertedDefault = invertRegion(region);
    if (valid[invertedDefault] && !context.disabled[invertedDefault]) {
      return {region: invertedDefault, align: context.align};
    }
  }

  return undefined;
}

function getFallbackPosition(context: Context): Position {
  // Prioritize the configured default region.
  let fallback: Region | undefined = context.region;

  // If the default region is not set or is disabled, pick the first enabled
  // region.
  if (typeof fallback !== 'string' || context.disabled[fallback]) {
    fallback = Object.keys(context.disabled).find(
      (region) => !context.disabled[region],
    ) as Region;
  }

  // ALL OF THE REGIONS ARE DISABLED ಠ_ಠ
  if (typeof fallback !== 'string') {
    fallback = TOP;
  }

  return {region: fallback, align: context.align};
}

function getRegion(
  context: Context,
  valid: Regions<boolean>,
): [Region, number, Reason] {
  const idealPosition = getIdealPosition(context, valid);

  // Return the default region set in the context if it is valid.
  const defaultPosition = getDefaultPosition(context, valid);

  if (defaultPosition) {
    return [
      defaultPosition.region,
      defaultPosition.align,
      idealPosition && defaultPosition.region === idealPosition.region
        ? 'ideal'
        : 'default',
    ];
  }

  // Return the default region set in the config if it is valid.
  const invertedPosition = getInvertDefaultPosition(context, valid);

  if (invertedPosition) {
    return [
      invertedPosition.region,
      invertedPosition.align,
      idealPosition && invertedPosition.region === idealPosition.region
        ? 'ideal'
        : 'inverted',
    ];
  }

  // Return the region with the most valid space.
  if (idealPosition) {
    return [idealPosition.region, idealPosition.align, 'ideal'];
  }

  // Return the region from the external calculation if one is returned.
  const externalPosition = getExternalPosition(context);
  if (externalPosition) {
    return [externalPosition.region, externalPosition.align, 'external'];
  }

  const fallbackPosition = getFallbackPosition(context);

  return [fallbackPosition.region, fallbackPosition.align, 'fallback'];
}

function constrainRect(context: Context, region: Region, rect: Rect): Rect {
  const offsetBounds = getOffsetBounds(context, region);

  const left = constrainLeft(context, region, offsetBounds, rect);
  const top = constrainTop(context, region, offsetBounds, rect);

  return new Rect(left, top, rect.width, rect.height);
}

function getOffset(context: Context, region: Region, rect: Rect): number {
  const {target} = context;

  if (region === TOP) {
    return target.top - rect.bottom;
  } else if (region === RIGHT) {
    return rect.left - target.right;
  } else if (region === BOTTOM) {
    return rect.top - target.bottom;
  }

  // Region is left.
  return target.left - rect.right;
}

function getOverlap(region: Region, intersect: Rect): number {
  if (region === TOP || region === BOTTOM) {
    return intersect.width;
  }

  // Region is left or right.
  return intersect.height;
}

function getCenter(region: Region, rect: Rect, intersect: Rect): number {
  if (region === TOP || region === BOTTOM) {
    return intersect.left + intersect.width / 2 - rect.left;
  }

  // Region is left or right;
  return intersect.top + intersect.height / 2 - rect.top;
}

const allRegions = {top: true, right: true, bottom: true, left: true};
const noRegions = {top: false, right: false, bottom: false, left: false};

function normalizeAlign(align?: Align): number {
  if (typeof align === 'number') {
    return align;
  }

  if (align === 'start') {
    return 0;
  }

  if (align === 'end') {
    return 1;
  }

  return 0.5;
}

function getContext(config: Config): Context {
  const {
    offset = 0,
    overlap = 0,
    edgeOffset = 0,
    align,
    region,
    bounds,
    target,
    content,
    disabled,
    constrain,
  } = config;

  return {
    offset,
    overlap,
    edgeOffset,
    align: normalizeAlign(align),
    region,
    bounds: Rect.fromRect(bounds),
    target: Rect.fromRect(target),
    content,
    disabled: {...noRegions, ...disabled},
    constrain: {...allRegions, ...constrain},
  };
}

function flowtip(config: Config): Result {
  const context = getContext(config);

  const valid = getValidRegions(context);

  const [region, align, reason] = getRegion(context, valid);

  const tempRect = getRect(context, region, align);

  const rect = constrainRect(context, region, tempRect);

  const intersect = Rect.intersect(context.target, rect);

  const offset = getOffset(context, region, rect);

  const overlap = getOverlap(region, intersect);

  const overlapCenter = getCenter(region, rect, intersect);

  return {
    bounds: context.bounds,
    target: context.target,
    region,
    reason,
    align,
    rect,
    valid,
    offset,
    overlap,
    overlapCenter,
  };
}

export default flowtip;
