# flowtip-core

FlowTip layout resolver algorithm.

## Usage

FlowTip has 3 required config values (`target`, `content`, and `bounds` as [DOMRect-shaped] objects) as input in addition to a number of optional config values. The returned result is a resolved region (`top`, `right`, `bottom`, or `left`) and a [DOMRect-shaped] object of the resolved position of the content.

```js
const config = {
  rect: {top: 10, left: 100, width: 100, height: 20},
  content: {width: 250, height: 200},
  bounds: {top: 0, left: 0, width: 1200, height: 800},
  // Optional config values.
};

const {region, rect} = flowtip(config);
```

## Config

### `target`: object 
*required*

The measured position of the target element as a [DOMRect-shaped] object.

### `content`: object 
*required*

The measured width and height of the tooltip content. as a [dimensions] object.

### `bounds`: object 
*required*

The measured position of the available layout area for the tooltip content as a [DOMRect-shaped] object. This defines the outer collision boundaries referenced by the `constrain` option.

> This should be the browser viewport rect in most instances.

### `region`: string

*optional*

The preferred region in which the tooltip will appear at first relative to its target. Possibly values are: `top`, `bottom`, `left`, and `right`.

> If `region` is omitted, the algorithm will pick default to the region with the most available space. (handled by the `getIdealRegion` function)

### `offset`: number

*optional*, *default: `0`*

The desired distance between the positioned content and the target.

Since the layout algorithm does not factor the size of an indicator triangle element into the calculation, this value should be supplied as the combined length of the indicator plus the desired margin.

### `overlap`: number

*optional*, *default: `0`*

The minimum overlap along an edge for each region to be considered valid.

If you are rendering an indicator triangle, this should be the minimum linear overlap necessary to fit the indicator triangle along the adjacent edge.

> Providing a negative number is a valid option, this would be useful for rendering a "noodle" connection where direct linear overlap is not required.

### `align`: string | number

*optional*, *default: `center`*

Linear alignment between the positioned content and the target. Possible values are a number in the range of `0` to `1`, or one of `start`, `center`, and `end` (aliases for `0`, `0.5`, and `1` respectively).

### `disabled`: object

*optional*, *default: `{top: false, left: false, bottom: false, right: false}`*

Map of boolean values denoting particular regions as disabled.

Use this option to restrict the tooltip to the regions above and below the content:

```js
flowtip({
  disabled: {
    left: true,
    right: true,
  },
  ...
});
```

### `constrain`: object

*optional*, *default: `{top: true, left: true, bottom: true, right: true}`*

Map of boolean values denoting particular boundary edges should constrain the positioned tooltip.

The tooltip is allowed to occpuy a region beyond the boundary if a particular edge is disabled. This is used to disable the "sticky" behavior of a positioned tooltip when the viewport scrolls beyond the target element.

## Rect Interface

While `flowtip-core` has no dependency on the DOM, it is designed to be directly compatible with DOMRect instances returned from `getClientBoundingRect()` calls. Any object that satisfies the DOMRect object interface `top: number, left: number, bottom: number, right: number, width?: number, height:? number` can be used.

The absolute reference frame of the measurements does not have an impact on the calculation - as long as all measurements are relative to the same frame everything will work out.

[DOMRect-shaped]: #rect-interface
[dimensions]: #rect-interface
