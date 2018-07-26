# flowtip-react-dom

A FlowTip Component for [React DOM]

## Usage

The `FlowTip` component works by wrapping some content and positioning it relative to a measured target.

The basic required props are `target` and `Content`, with additional optional props providing enhanced behavior.

Any added props that are not used by the `FlowTip` component are passed down to the `Content` component when it is rendered. This allows `FlowTip` to behave as a component "decorator" which enhances the underlying component interface.

### Basic Example

This is a minimal example that illustrates using `flowtip-react-dom` to render a custom tooltip design.`

```jsx
import React from 'react';
import FlowTip from 'flowtip-react-dom';
import ResizeObserver from 'react-resize-observer';

const Content = ({children, style}) => (
  <div className="flowtip-content" style={style}>
    {children}
  </div>
);

const Tail = ({region, children, style}) => (
  <div className={`flowtip-tail-${result.region}`} style={style}>
    {children}
  </div>
);

class ExampleTip extends React.Component {
  render() {
    return (
      <FlowTip target={this.props.target}>
        ({contentStyle, tailStyle, updateContentRect, updateTailRect, region}) => {
          return (
            <Content style={contentStyle}>
              <ResizeObserver onReflow={updateContentRect} />
              <Tail region={region} style={tailStyle}>
                <ResizeObserver onReflow={updateTailRect} />
              </Tail>
            </Content>
          )
        }
        FlowTip Content
      </FlowTip>
    );
  }
}

class FlowTipExample extends React.Component {
  state = {flowTipOpen: false, target: null};

  _toggleFlowTip = () => this.setState({flowTipOpen: !this.state.flowTipOpen});

  _handleTargetReflow = (target) => this.setState({target});

  render() {
    return (
      <div>
        <button onClick={this._toggleFlowTip}>
          <ResizeObserver onReflow={this._handleTargetReflow} />
          Activate FlowTip
        </button>
        {!!this.state.flowTipOpen && (
          <ExampleTip target={this.state.target} />
        )}
      </div>
    );
  }
}
```

<details>
<summary>Example CSS</summary>

```css
.flowtip-content {
  padding: 10px;
  background: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
}

.flowtip-tail-top,
.flowtip-tail-bottom {
  width: 20px;
  height: 10px;
}

.flowtip-tail-right,
.flowtip-tail-left {
  width: 10px;
  height: 20px;
}

.flowtip-tail-top::before,
.flowtip-tail-right::before,
.flowtip-tail-bottom::before,
.flowtip-tail-left::before {
  content: '';
  display: block;
}

.flowtip-tail-top::before {
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid white;
}

.flowtip-tail-right::before {
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-right: 10px solid white;
}

.flowtip-tail-bottom::before {
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid white;
}

.flowtip-tail-left::before {
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-left: 10px solid white;
}
```

See [Styling FlowTip](#styling-flowtip) for more details.

</details>

---

Note that the `FlowTip` component defers all possible state to the parent component.

It does not track the target element position itself and must be provided with an updated `target` prop any time the target size or position in the viewport changes ([`react-resize-observer`] is an excellent tool for this task).

It also does not have any concept of an active or deactivated state, conditionally rendering the entire component is the way to show and hide it.

### Styling FlowTip

The `FlowTip` component renders nothing by itself - deferring all responsibility to the components provided through the `tail` and `content` props. This keeps the library as non-opinionated as possible but means that any CSS styles must be manually provided. The only expectation is that the provided `style` prop be applied to the root content and tail elements.

> The `style` prop contains the calculated CSS position values for the tail and content elements.

When a `tail` component is provided, FlowTip renders it as a child of the `content` component, where it is given a `absolute` position aligning it along the correct edge. FlowTip doesn't attempt to orient the rendered tail element towards the target. Instead, it provides the layout calculation `result` object as a prop, allowing you to update the styles depending on the current region.

Reference `result.region` in your `tail` component to style it in the correct orientation:

```jsx
const Tail = ({result, children, style}) => (
  <div className={`flowtip-tail-${result.region}`} style={style}>
    {children}
  </div>
);
```

The `result` object contains additional information useful for advanced styling tasks. `result.offset` represents the current distance between the content and the target. `result.reason` contains a string value (either `default`, `inverted`, `ideal`, `external`, or `fallback`) describing the current state of the layout calculation. Checking if the `reason` value is equal to `external` is a way to detect if the tail is "detached" from the target - a case where you may want to hide it.

```jsx
import classNames from 'classnames';

const Tail = ({result, children, style}) =>
  <div
    className={classNames(`flowtip-tail-${result.region}`, {
      'flowtip-tail-detached': result.reason === 'external',
    }}
    style={style}
  >
    {children}
  </div>;
```

```css
.flowtip-tail-detached {
  opacity: 0;
}
```

> Be careful with overly dynamic tail and content styles calculated from the `result` object. FlowTip can get caught in a feedback loop causing it to rapidly switch between styles. Use `opacity` to hide your tail element rather than `display: none` so that its effect on the layout is constant.

It is common to use a "CSS triangle" to render the tail element, due to the way FlowTip measures rendered elements (using [`react-resize-observer`] - explained below), retuning a `0px x 0px` element with borders will cause layout issues. Make sure that the root tail element represents the total width and height of the tail, with any elements containing borders as children.

This is problematic:

```css
.flowtip-tail-bottom {
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 20px solid white;
}
```

Problem avoided with nested elements:

```css
.flowtip-tail-bottom .triangle {
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 20px solid white;
}
```

FlowTip uses [`react-resize-observer`] to measure the dimensions of the rendered content and tail elements, which allows it to automatically measure the dimensions of your styled elements. Unfortunately, if the root content element is given a CSS border, the absolutely positioned tail element will be misaligned a distance equal to the width of the border. The solution to this is to apply any necessary border styles to an element that is a child of the content component, leaving it an the tail children of a borderless root element.

Content Border Example:

```jsx
const Tail = ({result, children, style}) => (
  <div className={`flowtip-tail-${result.region}`} style={style}>
    {children}
  </div>
);

const StyledFlowTip = ({children, ...props}) => (
  <FlowTip tail={Tail} {...props}>
    <div className="flowtip-content">{children}</div>
  </FlowTip>
);

// Rendering StyledFlowTip component:
{
  !!this.state.flowTipOpen && (
    <StyledFlowTip target={this.state.target}>FlowTip Content</StyledFlowTip>
  );
}
```

<details>
<summary>Example CSS</summary>

```css
.flowtip-content {
  padding: 10px;
  background: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
  border: 2px solid #eee;
}
```

</details>

---

### Accessibility & Advanced Behavior

Additional best-practice behaviors like managing user focus or closing the tooltip when the page behind is clicked are not handled by the component itself. We recommend using [`focus-trap-react`] to add this functionality.

```jsx
import React from 'react';
import FlowTip from 'flowtip-react-dom';
import ResizeObserver from 'react-resize-observer';
import FocusTrap from 'focus-trap-react';

const Content = ({result, children, style, onClose}) => (
  <FocusTrap
    className="flowtip-content"
    style={style}
    focusTrapOptions={{
      onDeactivate: onClose,
      escapeDeactivates: true,
      clickOutsideDeactivates: true,
    }}
  >
    {children}
  </FocusTrap>
);

const Tail = ({result, children, style}) => (
  <div className={`flowtip-tail-${result.region}`} style={style}>
    {children}
  </div>
);

class FlowTipExample extends React.Component {
  state = {flowTipOpen: false, target: null};

  _openFlowTip = () => this.setState({flowTipOpen: true});
  _closeFlowTip = () => this.setState({flowTipOpen: false});

  _handleTargetReflow = (target) => this.setState({target});

  render() {
    return (
      <div>
        <button onClick={this._openFlowTip}>
          <ResizeObserver onReflow={this._handleTargetReflow} />
          Activate FlowTip
        </button>
        {!!this.state.flowTipOpen && (
          <FlowTip
            target={this.state.target}
            content={Content}
            tail={Tail}
            onClose={this._closeFlowTip}
          >
            FlowTip Content
          </FlowTip>
        )}
      </div>
    );
  }
}
```

## Component Props

### `target`: object | null

_required_

The measured position of the target element as a [DOMRect-shaped] object.

> The component will not render any visible content while this prop is `null`.

### `bounds`: object

_optional_

The measured position of the available layout area for the tooltip content as a [DOMRect-shaped] object. This defines the outer collision boundaries referenced by the `constrain` prop.

> If omitted, the viewport rect will be used.

### `region`: string

_optional_

The preferred region in which the tooltip will appear at first relative to its target. Possibly values are: `top`, `bottom`, `left`, and `right`.

> If `region` is omitted, the algorithm will pick default to the region with the most available space. (handled by the `getIdealRegion` function in `flowtip-core`)

### `sticky`: boolean

_optional_, _default: `false`_

Disabling `sticky` will make the component reposition its content to occupy whatever the current ideal region is - regardless of its current position.

This results in apparently unnecessary reposition events. When `sticky` is true, the positioned content will occupy the current region until that region is no longer valid, i.e. the content collides with the boundary edge.

### `targetOffset`: number

_optional_, _default: `0`_

The desired margin between the positioned content tail and the target.

### `edgeOffset`: number

_optional_, _default: `0`_

The minimum margin between the positioned content and the boundary. A positive value will prevent the content from touching the boundary edge, a negative value will allow the content to overflow the boundary before a collision is detected.

### `tailOffset`: number

_optional_, _default: `0`_

The minimum distance between the tail and corner of the content along an edge.

> If your content has rounded corners, this should be equal to the radius to prevent the tail from entering the rounded region.

### `align`: string | number

_optional_, _default: `center`_

Linear alignment between the positioned content and the target. Possible values are a number in the range of `0` to `1`, or one of `start`, `center`, and `end` (aliases for `0`, `0.5`, and `1` respectively).

### `topDisabled`: boolean

_optional_, _default: `false`_

Disable rendering the content above the target.

### `rightDisabled`: boolean

_optional_, _default: `false`_

Disable rendering the content to the right of the target.

### `bottomDisabled`: boolean

_optional_, _default: `false`_

Disable rendering the content below the target.

### `leftDisabled`: boolean

_optional_, _default: `false`_

Disable rendering the content to the left of the target.

### `constrainTop`: object

_optional_, _default: `true`_

Disable rendering the content outside the bounds area in the top region.

### `constrainRight`: object

_optional_, _default: `true`_

Disable rendering the content outside the bounds area in the right region.

### `constrainBottom`: object

_optional_, _default: `true`_

Disable rendering the content outside the bounds area in the bottom region.

### `constrainLeft`: object

_optional_, _default: `true`_

Disable rendering the content outside the bounds area in the left region.

Content: ReactClass<{style: Object, result: Result}>,

### `content`: function | string

_optional_, _default: `div`_

A React Class or stateless component responsible for rendering the tooltip content.

FlowTip renders this component with `children`, `style`, and `result` props. The `children` and `style` props must be passed to its root HTML tag element for content positioning to work.

Example `Content` component:

```jsx
const Content = ({result, children, style}) =>
  <div className='flowtip-content' style={style} >
    {children}
    Current region: {result.region}
  </div>;
...

<FlowTip Content={Content} ... />
```

> FlowTip will default to rendering an unstyled `div` element if the `content` prop is omitted. Content styling can be handled by child element in this case.

### `tail`: function

_optional_

An optional React Class or stateless component responsible for rendering the tail content.

FlowTip renders this component with `children`, `style`, and `result` props. The `children` and `style` props must be passed to its root HTML tag element for tail positioning to work.

Example `Tail` component:

```jsx
const Tail = ({result, children, style}) =>
  <div className={`flowtip-tail-${result.region}`} style={style} >
    {children}
  </div>;
...

<FlowTip Tail={Tail} ... />
```

## Rect Interface

While `flowtip-core` has no dependency on the DOM, it is designed to be directly compatible with DOMRect instances returned from `getClientBoundingRect()` calls. Any object that satisfies the DOMRect object interface `top: number, left: number, width: number, height: number, bottom?: number, right?: number` can be used.

The absolute reference frame of the measurements does not have an impact on the calculation - as long as all measurements are relative to the same frame.

[domrect-shaped]: #rect-interface
[dimensions]: #rect-interface
[react dom]: https://facebook.github.io/react/docs/react-dom.html
[`react-resize-observer`]: https://github.com/metalabdesign/react-resize-observer
[`focus-trap-react`]: https://github.com/davidtheclark/focus-trap-react
[`react-resize-observer`]: https://github.com/metalabdesign/react-resize-observer
