import Rect, {RectShape} from 'flowtip-rect';

export type Region = 'top' | 'right' | 'bottom' | 'left';
export type Reason = 'default' | 'inverted' | 'ideal' | 'external' | 'fallback';
export type Dimensions = {width: number; height: number};
export type Align = 'start' | 'center' | 'end' | number;

type Regions<T> = {[key in Region]: T};
type RegionsShape<T> = {[key in Region]?: T};

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
  align?: number;
  region?: Region;
  bounds: Rect;
  target: Rect;
  content: Dimensions;
  disabled: Regions<boolean>;
  constrain: Regions<boolean>;
  snap: Regions<number[]>;
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
  snap?: RegionsShape<Align[]>;
}

export const TOP: Region = 'top';
export const RIGHT: Region = 'right';
export const BOTTOM: Region = 'bottom';
export const LEFT: Region = 'left';

export const START: Align = 'start';
export const CENTER: Align = 'center';
export const END: Align = 'end';

export const DEFAULT_ALIGN = 0.5;

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

function getEffectiveRegionBounds(context: Context, region: Region): Rect {
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
  const {
    target,
    disabled,
    overlap,
    offset,
    edgeOffset,
    bounds,
    content,
  } = context;

  const topBottomValid =
    !(disabled.top && disabled.bottom) &&
    bounds.right - edgeOffset - target.left - overlap >= 0 &&
    target.right - edgeOffset - bounds.left - overlap >= 0;

  const leftRightValid =
    !(disabled.left && disabled.right) &&
    bounds.bottom - edgeOffset - target.top - overlap >= 0 &&
    target.bottom - edgeOffset - bounds.top - overlap >= 0;

  let topValid = !disabled.top && topBottomValid;
  let rightValid = !disabled.right && leftRightValid;
  let bottomValid = !disabled.bottom && topBottomValid;
  let leftValid = !disabled.left && leftRightValid;

  if (topValid) {
    topValid =
      target.top - offset - content.height - edgeOffset - bounds.top >= 0;
  }

  if (rightValid) {
    rightValid =
      bounds.right - edgeOffset - content.width - offset - target.right >= 0;
  }

  if (bottomValid) {
    bottomValid =
      bounds.bottom - edgeOffset - content.height - offset - target.bottom >= 0;
  }

  if (leftValid) {
    leftValid =
      target.left - offset - content.width - edgeOffset - bounds.left >= 0;
  }

  return {
    top: topValid,
    right: rightValid,
    bottom: bottomValid,
    left: leftValid,
  };
}

function getValidPositions(context: Context): Regions<number[]> {
  const {snap, target, edgeOffset, bounds, content, constrain} = context;

  const topPositions = [];
  const rightPositions = [];
  const bottomPositions = [];
  const leftPositions = [];

  for (let i = 0; i < snap.top.length; i++) {
    const align = snap.top[i];
    const contentLeft = target.left + (target.width - content.width) * align;
    const contentRight = contentLeft + content.width;

    const contentIsClipped =
      (constrain.left && bounds.left + edgeOffset > contentLeft) ||
      (constrain.right && bounds.right - edgeOffset < contentRight);

    if (!contentIsClipped) {
      topPositions.push(align);
    }
  }

  for (let i = 0; i < snap.right.length; i++) {
    const align = snap.right[i];
    const contentTop = target.top + (target.height - content.height) * align;
    const contentBottom = contentTop + content.height;

    const contentIsClipped =
      (constrain.top && bounds.top + edgeOffset > contentTop) ||
      (constrain.bottom && bounds.right - edgeOffset < contentBottom);

    if (!contentIsClipped) {
      rightPositions.push(align);
    }
  }

  for (let i = 0; i < snap.bottom.length; i++) {
    const align = snap.bottom[i];
    const contentLeft = target.left + (target.width - content.width) * align;
    const contentRight = contentLeft + content.width;

    const contentIsClipped =
      (constrain.left && bounds.left + edgeOffset > contentLeft) ||
      (constrain.right && bounds.right - edgeOffset < contentRight);

    if (!contentIsClipped) {
      bottomPositions.push(align);
    }
  }

  for (let i = 0; i < snap.left.length; i++) {
    const align = snap.left[i];
    const contentTop = target.top + (target.height - content.height) * align;
    const contentBottom = contentTop + content.height;

    const contentIsClipped =
      (constrain.top && bounds.top + edgeOffset > contentTop) ||
      (constrain.bottom && bounds.left - edgeOffset < contentBottom);

    if (!contentIsClipped) {
      leftPositions.push(align);
    }
  }

  return {
    top: topPositions,
    right: rightPositions,
    bottom: bottomPositions,
    left: leftPositions,
  };
}

function getPreferredAlign(
  context: Context,
  region: Region,
): number | undefined {
  if (context.region === region && context.align !== undefined) {
    return context.align;
  }

  return undefined;
}

function getIdealAlign(context: Context, region: Region): number {
  const {bounds, edgeOffset, target} = context;

  if (region === TOP || region === BOTTOM) {
    return (
      (target.left - edgeOffset - bounds.left) /
      (bounds.width - edgeOffset - edgeOffset - target.width)
    );
  }

  return (
    (target.top - edgeOffset - bounds.top) /
    (bounds.height - edgeOffset - edgeOffset - target.height)
  );
}

function getPositionInRegion(
  context: Context,
  region: Region,
  positions: number[],
): number {
  if (positions.length === 0) {
    return 0.5;
  }

  if (positions.length === 1) {
    return positions[0];
  }

  let align = getPreferredAlign(context, region);

  if (align === undefined) {
    align = getIdealAlign(context, region);
  }

  console.log('idealAlign', align);

  return positions.reduce((prev, next) =>
    Math.abs(next - (align as number)) < Math.abs(prev - (align as number))
      ? next
      : prev,
  );
}

function getIdealRegion(
  context: Context,
  regions: Regions<boolean>,
  positions: Regions<number[]>,
): Region | undefined {
  const {target, content, bounds} = context;

  let margin = 0;
  let region: Region | undefined = undefined;

  // Calculate the amount of remaining free space in each region when occupied
  // by the content rect. It is not necessary to factor `offset` into this
  // calculation since it is constant for all regions.
  const topMargin = target.top - bounds.top - content.height;
  const rightMargin = bounds.right - target.right - content.width;
  const bottomMargin = bounds.bottom - target.bottom - content.height;
  const leftMargin = target.left - bounds.left - content.width;

  // if (regions.top && positions.top.length && topMargin > margin) {
  //   margin = topMargin;
  //   region = TOP;
  // }

  // if (regions.right && positions.right.length && rightMargin > margin) {
  //   margin = rightMargin;
  //   region = RIGHT;
  // }

  // if (regions.bottom && positions.bottom.length && bottomMargin > margin) {
  //   margin = bottomMargin;
  //   region = BOTTOM;
  // }

  // if (regions.left && positions.left.length && leftMargin > margin) {
  //   margin = leftMargin;
  //   region = LEFT;
  // }

  if (regions.top && topMargin > margin) {
    margin = topMargin;
    region = TOP;
  }

  if (regions.right && rightMargin > margin) {
    margin = rightMargin;
    region = RIGHT;
  }

  if (regions.bottom && bottomMargin > margin) {
    margin = bottomMargin;
    region = BOTTOM;
  }

  if (regions.left && leftMargin > margin) {
    margin = leftMargin;
    region = LEFT;
  }

  return region;
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

function getPreferredRegion(
  context: Context,
  regions: Regions<boolean>,
  positions: Regions<number[]>,
): Region | undefined {
  const {region} = context;

  if (typeof region === 'string') {
    if (regions[region]) {
      return region;
    }
  }

  return undefined;
}

function getInvertPreferredRegion(
  context: Context,
  regions: Regions<boolean>,
  positions: Regions<number[]>,
): Region | undefined {
  const {region} = context;

  if (typeof region === 'string') {
    const result = invertRegion(region);
    if (regions[result]) {
      return result;
    }
  }

  return undefined;
}

function getFallbackRegion(context: Context): Region {
  // Prioritize the configured default region.
  let result: Region | undefined = context.region;

  // If the default region is not set or is disabled, pick the first enabled
  // region.
  if (typeof result !== 'string' || context.disabled[result]) {
    result = Object.keys(context.disabled).find(
      (region) => !context.disabled[region],
    ) as Region;
  }

  // ALL OF THE REGIONS ARE DISABLED ಠ_ಠ
  if (typeof result !== 'string') {
    result = TOP;
  }

  return result;
}

function getRegion(
  context: Context,
  regions: Regions<boolean>,
  positions: Regions<number[]>,
): [Region, Reason] {
  const ideal = getIdealRegion(context, regions, positions);

  // Return the default region set in the context if it is valid.
  const preferred = getPreferredRegion(context, regions, positions);

  if (preferred) {
    return [preferred, preferred === ideal ? 'ideal' : 'default'];
  }

  // Return the default region set in the config if it is valid.
  const inverted = getInvertPreferredRegion(context, regions, positions);

  if (inverted) {
    return [inverted, inverted === ideal ? 'ideal' : 'inverted'];
  }

  // Return the region with the most valid space.
  if (ideal) {
    return [ideal, 'ideal'];
  }

  // Return the region from the external calculation if one is returned.
  const external = getExternalRegion(context);
  if (external) {
    return [external, 'external'];
  }

  const fallback = getFallbackRegion(context);

  return [fallback, 'fallback'];
}

function constrainRect(context: Context, region: Region, rect: Rect): Rect {
  const bounds = getEffectiveRegionBounds(context, region);

  const left = constrainLeft(context, region, bounds, rect);
  const top = constrainTop(context, region, bounds, rect);

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

function parseAlign(align: Align): number {
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

function parseConfig(config: Config): Context {
  const {
    align,
    bounds,
    constrain,
    content,
    disabled,
    edgeOffset = 0,
    offset = 0,
    overlap = 0,
    region,
    snap = {},
    target,
  } = config;

  const parsedAlign = align !== undefined ? parseAlign(align) : undefined;
  const defaultSnap = parsedAlign !== undefined ? [parsedAlign] : [];

  return {
    align: parsedAlign,
    bounds: Rect.fromRect(bounds),
    constrain: {...allRegions, ...constrain},
    content,
    disabled: {...noRegions, ...disabled},
    edgeOffset,
    offset,
    overlap,
    region,
    snap: {
      top:
        snap.top !== undefined && snap.top.length
          ? snap.top.map(parseAlign)
          : defaultSnap,
      right:
        snap.right !== undefined && snap.right.length
          ? snap.right.map(parseAlign)
          : defaultSnap,
      bottom:
        snap.bottom !== undefined && snap.bottom.length
          ? snap.bottom.map(parseAlign)
          : defaultSnap,
      left:
        snap.left !== undefined && snap.left.length
          ? snap.left.map(parseAlign)
          : defaultSnap,
    },
    target: Rect.fromRect(target),
  };
}

function flowtip(config: Config): Result {
  const context = parseConfig(config);

  const regions = getValidRegions(context);
  const positions = getValidPositions(context);

  const [region, reason] = getRegion(context, regions, positions);

  const position = getPositionInRegion(context, region, positions[region]);

  const tempRect = getRect(context, region, position);

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
    align: position,
    rect,
    valid: regions,
    offset,
    overlap,
    overlapCenter,
  };
}

export default flowtip;
