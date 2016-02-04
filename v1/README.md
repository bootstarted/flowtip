# FlowTip

*A flexible, adaptable and easy to use tooltip positioning library.*

* [Website](http://qiushihe.github.io/flowtip)
* [Interactive Demo](http://qiushihe.github.io/flowtip/demo.html)
* [Github Repo](https://github.com/qiushihe/flowtip)

## Dependencies

* [jQuery](http://jquery.com)
* [Unerscore.js](http://underscorejs.org)
* [CoffeeScript](http://coffeescript.org) (development only)

## Glossaries

The documentation and source of this library refers to several terms that may require
clarification:

**Tooltip**: An instance of **FlowTip** object.

**Root**: The **root** of a tooltip refers to the element that contains both the tooltip's
"content" element, and "tail" element.

**Content (element)**: The container element for the tooltip's content.

**Tail**: The tail of the tooltip. It's usually visualized as a pointy "nub" of sort.

**Target**: The target is the thing the tooltip points to.

**Region**: There are four different regions a tooltip could be in at any given time. The four
regions are "top", "bottom", "left" and "right". Region is described relative to the target of
the tooltip. For example, region "top" means the tooltip would appear above the target, and
region "right" means the tooltip would appear to the right side of the target.

**Pivot**: The pivot is a imaginary line that is aligned to the target and the tooltip's root is
then in term aligned to the pivot.

## Basic Usage

Creates an instance of the **FlowTip** object:

    var tooltip = new FlowTip();

An instance of the **FlowTip** can be created with options (see **Attributes** section below):

    var myFlowTip = new FlowTip({
        region: "bottom"
        className: "my-tip"
        hasTail: false
    })

At this point, the tooltip is not yet "attached" to a target. The tooltip's target can be set by
calling `setTarget`:

    tooltip.setTarget(tooltipTarget);

... where `tooltipTarget` may be a DOM object or a jQuery selection.

To make the tooltip visible, call `show`:

    tooltip.show();

This will render the tooltip is it's not already rendered, and position the tooltip in the
appropriate region (see `region` in **Attributes** section below) with proper alignments
(see **Alignments** section below).

It's important to note that instances of **FlowTip** does **not** automatically re-position
themselves when their targets move. The responsibility of detecting target movement lies outside
the scope of this library. To update the tooltip's position against its target:

    tooltip.reposition();

## Attributes

### `className`: **String**

_Default value: ""_

Additional class name(s) for the container of the tooltip.

### `contentClassName`: **String**

_Default value: ""_

Additional class name(s) for the tooltip's content.

### `tailClassName`: **String**

_Default value: ""_

Additional class name(s) for the tooltip's tail.

### `appendTo`: **Element**

_Default value: null_

The element within which the tooltip will be inserted into. Can be set or updated by calling
`setAppendTo`. Default value is the document's `body` and the tooltip would thus be free to appear
and move anywhere on the page and edge detection will only be performed on the edge of the page.

If `appendTo` is set to an element then edge detection will be performed on the edge of
the element instead.

### `tooltipContent`: **String** or **Element**

_Default value: null_

The content of the tooltip. May be specified as (HTML) string or DOM element. Can be set original
updated by calling `setTooltipContent`.

### `region`: **String**

_Default value: top_

The preferred region in which the tooltip will appear at first relative to its target. Possibly
values are: `top`, `bottom`, `left` and `right`.

### `topDisabled`, `bottomDisabled`, `leftDisabled` and `rightDisabled`: **Boolean**

_Default value: false_

When set to `true`, the specified region will become unavailable for the various edge detection
algorithms.

### `hideInDisabledRegions`: **Boolean**

_Default value: false_

When set to `true`, and when the only suitable regions for the tooltip are disabled, the tooltip
will be hidden. When set to `false`, and when the only suitable regions for the tooltip are
disabled, the tooltip will be placed in its original region.

### `persevere`: **Boolean**

_Default value: false_

If set to `true`, the tooltip will revert back to its preferred region whenever there is enough
space in that region. If set to `false`, the tooltip will remain in the region edge detection
puts it in, until edge detection changes it again.

### `hasTail`: **Boolean**

_Default value: true_

Controls if the tooltip's tail's visibility. When set to `false` the tooltip's tail will be hidden
and ignored for all positioning calculations.

### `width`: **Integer**

_Default value: null_

Width of the tooltip's root. If set to `null`, the tooltip will expand to fit its content's width.

### `height`: **Integer** or the string "auto"

_Default value: auto_

Height of the tooltip's root. If set to `null`, the tooltip will expand to fit its content's
height. If set to `"auto"`, the tooltip's content will be relatively positioned to allow possible
scrolling.

### `minWidth`: **String**

_Default value: null_

In the form of `42px`, or other forms accepted by CSS min-width.

### `minHeight`: **String**

_Default value: null_

In the form of `42px`, or other forms accepted by CSS max-width.

### `maxWidth`: **String**

_Default value: null_

In the form of `42px`, or other forms accepted by CSS min-height.

### `maxHeight`:**String**

_Default value: null_

In the form of `42px`, or other forms accepted by CSS max-height.

### `tailWidth`: **Integer**

_Default value: 20_

Width of the tail element.

### `tailHeight`: **Integer**

_Default value: 10_

Height of the tail element.

### `targetOffset`: **Integer**

_Default value: 10_

The distance between the tooltip's root (or tip of the tail, see `targetOffsetFrom` below) and
the target's edge.

### `targetOffsetFrom`: **String**

_Default value: root_

Possible values are `root` and `tail`. When set to `root`, `targetOffset` will be calculated
against the edge of the tooltip's root; When set to `tail`, `targetOffset` will be calculated
against the tip of the tail.

### `edgeOffset`: **Integer**

_Default value: 30_

The distance between the tooltip's root's edge and the edge of the boundary representative the
tooltip's `appendTo` element. When this distance is smaller than `edgeOffset`, edge detection
will place the tooltip in an opposite region (i.e. flipping the tooltip).

### `rotationOffset`: **Integer**

_Default value: 30_

The distance between the target's edge and the edge of the boundary representative the tooltip's
`appendTo` element. When this distance is smaller than `rotationOffset`, edge detection will
place the tooltip in an adjacent region (i.e. rotating the tooltip).

### `targetAlign`: **String**

_Default value: center_

Possible values are `center` and `edge`. When set to `center`, the pivot will be center aligned
against the target. When set to `edge`, one of the pivot's edge will be aligned against the pivot.
See `targetAlignOffset` for the exact mechanics of the two values. This value can also be
specified on a per-region basis via `[top|bottom|left|right]TargetAlign`, and if a region's
specific value is absence, the value from `targetAlign` will be used.

### `targetAlignOffset`: **Integer**

_Default value: 0_

If `targetAlign` is set to `center`, this value controls the clockwise distance from the center
of the target the pivot will shift. When this value is positive, the pivot will shift clockwise,
and counter-clockwise when this value is negative.

If `targetAlign` is set to `edge`, the pivot will shift away from one of the target's edges.
When this value is positive, the clockwise edge will be used, and the counter-clockwise edge
will be used when this value is negative. The absolute value of this value controls the amount
of shifting.

### `rootAlign`: **String**

_Default value: center_

Possible values are `center` and `edge`. When set to `center`, the tooltip's root will be center
aligned against the pivot. When set to `edge`, one of the tooltip's root's edge will be aligned
against the pivot. See `rootAlignOffset` for the exact mechanics of the two values. This value
can also be specified on a per-region basis via `[top|bottom|left|right]RootAlign`, and if a
region's specific value is absence, the value from `rootAlign` will be used.

### `rootAlignOffset`: **Integer**

_Default value: 0_

If `rootAlign` is set to `center`, this value controls the clockwise distance from the pivot the
tooltip's root will shift. When this value is positive, the root will shift clockwise, and
counter-clockwise when this value is negative.

If `rootAlign` is set to `edge`, one of the tooltip's root's edge will be aligned against the
pivot. When this value is positive, the clockwise edge will be used, and the counter-clockwise
edge will be used when this value is negative. The absolute value of this value controls the
amount of shifting.

## Public Methods

### `constructor`

Accepts a hash of options. See **Attributes**.

### `render`

Render the tooltip's root (if not already rendered), content and insert the tooltip into the DOM.
If called repeatedly, only re-render the tooltip's content.

### `setAppendTo`

Set the tooltip's containing element. If the tooltip has already been rendered, the tooltip will
be moved/inserted into the new containing element.

### `setTarget`

Set the tooltip's target. The target is the element to which the tooltip will be pointing at.

### `setClientRectTarget`

Set the tooltip's target to be a ClientRect instead of a html element. The target is the
ClientRect to which the tooltip will be pointing at.

### `setTooltipContent`

Set the tooltip's content. If `render` is set to `true` for `options`, the `render()` method will
be called to re-render the content.

### `reposition`

Perform edge detection and position calculations to update the tooltip's position.

### `show`

Show the tooltip. Also update the tooltip's `visible` attribute.

### `hide`

Hide the tooltip. Also update the tooltip's `visible` attribute.

### `trigger`

Trigger an event from the root of the tooltip.

### `destroy`

Remove the tooltip's root from DOM.

## Edge Detection

There are three strategies for detection: **flip**, **rotate** and **squeeze**.

### Flip

The tooltip will be flipped when the root of the tooltip gets too close to the edge of the
boundary. Adjust `edgeOffset` to control the amount of space allowed. The tooltip will be
flipped horizontally when in the left and right regions, and vertically when in the top and
bottom regions.

### Rotate

The tooltip will be rotated to an adjacent region if the target gets too close to the edge of
the boundary. Adjust `rotationOffset` to control the amount of space allowed. For example, the
tooltip will be rotated to the top region if the tooltip is currently in the left or right
region, and the target gets too close to the bottom edge of the boundary.

### Squeeze

The tooltip will be squeezed to an adjacent region if the root of the tooltip gets too close to
the edge of the boundary on both sides. For example, if the tooltip is in left or right region,
and neither region has enough space, the tooltip will be squeezed to the top region.

## Alignments

Tool tip's alignments are divided into **root alignment** and **target alignment**, each with
a corresponding **offset** attribute that controls the direction of the alignment and offset
amount.

### Target Alignment

Target alignment refers to the alignment of the pivot relative to the target of the tooltip. See
`targetAlign` and `targetAlignOffset`.

### Root Alignment

Root alignment refers to the alignment of the tooltip's root relative to the pivot. See
`rootAlign` and `rootAlignOffset`.

## Coordinator

_TODO: Add documentation for `FlowTip.Coordinator`_

