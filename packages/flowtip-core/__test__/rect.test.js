import Rect from '../src/Rect';

describe('Rect', () => {
  describe('grow', () => {
    it('should increase the boundaries of a react equally on all sides', () => {
      const initial = new Rect(10, 10, 20, 20);
      const final = new Rect(0, 0, 40, 40);
      expect(Rect.grow(initial, 10)).toEqual(final);
    });
  });

  describe('areEqual', () => {
    it('should return true with both undefined or null arguments', () => {
      expect(Rect.areEqual(null, null)).toBe(true);
      expect(Rect.areEqual(undefined, undefined)).toBe(true);
      expect(Rect.areEqual(null, undefined)).toBe(true);
      expect(Rect.areEqual(undefined, null)).toBe(true);
    });

    it('should return false with a single null or undefined argument', () => {
      expect(Rect.areEqual(null, new Rect(0, 0, 0, 0))).toBe(false);
      expect(Rect.areEqual(undefined, new Rect(0, 0, 0, 0))).toBe(false);
      expect(Rect.areEqual(new Rect(0, 0, 0, 0), undefined)).toBe(false);
      expect(Rect.areEqual(new Rect(0, 0, 0, 0), null)).toBe(false);
    });

    it('should true with two equivalent rects', () => {
      expect(Rect.areEqual(new Rect(1, 2, 3, 4), new Rect(1, 2, 3, 4))).toBe(
        true,
      );
    });

    it('should true with two different rects', () => {
      expect(Rect.areEqual(new Rect(1, 2, 3, 4), new Rect(4, 3, 2, 1))).toBe(
        false,
      );
    });
  });
});
