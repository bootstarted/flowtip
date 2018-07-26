// @flow
import Rect from './Rect';
import type {RectLike} from './Rect';
import invariant from 'invariant';

export type Region = 'top' | 'right' | 'bottom' | 'left';
export type Reason = 'default' | 'inverted' | 'ideal' | 'external' | 'fallback';
export type Dimensions = {width: number, height: number};
export type Align = 'start' | 'center' | 'end' | number;
type _Regions = {
  top: boolean,
  right: boolean,
  bottom: boolean,
  left: boolean,
};
export type Regions = $Shape<_Regions>;
export type Result = {
  bounds: Rect,
  target: Rect,
  region: Region,
  reason: Reason,
  rect: Rect,
  valid: _Regions,
  offset: number,
  overlap: number,
  overlapCenter: number,
};
type _Config = {
  offset: number,
  overlap: number,
  edgeOffset: number,
  align: number,
  region?: Region,
  bounds: Rect,
  target: Rect,
  content: Dimensions,
  disabled: _Regions,
  constrain: _Regions,
};
export type Config = {
  offset?: number,
  overlap?: number,
  edgeOffset?: number,
  align?: Align,
  region?: Region,
  bounds: RectLike | Rect,
  target: RectLike | Rect,
  content: Dimensions,
  disabled?: Regions,
  constrain?: Regions,
};

export const TOP: Region = 'top';
export const RIGHT: Region = 'right';
export const BOTTOM: Region = 'bottom';
export const LEFT: Region = 'left';

export const START: Align = 'start';
export const CENTER: Align = 'center';
export const END: Align = 'end';

/**
 * Get the position of the content rect when moved into the supplied region and
 * aligned with `config.align`. The returned rect represents the ideal content
 * position before any boundary constrains are applied.
 *
 * The `config.align` value determines how the content rect will be positioned
 * relative to the target rect. A `conifg.align` value of 0 will align it to the
 * start (left or top) of the target while a value of 1 will align the rect to
 * the end (right or bottom). A value of 0.5 will center align it in every
 * orientation.
 *
 * @param   {Object} config FlowTip layout config object.
 * @param   {string} region A region (`top`, `right`, `bottom`, or `left`).
 * @returns {Object} A rect object.
 */
function getRect(config: _Config, region: Region): Rect {
  const {target, content, align, offset} = config;

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

const getContentAvailabilityRect = (config, region: Region, _result) => {
  const {target, bounds, offset} = config;
  switch (region) {
    case TOP: {
      const top = bounds.top;
      const bottom = Math.min(bounds.bottom, target.top) - offset;
      return new Rect(bounds.left, top, bounds.width, bottom - top);
    }
    case BOTTOM: {
      const top = Math.max(target.bottom, bounds.top) + offset;
      const bottom = bounds.bottom;
      return new Rect(bounds.left, top, bounds.width, bottom - top);
    }
    case LEFT: {
      const left = bounds.left;
      const right = Math.min(bounds.right, target.left) - offset;
      return new Rect(left, bounds.top, right - left, bounds.height);
    }
    case RIGHT: {
      const left = Math.max(bounds.left, target.right) + offset;
      const right = bounds.right;
      return new Rect(left, bounds.top, right - left, bounds.height);
    }
    default:
      throw new TypeError('Invalid region.');
  }
};

const getTailAvailabilityRect = (config, region: Region, _result) => {
  const {target, bounds} = config;
  switch (region) {
    case TOP:
      return new Rect(
        target.left,
        bounds.top,
        target.width,
        target.top - bounds.top,
      );
    case BOTTOM:
      return new Rect(
        target.left,
        target.bottom,
        target.width,
        bounds.bottom - target.bottom,
      );
    case LEFT:
      return new Rect(
        bounds.left,
        target.top,
        target.left - bounds.left,
        target.height,
      );
    case RIGHT:
      return new Rect(
        target.right,
        target.top,
        bounds.right - target.right,
        target.height,
      );
    default:
      throw new TypeError('Invalid region.');
  }
};

const getContentRect = (config, region, result) => {
  const {overlap, content, bounds} = config;
  const contentAvailable = result.contentAvailabilityRect;
  const tailAvailable = result.tailAvailabilityRect;
  switch (region) {
    case TOP:
    case BOTTOM:
      const left = Math.max(
        bounds.left,
        tailAvailable.left + overlap - content.width,
      );
      const right = Math.min(
        bounds.right,
        tailAvailable.right - overlap + content.width,
      );
      return new Rect(
        left,
        contentAvailable.top,
        right - left,
        contentAvailable.height,
      );
    case LEFT:
    case RIGHT:
      const top = Math.max(
        bounds.top,
        tailAvailable.top + overlap - content.height,
      );
      const bottom = Math.min(
        bounds.bottom,
        tailAvailable.bottom - overlap + content.height,
      );
      return new Rect(
        contentAvailable.left,
        top,
        contentAvailable.width,
        bottom - top,
      );
    default:
      throw new TypeError('Invalid region.');
  }
};

const getOverlapRect = (config, region, result) => {
  return Rect.intersect(config.target, result.contentRect);
};

const getOverlap = (config, region, result) => {
  switch (region) {
    case TOP:
    case BOTTOM:
      return result.overlapRect.width;
    case LEFT:
    case RIGHT:
      return result.overlapRect.height;
    default:
      throw new TypeError();
  }
};

/**
 * Calculate which regions are valid for the content rect to occupy.
 * This function measures the available space around the target rect within the
 * container rect. Any region with sufficient space to display the content rect
 * without clipping is set to `true`.
 *
 * This function checks the margins between the target rect and the bounds rect
 * in every region when offset from the the target. If a margin is smaller than
 * the width or height of the height of the content rect, that region is not
 * valid.
 *
 *  _________________________________________________________________
 * |                   ^                                             |
 * |                   |                                             |
 * |                  top                                            |
 * |                 margin   |‾‾‾‾‾‾‾‾‾‾‾|                          |
 * |                   |      |  content  |                          |
 * |                  _V_ _ _ |___________|    |<----right-margin--->|
 * |                                |          |                     |
 * |         |‾‾‾‾‾‾‾‾‾‾‾|     _____|_____     |‾‾‾‾‾‾‾‾‾‾‾|         |
 * |         |  content  |----|  target   |----|  content  |         |
 * |         |___________|     ‾‾‾‾‾|‾‾‾‾‾     |___________|         |
 * |                     |          |                                |
 * |<----left-margin---->|    |‾‾‾‾‾‾‾‾‾‾‾| ‾ ‾<- bottom margin      |
 *  ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|  content  |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
 *                            |___________|
 * > bottom margin is smaller than the content height, this region is disabled
 *
 * In addition to checking the margins, this function also checks that enough
 * of the target rect intersects with the bounds rect in each direction to
 * accommodate the `overlap` value set in the config. This calculation allows
 * a region to be considered invalid if there is not enough room to render
 * a caret.
 *
 *               |                                                   |
 *               |<--L-->|------------min-overlap------------|<--R-->|
 *               |                                                   |
 *               |<-left-intersection->|                             |
 *               |                     |                             |
 *               |   __________________|                             |
 *               |  |      target      |                             |
 *               |  |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾                              |
 *               |  |<--------------right-intersection-------------->|
 *               |           ^                                       |
 *               | |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|                            |
 *               | |       content      |                            |
 *               | |____________________|                            |
 *               |                                                   |
 * > Sufficient intersection at the left and right, the top and bottom
 * > regions are considered valid.
 *
 *               |                                                   |
 *               |<--L-->|------------min-overlap------------|<--R-->|
 *               |                                                   |
 *               |<-->|--left-intersection                           |
 *               |    |                                              |
 *  _____________|____|      |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|                  |
 * |      target      |    < |       content      |                  |
 * |‾‾‾‾‾‾‾‾‾‾‾‾‾|‾‾‾‾       |____________________|                  |
 * |             |                                                   |
 * |<------------+----------right-intersection---------------------->|
 *               |                                                   |
 * > Insufficient intersection at the left, the top and bottom regions are
 * > not considered valid. Only the right region is valid.
 *
 */
const hasEnoughSpace = (config: _Config, region, result): _Regions => {
  switch (region) {
    case TOP:
    case BOTTOM:
      return result.contentRect.height >= config.content.height;
    case RIGHT:
    case LEFT:
      return result.contentRect.width >= config.content.width;
    default:
      throw new TypeError();
  }
};

const hasEnoughOverlap = (config, region, result) => {
  return result.overlap >= config.overlap;
};

const isDetatched = (config, region, result) => {
  const {target, offset} = config;
  const {contentRect} = result;
  switch (region) {
    case BOTTOM:
      return target.bottom + offset < contentRect.top;
    case TOP:
      return target.top - offset > contentRect.bottom;
    case RIGHT:
      return target.right + offset < contentRect.left;
    case LEFT:
      return target.left - offset > contentRect.right;
    default:
      throw new TypeError();
  }
};

/**
 * Get the updated left position of the content rect with boundary constraints
 * applied.
 *
 * @param   {Object} config FlowTip layout config object.
 * @param   {string} region A region (`top`, `right`, `bottom`, or `left`).
 * @param   {Object} offsetBounds A final bounds rect for the current region.
 * @param   {Object} rect A content rect object.
 * @returns {number} A new left position for the content rect.
 */
function constrainLeft(
  config: _Config,
  region: Region,
  offsetBounds: Rect,
  rect: Rect,
): number {
  const {constrain, bounds} = config;

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

/**
 * Get the updated top position of the content rect with boundary constraints
 * applied.
 *
 * @param   {Object} config FlowTip layout config object.
 * @param   {string} region A region (`top`, `right`, `bottom`, or `left`).
 * @param   {Object} offsetBounds A final bounds rect for the current region.
 * @param   {Object} rect A content rect object.
 * @returns {number} A new top position for the content rect.
 */
function constrainTop(
  config: _Config,
  region: Region,
  offsetBounds: Rect,
  rect: Rect,
): number {
  const {constrain, bounds} = config;

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

/**
 * Resolve a region when the target rect is positioned outside of the bounds
 * rect.
 *
 * This algorithm checks which triangular segment around the bounds rect is
 * occupied and returned the associated region.
 *
 *           \                   top quadrant                  /
 *             \            returns bottom region            /
 *               \                                         /
 *                 \      top-left    |    top-right     /
 *                   \    upper half  |    upper half  /
 *                     \              |              /
 *                       \            |            /
 *                         \__________|__________/
 *               top-left  | \        |        / | top-right
 *  left       lower half  |   \      |      /   | lower half         right
 *  quadrant               |     \    |    /     |                 quadrant
 *  returns   -------------|------+---+---+------|--------------    returns
 *  right                  |     /    |    \     |                     left
 *  region    bottom-left  |   /      |      \   |  bottom-right     region
 *              upper half | /        |        \ |  upper half
 *                         /‾‾‾‾‾‾‾‾‾‾|‾‾‾‾‾‾‾‾‾‾\
 *                       /            |            \
 *                     /              |              \
 *                   /   bottom-left  |  bottom-right  \
 *                 /      lower half  |  lower half      \
 *               /                                         \
 *             /               bottom quadrant               \
 *           /               returns top region                \
 *
 * > The quadrants are divided at 45 degree angles and extend outward and inward
 * > from each edge.
 *
 * When an edge constraint is disabled, the logic for that quadrant is skipped.
 * The halves of the adjacent quadrants are also skipped.
 *
 * For example, if the bottom constraint is disabled, the bottom halves of the
 * left and right quadrants do not exist. The top halves extend indefinitely
 * downwards so that the top region is never returned when the target rect is
 * not directly below the bounds rect.
 *
 *                       \            |            /
 *                         \__________|__________/
 *               top-left  | \        |        / | top-right
 *  left       lower half  |   \      |      /   | lower half         right
 *  quadrant               |     \    |    /     |                 quadrant
 *  returns   -------------|------+---+---+------|--------------    returns
 *  right                  |                     |                     left
 *  region    bottom-left  |      contrain       |  bottom-right     region
 *              upper half |      disabled       |  upper half
 *                         |‾ ‾ ‾ ‾ ‾ ‾ ‾ ‾ ‾ ‾ ‾|
 *               quadrant  |     handled by      |  quadrant
 *                extents  |   getIdealRegion    |  extends
 *            indefinitely |                     |  indefinitely
 *                         |                     |
 *
 * @param   {Object} config FlowTip layout config object.
 * @returns {string|undefined} A region (`top`, `right`, `bottom`, or `left`).
 */
function getExternalRegion(config: _Config): ?Region {
  const {target, constrain, bounds, edgeOffset, disabled} = config;

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
 * Get the updated left position of the content rect with boundary constraints
 * applied.
 *
 * @param   {Object} config FlowTip layout config object.
 * @param   {string} region A region (`top`, `right`, `bottom`, or `left`).
 * @param   {Object} rect A content rect object.
 * @returns {Object} A repositioned content rect.
 */
function constrainRect(
  config: _Config,
  region: Region,
  rect: Rect,
  offsetBounds,
): Rect {
  const left = constrainLeft(config, region, offsetBounds, rect);
  const top = constrainTop(config, region, offsetBounds, rect);

  return new Rect(left, top, rect.width, rect.height);
}

/**
 * Get the distance between the target rect and the content rect along the
 * normal of the region.
 *
 * If the content rect intersects the target rect, the returned value is
 * negative.
 *
 * @param   {Object} config FlowTip layout config object.
 * @param   {string} region A region (`top`, `right`, `bottom`, or `left`).
 * @param   {Object} rect A content rect object.
 * @returns {number} Distance between target and content.
 */
function getOffset(config: _Config, region: Region, rect: Rect): number {
  const {target} = config;

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

/**
 * Get the center position of the liner overlap range between the content rect
 * and the target rect. This value is calculated to use as a style input when
 * rendering an indicator.
 *
 * The value returned is relative to the top or left edge of the content rect.
 * This is for convenience since an indicator will most likely be rendered as
 * a child of the content element.
 *
 *
 *     |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|
 *     |            content             |
 *     |________________________________|
 *     |                  |      V      |
 *     |<--overlap-center-+----->|      |
 *                        |<-----+----->|-overlap
 *                        |______|______|____
 *                        |      target      |
 *                         ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
 * > The overlap center is relative to the left (or top) edge of the content
 * > rect.
 *
 *     |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|
 *     |         content         |
 *     |_________________________|
 *     |                         |   V
 *     |<--overlap-center--------+-->|
 *                               |<--+-->|-overlap
 *                                       |__________________
 *                                       |      target      |
 *                                        ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
 * > If there is no geometric overlap between the content rect and the target
 * > rect, the overlap center will be longer then the content rect edge or
 * > will be negative.
 *

 * @param   {string} region A region (`top`, `right`, `bottom`, or `left`).
 * @param   {Object} rect A content rect object.
 * @param   {Object} intersect The intersection rect of the target and content.
 * @returns {number} Distance to overlap center.
 */
function getCenter(region: Region, rect: Rect, intersect: Rect): number {
  if (region === TOP || region === BOTTOM) {
    return intersect.left + intersect.width / 2 - rect.left;
  }

  // Region is left or right;
  return intersect.top + intersect.height / 2 - rect.top;
}

const allRegions = {top: true, right: true, bottom: true, left: true};
const noRegions = {top: false, right: false, bottom: false, left: false};

function normalizeAlign(align: ?Align): number {
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

function defaults(config: Config): _Config {
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
    bounds: Rect.from(bounds),
    target: Rect.from(target),
    content,
    disabled: {...noRegions, ...disabled},
    constrain: {...allRegions, ...constrain},
  };
}

/**
 * Calculate a FlowTip layout result.
 *
 * @param   {Object} config FlowTip layout config object.
 * @param   {Object} config.target A rect representing the target element.
 * @param   {Object} config.content A rect representing the content element.
 * @param   {string} [config.region] The default region
 *                                   (`top`, `right`, `bottom`, or `left`).
 * @param   {string} config.disabled Disabled regions
 *                                   (`{top, right, bottom, left}`).
 * @param   {string} config.constrain Constrained regions
 *                                    (`{top, right, bottom, left}`).
 * @param   {number} [config.offset=0] Target-content offset.
 * @param   {number} [config.overlap=0] Min target-content liner overlap.
 * @param   {number} [config.align=0.5] Target-content align factor.
 * @returns {Object} FlowTip layout result object.
 */
function flowtip(config: Config): Result {
  const finalConfig = defaults(config);

  invariant(
    typeof config.target.left === 'number',
    'target.left must be number',
  );
  invariant(typeof config.target.top === 'number', 'target.top must be number');
  invariant(
    typeof config.bounds.left === 'number',
    'bounds.left must be number',
  );
  invariant(typeof config.bounds.top === 'number', 'bounds.top must be number');

  const regionList = [LEFT, RIGHT, TOP, BOTTOM];
  const phases = [
    {key: 'contentAvailabilityRect', value: getContentAvailabilityRect},
    {key: 'tailAvailabilityRect', value: getTailAvailabilityRect},
    {key: 'contentRect', value: getContentRect},
    {key: 'overlapRect', value: getOverlapRect},
    {key: 'overlap', value: getOverlap},
    {key: 'hasEnoughSpace', value: hasEnoughSpace},
    {key: 'hasEnoughOverlap', value: hasEnoughOverlap},
    {key: 'isDetatched', value: isDetatched},
  ];

  const regions = {};
  regionList.forEach((region) => {
    const result = {};
    phases.forEach((phase) => {
      result[phase.key] = phase.value(finalConfig, region, result);
    });
    regions[region] = result;
  });

  const region =
    regionList.find((name) => {
      return regions[name].hasEnoughSpace && regions[name].hasEnoughOverlap;
    }) || 'left';

  const tempRect = getRect(finalConfig, region);

  const rect = constrainRect(
    finalConfig,
    region,
    tempRect,
    regions[region].contentRect,
  );

  const intersect = Rect.intersect(finalConfig.target, rect);

  const offset = getOffset(finalConfig, region, rect);

  const overlap = regions[region].overlap;

  const overlapCenter = getCenter(region, rect, intersect);
  return {
    regions,
    bounds: finalConfig.bounds,
    target: finalConfig.target,
    region,
    rect,
    offset,
    overlap,
    overlapCenter,
  };
}

export default flowtip;
