import * as React from 'react';
import ResizeObserver from 'react-resize-observer';

import {Props, RenderProps} from './types';
import {getTailStyle, getContentStyle} from './util/render';

const omitFlowtipProps = (props: Props) => {
  const {
    target: _target,
    bounds: _bounds,
    region: _region,
    sticky: _sticky,
    targetOffset: _targetOffset,
    edgeOffset: _edgeOffset,
    tailOffset: _tailOffset,
    align: _align,
    topDisabled: _topDisabled,
    rightDisabled: _rightDisabled,
    bottomDisabled: _bottomDisabled,
    leftDisabled: _leftDisabled,
    constrainTop: _constrainTop,
    constrainRight: _constrainRight,
    constrainBottom: _constrainBottom,
    constrainLeft: _constrainLeft,
    render: _render,
    content: _content,
    tail: _tail,
    ...rest
  } = props;

  return rest;
};

const isComponent = (component: unknown): component is React.Component => {
  return typeof component === 'string' || typeof component === 'function';
};

const defaultRender = (renderProps: RenderProps): React.ReactNode => {
  const {props, state, onTailSize, onContentSize} = renderProps;
  const {content: ContentComponent = 'div', tail: TailComponent} = props;

  const children = (
    <>
      <ResizeObserver onResize={onContentSize} />
      {props.children}
      {isComponent(TailComponent) && (
        <TailComponent style={getTailStyle(props, state)} result={state.result}>
          <ResizeObserver onResize={onTailSize} />
        </TailComponent>
      )}
    </>
  );

  if (typeof ContentComponent === 'string') {
    return (
      <ContentComponent
        {...omitFlowtipProps(props)}
        style={getContentStyle(props, state)}
      >
        {children}
      </ContentComponent>
    );
  }

  return (
    <ContentComponent
      {...omitFlowtipProps(props)}
      style={getContentStyle(props, state)}
      result={state.result}
    >
      {children}
    </ContentComponent>
  );
};

export default defaultRender;
