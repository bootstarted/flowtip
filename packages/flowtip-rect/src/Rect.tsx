export interface RectShape {
  top: number;
  left: number;
  width: number;
  height: number;
}

class Rect implements DOMRectReadOnly, RectShape {
  public static zero: Rect = new Rect(0, 0, 0, 0);

  /**
   * Convert a rect shaped object to a Rect instance. This is useful for
   * converting native ClientRect/DOMRect instances to standard objects with
   * enumerable keys.
   *
   * @param   {Object} rect A rect-like object.
   * @returns {Object} A Rect instance.
   */
  public static fromRect(rect: RectShape): Rect {
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
   * @param   {Object} a An object implementing RectShape.
   * @param   {Object} b An object implementing RectShape.
   * @returns {Object} A Rect instance.
   */
  public static intersect(a: RectShape, b: RectShape): Rect {
    const rectA = Rect.fromRect(a);
    const rectB = Rect.fromRect(b);

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
   * @param   {Object} rect An object implementing RectShape.
   * @param   {number} amount Offset to apply to each boundary edge.
   * @returns {Object} A Rect instance.
   */
  public static grow(rect: RectShape, amount: number): Rect {
    return new Rect(
      rect.left - amount,
      rect.top - amount,
      rect.width + amount * 2,
      rect.height + amount * 2,
    );
  }

  /**
   * Determine if two objects implementing RectShape are equal.
   *
   * @param   {Object} [a] An object implementing RectShape.
   * @param   {Object} [b] An object implementing RectShape.
   * @returns {boolean} True if rects are equal.
   */
  public static areEqual(a?: RectShape, b?: RectShape): boolean {
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
   * @param   {Object} [rect] An object implementing RectShape.
   * @returns {boolean} True if the rect has a positive area.
   */
  public static isValid(rect: RectShape): boolean {
    return rect.width >= 0 && rect.height >= 0;
  }

  public static abs(rect: RectShape): Rect {
    if (rect instanceof Rect && Rect.isValid(rect)) {
      return rect;
    }

    return new Rect(
      Math.min(rect.left, rect.left + rect.width),
      Math.min(rect.top, rect.top + rect.height),
      Math.abs(rect.width),
      Math.abs(rect.height),
    );
  }

  public readonly top: number;
  public readonly left: number;
  public readonly height: number;
  public readonly width: number;

  public toJSON(): Record<
    'bottom' | 'height' | 'left' | 'right' | 'top' | 'width' | 'x' | 'y',
    number
  > {
    return {
      bottom: this.bottom,
      height: this.height,
      left: this.left,
      right: this.right,
      top: this.top,
      width: this.width,
      x: this.x,
      y: this.y,
    };
  }

  public get x(): number {
    return this.left;
  }

  public get y(): number {
    return this.top;
  }

  public get right(): number {
    return this.left + this.width;
  }

  public get bottom(): number {
    return this.top + this.height;
  }

  public constructor(x: number, y: number, width: number, height: number) {
    this.left = x;
    this.top = y;
    this.width = width;
    this.height = height;

    Object.freeze(this);
  }
}

export default Rect;
