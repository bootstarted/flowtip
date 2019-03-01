import * as React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
// import {withKnobs, object} from '@storybook/addon-knobs/react';

import ResizeObserver from 'react-resize-observer';
import FlowTip, {TailProps} from 'flowtip-react-dom';
import {Rect, RectLike} from 'flowtip-core';

import useDebouncedState from './util/useDebouncedState';

function withAction<T extends any[], R>(
  name: string,
  func: (...args: T) => R,
): (...args: T) => R {
  const handler = action(name);
  return (...args: T) => {
    handler(...args);
    return func(...args);
  };
}

const triangles = {
  top: (
    <div
      style={{
        borderTop: '6px solid rgba(0,0,0,0.5)',
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
      }}
    />
  ),
  right: (
    <div
      style={{
        borderTop: '6px solid rgba(0,0,0,0.5)',
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
      }}
    />
  ),
  bottom: (
    <div
      style={{
        borderBottom: '6px solid rgba(0,0,0,0.5)',
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
      }}
    />
  ),
  left: (
    <div
      style={{
        borderTop: '6px solid rgba(0,0,0,0.5)',
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
      }}
    />
  ),
};

const Tail = ({result}: TailProps) => triangles[result.region];

function TooltipExample() {
  const [active, setActive] = useDebouncedState(false);
  const [target, setTarget] = React.useState<RectLike | undefined>();

  return (
    <div style={{fontFamily: 'sans-serif'}}>
      <div
        style={{position: 'relative', float: 'left'}}
        onMouseOver={() => withAction('setActive', setActive)(true, 0)}
        onMouseOut={() => withAction('setActive', setActive)(false, 500)}
      >
        <ResizeObserver
          onReflow={(rect) =>
            withAction('setTarget', setTarget)(Rect.from(rect))
          }
        />
        tooltip target
        {active && (
          <FlowTip target={target} tail={Tail}>
            <div
              style={{
                borderRadius: 8,
                background: 'rgba(0,0,0,0.5)',
                padding: '3px 8px',
                color: 'white',
                whiteSpace: 'nowrap',
              }}
            >
              tooltip content
            </div>
          </FlowTip>
        )}
      </div>
    </div>
  );
}

storiesOf('Basic', module)
  // .addDecorator(withKnobs)
  .add('Tooltip', () => <TooltipExample />);
