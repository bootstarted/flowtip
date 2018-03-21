// @flow

export type RectLike =
  // eslint-disable-next-line no-use-before-define
  | Rect
  | ClientRect
  | {
      top: number,
      left: number,
      width: number,
      height: number,
      bottom?: number,
      right?: number,
    };

class Rect {
  top: number;
  left: number;
  height: number;
  width: number;
  right: number;
  bottom: number;

  static zero: Rect = new Rect(0, 0, 0, 0);

  /**
   * Convert a rect-like object to a Rect instance. This is useful for
   * converting non-serializable ClientRect instances to more standard objects.
   *
   * @param   {Object} rect A rect-like object.
   * @returns {Object} A Rect instance.
   */
  static from(rect: RectLike): Rect {
    if (rect instanceof Rect) return rect;
    return new Rect(rect.left, rect.top, rect.width, rect.height);
  }

  /**
   * Calculate the intersection of two rects.
   *
   * If there is a true geometric intersection, the returned rect will have a
   * positive width and height.
   *
   * If the rects do not intersect in either axis, the returned dimension for
   * that axis is negative and represents the distance between the rects.
   *
   * @param   {Object} a A rect-like object.
   * @param   {Object} b A rect-like object.
   * @returns {Object} A Rect instance.
   */
  static intersect(a: RectLike, b: RectLike): Rect {
    const rectA = Rect.from(a);
    const rectB = Rect.from(b);

    const left = Math.max(rectA.left, rectB.left);
    const right = Math.min(rectA.right, rectB.right);
    const top = Math.max(rectA.top, rectB.top);
    const bottom = Math.min(rectA.bottom, rectB.bottom);
    const width = right - left;
    const height = bottom - top;

    return new Rect(left, top, width, height);
  }

  /**
   * Expand (or shrink) the boundaries of a rect.
   *
   * @param   {Object} rect A rect-like object.
   * @param   {number} amount Offset to apply to each boundary edge.
   * @returns {Object} A Rect instance.
   */
  static grow(rect: RectLike, amount: number): Rect {
    return new Rect(
      rect.left - amount,
      rect.top - amount,
      rect.width + amount * 2,
      rect.height + amount * 2,
    );
  }

  /**
   * Determine if two rect-like objects are equal.
   *
   * @param   {Object} [a] A rect-like object.
   * @param   {Object} [b] A rect-like object.
   * @returns {boolean} True if rects are equal.
   */
  static areEqual(a: ?RectLike, b: ?RectLike): boolean {
    if (a === b) return true;

    if ((a === null || a === undefined) && (b === null || b === undefined)) {
      return true;
    }

    if (a === null || a === undefined || b === null || b === undefined) {
      return false;
    }

    return (
      a.left === b.left &&
      a.top === b.top &&
      a.width === b.width &&
      a.height === b.height
    );
  }

  /**
   * Determine if a rect-like object has valid positive area.
   *
   * @param   {Object} [rect] A rect-like object.
   * @returns {boolean} True if the rect has a positive area.
   */
  static isValid(rect: RectLike): boolean {
    return rect.width >= 0 && rect.height >= 0;
  }

  constructor(left: number, top: number, width: number, height: number): void {
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
    this.right = this.left + this.width;
    this.bottom = this.top + this.height;

    Object.freeze(this);
  }
}

export default Rect;
