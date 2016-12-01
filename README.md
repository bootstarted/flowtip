# FlowTip

*A flexible, adaptable and easy to use tooltip component for React.js*

![build status](http://img.shields.io/travis/metalabdesign/flowtip/master.svg?style=flat)
![coverage](http://img.shields.io/coveralls/metalabdesign/flowtip/master.svg?style=flat)
![license](http://img.shields.io/npm/l/flowtip.svg?style=flat)
![version](http://img.shields.io/npm/v/flowtip.svg?style=flat)
![downloads](http://img.shields.io/npm/dm/flowtip.svg?style=flat)

Looking for the non-React.js version? It's in the [legacy](https://github.com/qiushihe/flowtip/tree/legacy) branch.

At its core, `FlowTip` is a set of calculations that ensure.

## Demo

See the [demo from the legacy branch](http://qiushihe.github.io/flowtip/demo.html). The code sample on the side doesn't apply to the current React version but the behaviour is basically the same.

## Peer Dependencies

* `react >= 0.14`
* `react-dom >= 0.14`

## Glossaries

The documentation and source of this library refers to several terms that may require
clarification:

**Parent**: The element bounding the tooltip.

**Content**: The container element for the tooltip's content.

**Tail**: The tail of the tooltip. It's usually visualized as a pointy "nub" of sort.

**Target**: The target is the thing the tooltip points to.

**Region**: There are four different regions a tooltip could be in at any given time. The four regions are "top", "bottom", "left" and "right". Region is described relative to the target of the tooltip. For example, region "top" means the tooltip would appear above the target, and region "right" means the tooltip would appear to the right side of the target.

**Pivot**: The pivot is a imaginary line that is aligned to the target and the tooltip's root is then in term aligned to the pivot.

**Anchor**: The element from which the tooltips position is referenced.

## Basic Usage

To include an instance of FlowTip in your component:

```javascript
import flowtip from 'flowtip/lib/dom';

// Define the FlowTip content component
const ContentComponent = ({style, region, children}) => (
  <div className={`flowtip-root flowtip-root-${region}`} style={style}>
    {children}
  </div>
);

// Define the FlowTip tail component
const TailComponent = ({style, region}) => (
  <div className={`flowtip-tail flowtip-tail-${region}`} style={style} />
);

// Generate a FlowTip™ component with the content and tail components.
const MyFlowTip = flowtip(ContentComponent, TailComponent);

// Render the FlowTip™ component.
const target = {
  top: 5,
  left: 5,
  width: 100,
  height: 100,
};

<MyFlowTip target={target}>
  <b>Holy Shit!</b>
  <br />
  FlowTip as React Component
</FlowTip>
```

The `target` property specifies the position and dimension of the tooltip's target as calculated by `getBoundingClientRect()`.


## Advanced Usage

The primary FlowTip component is essentially a stateless function that computes where the tooltip _should be_ displayed (based on the bounding boxes you pass to it) and then passes that information down to its children. It's quite possible to build tooltips for platforms other than just the browser.

The DOM implementation takes care of computing all the values except `target` for you.

```javascript
import FlowTip from 'flowtip';

<FlowTip
  tail={...}
  content={...}
  target={...}
  parent={...}
  anchor={...}
  children={({content, tail}) => (
    <div style={{
      position: "absolute",
      left: content.left,
      top: content.top,
    }}>
      Hello.
      <div style={{
        position: "absolute",
        left: tail.left,
        top: tail.top,
      }}/>
    </div>
  )}
/>
```

## FlowTip Properties

### `region`: **String**

_Default value: top_

The preferred region in which the tooltip will appear at first relative to its target. Possibly values are: `top`, `bottom`, `left` and `right`.

### `topDisabled`, `bottomDisabled`, `leftDisabled` and `rightDisabled`: **Boolean**

_Default value: false_

When set to `true`, the specified region will become unavailable for the various edge detection algorithms.

### `hideInDisabledRegions`: **Boolean**

_Default value: false_

When set to `true`, and when the only suitable regions for the tooltip are disabled, the tooltip will be hidden. When set to `false`, and when the only suitable regions for the tooltip are disabled, the tooltip will be placed in its original region.

### `targetOffset`: **Integer**

_Default value: 10_

The distance between the tooltip's root (or tip of the tail, see `targetOffsetFrom` below) and the target's edge.

### `targetOffsetFrom`: **String**

_Default value: root_

Possible values are `root` and `tail`. When set to `root`, `targetOffset` will be calculated against the edge of the tooltip's root; When set to `tail`, `targetOffset` will be calculated against the tip of the tail.

### `edgeOffset`: **Integer**

_Default value: 30_

The distance between the tooltip's root's edge and the edge of the boundary representative the tooltip's `appendTo` element. When this distance is smaller than `edgeOffset`, edge detection will place the tooltip in an opposite region (i.e. flipping the tooltip).

### `rotationOffset`: **Integer**

_Default value: 30_

The distance between the target's edge and the edge of the boundary representative the tooltip's `appendTo` element. When this distance is smaller than `rotationOffset`, edge detection will place the tooltip in an adjacent region (i.e. rotating the tooltip).

### `targetAlign`: **String**

_Default value: center_

Possible values are `center` and `edge`. When set to `center`, the pivot will be center aligned against the target. When set to `edge`, one of the pivot's edge will be aligned against the pivot. See `targetAlignOffset` for the exact mechanics of the two values. This value can also be specified on a per-region basis via `[top|bottom|left|right]TargetAlign`, and if a region's specific value is absence, the value from `targetAlign` will be used.

### `targetAlignOffset`: **Integer**

_Default value: 0_

If `targetAlign` is set to `center`, this value controls the clockwise distance from the center of the target the pivot will shift. When this value is positive, the pivot will shift clockwise, and counter-clockwise when this value is negative.

If `targetAlign` is set to `edge`, the pivot will shift away from one of the target's edges. When this value is positive, the clockwise edge will be used, and the counter-clockwise edge will be used when this value is negative. The absolute value of this value controls the amount of shifting.

### `rootAlign`: **String**

_Default value: center_

Possible values are `center` and `edge`. When set to `center`, the tooltip's root will be center aligned against the pivot. When set to `edge`, one of the tooltip's root's edge will be aligned against the pivot. See `rootAlignOffset` for the exact mechanics of the two values. This value can also be specified on a per-region basis via `[top|bottom|left|right]RootAlign`, and if a region's specific value is absence, the value from `rootAlign` will be used.

### `rootAlignOffset`: **Integer**

_Default value: 0_

If `rootAlign` is set to `center`, this value controls the clockwise distance from the pivot the tooltip's root will shift. When this value is positive, the root will shift clockwise, and counter-clockwise when this value is negative.

If `rootAlign` is set to `edge`, one of the tooltip's root's edge will be aligned against the pivot. When this value is positive, the clockwise edge will be used, and the counter-clockwise edge will be used when this value is negative. The absolute value of this value controls the amount of shifting.

## Edge Detection

There are three strategies for detection: **flip**, **rotate** and **squeeze**.

### Flip

The tooltip will be flipped when the root of the tooltip gets too close to the edge of the boundary. Adjust `edgeOffset` to control the amount of space allowed. The tooltip will be flipped horizontally when in the left and right regions, and vertically when in the top and bottom regions.

### Rotate

The tooltip will be rotated to an adjacent region if the target gets too close to the edge of the boundary. Adjust `rotationOffset` to control the amount of space allowed. For example, the tooltip will be rotated to the top region if the tooltip is currently in the left or right region, and the target gets too close to the bottom edge of the boundary.

### Squeeze

The tooltip will be squeezed to an adjacent region if the root of the tooltip gets too close to the edge of the boundary on both sides. For example, if the tooltip is in left or right region, and neither region has enough space, the tooltip will be squeezed to the top region.

## Alignments

Tooltip's alignments are divided into **root alignment** and **target alignment**, each with a corresponding **offset** attribute that controls the direction of the alignment and offset amount.

### Target Alignment

Target alignment refers to the alignment of the pivot relative to the target of the tooltip. See `targetAlign` and `targetAlignOffset`.

### Root Alignment

Root alignment refers to the alignment of the tooltip's root relative to the pivot. See `rootAlign` and `rootAlignOffset`.

## Clamping

By default the tooltip is "clamped" to its parent. Meaning even if the target leaves the viewport, the tooltip would never leave the viewport. The clamping behaviour can be controlled via the `clamp` property.

When `clamp` is `true`, the flyout will always remains in the parent even if the target is out of the parent.

When `clamp` is `false`, the flyout will always attatch itself to the target, even if it’s outside the parent, but it will make a best effort to be in the parent.
